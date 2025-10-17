import { Controller, Post, Body, Param, Get, Put } from "@nestjs/common";
import { NotifyUserDto } from "../application/dto/notify-user.dto";
import { RolePermissions } from "../infrastructure/role.repository.prisma";
import { RolesService } from "../application/role.service";

@Controller("roles")
export class RolesController {
  constructor(private readonly service: RolesService) {}

  // 1️⃣ Create Role
  @Post("create")
  createRole(
    @Body() dto: { role_name: string; permissions?: RolePermissions }
  ) {
    return this.service.createRole(dto.role_name, dto.permissions);
  }

  // 2️⃣ Update Role
  @Put("update/:role_id")
  updateRole(
    @Param("role_id") role_id: string,
    @Body() dto: { role_name?: string; permissions?: RolePermissions }
  ) {
    return this.service.updateRole(role_id, dto.role_name, dto.permissions);
  }

  // 3️⃣ Assign Intent to Role
  @Post("assign-intent")
  assignIntent(@Body() dto: { role: string; intent_id: string }) {
    return this.service.assignIntent(dto.role, dto.intent_id);
  }

  // 4️⃣ Notify Users when Chat Fails
  @Post("notify")
  notifyUsers(@Body() dto: NotifyUserDto) {
    return this.service.notifyUsersWhenChatFails(dto);
  }

  // 5️⃣ Get All Roles
  @Get()
  getAllRoles() {
    return this.service.getAllRoles();
  }

  // 6️⃣ Get Role By Name
  @Get(":role_name")
  getRoleByName(@Param("role_name") role_name: string) {
    return this.service.getRoleByName(role_name);
  }
}
