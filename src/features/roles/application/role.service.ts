import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { NotifyUserDto } from "./dto/notify-user.dto";
import {
  RolesRepository,
  RolePermissions,
} from "../infrastructure/role.repository.prisma";
import { UsersRepository } from "src/features/users/applications/infrastructure/users.repository.prisma";


@Injectable()
export class RolesService {
  constructor(
    private readonly repo: RolesRepository,
    private readonly usersRepo: UsersRepository
  ) {}

  async createRole(role_name: string, permissions?: RolePermissions) {
    try {
      return await this.repo.createRole(role_name, permissions);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async updateRole(
    role_id: string,
    role_name?: string,
    permissions?: RolePermissions
  ) {
    const role = await this.repo.getRoleById(role_id);
    if (!role) throw new NotFoundException("Role not found");
    return this.repo.updateRole(role_id, role_name, permissions);
  }

  async getAllRoles() {
    return this.repo.getAllRoles();
  }

  async getRoleByName(role_name: string) {
    const role = await this.repo.getRoleByName(role_name);
    if (!role) throw new NotFoundException("Role not found");
    return role;
  }

  async assignIntent(role_name: string, intent_name: string) {
    // 1️⃣ Find the role by name
    const role = await this.repo.getRoleByName(role_name);
    if (!role) throw new NotFoundException("Role not found");

    // 2️⃣ Find the intent by name
    const intent = await this.repo.findIntentByName(intent_name);
    if (!intent) throw new NotFoundException("Intent not found");

    // 3️⃣ Create the role-intent mapping using UUIDs
    return await this.repo.assignIntent(role.role_id, intent.intent_id);
  }

  async notifyUsersWhenChatFails(dto: NotifyUserDto) {
    const intent = await this.repo.findIntentByName(dto.intent_name);
    if (!intent) throw new NotFoundException("Intent not found");

    const rolesAssigned = await this.repo.getRolesByIntentId(intent.intent_id);
    if (!rolesAssigned.length)
      throw new NotFoundException("No roles assigned for this intent");

    const notifications = [];

    for (const roleIntent of rolesAssigned) {
      const permissions = await this.repo.getRolePermissions(
        roleIntent.role_id
      );
      if (!permissions?.view) continue;

      const role = await this.repo.getRoleById(roleIntent.role_id);
      const users = await this.usersRepo.getUsersByRole(
        role.role_name,
        dto.business_id
      );

      for (const user of users) {
        notifications.push(
          this.repo.createNotification(
            user.user_id,
            intent.intent_id,
            dto.message
          )
        );
      }
    }

    return await Promise.all(notifications);
  }
}
