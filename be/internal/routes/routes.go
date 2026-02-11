package routes

import (
	"koskosan-be/internal/config"
	"koskosan-be/internal/handlers"
	"koskosan-be/internal/middleware"

	"github.com/gin-gonic/gin"
)

// Routes structure untuk organization yang lebih baik
type Routes struct {
	authHandler      *handlers.AuthHandler
	kamarHandler     *handlers.KamarHandler
	galleryHandler   *handlers.GalleryHandler
	dashboardHandler *handlers.DashboardHandler
	reviewHandler    *handlers.ReviewHandler
	profileHandler   *handlers.ProfileHandler
	bookingHandler   *handlers.BookingHandler
	paymentHandler   *handlers.PaymentHandler
	tenantHandler    *handlers.TenantHandler
	contactHandler   *handlers.ContactHandler
}

// NewRoutes initialize routes dengan semua handlers
func NewRoutes(
	authHandler *handlers.AuthHandler,
	kamarHandler *handlers.KamarHandler,
	galleryHandler *handlers.GalleryHandler,
	dashboardHandler *handlers.DashboardHandler,
	reviewHandler *handlers.ReviewHandler,
	profileHandler *handlers.ProfileHandler,
	bookingHandler *handlers.BookingHandler,
	paymentHandler *handlers.PaymentHandler,
	tenantHandler *handlers.TenantHandler,
	contactHandler *handlers.ContactHandler,
) *Routes {
	return &Routes{
		authHandler:      authHandler,
		kamarHandler:     kamarHandler,
		galleryHandler:   galleryHandler,
		dashboardHandler: dashboardHandler,
		reviewHandler:    reviewHandler,
		profileHandler:   profileHandler,
		bookingHandler:   bookingHandler,
		paymentHandler:   paymentHandler,
		tenantHandler:    tenantHandler,
		contactHandler:   contactHandler,
	}
}

// Register registers semua routes ke gin router
func (r *Routes) Register(router *gin.Engine, cfg *config.Config) {
	// Static files
	router.Static("/uploads", "./uploads")

	api := router.Group("/api")
	{
		// Public routes - tidak perlu auth
		r.registerPublicRoutes(api)

		// Protected routes - perlu auth (dari cookie)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			r.registerProtectedRoutes(protected)
		}
	}
}

// Public routes (no auth required)
func (r *Routes) registerPublicRoutes(api *gin.RouterGroup) {
	// Authentication
	auth := api.Group("/auth")
	{
		auth.POST("/login", r.authHandler.Login)
		auth.POST("/register", r.authHandler.Register)
		auth.POST("/google-login", r.authHandler.GoogleLogin)
		auth.POST("/forgot-password", r.authHandler.ForgotPassword)
		auth.POST("/reset-password", r.authHandler.ResetPassword)
	}

	// Kamar/Room browsing
	kamar := api.Group("/kamar")
	{
		kamar.GET("", r.kamarHandler.GetKamars)           // GET /api/kamar
		kamar.GET("/:id", r.kamarHandler.GetKamarByID)    // GET /api/kamar/:id
		kamar.GET("/:id/reviews", r.reviewHandler.GetReviews) // GET /api/kamar/:id/reviews
	}

	// Gallery
	api.GET("/galleries", r.galleryHandler.GetGalleries)

	// Reviews
	api.GET("/reviews", r.reviewHandler.GetAllReviews)

	// Contact form
	api.POST("/contact", r.contactHandler.HandleContactForm)

	// Payment webhook (untuk Midtrans callback) - REMOVED
	// api.POST("/payments/webhook", r.paymentHandler.HandleMidtransWebhook)
}

// Protected routes (auth required)
func (r *Routes) registerProtectedRoutes(protected *gin.RouterGroup) {
	// User Profile
	profile := protected.Group("/profile")
	{
		profile.GET("", r.profileHandler.GetProfile)              // GET /api/profile
		profile.PUT("", r.profileHandler.UpdateProfile)           // PUT /api/profile
		profile.PUT("/change-password", r.profileHandler.ChangePassword) // PUT /api/profile/change-password
	}

	// Bookings
	bookings := protected.Group("/bookings")
	{
		bookings.GET("", r.bookingHandler.GetMyBookings) // GET /api/bookings
		bookings.POST("", r.bookingHandler.CreateBooking) // POST /api/bookings
		bookings.POST("/:id/cancel", r.bookingHandler.CancelBooking) // POST /api/bookings/:id/cancel
		bookings.POST("/:id/extend", r.bookingHandler.ExtendBooking) // POST /api/bookings/:id/extend
	}

	// Payments
	payments := protected.Group("/payments")
	{
		payments.POST("", r.paymentHandler.CreatePayment)                  // POST /api/payments
		payments.POST("/:id/proof", r.paymentHandler.UploadPaymentProof)   // POST /api/payments/:id/proof
		payments.POST("/confirm-cash/:id", r.paymentHandler.ConfirmCashPayment) // POST /api/payments/confirm-cash/:id
		payments.GET("/reminders", r.paymentHandler.GetReminders)             // GET /api/payments/reminders
	}

	// Reviews
	protected.POST("/reviews", r.reviewHandler.CreateReview)

	// Admin routes
	r.registerAdminRoutes(protected)
}

// Admin routes (auth + admin role required)
func (r *Routes) registerAdminRoutes(protected *gin.RouterGroup) {
	admin := protected.Group("")
	admin.Use(middleware.RoleMiddleware("admin"))
	{
		// Kamar management
		kamar := admin.Group("/kamar")
		{
			kamar.POST("", r.kamarHandler.CreateKamar)    // POST /api/kamar
			kamar.PUT("/:id", r.kamarHandler.UpdateKamar) // PUT /api/kamar/:id
			kamar.DELETE("/:id", r.kamarHandler.DeleteKamar) // DELETE /api/kamar/:id
		}

		// Gallery management
		galleries := admin.Group("/galleries")
		{
			galleries.POST("", r.galleryHandler.CreateGallery)    // POST /api/galleries
			galleries.DELETE("/:id", r.galleryHandler.DeleteGallery) // DELETE /api/galleries/:id
		}

		// Dashboard
		admin.GET("/dashboard", r.dashboardHandler.GetStats)

		// Payments management
		payments := admin.Group("/payments")
		{
			payments.GET("", r.paymentHandler.GetAllPayments)       // GET /api/payments
			payments.PUT("/:id/confirm", r.paymentHandler.ConfirmPayment) // PUT /api/payments/:id/confirm
		}

		// Tenants management
		admin.GET("/tenants", r.tenantHandler.GetAllTenants)
	}
}
