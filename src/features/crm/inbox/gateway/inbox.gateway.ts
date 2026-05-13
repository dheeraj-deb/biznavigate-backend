import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/inbox',
})
export class InboxGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(InboxGateway.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async handleConnection(client: Socket) {
        const token = this.extractToken(client);
        if (!token) {
            this.logger.warn(`Socket ${client.id} disconnected: missing token`);
            client.disconnect(true);
            return;
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET') || this.configService.get<string>('JWT_SECRET'),
            });
            client.data.user = payload;
            client.data.business_id = payload.business_id;
            this.logger.log(`Client connected: ${client.id}`);
        } catch {
            this.logger.warn(`Socket ${client.id} disconnected: invalid token`);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoin(client: Socket, businessId: string) {
        if (!client.data.business_id || client.data.business_id !== businessId) {
            this.logger.warn(`Client ${client.id} denied room biz:${businessId}`);
            return { joined: false, error: 'Forbidden business room' };
        }
        client.join(`biz:${businessId}`);
        this.logger.log(`Client ${client.id} joined room biz:${businessId}`);
        return { joined: businessId };
    }

    @SubscribeMessage('leave')
    handleLeave(client: Socket, businessId: string) {
        if (client.data.business_id !== businessId) return;
        client.leave(`biz:${businessId}`);
    }

    private extractToken(client: Socket): string | null {
        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string' && authToken.length > 0) return authToken;

        const header = client.handshake.headers.authorization;
        if (typeof header === 'string' && header.startsWith('Bearer ')) {
            return header.slice('Bearer '.length);
        }

        const queryToken = client.handshake.query?.token;
        return typeof queryToken === 'string' && queryToken.length > 0 ? queryToken : null;
    }

    notifyNewMessage(businessId: string, conversationId: string, message: any) {
        this.server
            .to(`biz:${businessId}`)
            .emit('new_message', { conversationId, message });
    }

    notifyMessageSent(businessId: string, conversationId: string, message: any) {
        this.server
            .to(`biz:${businessId}`)
            .emit('message_sent', { conversationId, message });
    }

    notifyConversationUpdated(businessId: string, conversationId: string, preview: { message_text: string; timestamp: Date }) {
        this.server
            .to(`biz:${businessId}`)
            .emit('conversation_updated', { conversationId, ...preview });
    }

    notifyEscalation(businessId: string, conversationId: string, data: { reason: string; phone: string; escalated_at: Date }) {
        this.server
            .to(`biz:${businessId}`)
            .emit('escalation', { conversationId, is_ai_handled: false, ...data });
    }

    notifyConversationResolved(businessId: string, conversationId: string, resolved_at: Date) {
        this.server
            .to(`biz:${businessId}`)
            .emit('conversation_resolved', { conversationId, resolved_at });
    }

    notifyStatusUpdate(
        businessId: string,
        conversationId: string,
        platformMessageId: string,
        status: string,
    ) {
        this.server
            .to(`biz:${businessId}`)
            .emit('status_update', { conversationId, platformMessageId, status });
    }
}
