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
      "https://9a85-103-70-197-68.ngrok-free.app/zoho/auth/callback";
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

  async getAuthorizationCode(clientId: string) {
    console.log("clientId", clientId);
    try {
      //   const response = await axios.get(`https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${clientId}`, {
      //     params: {
      //       response_type: "code",
      //       client_id: clientId,
      //       scope: "ZohoInventory.fullaccess.all",
      //       redirect_uri: this.authCallbackUrl,
      //       access_type: "offline",
      //       prompt: "consent",
      //     },
      //   });

      const response = await axios.get(
        `https://accounts.zoho.in/oauth/v2/auth
        ?response_type=code
        &client_id=1000.NIIO305M71RIEIS6GP0HKL9OQM10HP
        &scope=ZohoInventory.fullaccess.all
        &redirect_uri=https://9a85-103-70-197-68.ngrok-free.app/zoho/auth/callback
        &access_type=offline
        &prompt=consent&`
      );

      //   console.log("Authorization code URL:", response.data);
      return response.data;
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

      console.log("Customer data fetched successfully:", customer.data);

      //   console.log("Items fetched successfully:", response.data);
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      throw new Error("Error fetching items");
    }
  }

  async createContact(
    data: Contact,
    organizationId: string,
    accessToken: string
  ) {
    try {
      const response = await axios.post(
        `${this.zohoInventoryUrl}/contacts?organization_id=${organizationId}`,
        data,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );
      return response.data || {};
    } catch (error) {
      console.error("Error creating contact:", error);
      throw new Error("Error creating contact");
    }
  }
}
