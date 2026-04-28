import { applyDecorators, Type } from '@nestjs/common';

/** No-op stub — Swagger removed. Kept for backward compatibility with existing usages. */
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  _model: TModel,
) => applyDecorators();
