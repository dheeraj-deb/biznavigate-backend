import { registerAs } from "@nestjs/config";

export default registerAs('env', () => ({
    nodeEnv:process.env.NODE_ENV || 'development'
}));