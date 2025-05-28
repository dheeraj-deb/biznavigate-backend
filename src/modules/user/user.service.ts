import { Injectable } from "@nestjs/common";
import { Zoho } from "src/integration/crms/zoho/zoho";

@Injectable()
export class UserService {
  constructor(private Zoho: Zoho) {}

  async registerShop(body: any): Promise<any> {
    // this.Zoho.createContact();
    return {
      message: "Shop registered successfully",
      data: body,
    };
  }
}
