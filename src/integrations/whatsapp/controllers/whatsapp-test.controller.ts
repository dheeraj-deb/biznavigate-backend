import { Body, Controller, Post } from '@nestjs/common';
import { ConversationHandlerService } from '../services/conversation-handler.service';

export interface TestMessageDto {
  distributorPhoneNumber: string;
  userPhoneNumber: string;
  message: string;
}

@Controller('whatsapp/test')
export class WhatsAppTestController {
  constructor(private conversationHandler: ConversationHandlerService) {}

  @Post('message')
  async testMessage(@Body() testData: TestMessageDto) {
    try {
      const response = await this.conversationHandler.handleMessage(
        testData.distributorPhoneNumber,
        testData.userPhoneNumber,
        testData.message
      );

      return {
        success: true,
        data: response,
        input: testData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        input: testData,
      };
    }
  }

  @Post('conversation-flow')
  async testConversationFlow(@Body() testData: { 
    distributorPhoneNumber: string;
    userPhoneNumber: string;
    messages: string[];
  }) {
    const responses = [];
    
    try {
      for (const message of testData.messages) {
        const response = await this.conversationHandler.handleMessage(
          testData.distributorPhoneNumber,
          testData.userPhoneNumber,
          message
        );
        
        responses.push({
          input: message,
          response: response,
        });
      }

      return {
        success: true,
        conversationFlow: responses,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        conversationFlow: responses,
      };
    }
  }

  @Post('reset-session')
  async resetSession(@Body() testData: { userPhoneNumber: string }) {
    try {
      const { RedisSessionService } = await import('../services/redis-session.service');
      const sessionService = new RedisSessionService();

      await sessionService.deleteSession(testData.userPhoneNumber);

      return {
        success: true,
        message: `Session reset for ${testData.userPhoneNumber}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
