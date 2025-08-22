import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import axios from "axios";
import { PrismaService } from "src/prisma/prisma.service";

export interface ZohoCurrency {
  currency_id: string;
  currency_code: string;
  currency_name: string;
  is_base_currency: boolean;
}

export interface ZohoContact {
  contact_id?: string;
  contact_name: string;
  company_name: string;
  contact_type: string;
  currency_id: string;
  billing_address: any;
  shipping_address: any;
  vat_reg_no?: string;
  tax_reg_no?: string;
  gst_no?: string;
}

export interface ZohoSalesOrder {
  salesorder_id?: string;
  customer_id: string;
  salesorder_number?: string;
  date: string;
  line_items: ZohoLineItem[];
  currency_id?: string;
}

export interface ZohoLineItem {
  item_id?: string;
  name: string;
  description?: string;
  rate: number;
  quantity: number;
  unit?: string;
}

export interface ZohoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
}

@Injectable()
export class ZohoService {
  private readonly logger = new Logger(ZohoService.name);
  private readonly baseUrl: string;
  private readonly authUrl: string;
  private readonly tokenUrl: string;
  private readonly inventoryUrl: string;
  private readonly authCallbackUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private prisma: PrismaService
  ) {
    this.baseUrl = this.configService.get("zoho.apiDomain");
    this.authUrl = this.configService.get("zoho.authUrl");
    this.tokenUrl = this.configService.get("zoho.tokenUrl");
    this.inventoryUrl = this.configService.get("zoho.inventoryUrl");
    this.authCallbackUrl = this.configService.get("zoho.redirectUri");
    ("https://489a-103-70-197-101.ngrok-free.app/business-user/auth/callback");
  }

  async getAuthorizationCodeLink(
    clientId: string,
    clientSecret: string
  ): Promise<string> {
    const scope =
      this.configService.get("zoho.scope") ||
      "ZohoInventory.items.READ,ZohoInventory.inventoryadjustments.CREATE,ZohoInventory.contacts.READ,ZohoInventory.contacts.CREATE,ZohoInventory.settings.READ";

    const state = `${clientId},${clientSecret}`;
    const authUrl = new URL(this.authUrl);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("redirect_uri", this.authCallbackUrl);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");

    this.logger.log(`Generated Zoho authorization URL for client: ${clientId}`);
    return authUrl.toString();
  }

  async getAccessToken(
    clientId: string,
    clientSecret: string,
    code: string,
    grantType: string,
    refreshToken?: string
  ): Promise<ZohoTokenResponse> {
    try {
      const { access_token, expires_in, token_acquired_at, refresh_token } =
        await this.prisma.zoho_user_credential.findUnique({
          where: { client_id: clientId },
        });

      console.log("Access token found:", access_token);

      if (access_token) {
        const isExpired =
          new Date(token_acquired_at).getTime() + expires_in * 1000 <
          Date.now();

        if (!isExpired) {
          console.log(true);
          return { access_token, expires_in, refresh_token };
        } else {
          console.log(false);
          const params = new URLSearchParams({
            grant_type: grantType,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: this.authCallbackUrl,
          });

          if (grantType === "authorization_code") {
            params.append("code", code);
          } else if (grantType === "refresh_token" && refreshToken) {
            params.append("refresh_token", refreshToken);
          }
          const response = await axios.post<ZohoTokenResponse>(
            this.tokenUrl,
            params,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
          const { access_token, expires_in, refresh_token } = response.data;
          this.prisma.zoho_user_credential.update({
            where: { client_id: clientId },
            data: {
              access_token,
              expires_in,
              refresh_token,
              token_acquired_at: new Date().toISOString(),
            },
          });
          return {
            access_token,
            expires_in,
            refresh_token,
          };
        }
      } else {
        const params = new URLSearchParams({
          grant_type: grantType,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: this.authCallbackUrl,
        });

        if (grantType === "authorization_code") {
          params.append("code", code);
        } else if (grantType === "refresh_token" && refreshToken) {
          params.append("refresh_token", refreshToken);
        }
        const response = await axios.post<ZohoTokenResponse>(
          this.tokenUrl,
          params,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        console.log("Response", response.data);

        this.logger.log(
          `Successfully obtained Zoho access token for client: ${clientId}`
        );
        return response.data;
      }
    } catch (error) {
      this.logger.error(`Failed to get Zoho access token: ${error.message}`);
      throw new Error(`Zoho authentication failed: ${error.message}`);
    }
  }

  async verifyOrganizationId(
    organizationId: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ organization: any }>(
          `${this.inventoryUrl}/organizations/${organizationId}`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          }
        )
      );

      return response.data.organization?.organization_id === organizationId;
    } catch (error) {
      this.logger.error(`Error verifying organization ID: ${error.message}`);
      throw new Error("Error verifying organization ID");
    }
  }

  async getCurrencies(
    organizationId: string,
    accessToken: string
  ): Promise<ZohoCurrency[]> {
    this.logger.log(`Fetching currencies for organization: ${organizationId}`);
    try {
      const response = await axios.get(
        `${this.inventoryUrl}/settings/currencies`,
        {
          params: {
            organization_id: organizationId,
          },
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );

      this.logger.log(
        `Retrieved ${
          response.data.currencies?.length || 0
        } currencies from Zoho`
      );
      return response.data.currencies || [];
    } catch (error) {
      this.logger.error(`Failed to get currencies from Zoho: ${error.message}`);
      throw new Error(`Failed to retrieve currencies: ${error.message}`);
    }
  }

  async createContact(
    contactData: ZohoContact,
    organizationId: string,
    accessToken: string
  ): Promise<void | { contact: any } | { message: string; status: boolean }> {
    try {
      this.logger.log(
        `Creating contact with data: ${JSON.stringify(contactData)}`
      );

      const response = await axios.post(
        `${this.inventoryUrl}/contacts`,
        contactData,
        {
          params: {
            organization_id: organizationId,
          },
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return {
        status: true,
        contact: response.data.contact,
      };
    } catch (error) {
      if (error.response && error.response.data.code === 3062) {
        return {
          status: false,
          message: error.response.data.message || "Unknown error occurred",
        };
      } else {
        this.logger.error(`Failed to create contact in Zoho: ${error.message}`);
        throw new Error(`Failed to create contact: ${error.message}`);
      }
    }
  }

  async getContact(
    contactId: string,
    organizationId: string,
    accessToken: string
  ): Promise<{ contact: any }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ contact: any }>(
          `${this.inventoryUrl}/contacts/${contactId}`,
          {
            params: {
              organization_id: organizationId,
            },
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get contact from Zoho: ${error.message}`);
      throw new Error(`Failed to retrieve contact: ${error.message}`);
    }
  }

  async createSalesOrder(
    orderData: ZohoSalesOrder,
    organizationId: string,
    accessToken: string
  ): Promise<{ salesorder: any }> {
    try {
      this.logger.log(
        `Creating sales order with data: ${JSON.stringify(orderData)}`
      );

      const response = await firstValueFrom(
        this.httpService.post<{ salesorder: any }>(
          `${this.inventoryUrl}/salesorders`,
          orderData,
          {
            params: {
              organization_id: organizationId,
            },
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )
      );

      this.logger.log(
        `Successfully created sales order in Zoho: ${response.data.salesorder?.salesorder_id}`
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create sales order in Zoho: ${error.message}`
      );
      throw new Error(`Failed to create sales order: ${error.message}`);
    }
  }

  async getItems(organizationId: string, accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.inventoryUrl}/items`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: organizationId,
        },
      });

      this.logger.log(
        `Retrieved ${response.data.items?.length || 0} items from Zoho`
      );
      return response.data.items || [];
    } catch (error) {
      this.logger.error(`Failed to get items from Zoho: ${error.message}`);
      throw new Error(`Failed to retrieve items: ${error}`);
    }
  }

  async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<ZohoTokenResponse> {
    return this.getAccessToken(
      clientId,
      clientSecret,
      "",
      "refresh_token",
      refreshToken
    );
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      // Make a simple API call to validate the token
      const url = `${this.baseUrl}/books/v3/organizations`;

      await firstValueFrom(
        this.httpService.get<{ organizations: any[] }>(url, {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
        })
      );

      return true;
    } catch (error) {
      this.logger.warn(`Zoho token validation failed: ${error.message}`);
      return false;
    }
  }
}
