import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/features/users/domain/repositories/user.repository";
import { CustomerRepository } from "../domain/repositories/customer.repository";
import { Customer } from "../domain/entities/customer.entity";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository
  ) {}
  findById(id: string): Promise<Customer | null> {
    throw new Error("Method not implemented.");
  }
  findByExternalId(externalId: string): Promise<Customer | null> {
    throw new Error("Method not implemented.");
  }
  findByBusinessUserId(businessUserId: string): Promise<Customer[]> {
    throw new Error("Method not implemented.");
  }
  findByCompanyName(companyName: string): Promise<Customer | null> {
    throw new Error("Method not implemented.");
  }
  findAll(limit?: number, offset?: number): Promise<Customer[]> {
    throw new Error("Method not implemented.");
  }
  update(id: string, customer: Partial<Customer>): Promise<Customer> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  count(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  findByPlatform(platform: string): Promise<Customer[]> {
    throw new Error("Method not implemented.");
  }

  async create(customer: Customer): Promise<any> {
    const businessUser = await this.userRepository.findById(
      customer.businessUserId
    );

    if (!businessUser) {
      throw new Error("Business user not found");
    }
    // const createdCustomer = await this.prisma.customer.create({
    //     data: {
    //         id: customer.id,
    //         businessUserId: businessUser.id,
    //         companyName: customer.companyName,
    //         billingAddress: customer.billingAddress,
    //         shippingAddress: customer.shippingAddress,
    //         externalId: customer.externalId,
    //         platform: customer.platform,
    //     },
    // });

    return [];
  }
}
