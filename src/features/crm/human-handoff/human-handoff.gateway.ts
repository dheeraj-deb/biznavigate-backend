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
    namespace: '/handoff',
})
export class HumanHandoffGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(HumanHandoffGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Handoff client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Handoff client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoin(client: Socket, businessId: string) {
        client.join(`biz:${businessId}`);
        this.logger.log(`Handoff client ${client.id} joined room biz:${businessId}`);
        return { joined: businessId };
    }

    @SubscribeMessage('leave')
    handleLeave(client: Socket, businessId: string) {
        client.leave(`biz:${businessId}`);
    }

    /** New escalation arrived — agent queue should refresh */
    notifyNewEscalation(
        businessId: string,
        data: {
            conversationId: string;
            reason: string;
            phone: string;
            escalated_at: Date;
            customer_name?: string;
            lead_id?: string;
        },
    ) {
        this.server.to(`biz:${businessId}`).emit('new_escalation', data);
    }

    /** An agent took over a conversation */
    notifyAgentAssigned(businessId: string, conversationId: string, agentId: string, assignedAt: Date) {
        this.server.to(`biz:${businessId}`).emit('agent_assigned', { conversationId, agent_id: agentId, assigned_at: assignedAt });
    }

    /** Agent sent a message to the customer */
    notifyAgentMessage(businessId: string, conversationId: string, message: any) {
        this.server.to(`biz:${businessId}`).emit('agent_message', { conversationId, message });
    }

    /** Customer replied while conversation is human-handled */
    notifyCustomerMessage(businessId: string, conversationId: string, message: any) {
        this.server.to(`biz:${businessId}`).emit('customer_message', { conversationId, message });
    }

    /** Conversation resolved/closed */
    notifyResolved(businessId: string, conversationId: string, resolvedAt: Date) {
        this.server.to(`biz:${businessId}`).emit('conversation_resolved', { conversationId, resolved_at: resolvedAt });
    }
}
