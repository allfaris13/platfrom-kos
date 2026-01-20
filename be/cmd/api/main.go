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
	database.InitDB()
	db := database.GetDB()

	// 3. Initialize Repositories
	userRepo := repository.NewUserRepository(db)
	kamarRepo := repository.NewKamarRepository(db)

	// 4. Initialize Services
	authService := service.NewAuthService(userRepo, cfg)
	kamarService := service.NewKamarService(kamarRepo)

	// 5. Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService)
	kamarHandler := handlers.NewKamarHandler(kamarService)

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
	api := r.Group("/api")
	{
		// Public Routes
		api.POST("/login", authHandler.Login)
		api.GET("/kamar", kamarHandler.GetKamars)
		api.GET("/kamar/:id", kamarHandler.GetKamarByID)

		// Protected Routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			protected.POST("/kamar", kamarHandler.CreateKamar)
			// Add other protected routes here
		}
	}

	log.Printf("Server running on http://localhost:%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
