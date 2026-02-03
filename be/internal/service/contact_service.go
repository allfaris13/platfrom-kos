package service

import (
	"log"
)

type ContactService interface {
	SendContactMessage(name, email, message string) error
}

type contactService struct {
	targetEmail string
}

func NewContactService() ContactService {
	return &contactService{
		targetEmail: "muhammadarkanfauzi9@gmail.com",
	}
}

func (s *contactService) SendContactMessage(name, email, message string) error {
	// Simulate sending email
	log.Printf("--- SIMULATED EMAIL SENT ---")
	log.Printf("From: %s <%s>", name, email)
	log.Printf("To: %s", s.targetEmail)
	log.Printf("Message: %s", message)
	log.Printf("----------------------------")
	
	return nil
}
