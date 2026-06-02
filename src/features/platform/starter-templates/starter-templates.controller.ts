import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import {
  ApplyRecommendedStarterTemplatesDto,
  ApplyStarterTemplateDto,
  StarterTemplateQueryDto,
} from "./dto/apply-starter-template.dto";
import { StarterTemplatesService } from "./starter-templates.service";

@UseGuards(JwtAuthGuard)
@Controller("starter-templates")
export class StarterTemplatesController {
  constructor(private readonly starterTemplates: StarterTemplatesService) {}

  @Get()
  async list(@Query() query: StarterTemplateQueryDto): Promise<any> {
    return this.starterTemplates.listTemplates(query);
  }

  @Post("apply")
  async apply(@Request() req, @Body() dto: ApplyStarterTemplateDto): Promise<any> {
    return this.starterTemplates.applyTemplateToBusiness({
      businessId: req.user.business_id,
      templateKey: dto.template_key,
      force: dto.force,
    });
  }

  @Post("apply-recommended")
  async applyRecommended(@Request() req, @Body() dto: ApplyRecommendedStarterTemplatesDto = {}): Promise<any> {
    return this.starterTemplates.applyRecommendedTemplates(req.user.business_id, {
      phase: dto.phase,
    });
  }

  @Post(":templateKey/apply")
  async applyByKey(@Request() req, @Param("templateKey") templateKey: string): Promise<any> {
    return this.starterTemplates.applyTemplateToBusiness({
      businessId: req.user.business_id,
      templateKey,
    });
  }
}
