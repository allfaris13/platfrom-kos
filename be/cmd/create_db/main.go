package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Load .env file
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Get database configuration
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	// Connect to PostgreSQL server (without specifying a database)
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL server:", err)
	}
	defer db.Close()

	// Check if database exists
	var exists bool
	query := fmt.Sprintf("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = '%s')", dbName)
	err = db.QueryRow(query).Scan(&exists)
	if err != nil {
		log.Fatal("Failed to check database existence:", err)
	}

	if exists {
		fmt.Printf("Database '%s' already exists!\n", dbName)
		return
	}

	// Create database
	createDBQuery := fmt.Sprintf("CREATE DATABASE %s", dbName)
	_, err = db.Exec(createDBQuery)
	if err != nil {
		log.Fatal("Failed to create database:", err)
	}

	fmt.Printf("Database '%s' created successfully!\n", dbName)
}
