package service

import (
	"koskosan-be/internal/models"
	"os"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type MidtransService interface {
	CreateTransaction(booking *models.Pemesanan, amount float64) (*snap.Response, string, error)
	VerifyNotification(payload map[string]interface{}) (string, string, error)
}

type midtransService struct {
	snapClient snap.Client
}

func NewMidtransService() MidtransService {
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	isProd := os.Getenv("MIDTRANS_IS_PRODUCTION") == "true"
	
	s := snap.Client{}
	s.New(serverKey, midtrans.Sandbox)
	if isProd {
		s.New(serverKey, midtrans.Production)
	}

	return &midtransService{
		snapClient: s,
	}
}

func (s *midtransService) CreateTransaction(booking *models.Pemesanan, amount float64) (*snap.Response, string, error) {
	orderID := "ORDER-" + booking.Penyewa.NamaLengkap + "-" + string(rune(booking.ID)) // Simple order ID generation
	// In production, use a more robust unique ID generator like UUID
	
	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: int64(amount),
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: booking.Penyewa.NamaLengkap,
			Email: "customer@example.com", // Should be available in Penyewa or User models
		},
	}

	snapResp, err := s.snapClient.CreateTransaction(req)
	if err != nil {
		return nil, "", err
	}

	return snapResp, orderID, nil
}

func (s *midtransService) VerifyNotification(payload map[string]interface{}) (string, string, error) {
	orderID, _ := payload["order_id"].(string)
	transactionStatus, _ := payload["transaction_status"].(string)
	
	return orderID, transactionStatus, nil
}
