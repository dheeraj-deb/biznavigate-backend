import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UsersRepository } from "./infrastructure/users.repository.prisma";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AssignRoleDto } from "./dto/assign-role.dto";

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async createUser(dto: CreateUserDto) {
    try {
      return await this.repo.createUser(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateUser(user_id: string, dto: UpdateUserDto) {
    try {
      const user = await this.repo.getUserById(user_id);
      if (!user) throw new NotFoundException("User not found");
      return await this.repo.updateUser(user_id, dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async assignRole(dto: AssignRoleDto) {
    try {
      const user = await this.repo.getUserById(dto.user_id);
      if (!user) throw new NotFoundException("User not found");
      return await this.repo.assignRole(dto.user_id, dto.role_id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getUserById(user_id: string) {
    try {
      return await this.repo.getUserById(user_id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAllUsers() {
    try {
      return await this.repo.getAllUsers();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
