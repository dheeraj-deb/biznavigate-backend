import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from '../application/customers.service';
import { CreateCustomerDto } from '../application/dto/create-customer.dto';
import { CustomerResponseDto } from '../application/dto/customer-response.dto';

@ApiTags('customers')
@Controller('customers')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('register-shop')
  @ApiOperation({ summary: 'Register a new shop/customer' })
  @ApiResponse({ status: 201, description: 'Shop registered successfully', type: CustomerResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({ name: 'clientId', description: 'Business user client ID' })
  @ApiQuery({ name: 'platform', description: 'Platform name (e.g., zoho)' })
  @HttpCode(HttpStatus.CREATED)
  async registerShop(
    @Body() createCustomerDto: CreateCustomerDto,
    @Query('clientId') clientId: string,
    @Query('platform') platform: string,
  ) {
    const result = await this.customersService.registerShop(createCustomerDto, clientId, platform);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Shop registered successfully',
      data: result,
    };
  }

  @Post('sales-order')
  @ApiOperation({ summary: 'Create a sales order' })
  @ApiResponse({ status: 201, description: 'Sales order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({ name: 'clientId', description: 'Business user client ID' })
  @ApiQuery({ name: 'platform', description: 'Platform name (e.g., zoho)' })
  @HttpCode(HttpStatus.CREATED)
  async createSalesOrder(
    @Body() orderData: any,
    @Query('clientId') clientId: string,
    @Query('platform') platform: string,
  ) {
    const result = await this.customersService.createSalesOrder(orderData, clientId, platform);
    return {
      statusCode: HttpStatus.CREATED,
      message: result.message,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerById(@Param('id') id: string) {
    const customer = await this.customersService.getCustomerById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Customer retrieved successfully',
      data: customer,
    };
  }

  @Get('business-user/:businessUserId')
  @ApiOperation({ summary: 'Get customers by business user ID' })
  @ApiParam({ name: 'businessUserId', description: 'Business user ID' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async getCustomersByBusinessUser(@Param('businessUserId') businessUserId: string) {
    const customers = await this.customersService.getCustomersByBusinessUser(businessUserId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Customers retrieved successfully',
      data: customers,
    };
  }
}
