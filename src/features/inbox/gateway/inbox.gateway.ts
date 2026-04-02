import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/inbox',
})
export class InboxGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(InboxGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoin(client: Socket, businessId: string) {
        client.join(`biz:${businessId}`);
        this.logger.log(`Client ${client.id} joined room biz:${businessId}`);
        return { joined: businessId };
    }

    @SubscribeMessage('leave')
    handleLeave(client: Socket, businessId: string) {
        client.leave(`biz:${businessId}`);
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

    notifyEscalation(businessId: string, conversationId: string, data: { reason: string; phone: string; escalated_at: Date }) {
        this.server
            .to(`biz:${businessId}`)
            .emit('escalation', { conversationId, ...data });
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
