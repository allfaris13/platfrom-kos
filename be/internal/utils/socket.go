package utils

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	socketio "github.com/googollee/go-socket.io"
	"github.com/googollee/go-socket.io/engineio"
	"github.com/googollee/go-socket.io/engineio/transport"
	"github.com/googollee/go-socket.io/engineio/transport/polling"
	"github.com/googollee/go-socket.io/engineio/transport/websocket"
)

type SocketServer struct {
	Server *socketio.Server
	// Map UserID -> Set of SocketIDs (a user might have multiple tabs open)
	UserSockets map[uint]map[string]bool
	mu          sync.RWMutex
}

var GlobalSocket *SocketServer

func InitSocketServer() (*SocketServer, error) {
	server := socketio.NewServer(&engineio.Options{
		Transports: []transport.Transport{
			&polling.Transport{
				CheckOrigin: func(r *http.Request) bool {
					return true
				},
			},
			&websocket.Transport{
				CheckOrigin: func(r *http.Request) bool {
					return true
				},
			},
		},
	})
	
	ss := &SocketServer{
		Server:      server,
		UserSockets: make(map[uint]map[string]bool),
	}

	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		log.Printf("Socket connected: %s", s.ID())
		return nil
	})

	server.OnEvent("/", "authenticate", func(s socketio.Conn, userID uint) {
		ss.mu.Lock()
		defer ss.mu.Unlock()
		
		// Join room for targeting
		roomName := fmt.Sprintf("user_%d", userID)
		s.Join(roomName)
		
		if ss.UserSockets[userID] == nil {
			ss.UserSockets[userID] = make(map[string]bool)
		}
		ss.UserSockets[userID][s.ID()] = true
		s.SetContext(userID)
		log.Printf("Socket %s authenticated for user %d and joined room %s", s.ID(), userID, roomName)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		userID, ok := s.Context().(uint)
		if ok {
			ss.mu.Lock()
			if ss.UserSockets[userID] != nil {
				delete(ss.UserSockets[userID], s.ID())
				if len(ss.UserSockets[userID]) == 0 {
					delete(ss.UserSockets, userID)
				}
			}
			ss.mu.Unlock()
		}
		log.Printf("Socket disconnected: %s (reason: %s)", s.ID(), reason)
	})

	server.OnError("/", func(s socketio.Conn, e error) {
		log.Printf("Socket error: %v", e)
	})

	GlobalSocket = ss
	go server.Serve()
	return ss, nil
}

func (ss *SocketServer) BroadcastToUser(userID uint, event string, data interface{}) {
	roomName := fmt.Sprintf("user_%d", userID)
	ss.Server.BroadcastToRoom("/", roomName, event, data)
	log.Printf("Broadcasted event '%s' to user %d (room %s)", event, userID, roomName)
}

func (ss *SocketServer) BroadcastToAll(event string, data interface{}) {
	ss.Server.BroadcastToRoom("/", "", event, data)
}
