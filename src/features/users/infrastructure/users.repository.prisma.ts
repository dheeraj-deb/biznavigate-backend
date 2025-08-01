import { Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/user.repository';
import { User } from '../domain/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.business_user.findUnique({
      where: { id: Number(id) },
    });

    return user ? this.toDomain(user) : null;
  }

  async findByCustomerId(customerId: string): Promise<User | null> {
    const user = await this.prisma.business_user.findUnique({
      where: { customerId },
    });

    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.business_user.findFirst({
      where: { contactEmail: email },
    });

    return user ? this.toDomain(user) : null;
  }

  async findAll(limit = 10, offset = 0): Promise<User[]> {
    const users = await this.prisma.business_user.findMany({
      take: limit,
      skip: offset,
      // orderBy: { createdAt: 'desc' }, // 'createdAt' may not exist in your Prisma model
    });

    return users.map(this.toDomain);
  }

  async create(user: User): Promise<User> {
    console.log('Creating user in Prisma:', user);
    const created = await this.prisma.business_user.create({
      data: {
        // id: Number(user.id),
        customerId: user.customerId,
        businessName: user.businessName,
        contactPhone: user.contactPhone,
        contactEmail: user.contactEmail,
        gstin: user.gstin,
        address: user.address,
        notificationPreference: user.notificationPreference,
        platformId: user.platformId,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const updated = await this.prisma.business_user.update({
      where: { id: Number(id) },
      data: {
        businessName: userData.businessName,
        contactPhone: userData.contactPhone,
        contactEmail: userData.contactEmail,
        gstin: userData.gstin,
        address: userData.address,
        notificationPreference: userData.notificationPreference,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.business_user.delete({
      where: { id:Number(id) },
    });
  }

  async count(): Promise<number> {
    return this.prisma.business_user.count();
  }

  async findByPlatformId(platformId: string): Promise<User[]> {
    const users = await this.prisma.business_user.findMany({
      where: { platformId },
    //   orderBy: { createdAt: 'desc' },
    });

    return users.map(this.toDomain);
  }

  private toDomain(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.customerId,
      prismaUser.businessName,
      prismaUser.contactPhone,
      prismaUser.contactEmail,
      prismaUser.gstin,
      prismaUser.address,
      prismaUser.notificationPreference,
      prismaUser.platformId,
      true, // Assuming active by default
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}
