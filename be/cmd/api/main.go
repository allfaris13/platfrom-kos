package main

import (
	"koskosan-be/internal/config"
	"koskosan-be/internal/database"
	"koskosan-be/internal/handlers"
	"koskosan-be/internal/middleware"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/routes"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"log"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
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
	authService := service.NewAuthService(userRepo, penyewaRepo, cfg, emailSender)
	kamarService := service.NewKamarService(kamarRepo)
	galleryService := service.NewGalleryService(galleryRepo)
	dashboardService := service.NewDashboardService(db)
	reviewService := service.NewReviewService(reviewRepo)
	profileService := service.NewProfileService(userRepo, penyewaRepo)
	midtransService := service.NewMidtransService()
	bookingService := service.NewBookingService(bookingRepo, penyewaRepo)
	paymentService := service.NewPaymentService(paymentRepo, bookingRepo, kamarRepo, midtransService, db)
	tenantService := service.NewTenantService(penyewaRepo)
	contactService := service.NewContactService()


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
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Cookie"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API Routes
	appRoutes.Register(r, cfg)

	// 7. Start Background Workers
	go func() {
		utils.GlobalLogger.Info("Starting background workers...")
		
		// Reminder Service Worker
		reminderService := service.NewReminderService(paymentRepo, db)
		
		// Run initial checks
		if err := bookingService.AutoCancelExpiredBookings(); err != nil {
			utils.GlobalLogger.Error("Failed to auto-cancel bookings: %v", err)
		}
		
		// Tickers
		cancelTicker := time.NewTicker(1 * time.Hour)
		dailyTicker := time.NewTicker(24 * time.Hour) // For daily reminders
		reminderTicker := time.NewTicker(4 * time.Hour) // Check pending reminders every 4 hours

		for {
			select {
			case <-cancelTicker.C:
				if err := bookingService.AutoCancelExpiredBookings(); err != nil {
					utils.GlobalLogger.Error("Failed to auto-cancel bookings: %v", err)
				}
			case <-dailyTicker.C:
				if err := reminderService.CreateMonthlyReminders(); err != nil {
					utils.GlobalLogger.Error("Failed to create monthly reminders: %v", err)
				}
			case <-reminderTicker.C:
				if _, err := reminderService.SendPendingReminders(); err != nil {
					utils.GlobalLogger.Error("Failed to send pending reminders: %v", err)
				}
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
