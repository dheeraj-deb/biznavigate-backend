import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCustomerDto, QueryCustomerDto } from "./dto/contact.dto";

const ALLOWED_SORT_FIELDS = new Set(['created_at', 'total_spent', 'total_orders', 'last_order_date', 'engagement_score']);

@Injectable()
export class ContactsService {
    private readonly logger = new Logger(ContactsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(businessId: string, tenantId: string, dto: CreateCustomerDto) {
        try {
            const customer = await this.prisma.customers.create({
                data: {
                    business_id: businessId,
                    tenant_id: tenantId,
                    name: dto.name,
                    phone: dto.phone,
                    email: dto.email,
                    whatsapp_number: dto.whatsapp_number ?? dto.phone,
                    platform_user_id: dto.platform_user_id,
                },
            });
            return customer;
        } catch (error) {
            if (error?.code === 'P2002') {
                throw new ConflictException('A contact with this phone or email already exists');
            }
            this.logger.error(`Failed to create contact for business ${businessId}`, error);
            throw new InternalServerErrorException('Failed to create contact');
        }
    }

    async findAll(businessId: string, query: QueryCustomerDto) {
        if (!businessId) {
            throw new BadRequestException("Business id is missing");
        }

        const {
            search,
            sort_by = 'created_at',
            sort_order = 'desc',
            page = 1,
            limit = 20,
        } = query;

        if (!ALLOWED_SORT_FIELDS.has(sort_by)) {
            throw new BadRequestException(`Invalid sort_by field: "${sort_by}"`);
        }

        const where: any = { business_id: businessId };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
                { whatsapp_number: { contains: search } },
            ];
        }

        try {
            const [data, total] = await Promise.all([
                this.prisma.customers.findMany({
                    where,
                    orderBy: { [sort_by]: sort_order },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                this.prisma.customers.count({ where }),
            ]);

            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            this.logger.error(`Failed to fetch contacts for business ${businessId}`, error);
            throw new InternalServerErrorException("Failed to fetch contacts");
        }
    }
}