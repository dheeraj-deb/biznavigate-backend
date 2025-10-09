import { registerAs } from "@nestjs/config";

export default registerAs('zoho', () => {
  const config = {
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    redirectUri: process.env.ZOHO_REDIRECT_URI || 'https://efce2582845f.ngrok-free.app/business-user/auth/callback',
    scope: process.env.ZOHO_SCOPE || 'ZohoInventory.items.READ,ZohoInventory.inventoryadjustments.CREATE,ZohoInventory.contacts.READ,ZohoInventory.contacts.CREATE,ZohoInventory.settings.READ',
    apiDomain: process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in',
    authUrl: process.env.ZOHO_AUTH_URL || 'https://accounts.zoho.in/oauth/v2/auth',
    tokenUrl: process.env.ZOHO_TOKEN_URL || 'https://accounts.zoho.in/oauth/v2/token',
    inventoryUrl: process.env.ZOHO_INVENTORY_URL || 'https://www.zohoapis.in/inventory/v1',
  };

  // Validate required fields
//   if (!config.clientId || !config.clientSecret) {
//     throw new Error('Zoho Client ID and Client Secret are required');
//   }

  return config;
});
