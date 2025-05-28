import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBusinessUserDto } from "./dto/business_user_onboard.dto";

@Injectable()
export class BusinessUserService {
  constructor(private readonly prisma: PrismaService) {}

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
      const { clientId, organizationId } = integrationConfig;

      if (!clientId ||!organizationId) {
        throw new BadRequestException("Missing Zoho integration credentials");
      }

      await this.prisma.zoho_user_credential.create({
        data: {
          business_user_id: businessUser.id,
          
        client_id:clientId,
          organization_id: organizationId,
        },
      });
    }

    return businessUser;
  }
}
