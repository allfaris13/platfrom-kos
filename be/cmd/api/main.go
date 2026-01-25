package main

import (
	"koskosan-be/internal/config"
	"koskosan-be/internal/database"
	"koskosan-be/internal/handlers"
	"koskosan-be/internal/middleware"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/service"
	"log"

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

	// 4. Initialize Services
	authService := service.NewAuthService(userRepo, cfg)
	kamarService := service.NewKamarService(kamarRepo)
	galleryService := service.NewGalleryService(galleryRepo)
	dashboardService := service.NewDashboardService(db)
	reviewService := service.NewReviewService(reviewRepo)

	// 5. Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService)
	kamarHandler := handlers.NewKamarHandler(kamarService)
	galleryHandler := handlers.NewGalleryHandler(galleryService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)
	reviewHandler := handlers.NewReviewHandler(reviewService)

	// 6. Setup Router
	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Adjust for production
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
		api.GET("/kamar", kamarHandler.GetKamars)
		api.GET("/kamar/:id", kamarHandler.GetKamarByID)
		api.GET("/kamar/:id", kamarHandler.GetKamarByID)
		api.GET("/kamar/:id/reviews", reviewHandler.GetReviews)
		api.GET("/reviews", reviewHandler.GetAllReviews) // New endpoint for homepage
		api.GET("/galleries", galleryHandler.GetGalleries)

		// Protected Routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			protected.POST("/kamar", kamarHandler.CreateKamar)
			protected.POST("/galleries", galleryHandler.CreateGallery)
			protected.DELETE("/galleries/:id", galleryHandler.DeleteGallery)
			protected.GET("/dashboard", dashboardHandler.GetStats)
			protected.POST("/reviews", reviewHandler.CreateReview)
			// Add other protected routes here
		}
	}

	log.Printf("Server running on http://localhost:%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
