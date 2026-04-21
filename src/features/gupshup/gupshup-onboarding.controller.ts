import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { GupshupOnboardingService } from "./gupshup-onboarding.service";

@ApiTags("Gupshup")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("gupshup/onboarding")
export class GupshupOnboardingController {
  constructor(private readonly gupshup: GupshupOnboardingService) {}

  @Get("embed-link")
  @ApiQuery({ name: "user", required: true })
  @ApiQuery({ name: "lang", required: true })
  @ApiQuery({ name: "regenerate", required: false, type: Boolean })
  async getEmbedLink(
    @Query("user") user: string,
    @Query("lang") lang: string,
    @Query("regenerate") regenerate?: string,
  ) {
    const link = await this.gupshup.generateEmbedLink(
      user,
      lang,
      regenerate === "true",
    );
    return { link };
  }

}
