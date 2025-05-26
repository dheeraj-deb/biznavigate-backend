import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Zoho } from "src/integration/crms/zoho/zoho";

@Module({
    imports: [],
    controllers: [UserController],
    providers: [UserService, Zoho],
})
export class UserModule { }
