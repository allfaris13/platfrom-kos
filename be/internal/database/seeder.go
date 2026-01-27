package database

import (
	"koskosan-be/internal/models"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func SeedData() {
	// Seed Admin User
	var adminUser models.User
	err := DB.Where("username = ?", "admin").First(&adminUser).Error
	if err != nil { // Not found or error
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin := models.User{
			Username: "admin",
			Password: string(hashedPassword),
			Role:     "admin",
		}
		DB.Create(&admin)
		log.Println("Admin user 'admin' with password 'admin123' ensured")
	}

	// Seed Kamar
	var count int64
	DB.Model(&models.Kamar{}).Count(&count)
	if count == 0 {
		kamars := []models.Kamar{
			{
				NomorKamar: "A1", TipeKamar: "Single", HargaPerBulan: 1500000, Status: "Tersedia",
				Fasilitas: "AC, Wi-Fi, Kamar Mandi Dalam, Lemari, Meja Belajar",
			},
			{
				NomorKamar: "A2", TipeKamar: "Single", HargaPerBulan: 1200000, Status: "Penuh",
				Fasilitas: "AC, Wi-Fi, Kamar Mandi Luar, Lemari",
			},
		}
		DB.Create(&kamars)
		log.Println("Kamars seeded")
	}
}
