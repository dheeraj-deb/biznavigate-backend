import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByCustomerId(customerId: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(limit?: number, offset?: number): Promise<User[]>;
  abstract create(user: User): Promise<User>;
  abstract update(id: string, user: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract count(): Promise<number>;
  abstract findByPlatformId(platformId: string): Promise<User[]>;
}
