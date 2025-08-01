import { registerAs } from "@nestjs/config";

export default registerAs('TWILIO', () => ({
    SID: process.env.TWILIO_SID,
    AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    // add more
}))