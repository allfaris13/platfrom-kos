package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"koskosan-be/internal/config"
	"log"
	"net/http"
	"time"
)

type WhatsAppSender interface {
	SendWhatsApp(to, message string) error
}

type FonnteSender struct {
	token string
}

func NewFonnteSender(token string) *FonnteSender {
	return &FonnteSender{token: token}
}

func (s *FonnteSender) SendWhatsApp(to, message string) error {
	// Fonnte API endpoint
	url := "https://api.fonnte.com/send"

	// Prepare payload
	payload := map[string]string{
		"target":  to,
		"message": message,
	}
	jsonPayload, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", s.token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Log the response for debugging Fonnte issues
	var buf bytes.Buffer
	buf.ReadFrom(resp.Body)
	respBody := buf.String()
	log.Printf("[Fonnte API Response] Status: %s, Body: %s", resp.Status, respBody)

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fonnte api returned status: %s, body: %s", resp.Status, respBody)
	}

	return nil
}

type LogWASender struct{}

func (s *LogWASender) SendWhatsApp(to, message string) error {
	log.Printf("---------------------------------------------------------")
	log.Printf("[WA SIMULATION] To: %s", to)
	log.Printf("[WA SIMULATION] Message: %s", message)
	log.Printf("---------------------------------------------------------")
	return nil
}

func NewWhatsAppSender(cfg *config.Config) WhatsAppSender {
	if cfg.FonnteToken != "" {
		log.Println("[INFO] Initializing Real Fonnte WhatsApp Sender")
		return NewFonnteSender(cfg.FonnteToken)
	}

	log.Println("[WARNING] FONNTE_TOKEN is not set. WhatsApp messages will only be logged locally (Simulation Mode).")
	return &LogWASender{}
}
