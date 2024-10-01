import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient;
let url = process.env.REACT_APP_BASE_ENDPOINT_SOCKET;
let reconnectAttempts = 0;

export const getSocket = () => {
    if (!stompClient) {
        const socket = new SockJS(url);
        stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                // Subscribe to a topic (example)
                stompClient.subscribe('/topic/messages', (message) => {
                    console.log('Received message:', message.body);
                });
            },
            onStompError: (frame) => {
                console.error('Broker error:', frame.headers['message']);
                console.error('Additional details:', frame.body);
            },
            onWebSocketClose: () => {
                console.log('WebSocket connection closed');
                attemptReconnect(); 
            },
            onWebSocketError: (error) => {
                console.error('WebSocket error:', error);
            },
        });

        stompClient.activate();
        console.log('init socket done!')
    }
    // Thêm sự kiện để ngắt kết nối khi trang web đóng
    window.addEventListener('beforeunload', () => {
        disconnectSocket();
    });
    return stompClient;
};

export const attemptReconnect = () => {
    reconnectAttempts++;
    console.log(`Reconnection attempt ${reconnectAttempts}...`);

    // Set a retry timer (adjustable)
    setTimeout(() => {
        if (stompClient && !stompClient.connected) {
            console.log('Reactivating the socket...');
            stompClient.activate(); // Try to activate again
        }

        // Check if it's still not connected, keep retrying
        if (stompClient && !stompClient.connected) {
            attemptReconnect(); // Recursive call to keep trying
        }
    }, 5000); // Retry every 5 seconds
};

export const disconnectSocket = () => {
    if (stompClient && stompClient.connected) {
        stompClient.deactivate();
        stompClient = null; // Đặt lại biến socketInstance khi ngắt kết nối
        console.log('socket disconnect...')
    }
};