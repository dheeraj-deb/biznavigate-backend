import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { GupshupOnboardingService } from "./gupshup-onboarding.service";

@UseGuards(JwtAuthGuard)
@Controller("gupshup/onboarding")
export class GupshupOnboardingController {
  constructor(private readonly gupshup: GupshupOnboardingService) {}

  // ── Embedded Signup link (Gupshup-hosted, legacy) ──────────────────────────

  @Get("embed-link")
  async getEmbedLink(
    @Query("user") user: string,
    @Query("lang") lang: string,
    @Query("regenerate") regenerate?: string,
  ) {
    const link = await this.gupshup.generateEmbedLink(user, lang, regenerate === "true");
    return { link };
  }

  @Post("complete")
  async completeOnboarding(@Request() req: { user: { business_id: string } }) {
    const { business_id } = req.user;
    return this.gupshup.completeOnboarding(business_id);
  }

  // ── TPP Hosted Embed — Status endpoint ────────────────────────────────────

  @Get("pipeline-status/:appId")
  async getPipelineStatus(@Param("appId") appId: string) {
    return this.gupshup.getStatusForApp(appId);
  }
}
