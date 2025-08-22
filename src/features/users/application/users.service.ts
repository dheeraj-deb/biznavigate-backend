import { Injectable, Logger } from "@nestjs/common";
import { UserRepository } from "../domain/repositories/user.repository";
import { User } from "../domain/entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  UserResponseDto,
  ZohoAuthResponseDto,
  ZohoCredentialsSaveResponseDto,
} from "./dto/user-response.dto";
import {
  ResourceNotFoundException,
  DuplicateResourceException,
  BusinessLogicException,
  ExternalServiceException,
} from "../../../common/exceptions/base.exception";
import { ZohoService } from "../../../integrations/crm/zoho/zoho.service";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly zohoService: ZohoService,
    private readonly prisma: PrismaService
  ) {}

  // Domain entities are used here to encapsulate business logic
  // Even with Prisma, entities provide several key benefits:
  // 1. Business Logic Encapsulation - methods like updateProfile(), deactivate()
  // 2. Data Validation - ensure data integrity before persistence
  // 3. Type Safety - strongly typed domain objects
  // 4. Testability - pure business logic can be tested without database
  // 5. Framework Independence - business rules don't depend on Prisma

  async createUser(
    createUserDto: CreateUserDto
  ): Promise<UserResponseDto | ZohoAuthResponseDto> {
    this.logger.log(
      `Creating user with customerId: ${createUserDto.customerId}`
    );

    // Check if user with customerId already exists
    const existingUser = await this.userRepository.findByCustomerId(
      createUserDto.customerId
    );
    console.log("Existing user found:", existingUser);
    if (existingUser) {
      throw new DuplicateResourceException(
        "User",
        "customerId",
        createUserDto.customerId
      );
    }

    console.log("createUserDto.platformId:", createUserDto);
    // Validate platform exists
    const integration = await this.prisma.integrations.findUnique({
      where: { id: Number(createUserDto.platformId) },
    });

    if (!integration) {
      throw new ResourceNotFoundException(
        "Integration",
        createUserDto.platformId
      );
    }

    // Create user entity
    const user = User.create({
      id: uuidv4(),
      customerId: createUserDto.customerId,
      businessName: createUserDto.businessName,
      contactPhone: createUserDto.contactPhone,
      contactEmail: createUserDto.contactEmail,
      gstin: createUserDto.gstin,
      address: createUserDto.address,
      notificationPreference: createUserDto.notificationPreference,
      platformId: createUserDto.platformId,
    });

    console.log("User entity created:", user);

    // Save user to database
    const createdUser = await this.userRepository.create(user);
    this.logger.log(`User created successfully with ID: ${createdUser.id}`);

    // Handle Zoho integration
    if (integration.name.toLowerCase() === "zoho") {
      return await this.handleZohoIntegration(
        createdUser,
        createUserDto.integrationConfig
      );
    }

    return UserResponseDto.fromEntity(createdUser);
  }

  private async handleZohoIntegration(
    user: User,
    integrationConfig: any
  ): Promise<ZohoAuthResponseDto> {
    const { clientId, clientSecret, organizationId } = integrationConfig;

    if (!clientId || !organizationId || !clientSecret) {
      throw new BusinessLogicException("Missing Zoho integration credentials");
    }

    // Save Zoho credentials
    await this.prisma.zoho_user_credential.create({
      data: {
        business_user_id: Number(user.id),
        client_secret: clientSecret,
        client_id: clientId,
        organization_id: organizationId,
      },
    });

    // Generate authorization URL
    const authorizationUrl = await this.zohoService.getAuthorizationCodeLink(
      clientId,
      clientSecret
    );

    return {
      authorizationUrl,
      message: "User created successfully. Please complete Zoho authorization.",
    };
  }

  async saveZohoCredentials(
    code: string,
    state: string
  ): Promise<ZohoCredentialsSaveResponseDto> {
    this.logger.log("Saving Zoho credentials");

    const [clientId, clientSecret] = state.split(",");

    if (!clientId || !clientSecret) {
      throw new BusinessLogicException("Invalid state parameter");
    }

    try {
      const { access_token, refresh_token, expires_in } =
        await this.zohoService.getAccessToken(
          clientId,
          clientSecret,
          code,
          "authorization_code"
        );

      await this.prisma.zoho_user_credential.update({
        where: { client_id: clientId },
        data: {
          access_token,
          refresh_token,
          code,
          expires_in,
          token_acquired_at: new Date().toISOString(),
        },
      });

      this.logger.log("Zoho credentials saved successfully");

      return {
        message: "Zoho credentials saved successfully",
        status: 200,
      };
    } catch (error) {
      this.logger.error("Error saving Zoho credentials:", error);
      throw new ExternalServiceException("Zoho", error.message);
    }
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ResourceNotFoundException("User", id);
    }
    return UserResponseDto.fromEntity(user);
  }

  async getUserByCustomerId(customerId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByCustomerId(customerId);
    if (!user) {
      throw new ResourceNotFoundException("User", customerId);
    }
    return UserResponseDto.fromEntity(user);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return UserResponseDto.fromEntities(users);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating user with ID: ${id}`);

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new ResourceNotFoundException("User", id);
    }

    const updatedUser = existingUser.updateProfile(updateUserDto);
    const result = await this.userRepository.update(id, updatedUser);

    this.logger.log(`User updated successfully: ${id}`);
    return UserResponseDto.fromEntity(result);
  }

  async deactivateUser(id: string): Promise<UserResponseDto> {
    this.logger.log(`Deactivating user with ID: ${id}`);

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new ResourceNotFoundException("User", id);
    }

    const deactivatedUser = existingUser.deactivate();
    const result = await this.userRepository.update(id, deactivatedUser);

    this.logger.log(`User deactivated successfully: ${id}`);
    return UserResponseDto.fromEntity(result);
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Deleting user with ID: ${id}`);

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new ResourceNotFoundException("User", id);
    }

    await this.userRepository.delete(id);
    this.logger.log(`User deleted successfully: ${id}`);
  }
}
