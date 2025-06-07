// src/hooks/use-websocket.tsx
import { useEffect, useRef, useCallback, useState } from "react";
import {
  websocketService,
  WebSocketService,
  SocketMessage,
} from "@/lib/websocket";
import { toastError, toastInfo } from "@/lib/toast";

export interface UseWebSocketOptions {
  userId?: string;
  onMessage?: (message: SocketMessage) => void;
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { userId, onMessage, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messageHandlerRef = useRef(onMessage);
  const topicRef = useRef<string | null>(null);

  // Update the ref when onMessage changes
  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(async () => {
    try {
      setConnectionError(null);
      await websocketService.connect();
      setIsConnected(true);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to connect to WebSocket";
      setConnectionError(errorMessage);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (topicRef.current) {
      websocketService.unsubscribeFromTopic(topicRef.current);
      topicRef.current = null;
    }
    websocketService.disconnect();
    setIsConnected(false);
  }, []);

  const subscribeToUserUpdates = useCallback((targetUserId: string) => {
    if (!targetUserId) {
      console.warn("User ID is required for subscription");
      return;
    }

    const topic = WebSocketService.getUserTopic(targetUserId);

    // Unsubscribe from previous topic if any
    if (topicRef.current && topicRef.current !== topic) {
      websocketService.unsubscribeFromTopic(topicRef.current);
    }

    topicRef.current = topic;

    const handler = (message: SocketMessage) => {
      console.log("Received submission update:", message);
      if (messageHandlerRef.current) {
        messageHandlerRef.current(message);
      }
    };

    websocketService.subscribeToTopic(topic, handler);
    console.log(`Subscribed to user updates for: ${targetUserId}`);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (topicRef.current) {
        websocketService.unsubscribeFromTopic(topicRef.current);
      }
    };
  }, [autoConnect, connect]);

  // Subscribe to user updates when userId changes
  useEffect(() => {
    if (userId && isConnected) {
      subscribeToUserUpdates(userId);
    }
  }, [userId, isConnected, subscribeToUserUpdates]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = websocketService.isConnected();
      if (connected !== isConnected) {
        setIsConnected(connected);
      }
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeToUserUpdates,
  };
};
