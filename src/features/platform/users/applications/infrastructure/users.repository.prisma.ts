import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly businessSummary = {
    business_id: true,
    tenant_id: true,
    business_name: true,
    business_type: true,
  };

  // ✅ Create a user
  async createUser(data: CreateUserDto) {
    return await this.prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        phone_number: data.phone_number,
        businesses: { connect: { business_id: data.business_id } },
        roles: { connect: { role_id: data.role_id } },
        is_active: data.is_active ?? true,
      },
      include: { businesses: { select: this.businessSummary } },
    });
  }

  // ✅ Update user details
  async updateUser(user_id: string, data: UpdateUserDto) {
    const updateData: any = {
      name: data.name,
      email: data.email,
      is_active: data.is_active,
    };

    if (data.role_id) {
      updateData.role_id = data.role_id; // <-- use scalar field
    }

    return await this.prisma.users.update({
      where: { user_id },
      data: updateData,
      include: { businesses: { select: this.businessSummary } },
    });
  }

  // ✅ Assign a new role to a user
  async assignRole(user_id: string, role_id: string) {
    return await this.prisma.users.update({
      where: { user_id },
      data: { role_id }, // <-- use scalar field
      include: { businesses: { select: this.businessSummary } },
    });
  }

  // ✅ Get user by ID (excludes soft-deleted)
  async getUserById(user_id: string) {
    return await this.prisma.users.findFirst({
      where: { user_id, deleted_at: null },
      include: { businesses: { select: this.businessSummary } },
    });
  }

  async getAllUsers(business_id: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { business_id, deleted_at: null };
    const [items, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        include: { businesses: { select: this.businessSummary } },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.users.count({ where }),
    ]);
    return { data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  // ✅ Get users by Role (excludes soft-deleted)
  async getUsersByRole(role_id: string, business_id?: string) {
    return await this.prisma.users.findMany({
      where: {
        role_id,
        deleted_at: null,
        ...(business_id && { business_id }),
      },
      include: { businesses: { select: this.businessSummary } },
    });
  }

  async softDeleteUser(user_id: string) {
    return await this.prisma.users.update({
      where: { user_id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }
}
