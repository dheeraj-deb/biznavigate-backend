import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

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
  token_type: string;
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
    private readonly httpService: HttpService
  ) {
    this.baseUrl =
      this.configService.get("zoho.apiDomain") || "https://www.zohoapis.com";
    this.authUrl =
      this.configService.get("zoho.authUrl") ||
      "https://accounts.zoho.com/oauth/v2/auth";
    this.tokenUrl =
      this.configService.get("zoho.tokenUrl") ||
      "https://accounts.zoho.com/oauth/v2/token";
    this.inventoryUrl =
      this.configService.get("zoho.inventoryUrl") ||
      `${this.baseUrl}/inventory/v1`;
    this.authCallbackUrl =
      this.configService.get("zoho.redirectUri") ||
      "https://489a-103-70-197-101.ngrok-free.app/business-user/auth/callback";
  }

  async getAuthorizationCodeLink(
    clientId: string,
    clientSecret: string
  ): Promise<string> {
    const scope = this.configService.get("zoho.scope") ||
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

      const response = await firstValueFrom(
        this.httpService.post<ZohoTokenResponse>(this.tokenUrl, params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
      );

      this.logger.log(
        `Successfully obtained Zoho access token for client: ${clientId}`
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Zoho access token: ${error.message}`);
      throw new Error(`Zoho authentication failed: ${error.message}`);
    }
  }

  async verifyOrganizationId(organizationId: string, accessToken: string): Promise<boolean> {
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
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ currencies: ZohoCurrency[] }>(
          `${this.inventoryUrl}/settings/currencies`,
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
  ): Promise<{ contact: any }> {
    try {
      this.logger.log(`Creating contact with data: ${JSON.stringify(contactData)}`);
      
      const response = await firstValueFrom(
        this.httpService.post<{ contact: any }>(
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
        )
      );

      this.logger.log(
        `Successfully created contact in Zoho: ${response.data.contact?.contact_id}`
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create contact in Zoho: ${error.message}`);
      throw new Error(`Failed to create contact: ${error.message}`);
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
      this.logger.log(`Creating sales order with data: ${JSON.stringify(orderData)}`);
      
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

  async getItems(
    organizationId: string,
    accessToken: string
  ): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ items: any[] }>(
          `${this.inventoryUrl}/items`,
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

      this.logger.log(`Retrieved ${response.data.items?.length || 0} items from Zoho`);
      return response.data.items || [];
    } catch (error) {
      this.logger.error(`Failed to get items from Zoho: ${error.message}`);
      throw new Error(`Failed to retrieve items: ${error.message}`);
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
