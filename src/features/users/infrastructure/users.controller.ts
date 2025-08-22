import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { UsersService } from "../application/users.service";
import { CreateUserDto } from "../application/dto/create-user.dto";
import { UpdateUserDto } from "../application/dto/update-user.dto";
import {
  UserResponseDto,
  ZohoAuthResponseDto,
  ZohoCredentialsSaveResponseDto,
} from "../application/dto/user-response.dto";

@ApiTags("business-user")
@Controller("business-user")
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new business user" })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 201,
    description: "User created with Zoho integration",
    type: ZohoAuthResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "User already exists" })
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.createUser(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "User created successfully",
      data: result,
    };
  }

  @Get("auth/callback")
  @ApiOperation({ summary: "Save Zoho OAuth credentials" })
  @ApiResponse({
    status: 200,
    description: "Credentials saved successfully",
    type: ZohoCredentialsSaveResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiQuery({ name: "code", description: "Authorization code from Zoho" })
  @ApiQuery({
    name: "state",
    description: "State parameter containing credentials",
  })
  async saveZohoCredentials(
    @Query("code") code: string,
    @Query("state") state: string
  ) {
    const result = await this.usersService.saveZohoCredentials(code, state);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all users with pagination" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  async getAllUsers() {
    const result = await this.usersService.getAllUsers();
    return {
      statusCode: HttpStatus.OK,
      message: "Users retrieved successfully",
      data: result,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserById(@Param("id") id: string) {
    const user = await this.usersService.getUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: "User retrieved successfully",
      data: user,
    };
  }

  @Get("customer/:customerId")
  @ApiOperation({ summary: "Get user by customer ID" })
  @ApiParam({ name: "customerId", description: "Customer ID" })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserByCustomerId(@Param("customerId") customerId: string) {
    const user = await this.usersService.getUserByCustomerId(customerId);
    return {
      statusCode: HttpStatus.OK,
      message: "User retrieved successfully",
      data: user,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: "User updated successfully",
      data: user,
    };
  }

  @Put(":id/deactivate")
  @ApiOperation({ summary: "Deactivate user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "User deactivated successfully",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async deactivateUser(@Param("id") id: string) {
    const user = await this.usersService.deactivateUser(id);
    return {
      statusCode: HttpStatus.OK,
      message: "User deactivated successfully",
      data: user,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 204, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param("id") id: string) {
    await this.usersService.deleteUser(id);
  }
}
