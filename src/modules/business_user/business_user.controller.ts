import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { BusinessUserService } from "./business_user.service";
import { CreateBusinessUserDto } from "./dto/business_user_onboard.dto";

@Controller("business-user")
export class BusinessUserController {
  constructor(private readonly businessUserService: BusinessUserService) {}

  @Post()
  async createBusinessUser(@Body() dto: CreateBusinessUserDto) {
    return this.businessUserService.createBusinessUser(dto);
  }

  @Get("auth/callback")
  async handleAuthCallback(
    @Query("code") code: string,
    @Query("state") state: string
  ) {
    return this.businessUserService.saveZohoCredentials(code, state);
  }
}
