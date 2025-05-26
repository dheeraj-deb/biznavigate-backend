import { registerAs } from "@nestjs/config";

export default registerAs('zoho', () => ({
    InventoryUrl: process.env.ZOHO_INVENTORY_API_URL,
    AuthUrl: process.env.ZOHO_AUTH_API_URL,
    // add more
}))
