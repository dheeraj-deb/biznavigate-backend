import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { GupshupOnboardingService } from "./gupshup-onboarding.service";

@ApiTags("Gupshup")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("gupshup/onboarding")
export class GupshupOnboardingController {
  constructor(private readonly gupshup: GupshupOnboardingService) {}

  // ── Embedded Signup link (Gupshup-hosted, legacy) ──────────────────────────

  @Get("embed-link")
  @ApiOperation({ summary: "Generate a Gupshup-hosted Embedded Signup link (legacy flow)" })
  @ApiQuery({ name: "user", required: true })
  @ApiQuery({ name: "lang", required: true })
  @ApiQuery({ name: "regenerate", required: false, type: Boolean })
  async getEmbedLink(
    @Query("user") user: string,
    @Query("lang") lang: string,
    @Query("regenerate") regenerate?: string,
  ) {
    const link = await this.gupshup.generateEmbedLink(user, lang, regenerate === "true");
    return { link };
  }

  @Post("complete")
  @ApiOperation({ summary: "Complete onboarding using Gupshup app details API (legacy flow)" })
  async completeOnboarding(@Request() req: { user: { business_id: string } }) {
    const { business_id } = req.user;
    return this.gupshup.completeOnboarding(business_id);
  }

  // ── TPP Hosted Embed — Status endpoint ────────────────────────────────────

  @Get("pipeline-status/:appId")
  @ApiOperation({
    summary: "Get Gupshup pipeline status for a linked WABA app (TPP flow)",
    description:
      "Returns the current provisioning stage for a Gupshup app created via the TPP Hosted Embed flow. " +
      "Poll this after POST /whatsapp/oauth/embedded-callback until creationStage = WHATSAPP_PROVISIONING_DONE.",
  })
  @ApiParam({ name: "appId", required: true, description: "Gupshup app UUID returned from the link-app step" })
  @ApiResponse({
    status: 200,
    description: "Pipeline status from Gupshup",
    schema: {
      example: {
        status: "success",
        whatsapp: {
          creationStage: "WHATSAPP_PROVISIONING_DONE",
          pipeLineStage: "FINALIZE",
          embedStage: "EMBED_STARTED",
          whatsappVerificationStatus: "WHATSAPP_VERIFICATION_DONE",
        },
      },
    },
  })
  async getPipelineStatus(@Param("appId") appId: string) {
    return this.gupshup.getStatusForApp(appId);
  }
}
