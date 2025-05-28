import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBusinessUserDto } from "./dto/business_user_onboard.dto";
import { Zoho } from "src/integration/crms/zoho/zoho";

@Injectable()
export class BusinessUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly Zoho: Zoho
  ) {}

  async createBusinessUser(dto: CreateBusinessUserDto) {
    const {
      platformId,
      integrationConfig,
      customerId,
      businessName,
      contactPhone,
      notificationPreference,
      contactEmail,
      gstin,
      address,
    } = dto;

    // ✅ 1. Validate platform exists
    const integration = await this.prisma.integrations.findUnique({
      where: { id: platformId },
    });

    if (!integration) {
      throw new BadRequestException(`Invalid integrationId: '${platformId}'`);
    }

    // ✅ 2. Create business user
    const businessUser = await this.prisma.business_user.create({
      data: {
        customerId,
        businessName,
        contactPhone,
        contactEmail,
        gstin,
        address,
        notificationPreference,
        platformId,
      },
    });

    // ✅ 3. If platform is Zoho, save credentials
    if (integration.name.toLowerCase() === "zoho") {
      const { clientId, clientSecret, organizationId } = integrationConfig;

      if (!clientId || !organizationId || !clientSecret) {
        throw new BadRequestException("Missing Zoho integration credentials");
      }

      await this.prisma.zoho_user_credential.create({
        data: {
          business_user_id: businessUser.id,
          client_secret: clientSecret,
          client_id: clientId,
          organization_id: organizationId,
        },
      });

      return this.Zoho.getAuthorizationCodeLink(clientId, clientSecret);
    }

    return businessUser;
  }

  async saveZohoCredentials(code: string, state: string) {
    const [clientId, clientSecret] = state.split(",");

    if (!clientId || !clientSecret) {
      throw new BadRequestException("Invalid state parameter");
    }

    try {
      const { access_token, refresh_token } = await this.Zoho.getAccessToken(
        clientId,
        clientSecret,
        code,
        "authorization_code"
      );

      await this.prisma.zoho_user_credential.update({
        where: { client_id: clientId },
        data: { access_token, refresh_token },
      });

      return {
        message: "Zoho credentials saved successfully",
        stats: 200,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error saving Zoho credentials: ${error.message}`
      );
    }
  }
}
