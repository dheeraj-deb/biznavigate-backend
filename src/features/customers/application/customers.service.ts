import { Injectable, Logger } from "@nestjs/common";
import { CustomerRepository } from "../domain/repositories/customer.repository";
import { Customer } from "../domain/entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import {
  ResourceNotFoundException,
  BusinessLogicException,
  ExternalServiceException,
} from "../../../common/exceptions/base.exception";
import { ZohoService } from "../../../integrations/crm/zoho/zoho.service";
import { v4 as uuidv4 } from "uuid";
import { CustomerResponseDto } from "./dto/customer-response.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly zohoService: ZohoService,
    private readonly prisma: PrismaService
  ) { }

  async registerShop(
    createCustomerDto: CreateCustomerDto,
    clientId: string,
    platform: string
  ): Promise<CustomerResponseDto> {
    this.logger.log(
      `Registering shop: ${createCustomerDto.company_name} for client: ${clientId}`
    );

    if (!clientId) {
      throw new BusinessLogicException("Client ID is required");
    }

    if (!platform) {
      throw new BusinessLogicException("Platform is required");
    }

    // Get business user credentials
    let platformCredential = await this.validatePlatformCredentials(
      clientId,
      platform
    );

    const { access_token } = await this.zohoService.refreshAccessToken(
      clientId,
      platformCredential.client_secret,
      platformCredential.refresh_token
    );

    platformCredential.access_token = access_token;

    // Ensure country is present in addresses
    const billingAddress = {
      ...createCustomerDto.billing_address,
      country: createCustomerDto.billing_address.country || "India",
    };
    const shippingAddress = createCustomerDto.shipping_address
      ? {
        ...createCustomerDto.shipping_address,
        country: createCustomerDto.shipping_address.country || "India",
      }
      : billingAddress;

    // Create customer entity
    const customer = Customer.create({
      id: uuidv4(),
      contactName: createCustomerDto.contact_name,
      companyName: createCustomerDto.company_name,
      contactType: "customer",
      billingAddress,
      shippingAddress,
      vatRegNo: createCustomerDto.vat_reg_number,
      taxRegNo: createCustomerDto.tax_reg_number,
      gstNo: createCustomerDto.gst_number,
      businessUserId: clientId,
      platform: platform.toLowerCase(),
    });

    await this.prisma.shops.create({
      data: {
        shop_name: customer.companyName?.substring(0, 50) || "Unknown Shop", // Max 50 chars
        gst_number: customer.gstNo?.substring(0, 15) || "", // Max 15 chars
        address: "",
        pan: customer.vatRegNo?.substring(0, 10) || null, // Max 10 chars
        mobile_num: "9539192684", // 10 chars, within limit
        language: "en",
      },
    }).catch((error) => {
      this.logger.error("Error creating shop in database:", error);
    });

    // Handle platform-specific logic
    if (platform.toLowerCase() === "zoho") {
      return await this.registerShopInZoho(customer, platformCredential);
    }

    // For other platforms, just save locally
    // const savedCustomer = await this.customerRepository.create(customer);
    return CustomerResponseDto.fromEntity(customer);
  }

  private async validatePlatformCredentials(
    clientId: string,
    platform: string
  ) {
    if (platform.toLowerCase() === "zoho") {
      const platformCredential =
        await this.prisma.zoho_user_credential.findUnique({
          where: { client_id: clientId },
        });

      if (!platformCredential) {
        throw new ResourceNotFoundException("Platform credentials", clientId);
      }

      if (!platformCredential.access_token) {
        throw new BusinessLogicException(
          "Access token not found for the given client ID"
        );
      }

      if (!platformCredential.organization_id) {
        throw new BusinessLogicException(
          "Organization ID not found for the given client ID"
        );
      }

      return platformCredential;
    }

    return null;
  }

  private async registerShopInZoho(
    customer: Customer,
    credentials: any
  ): Promise<CustomerResponseDto> {
    try {
      const accessToken = credentials.access_token;
      const organizationId = credentials.organization_id;

      // Get currencies from Zoho
      const currencies = await this.zohoService.getCurrencies(
        organizationId,
        accessToken
      );

      if (!currencies || currencies.length === 0) {
        throw new ExternalServiceException(
          "Zoho",
          "No currencies found for the organization"
        );
      }

      const baseCurrency = currencies.find(
        (currency) => currency.is_base_currency
      );
      if (!baseCurrency) {
        throw new ExternalServiceException(
          "Zoho",
          "Base currency not found for the organization"
        );
      }

      // Map customer data for Zoho API
      const zohoContactData = {
        contact_name: customer.contactName,
        company_name: customer.companyName,
        contact_type: "customer",
        currency_id: baseCurrency.currency_id,
        billing_address: {
          ...customer.billingAddress,
          country: customer.billingAddress?.country || "India",
        },
        shipping_address: {
          ...customer.shippingAddress,
          country: customer.shippingAddress?.country || "India",
        },
        // vat_reg_no: customer.vatRegNo,
        // tax_reg_no: customer.taxRegNo,
        // gst_no: customer.gstNo,
      };

      // Create contact in Zoho
      const zohoResponse:
        | { contact: any }
        | { message: string; status: boolean }
        | void = await this.zohoService.createContact(
          zohoContactData,
          organizationId,
          accessToken
        );

      if (
        !zohoResponse ||
        typeof zohoResponse !== "object" ||
        !("contact" in zohoResponse)
      ) {
        throw new ExternalServiceException(
          "Zoho",
          zohoResponse &&
            "message" in zohoResponse &&
            typeof zohoResponse.message === "string"
            ? zohoResponse.message
            : "Failed to create contact in Zoho"
        );
      }

      // Save to local database
      // const savedCustomer = await this.customerRepository.create(customer);
      // await this.prisma.shops.create({
      //   data: {
      //     id: Number(customer.id),
      //     shop_name: customer.companyName,
      //     gst_number: customer.gstNo,
      //     address: JSON.stringify(customer.shippingAddress),
      //     language: "en",
      //     // mobile_num: customer.billingAddress?.phone || "",
      //     // pan_number: customer.vatRegNo,
      //   },
      // });

      this.logger.log(
        `Shop registered successfully in Zoho with ID: ${zohoResponse.contact.contact_id}`
      );

      return CustomerResponseDto.fromEntity(customer, {
        zohoContactId: zohoResponse.contact.contact_id,
        zohoData: zohoResponse.contact,
      });
    } catch (error) {
      this.logger.error("Error registering shop in Zoho:", error);
      throw new ExternalServiceException("Zoho", error.message);
    }
  }

  async createSalesOrder(
    orderData: any,
    clientId: string,
    platform: string
  ): Promise<any> {
    this.logger.log(`Creating sales order for client: ${clientId}`);

    if (!clientId) {
      throw new BusinessLogicException("Client ID is required");
    }

    if (!platform) {
      throw new BusinessLogicException("Platform is required");
    }

    const platformCredential = await this.validatePlatformCredentials(
      clientId,
      platform
    );

    if (platform.toLowerCase() === "zoho") {
      return await this.createSalesOrderInZoho(orderData, platformCredential);
    }

    throw new BusinessLogicException(
      `Platform ${platform} is not supported for sales orders`
    );
  }

  private async createSalesOrderInZoho(
    orderData: any,
    credentials: any
  ): Promise<any> {
    try {
      const accessToken = credentials.access_token;
      const organizationId = credentials.organization_id;

      const response = await this.zohoService.createSalesOrder(
        orderData,
        organizationId,
        accessToken
      );

      if (!response || !response.salesorder) {
        throw new ExternalServiceException(
          "Zoho",
          "Failed to create sales order in Zoho"
        );
      }

      this.logger.log(
        `Sales order created successfully in Zoho: ${response.salesorder.salesorder_id}`
      );

      return {
        message: "Sales order created successfully",
        data: response.salesorder,
      };
    } catch (error) {
      this.logger.error("Error creating sales order in Zoho:", error);
      throw new ExternalServiceException("Zoho", error.message);
    }
  }

  async getCustomerById(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new ResourceNotFoundException("Customer", id);
    }
    return CustomerResponseDto.fromEntity(customer);
  }

  async getCustomersByBusinessUser(
    businessUserId: string
  ): Promise<CustomerResponseDto[]> {
    const customers =
      await this.customerRepository.findByBusinessUserId(businessUserId);
    return customers.map((customer) =>
      CustomerResponseDto.fromEntity(customer)
    );
  }
}
