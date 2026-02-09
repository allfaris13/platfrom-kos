package database

import (
	"fmt"
	"koskosan-be/internal/config"
	"koskosan-be/internal/models"
	"log"
	"time"

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

	// PERFORMANCE OPTIMIZATION: Configure connection pool settings
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to get database instance:", err)
	}

	// SetMaxIdleConns sets the maximum number of connections in the idle connection pool
	// Reusing idle connections prevents overhead of creating new connections
	sqlDB.SetMaxIdleConns(10)

	// SetMaxOpenConns sets the maximum number of open connections to the database
	// Prevents "too many connections" errors under heavy load
	sqlDB.SetMaxOpenConns(100)

	// SetConnMaxLifetime sets the maximum amount of time a connection may be reused
	// Prevents issues with stale connections
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connection pool configured: MaxIdle=10, MaxOpen=100, MaxLifetime=1h")

	// Auto Migration
	err = DB.AutoMigrate(
		&models.User{},
		&models.Kamar{},
		&models.Penyewa{},
		&models.Pemesanan{},
		&models.Pembayaran{},

		&models.Gallery{},
		&models.Review{},
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
