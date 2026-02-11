package main

import (
	"log"
	"koskosan-be/internal/config"
	"koskosan-be/internal/models"
	"fmt"
	
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 1. Load Config (Manually or via init)
	// We need to load .env manually if we are not using the main config loader logic or just reuse it
	// Assuming running from root, .env should be accessible
	cfg := config.LoadConfig()

	// 2. Connect to DB
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected. Starting cleanup...")

	// 3. Delete Data
	// Transaction to ensure atomicity
	err = db.Transaction(func(tx *gorm.DB) error {
		// A. Delete Payment Reminders
		if err := tx.Exec("DELETE FROM payment_reminders").Error; err != nil {
			return err
		}
		log.Println("Deleted all Payment Reminders")

		// B. Delete Payments (Pembayaran)
		// User said "clear atau ke pending". Assuming ALL for now to be safe/clean.
		if err := tx.Exec("DELETE FROM pembayarans").Error; err != nil {
			return err
		}
		log.Println("Deleted all Payments")

		// C. Delete Bookings (Pemesanan)
		if err := tx.Exec("DELETE FROM pemesanans").Error; err != nil {
			return err
		}
		log.Println("Deleted all Bookings")

		// D. Reset Room Status to 'Tersedia'
		if err := tx.Model(&models.Kamar{}).Where("1=1").Update("status", "Tersedia").Error; err != nil {
			return err
		}
		log.Println("Reset all Rooms to 'Tersedia'")

		return nil
	})

	if err != nil {
		log.Fatalf("Cleanup failed: %v", err)
	}

	log.Println("Cleanup completed successfully!")
}
