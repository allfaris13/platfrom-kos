package database

import (
	"koskosan-be/internal/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	dsn := "host=localhost user=postgres password=12345678 dbname=tugas_arkan port=5432 sslmode=disable TimeZone=Asia/Jakarta"
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
