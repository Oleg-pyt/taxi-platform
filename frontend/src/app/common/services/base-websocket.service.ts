import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environments";

@Injectable()
export abstract class BaseWebSocketService {
    private socket: WebSocket | null = null;

    public connect(token: string): void {
        if (this.socket) {
            console.warn('WebSocket is already connected');
            return;
        }
        const wsUrl = this.getWebSocketUrl(token);
        try {
            this.socket = new WebSocket(wsUrl);
            this.socket.onopen = () => this.onWebSocketOpen();
            this.socket.onmessage = (event) => this.onWebSocketMessage(event);
            this.socket.onerror = (error) => this.onWebSocketError(error);
            this.socket.onclose = () => this.onWebSocketClose();
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }

    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    protected getWebSocketUrl(token: string): string {
        const wsUrl = environment['wsUrl'];
        const encodedToken = encodeURIComponent(token);
        return `${wsUrl}?token=${encodedToken}`;
    }

    protected abstract onWebSocketOpen(): void;
    protected abstract onWebSocketMessage(event: MessageEvent): void;
    protected abstract onWebSocketError(error: Event): void;
    protected abstract onWebSocketClose(): void;
}
