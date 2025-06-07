// src/lib/websocket.ts
import SockJS from "sockjs-client";
import { Client, StompSubscription } from "@stomp/stompjs";

const SOCKET_URL = "https://ws.learnsql.store/notification/ws";
let stompClient: Client | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

export interface SocketMessage {
  submitId: string;
  statusSubmit: "AC" | "WA" | "TLE" | "CE";
  timeExec: number;
  testPass: number;
  totalTest: number;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageHandlers: Map<string, (message: SocketMessage) => void> =
    new Map();

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (stompClient?.connected) {
        resolve();
        return;
      }

      const socket = new SockJS(SOCKET_URL);
      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          console.log("WebSocket connected successfully");
          reconnectAttempts = 0;

          // Re-subscribe to all topics after reconnection
          this.resubscribeAll();
          resolve();
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame.headers["message"]);
          console.error("Error details:", frame.body);
          reject(new Error(`STOMP error: ${frame.headers["message"]}`));
        },
        onWebSocketClose: () => {
          console.log("WebSocket connection closed");
          this.attemptReconnect();
        },
        onWebSocketError: (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        },
      });

      stompClient.activate();
    });
  }

  private attemptReconnect(): void {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
      return;
    }

    reconnectAttempts++;
    console.log(
      `Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`
    );

    setTimeout(() => {
      if (stompClient && !stompClient.connected) {
        stompClient.activate();
      }
    }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)); // Exponential backoff
  }

  private resubscribeAll(): void {
    // Re-subscribe to all topics with their handlers
    this.messageHandlers.forEach((handler, topic) => {
      this.subscribeToTopic(topic, handler);
    });
  }

  subscribeToTopic(
    topic: string,
    handler: (message: SocketMessage) => void
  ): void {
    // Store the handler for potential re-subscription
    this.messageHandlers.set(topic, handler);

    if (!stompClient?.connected) {
      console.warn("WebSocket not connected, will subscribe when connected");
      return;
    }

    // Unsubscribe from existing subscription if any
    const existingSubscription = this.subscriptions.get(topic);
    if (existingSubscription) {
      existingSubscription.unsubscribe();
    }

    // Create new subscription
    const subscription = stompClient.subscribe(topic, (message) => {
      try {
        const response: SocketMessage = JSON.parse(message.body);
        console.log("Received WebSocket message:", response);
        handler(response);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    this.subscriptions.set(topic, subscription);
    console.log(`Subscribed to topic: ${topic}`);
  }

  unsubscribeFromTopic(topic: string): void {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      this.messageHandlers.delete(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    }
  }

  disconnect(): void {
    if (stompClient?.connected) {
      // Clear all subscriptions
      this.subscriptions.clear();
      this.messageHandlers.clear();

      stompClient.deactivate();
      stompClient = null;
      console.log("WebSocket disconnected");
    }
  }

  isConnected(): boolean {
    return stompClient?.connected ?? false;
  }

  // Helper method to get user topic
  static getUserTopic(userId: string): string {
    return `/topic/submit/${userId}`;
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();

// Auto-disconnect on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    websocketService.disconnect();
  });
}
