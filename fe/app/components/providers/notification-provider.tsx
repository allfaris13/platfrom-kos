"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface NotificationContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  isConnected: false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8081";
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      setIsConnected(true);
      
      // Authenticate with user ID if available
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.id) {
            newSocket.emit("authenticate", user.id);
          }
        } catch (e) {
          console.error("Failed to parse user for socket auth", e);
        }
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from notification server");
      setIsConnected(false);
    });

    // Listen for generic notifications
    newSocket.on("notification", (data: { title: string; message: string; type?: string }) => {
      toast[data.type === "success" ? "success" : data.type === "error" ? "error" : "info"](data.message, {
        description: data.title,
      });
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(() => newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ socket, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};
