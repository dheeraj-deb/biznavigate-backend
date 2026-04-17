import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * API Paginated Response Decorator
 * Generates Swagger documentation for paginated responses
 *
 * @param model - The model class to document
 * @example
 * ```typescript
 * @Get()
 * @ApiPaginatedResponse(LeadEntity)
 * async findAll() { ... }
 * ```
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number', example: 1 },
                      limit: { type: 'number', example: 20 },
                      total: { type: 'number', example: 100 },
                      total_pages: { type: 'number', example: 5 },
                      has_next: { type: 'boolean', example: true },
                      has_prev: { type: 'boolean', example: false },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
