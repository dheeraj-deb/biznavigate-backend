import { Body, Controller, Post, Query } from "@nestjs/common";
import { CreateContact } from "./dto/user.dto";
import { UserService } from "./user.service";

@Controller()
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Post("/create-shop")
  async registerShop(
    @Body() body: CreateContact,
    @Query("clientId") clientId: string,
    @Query("platform") platform: string
  ): Promise<any> {
    try {
      const result = await this.UserService.registerShop(
        body,
        clientId,
        platform
      );

      return {
        message: "Shop registered successfully",
        data: result, // It's often better to return the result from the service
      };
      //   return {
      //     message: "Shop registered successfully",
      //     data: body,
      //   };
    } catch (error) {
      throw error;
    }
  }
}
