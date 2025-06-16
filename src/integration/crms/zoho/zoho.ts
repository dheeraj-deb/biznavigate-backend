import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { Contact } from "./interfaces/interface";

@Injectable()
export class Zoho {
  private zohoInventoryUrl: string;
  private zohoAuthUrl: string;
  private authCallbackUrl: string;
  constructor(private readonly ConfigService: ConfigService) {
    this.zohoInventoryUrl = this.ConfigService.get<string>("zoho.InventoryUrl");
    this.zohoAuthUrl = this.ConfigService.get<string>("zoho.AuthUrl");
    this.authCallbackUrl =
      "https://489a-103-70-197-101.ngrok-free.app/business-user/auth/callback";
    // axios.defaults.headers.common[
    //   "Authorization"
    // ] = `Zoho-oauthtoken ${}`;
  }

  async verifyOrganizationId(organizationId: string, authToken: string) {
    try {
      const response = await axios.get(
        `${this.zohoInventoryUrl}/organizations/${organizationId}`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${authToken}`,
          },
        }
      );

      if (
        response.data.organization === null &&
        response.data.organization.organization_id !== organizationId
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw new Error("Error verifying organization ID");
    }
  }

  async getAuthorizationCodeLink(clientId: string, clientSecret: string) {
    try {
      if (!clientId) {
        throw new Error("Client ID and User ID are required");
      }
      const link = `https://accounts.zoho.in/oauth/v2/auth
        ?response_type=code
        &client_id=${clientId}
        &scope=ZohoInventory.items.READ,ZohoInventory.inventoryadjustments.CREATE,ZohoInventory.contacts.READ,ZohoInventory.contacts.CREATE,ZohoInventory.settings.READ
        &redirect_uri=${this.authCallbackUrl}
        &access_type=offline
        &prompt=consent
        &state=${clientId},${clientSecret}`;
      return link;
    } catch (error) {
      console.error("Error getting authorization code:", error);
      throw new Error("Error getting authorization code");
    }
  }

  //   authorization callback

  async getAccessToken(
    clientId: string,
    clientSecret: string,
    code: string,
    grant_type: "authorization_code" | "refresh_token"
  ) {
    try {
      const query = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: grant_type,
        redirect_uri: this.authCallbackUrl,
        code: code,
      }).toString();
      const response = await axios.post(
        `${this.zohoAuthUrl}/oauth/v2/token?${query}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw new Error("Error getting access token");
    }
  }

  async getItems(
    organizationId: string,
    authorization_code: string
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.zohoInventoryUrl}/items?organization_id=${organizationId}`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${authorization_code}`,
          },
        }
      );

      const customer = await axios.get(
        `${this.zohoInventoryUrl}/contacts?organization_id=${organizationId}`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${authorization_code}`,
          },
        }
      );
      //   console.log("Items fetched successfully:", response.data);
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      throw new Error("Error fetching items");
    }
  }

  /**
   * Fetches the list of currencies for a given organization.
   * @param organizationId The ID of the Zoho organization.
   * @param accessToken Your Zoho OAuth access token.
   * @returns A promise that resolves to the array of currencies.
   */
  async getCurrencies(
    organizationId: string,
    accessToken: string
  ): Promise<any> {
    const url = `${this.zohoInventoryUrl}/settings/currencies`;

    try {
      const response = await axios.get(url, {
        params: {
          organization_id: organizationId,
        },
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });
      return response.data.currencies || [];
    } catch (error) {
      // The original error handling structure is preserved.
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error fetching currencies:", error.response.data);
      } else {
        console.error("An unexpected error occurred:", error);
      }
      throw new Error("Failed to fetch currencies from Zoho Inventory.");
    }
  }

  async createContact(
    data: Contact,
    organizationId: string,
    accessToken: string
  ) {
    console.log("Creating contact with data:", data);
    try {
      const response = await axios.post(
        `${this.zohoInventoryUrl}/contacts?organization_id=${organizationId}`,
        data,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response", response);
      return response.data || {};
    } catch (error) {
      console.error("Error creating contact:", error);
      throw new Error(error);
    }
  }

  async createSalesOrder(
    data: any,
    organizationId: string,
    accessToken: string
  ) {
    console.log("Creating sales order with data:", data);
    try {
      const response = await axios.post(
        `${this.zohoInventoryUrl}/salesorders?organization_id=${organizationId}`,
        data,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response", response);
      return response.data || {};
    } catch (error) {
      console.error("Error creating sales order:", error);
      throw new Error(error);
    }
  }
}
