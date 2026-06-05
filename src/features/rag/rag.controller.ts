import { Body, Controller, Delete, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RagService } from './rag.service';
import { IngestDocumentsDto } from './dto/ingest-documents.dto';

@UseGuards(JwtAuthGuard)
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  async ingest(@Request() req, @Body() dto: IngestDocumentsDto) {
    const { business_id } = req.user;
    const count = await this.ragService.ingestDocuments(
      business_id,
      dto.collection,
      dto.documents,
    );
    return { ingested: count };
  }

  @Delete('documents')
  async deleteDocuments(@Request() req, @Query('collection') collection?: string) {
    const { business_id } = req.user;
    await this.ragService.deleteDocuments(business_id, collection);
    return { success: true };
  }
}
