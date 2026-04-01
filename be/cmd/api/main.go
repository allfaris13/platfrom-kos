package main

import (
	"koskosan-be/internal/config"
	"koskosan-be/internal/database"
	"koskosan-be/internal/handlers"
	"koskosan-be/internal/middleware"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/routes"
	"koskosan-be/internal/scheduler"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"log"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 0. Set Timezone to Asia/Jakarta (WIB)
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		log.Println("Warning: Could not load Asia/Jakarta timezone, using local system time")
	} else {
		time.Local = loc
		log.Printf("Timezone successfully set to %s\n", loc.String())
	}

	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Initialize Database
	database.InitDB(cfg)
	db := database.GetDB()

	// 3. Initialize Repositories
	userRepo := repository.NewUserRepository(db)
	kamarRepo := repository.NewKamarRepository(db)
	galleryRepo := repository.NewGalleryRepository(db)
	reviewRepo := repository.NewReviewRepository(db)
	penyewaRepo := repository.NewPenyewaRepository(db)
	bookingRepo := repository.NewBookingRepository(db)
	paymentRepo := repository.NewPaymentRepository(db)

	// 4. Initialize Services
	emailSender := utils.NewEmailSender(cfg)
	waSender := utils.NewWhatsAppSender(cfg)

	// Removed Cloudinary Initialization

	authService := service.NewAuthService(userRepo, penyewaRepo, cfg, emailSender, &utils.RealIDTokenVerifier{})
	kamarService := service.NewKamarService(kamarRepo)
	galleryService := service.NewGalleryService(galleryRepo)
	dashboardService := service.NewDashboardService(db)
	reviewService := service.NewReviewService(reviewRepo, bookingRepo, penyewaRepo)
	profileService := service.NewProfileService(userRepo, penyewaRepo)
	bookingService := service.NewBookingService(bookingRepo, userRepo, penyewaRepo, kamarRepo, paymentRepo, db)
	paymentService := service.NewPaymentService(paymentRepo, bookingRepo, kamarRepo, penyewaRepo, db, emailSender, waSender)
	tenantService := service.NewTenantService(penyewaRepo)
	contactService := service.NewContactService()

	// 4.1 Initialize Socket.io
	socketServer, err := utils.InitSocketServer()
	if err != nil {
		log.Fatalf("Failed to initialize Socket.io: %v", err)
	}

	// 5. Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService, cfg)
	kamarHandler := handlers.NewKamarHandler(kamarService)
	galleryHandler := handlers.NewGalleryHandler(galleryService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)
	reviewHandler := handlers.NewReviewHandler(reviewService)
	profileHandler := handlers.NewProfileHandler(profileService)
	bookingHandler := handlers.NewBookingHandler(bookingService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	tenantHandler := handlers.NewTenantHandler(tenantService)
	contactHandler := handlers.NewContactHandler(contactService)

	// Initialize Routes
	appRoutes := routes.NewRoutes(
		authHandler,
		kamarHandler,
		galleryHandler,
		dashboardHandler,
		reviewHandler,
		profileHandler,
		bookingHandler,
		paymentHandler,
		tenantHandler,
		contactHandler,
	)

	// Log startup
	utils.GlobalLogger.Info("All handlers initialized successfully")

	// 6. Setup Router
	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	r := gin.Default()
	r.SetTrustedProxies(nil)

	// Global Middleware
	r.Use(middleware.ErrorHandlingMiddleware())
	r.Use(middleware.LoggingMiddleware())
	r.Use(middleware.SecurityHeadersMiddleware())

	// CORS Setup
	allowedOrigins := strings.Split(cfg.AllowedOrigins, ",")
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Cookie", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Socket.io mount
	r.GET("/socket.io/*any", gin.WrapH(socketServer.Server))
	r.POST("/socket.io/*any", gin.WrapH(socketServer.Server))
	r.Handle("ANY", "/socket.io/*any", gin.WrapH(socketServer.Server))

	// Serve Static Files for local uploads
	r.Static("/uploads", "./public/uploads")
	r.Static("/rooms", "./public/rooms")
	r.Static("/gallery", "./public/gallery")
	r.Static("/profiles", "./public/profiles")
	r.Static("/proofs", "./public/proofs")

	// API Routes
	appRoutes.Register(r, cfg)

	// 7. Start Background Workers
	go func() {
		utils.GlobalLogger.Info("Starting background workers...")

		// Reminder Service & Scheduler
		reminderService := service.NewReminderService(paymentRepo, db, emailSender, waSender)
		schedulerService := scheduler.NewScheduler(reminderService)
		schedulerService.Start()

		// Run initial checks
		if err := bookingService.AutoCancelExpiredBookings(); err != nil {
			utils.GlobalLogger.Error("Failed to auto-cancel bookings: %v", err)
		}

		// Tickers (Only for Cancel now, Reminder handled by Scheduler)
		cancelTicker := time.NewTicker(1 * time.Hour)

		for range cancelTicker.C {
			if err := bookingService.AutoCancelExpiredBookings(); err != nil {
				utils.GlobalLogger.Error("Failed to auto-cancel bookings: %v", err)
			}
		}
	}()

	log.Printf("Server running on http://localhost:%s", cfg.Port)
	utils.GlobalLogger.Info("Server started on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		utils.GlobalLogger.Error("Failed to run server: %v", err)
		log.Fatal("Failed to run server:", err)
	}
}
