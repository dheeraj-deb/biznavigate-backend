import { Type } from '@nestjs/common';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  _model: TModel,
) => () => {};
