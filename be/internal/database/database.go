package database

import (
	"fmt"
	"koskosan-be/internal/config"
	"koskosan-be/internal/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) {
	var err error
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migration
	err = DB.AutoMigrate(
		&models.User{},
		&models.Kamar{},
		&models.Penyewa{},
		&models.Pemesanan{},
		&models.Pembayaran{},
		&models.Laporan{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed Data
	SeedData()

	log.Println("Database initialized and migrated successfully on PostgreSQL")
}
func GetDB() *gorm.DB {
	return DB
}
