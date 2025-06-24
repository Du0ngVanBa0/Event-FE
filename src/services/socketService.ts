import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface SocketMessage {
    type: string;
    data: unknown;
}

interface MessageCallback {
    (message: SocketMessage): void;
}

class SocketService {
    private client: Client | null = null;
    private connected: boolean = false;

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client && this.connected) {
                resolve();
                return;
            }

            const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const wsUrl = `${serverUrl}/ws`;

            this.client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                connectHeaders: {},
                debug: (str) => {
                    console.log('STOMP: ' + str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            this.client.onConnect = () => {
                this.connected = true;
                resolve();
            };

            this.client.onStompError = () => {
                this.connected = false;
                reject(new Error('STOMP connection failed'));
            };

            this.client.onWebSocketError = (error) => {
                console.error('WebSocket error: ', error);
                this.connected = false;
                reject(error);
            };

            this.client.onDisconnect = () => {
                this.connected = false;
            };

            this.client.activate();
        });
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.connected = false;
        }
    }

    isConnected(): boolean {
        return this.connected && this.client?.connected === true;
    }

    subscribe(destination: string, callback: (message: SocketMessage) => void): StompSubscription | null {
        if (!this.client || !this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        return this.client.subscribe(destination, (message: IMessage) => {
            try {
                const parsedMessage = JSON.parse(message.body) as SocketMessage;
                callback(parsedMessage);
            } catch (error) {
                console.error('Error parsing message:', error);
                // Fallback to treating message.body as the data
                callback({
                    type: 'unknown',
                    data: message.body
                });
            }
        });
    }

    subscribeToEventReviews(maSuKien: string, callback: MessageCallback): StompSubscription | null {
        const destination = `/topic/events/${maSuKien}/reviews`;
        return this.subscribe(destination, callback);
    }

    unsubscribe(subscription: StompSubscription | null): void {
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    publish(destination: string, body: Record<string, unknown> = {}): void {
        if (!this.client || !this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body)
        });
    }
}

export const socketService = new SocketService();
export default socketService;
