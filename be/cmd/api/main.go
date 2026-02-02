package main

import (
	"koskosan-be/internal/config"
	"koskosan-be/internal/database"
	"koskosan-be/internal/handlers"
	"koskosan-be/internal/middleware"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/service"
	"log"
	"strings"

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
	authService := service.NewAuthService(userRepo, penyewaRepo, cfg)
	kamarService := service.NewKamarService(kamarRepo)
	galleryService := service.NewGalleryService(galleryRepo)
	dashboardService := service.NewDashboardService(db)
	reviewService := service.NewReviewService(reviewRepo)
	profileService := service.NewProfileService(userRepo, penyewaRepo)
	bookingService := service.NewBookingService(bookingRepo, penyewaRepo)
	paymentService := service.NewPaymentService(paymentRepo, bookingRepo, kamarRepo)
	tenantService := service.NewTenantService(penyewaRepo)

	// 5. Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService)
	kamarHandler := handlers.NewKamarHandler(kamarService)
	galleryHandler := handlers.NewGalleryHandler(galleryService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)
	reviewHandler := handlers.NewReviewHandler(reviewService)
	profileHandler := handlers.NewProfileHandler(profileService)
	bookingHandler := handlers.NewBookingHandler(bookingService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	tenantHandler := handlers.NewTenantHandler(tenantService)

	// 6. Setup Router
	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	r := gin.Default()
	r.SetTrustedProxies(nil)

	// CORS Setup
	allowedOrigins := strings.Split(cfg.AllowedOrigins, ",")
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API Routes
	// Serve static files
	r.Static("/uploads", "./uploads")

	api := r.Group("/api")
	{
		// Public Routes
		api.POST("/login", authHandler.Login)
		api.POST("/register", authHandler.Register)
		api.GET("/kamar", kamarHandler.GetKamars)
		api.GET("/kamar/:id", kamarHandler.GetKamarByID)
		api.GET("/kamar/:id/reviews", reviewHandler.GetReviews)
		api.GET("/reviews", reviewHandler.GetAllReviews) // New endpoint for homepage
		api.GET("/galleries", galleryHandler.GetGalleries)

		// Protected Routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			// Admin Only Routes
			admin := protected.Group("/")
			admin.Use(middleware.RoleMiddleware("admin"))
			{
				admin.POST("/kamar", kamarHandler.CreateKamar)
				admin.PUT("/kamar/:id", kamarHandler.UpdateKamar)
				admin.DELETE("/kamar/:id", kamarHandler.DeleteKamar)
				admin.POST("/galleries", galleryHandler.CreateGallery)
				admin.DELETE("/galleries/:id", galleryHandler.DeleteGallery)
				admin.GET("/dashboard", dashboardHandler.GetStats)
				admin.GET("/payments", paymentHandler.GetAllPayments)
				admin.PUT("/payments/:id/confirm", paymentHandler.ConfirmPayment)
				admin.GET("/tenants", tenantHandler.GetAllTenants)
			}

			// All Authenticated Users
			protected.POST("/reviews", reviewHandler.CreateReview)
			protected.GET("/profile", profileHandler.GetProfile)
			protected.PUT("/profile", profileHandler.UpdateProfile)
			protected.PUT("/profile/change-password", profileHandler.ChangePassword)
			protected.GET("/my-bookings", bookingHandler.GetMyBookings)
			// Add other protected routes here
		}
	}

	log.Printf("Server running on http://localhost:%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
