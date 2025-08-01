import { Customer } from '../entities/customer.entity';

export abstract class CustomerRepository {
  abstract findById(id: string): Promise<Customer | null>;
  abstract findByExternalId(externalId: string): Promise<Customer | null>;
  abstract findByBusinessUserId(businessUserId: string): Promise<Customer[]>;
  abstract findByCompanyName(companyName: string): Promise<Customer | null>;
  abstract findAll(limit?: number, offset?: number): Promise<Customer[]>;
  abstract create(customer: Customer): Promise<Customer>;
  abstract update(id: string, customer: Partial<Customer>): Promise<Customer>;
  abstract delete(id: string): Promise<void>;
  abstract count(): Promise<number>;
  abstract findByPlatform(platform: string): Promise<Customer[]>;
}
