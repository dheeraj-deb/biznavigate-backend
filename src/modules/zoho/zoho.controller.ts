import { Body, Controller, Get, Param, Query } from "@nestjs/common";
import { Zoho } from "src/integration/crms/zoho/zoho";

@Controller("zoho")
export class ZohoController {
  constructor(private readonly Zoho: Zoho) {}

  @Get("auth/callback")
  async handleAuthCallback(
    @Query("code") code: any,
    @Query("state") state: string
  ) {
    console.log("Authorization callback received:", code);
    const { access_token } = await this.Zoho.getAccessToken(
      state,
      "f9e61cf16c55a874fec0a97f7f345109a32a362304",
      code,
      "authorization_code"
    );
    return this.Zoho.getItems("60041288016", access_token);
    // const items = []
    // return { access_token, items };
    // Handle the authorization callback from Zoho
    // This is where you would exchange the authorization code for an access token
  }

  @Get("get-authorization-code")
  async getAuthorizationCode(@Query("clientId") clientId: string) {
    return await this.Zoho.getAuthorizationCodeLink(clientId);
  }

  // Example method
  @Get()
  getHello(): string {
    return "Hello from Zoho Controller!";
  }
}
