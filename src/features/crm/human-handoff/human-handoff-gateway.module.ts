import { Module } from '@nestjs/common';
import { HumanHandoffGateway } from './human-handoff.gateway';

@Module({
    providers: [HumanHandoffGateway],
    exports: [HumanHandoffGateway],
})
export class HumanHandoffGatewayModule {}
