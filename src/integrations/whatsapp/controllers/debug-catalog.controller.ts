import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Debug Catalog')
@Controller('api/debug/catalog')
export class DebugCatalogController {
  private readonly logger = new Logger(DebugCatalogController.name);

  constructor(private prisma: PrismaService) {}

  @Get('products')
  @ApiOperation({
    summary: 'Debug: Check products in database',
    description: 'Check what products exist and their organization_id values'
  })
  async debugProducts(@Query('organizationId') organizationId?: string) {
    try {
      this.logger.log(`Debugging products - organizationId filter: ${organizationId || 'none'}`);

      // Get all products without any filter first
      const allProducts = await this.prisma.products.findMany({
        select: {
          id: true,
          name: true,
          organization_id: true,
          status: true
        },
        take: 10
      });

      // Get count by organization_id
      const orgCounts = await this.prisma.products.groupBy({
        by: ['organization_id'],
        _count: {
          id: true
        }
      });

      // Get products with specific organization_id if provided
      let filteredProducts = [];
      if (organizationId) {
        filteredProducts = await this.prisma.products.findMany({
          where: {
            organization_id: organizationId,
            status: 'active'
          },
          select: {
            id: true,
            name: true,
            organization_id: true,
            status: true,
            selling_price: true
          },
          take: 5
        });
      }

      return {
        debug: {
          totalProductsInDB: allProducts.length,
          sampleProducts: allProducts,
          organizationCounts: orgCounts,
          filteredProducts: filteredProducts,
          filterUsed: organizationId || 'none'
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error debugging products:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('test-query')
  @ApiOperation({
    summary: 'Debug: Test catalog query',
    description: 'Test the exact query used by catalog service'
  })
  async testCatalogQuery(@Query('organizationId') organizationId?: string) {
    try {
      this.logger.log(`Testing catalog query with organizationId: ${organizationId}`);

      // This is the exact query from the catalog service
      const whereClause: any = {
        status: 'active'
      };

      if (organizationId) {
        whereClause.organization_id = organizationId;
      }

      this.logger.log(`Where clause:`, whereClause);

      const [products, totalCount] = await Promise.all([
        this.prisma.products.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            description: true,
            sku: true,
            selling_price: true,
            mrp: true,
            hsn_code: true,
            status: true,
            organization_id: true,
            category_id: true
          },
          orderBy: {
            name: 'asc'
          },
          take: 10
        }),
        this.prisma.products.count({ where: whereClause })
      ]);

      return {
        debug: {
          query: {
            where: whereClause,
            orderBy: { name: 'asc' },
            take: 10
          },
          results: {
            totalCount,
            productsFound: products.length,
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              organization_id: p.organization_id,
              status: p.status,
              price: p.selling_price ? Number(p.selling_price) : null
            }))
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error testing catalog query:', error);
      return {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('organizations')
  @ApiOperation({
    summary: 'Debug: List all organization IDs',
    description: 'Get all unique organization_id values in products table'
  })
  async listOrganizations() {
    try {
      const orgs = await this.prisma.products.findMany({
        select: {
          organization_id: true
        },
        distinct: ['organization_id']
      });

      const orgStats = await this.prisma.products.groupBy({
        by: ['organization_id', 'status'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      });

      return {
        uniqueOrganizations: orgs.map(o => o.organization_id),
        organizationStats: orgStats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error listing organizations:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('zoho-credentials')
  @ApiOperation({
    summary: 'Debug: Check Zoho credentials table',
    description: 'See organization IDs in zoho_user_credential table'
  })
  async checkZohoCredentials() {
    try {
      const credentials = await this.prisma.zoho_user_credential.findMany({
        select: {
          organization_id: true,
          whatsapp_number: true,
          client_id: true
        }
      });

      return {
        zohoCredentials: credentials,
        count: credentials.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error checking Zoho credentials:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('test-phone-mapping')
  @ApiOperation({
    summary: 'Debug: Test WhatsApp phone to organization mapping',
    description: 'Test the exact logic used to map WhatsApp number to organization ID'
  })
  async testPhoneMapping(@Query('whatsappNumber') whatsappNumber: string) {
    try {
      this.logger.log(`Testing phone mapping for: ${whatsappNumber}`);

      // Test the exact query used in conversation handler
      const credential = await this.prisma.zoho_user_credential.findFirst({
        where: {
          whatsapp_number: whatsappNumber
        },
        select: {
          organization_id: true,
          whatsapp_number: true,
          client_id: true
        }
      });

      // Also test business_user fallback
      const businessUser = await this.prisma.business_user.findFirst({
        where: {
          contactPhone: whatsappNumber
        },
        select: {
          customerId: true,
          contactPhone: true,
          businessName: true
        }
      });

      let finalOrganizationId = 'default-org';
      let source = 'none';

      if (credential?.organization_id) {
        finalOrganizationId = credential.organization_id;
        source = 'zoho_user_credential';
      } else if (businessUser?.customerId) {
        finalOrganizationId = businessUser.customerId;
        source = 'business_user';
      }

      return {
        input: {
          whatsappNumber
        },
        results: {
          zohoCredential: credential,
          businessUser: businessUser,
          finalOrganizationId,
          source
        },
        debug: {
          foundInZoho: !!credential,
          foundInBusinessUser: !!businessUser,
          exactMatchZoho: credential?.whatsapp_number === whatsappNumber,
          exactMatchBusiness: businessUser?.contactPhone === whatsappNumber
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Error testing phone mapping:', error);
      return {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }
}