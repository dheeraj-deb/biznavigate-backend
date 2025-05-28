import { Body, Controller, Post } from "@nestjs/common";
import { BusinessUserService } from "./business_user.service";
import { CreateBusinessUserDto } from "./dto/business_user_onboard.dto";

@Controller("business-user")
export class BusinessUserController {
  constructor(private readonly businessUserService: BusinessUserService) {}

  @Post()
  async createBusinessUser(@Body() dto: CreateBusinessUserDto) {
    return this.businessUserService.createBusinessUser(dto);
  }
}
