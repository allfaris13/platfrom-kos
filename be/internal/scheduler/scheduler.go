package scheduler

import (
	"koskosan-be/internal/service"
	"log"

	"github.com/robfig/cron/v3"
)

type Scheduler struct {
	cron            *cron.Cron
	reminderService service.ReminderService
}

func NewScheduler(reminderService service.ReminderService) *Scheduler {
	// Initialize cron with seconds precision if needed, but standard is fine.
	// We use standard cron parser (Minute Hour Dom Month Dow)
	c := cron.New()
	return &Scheduler{
		cron:            c,
		reminderService: reminderService,
	}
}

func (s *Scheduler) Start() {
	// Schedule job to run every day at 08:00 AM
	// Cron format: "0 8 * * *" (At 08:00)
	_, err := s.cron.AddFunc("0 8 * * *", func() {
		log.Println("[Scheduler] Running daily payment reminder check...")

		// 1. Create monthly reminders if needed
		if err := s.reminderService.CreateMonthlyReminders(); err != nil {
			log.Printf("[Scheduler] Error creating reminders: %v", err)
		}

		// 2. Send pending reminders
		reminders, err := s.reminderService.SendPendingReminders()
		if err != nil {
			log.Printf("[Scheduler] Error sending reminders: %v", err)
		} else {
			log.Printf("[Scheduler] Sent %d reminders", len(reminders))
		}
	})

	if err != nil {
		log.Fatalf("Error adding cron job: %v", err)
	}

	s.cron.Start()
	log.Println("Scheduler started: Daily payment reminders at 08:00 AM")

	// Trigger immediately on start for testing/catch-up
	go func() {
		log.Println("[Scheduler] Running initial startup payment reminder check...")
		if err := s.reminderService.CreateMonthlyReminders(); err != nil {
			log.Printf("[Scheduler] Error creating reminders on startup: %v", err)
		}
		reminders, err := s.reminderService.SendPendingReminders()
		if err == nil {
			log.Printf("[Scheduler] Sent %d reminders on startup", len(reminders))
		}
	}()
}

func (s *Scheduler) Stop() {
	s.cron.Stop()
}
