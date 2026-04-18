import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class GupshupOnboardingService implements OnModuleInit {
  private readonly logger = new Logger(GupshupOnboardingService.name);
  private readonly baseUrl = "https://partner.gupshup.io";
  private readonly appId: string;
  private readonly email: string;
  private readonly password: string;

  private cachedPartnerToken: string | null = null;
  private partnerTokenExpiresAt: number = 0;

  private cachedAppToken: string | null = null;
  private appTokenExpiresAt: number = 0;

  constructor(private readonly config: ConfigService) {
    this.appId = this.config.getOrThrow<string>("GUPSHUP_APP_ID");
    this.email = this.config.getOrThrow<string>("GUPSHUP_EMAIL");
    this.password = this.config.getOrThrow<string>("GUPSHUP_PASSWORD");
  }

  async onModuleInit() {
    try {
      await this.subscribeWebhook();
      this.logger.log("Gupshup webhook subscription registered");
    } catch (e) {
      this.logger.error("Failed to register Gupshup webhook", e.message);
    }
  }

  private async getPartnerToken(): Promise<string> {
    if (this.cachedPartnerToken && Date.now() < this.partnerTokenExpiresAt - 5 * 60 * 1000) {
      return this.cachedPartnerToken;
    }

    const params = new URLSearchParams();
    params.append("email", this.email);
    params.append("password", this.password);

    const { data } = await axios.post(
      `${this.baseUrl}/partner/account/login`,
      params,
      { headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" } },
    );

    if (!data.token) {
      throw new InternalServerErrorException("Failed to authenticate with Gupshup");
    }

    this.cachedPartnerToken = data.token;
    this.partnerTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return this.cachedPartnerToken;
  }

  private async getAppToken(): Promise<string> {
    if (this.cachedAppToken && Date.now() < this.appTokenExpiresAt - 5 * 60 * 1000) {
      return this.cachedAppToken;
    }

    const partnerToken = await this.getPartnerToken();

    const { data } = await axios.get(
      `${this.baseUrl}/partner/app/${this.appId}/token`,
      { headers: { token: partnerToken } },
    );

    if (!data.token?.token) {
      throw new InternalServerErrorException("Failed to get Gupshup app token");
    }

    this.cachedAppToken = data.token.token;
    this.appTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return this.cachedAppToken;
  }

  async subscribeWebhook(): Promise<any> {
    const appToken = await this.getAppToken();
    const backendUrl = this.config.getOrThrow<string>("BACKEND_URL");
    const webhookUrl = `${backendUrl}/whatsapp/webhook`;

    const params = new URLSearchParams();
    params.append("modes", "MESSAGE,SENT,DELIVERED,READ,FAILED,OTHERS,FLOWS_MESSAGE");
    params.append("tag", "BizNavigate-V3");
    params.append("url", webhookUrl);
    params.append("version", "3");
    params.append("showOnUI", "false");

    const { data } = await axios.post(
      `${this.baseUrl}/partner/app/${this.appId}/subscription`,
      params,
      { headers: { Authorization: appToken, "Content-Type": "application/x-www-form-urlencoded" } },
    );

    if (data.status !== "success") {
      throw new InternalServerErrorException(data.message ?? "Failed to subscribe webhook");
    }

    return data.subscription;
  }

  async generateEmbedLink(user: string, lang: string, regenerate = false): Promise<string> {
    const partnerToken = await this.getPartnerToken();
    const url = `${this.baseUrl}/partner/app/${this.appId}/onboarding/embed/link`;

    const { data } = await axios.get(url, {
      headers: { token: partnerToken },
      params: { user, lang, regenerate },
    });

    if (data.status !== "success") {
      throw new InternalServerErrorException(data.message ?? "Failed to generate embed link");
    }

    return data.link as string;
  }
}
