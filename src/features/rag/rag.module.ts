import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { RagDocument, RagDocumentSchema } from './schemas/rag-document.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: RagDocument.name, schema: RagDocumentSchema }]),
  ],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
