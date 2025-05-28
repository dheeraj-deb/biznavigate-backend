import { Body, Controller, Post } from "@nestjs/common";

@Controller()
export class UserController {
    constructor() {
    }

    @Post('/create-shop')
    async registerShop(@Body() body: any): Promise<any> {
        
        return {
            message: "Shop registered successfully",
            data: body,
        };
        
    }
}
