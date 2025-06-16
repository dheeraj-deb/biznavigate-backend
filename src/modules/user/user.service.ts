import { BadRequestException, Injectable } from "@nestjs/common";
import { Zoho } from "src/integration/crms/zoho/zoho";
import { CreateContact } from "./dto/user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { ContactType } from "src/integration/crms/zoho/interfaces/interface";
import { count } from "rxjs";

@Injectable()
export class UserService {
  constructor(private Zoho: Zoho, private readonly prisma: PrismaService) {}

  async registerShop(
    body: CreateContact,
    clientId: string,
    platform: string
  ): Promise<any> {
    try {
      if (!clientId) {
        throw new BadRequestException("Client ID is required");
      }

      if (!platform) {
        throw new BadRequestException("Platform is required");
      }

      if (platform.toLowerCase() === "zoho") {
        const platforCredential =
          await this.prisma.zoho_user_credential.findUnique({
            where: {
              client_id: clientId,
            },
          });

        if (!platforCredential) {
          throw new BadRequestException(
            "Platform credentials not found for the given client ID"
          );
        }

        // Ensure access token exists
        if (!platforCredential.access_token) {
          throw new BadRequestException(
            "Access token not found for the given client ID"
          );
        }

        if (!platforCredential.organization_id) {
          throw new BadRequestException(
            "Organization ID not found for the given client ID"
          );
        }

        const accessToken = platforCredential?.access_token;
        const organizationId = platforCredential?.organization_id;

        const currencies = await this.Zoho.getCurrencies(
          organizationId,
          accessToken
        );

        console.log("Currencies:", currencies);

        if (!currencies || currencies.length === 0) {
          throw new BadRequestException(
            "No currencies found for the organization"
          );
        }

        const baseCurrency = currencies.find(
          (currency) => currency.is_base_currency
        );

        if (!baseCurrency) {
          throw new BadRequestException(
            "Base currency not found for the organization"
          );
        }

        const mapedObject = {
          contact_name: body.contact_name,
          company_name: body.company_name,
          contact_type: ContactType.customer,
          currency_id: baseCurrency.currency_id,
          billing_address: {
            ...body.billing_address,
            country: "India",
          },
          shipping_address: {
            ...body.shipping_address,
            country: "India",
          },
          vat_reg_no: body.vat_reg_number,
          tax_reg_no: body.tax_reg_number,
          gst_no: body.gst_number,
        };

        const response = await this.Zoho.createContact(
          mapedObject,
          organizationId,
          accessToken
        );

        if (!response || !response.contact) {
          throw new BadRequestException("Failed to create contact in Zoho");
        }

        return {
          message: "Shop registered successfully",
          data: response.contact,
        };
      }

      // return {
      //   message: "Shop registered successfully",
      //   data: body,
      // };
    } catch (error) {
      console.error("Error registering shop:", error);
      throw error;
    }
  }

  async salesOrder(
    body: any,
    clientId: string,
    platform: string
  ): Promise<any> {
    try {
      if (!clientId) {
        throw new BadRequestException("Client ID is required");
      }

      if (!platform) {
        throw new BadRequestException("Platform is required");
      }

      if (platform.toLowerCase() === "zoho") {
        const platforCredential =
          await this.prisma.zoho_user_credential.findUnique({
            where: {
              client_id: clientId,
            },
          });

        if (!platforCredential) {
          throw new BadRequestException(
            "Platform credentials not found for the given client ID"
          );
        }

        // Ensure access token exists
        if (!platforCredential.access_token) {
          throw new BadRequestException(
            "Access token not found for the given client ID"
          );
        }

        if (!platforCredential.organization_id) {
          throw new BadRequestException(
            "Organization ID not found for the given client ID"
          );
        }

        const accessToken = platforCredential?.access_token;
        const organizationId = platforCredential?.organization_id;

        const response = await this.Zoho.createSalesOrder(
          body,
          organizationId,
          accessToken
        );

        if (!response || !response.salesorder) {
          throw new BadRequestException("Failed to create sales order in Zoho");
        }

        return {
          message: "Sales order created successfully",
          data: response.salesorder,
        };
      }
    } catch (error) {
      console.error("Error creating sales order:", error);
      throw error;
    }
  }
}
