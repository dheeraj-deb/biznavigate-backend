import { Type } from '@nestjs/common';

// Swagger removed — this decorator is a no-op
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  _model: TModel,
) => () => {};
