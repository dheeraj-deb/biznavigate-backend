
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model shops
 * 
 */
export type shops = $Result.DefaultSelection<Prisma.$shopsPayload>
/**
 * Model whatsapp_templates
 * 
 */
export type whatsapp_templates = $Result.DefaultSelection<Prisma.$whatsapp_templatesPayload>
/**
 * Model business_user
 * 
 */
export type business_user = $Result.DefaultSelection<Prisma.$business_userPayload>
/**
 * Model OnboardingSession
 * 
 */
export type OnboardingSession = $Result.DefaultSelection<Prisma.$OnboardingSessionPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Shops
 * const shops = await prisma.shops.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Shops
   * const shops = await prisma.shops.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.shops`: Exposes CRUD operations for the **shops** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Shops
    * const shops = await prisma.shops.findMany()
    * ```
    */
  get shops(): Prisma.shopsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.whatsapp_templates`: Exposes CRUD operations for the **whatsapp_templates** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Whatsapp_templates
    * const whatsapp_templates = await prisma.whatsapp_templates.findMany()
    * ```
    */
  get whatsapp_templates(): Prisma.whatsapp_templatesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.business_user`: Exposes CRUD operations for the **business_user** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Business_users
    * const business_users = await prisma.business_user.findMany()
    * ```
    */
  get business_user(): Prisma.business_userDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingSession`: Exposes CRUD operations for the **OnboardingSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingSessions
    * const onboardingSessions = await prisma.onboardingSession.findMany()
    * ```
    */
  get onboardingSession(): Prisma.OnboardingSessionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    shops: 'shops',
    whatsapp_templates: 'whatsapp_templates',
    business_user: 'business_user',
    OnboardingSession: 'OnboardingSession'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "shops" | "whatsapp_templates" | "business_user" | "onboardingSession"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      shops: {
        payload: Prisma.$shopsPayload<ExtArgs>
        fields: Prisma.shopsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.shopsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.shopsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>
          }
          findFirst: {
            args: Prisma.shopsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.shopsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>
          }
          findMany: {
            args: Prisma.shopsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>[]
          }
          create: {
            args: Prisma.shopsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>
          }
          createMany: {
            args: Prisma.shopsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.shopsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>[]
          }
          delete: {
            args: Prisma.shopsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>
          }
          update: {
            args: Prisma.shopsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>
          }
          deleteMany: {
            args: Prisma.shopsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.shopsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.shopsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>[]
          }
          upsert: {
            args: Prisma.shopsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$shopsPayload>
          }
          aggregate: {
            args: Prisma.ShopsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShops>
          }
          groupBy: {
            args: Prisma.shopsGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShopsGroupByOutputType>[]
          }
          count: {
            args: Prisma.shopsCountArgs<ExtArgs>
            result: $Utils.Optional<ShopsCountAggregateOutputType> | number
          }
        }
      }
      whatsapp_templates: {
        payload: Prisma.$whatsapp_templatesPayload<ExtArgs>
        fields: Prisma.whatsapp_templatesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.whatsapp_templatesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.whatsapp_templatesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>
          }
          findFirst: {
            args: Prisma.whatsapp_templatesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.whatsapp_templatesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>
          }
          findMany: {
            args: Prisma.whatsapp_templatesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>[]
          }
          create: {
            args: Prisma.whatsapp_templatesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>
          }
          createMany: {
            args: Prisma.whatsapp_templatesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.whatsapp_templatesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>[]
          }
          delete: {
            args: Prisma.whatsapp_templatesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>
          }
          update: {
            args: Prisma.whatsapp_templatesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>
          }
          deleteMany: {
            args: Prisma.whatsapp_templatesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.whatsapp_templatesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.whatsapp_templatesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>[]
          }
          upsert: {
            args: Prisma.whatsapp_templatesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$whatsapp_templatesPayload>
          }
          aggregate: {
            args: Prisma.Whatsapp_templatesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWhatsapp_templates>
          }
          groupBy: {
            args: Prisma.whatsapp_templatesGroupByArgs<ExtArgs>
            result: $Utils.Optional<Whatsapp_templatesGroupByOutputType>[]
          }
          count: {
            args: Prisma.whatsapp_templatesCountArgs<ExtArgs>
            result: $Utils.Optional<Whatsapp_templatesCountAggregateOutputType> | number
          }
        }
      }
      business_user: {
        payload: Prisma.$business_userPayload<ExtArgs>
        fields: Prisma.business_userFieldRefs
        operations: {
          findUnique: {
            args: Prisma.business_userFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.business_userFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>
          }
          findFirst: {
            args: Prisma.business_userFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.business_userFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>
          }
          findMany: {
            args: Prisma.business_userFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>[]
          }
          create: {
            args: Prisma.business_userCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>
          }
          createMany: {
            args: Prisma.business_userCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.business_userCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>[]
          }
          delete: {
            args: Prisma.business_userDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>
          }
          update: {
            args: Prisma.business_userUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>
          }
          deleteMany: {
            args: Prisma.business_userDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.business_userUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.business_userUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>[]
          }
          upsert: {
            args: Prisma.business_userUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$business_userPayload>
          }
          aggregate: {
            args: Prisma.Business_userAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBusiness_user>
          }
          groupBy: {
            args: Prisma.business_userGroupByArgs<ExtArgs>
            result: $Utils.Optional<Business_userGroupByOutputType>[]
          }
          count: {
            args: Prisma.business_userCountArgs<ExtArgs>
            result: $Utils.Optional<Business_userCountAggregateOutputType> | number
          }
        }
      }
      OnboardingSession: {
        payload: Prisma.$OnboardingSessionPayload<ExtArgs>
        fields: Prisma.OnboardingSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>
          }
          findFirst: {
            args: Prisma.OnboardingSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>
          }
          findMany: {
            args: Prisma.OnboardingSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>[]
          }
          create: {
            args: Prisma.OnboardingSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>
          }
          createMany: {
            args: Prisma.OnboardingSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>[]
          }
          delete: {
            args: Prisma.OnboardingSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>
          }
          update: {
            args: Prisma.OnboardingSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>
          }
          deleteMany: {
            args: Prisma.OnboardingSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>[]
          }
          upsert: {
            args: Prisma.OnboardingSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingSessionPayload>
          }
          aggregate: {
            args: Prisma.OnboardingSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingSession>
          }
          groupBy: {
            args: Prisma.OnboardingSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingSessionCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingSessionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    shops?: shopsOmit
    whatsapp_templates?: whatsapp_templatesOmit
    business_user?: business_userOmit
    onboardingSession?: OnboardingSessionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model shops
   */

  export type AggregateShops = {
    _count: ShopsCountAggregateOutputType | null
    _avg: ShopsAvgAggregateOutputType | null
    _sum: ShopsSumAggregateOutputType | null
    _min: ShopsMinAggregateOutputType | null
    _max: ShopsMaxAggregateOutputType | null
  }

  export type ShopsAvgAggregateOutputType = {
    id: number | null
  }

  export type ShopsSumAggregateOutputType = {
    id: number | null
  }

  export type ShopsMinAggregateOutputType = {
    id: number | null
    shop_name: string | null
    gst_number: string | null
    address: string | null
    pan: string | null
    mobile_num: string | null
    language: string | null
  }

  export type ShopsMaxAggregateOutputType = {
    id: number | null
    shop_name: string | null
    gst_number: string | null
    address: string | null
    pan: string | null
    mobile_num: string | null
    language: string | null
  }

  export type ShopsCountAggregateOutputType = {
    id: number
    shop_name: number
    gst_number: number
    address: number
    pan: number
    mobile_num: number
    language: number
    _all: number
  }


  export type ShopsAvgAggregateInputType = {
    id?: true
  }

  export type ShopsSumAggregateInputType = {
    id?: true
  }

  export type ShopsMinAggregateInputType = {
    id?: true
    shop_name?: true
    gst_number?: true
    address?: true
    pan?: true
    mobile_num?: true
    language?: true
  }

  export type ShopsMaxAggregateInputType = {
    id?: true
    shop_name?: true
    gst_number?: true
    address?: true
    pan?: true
    mobile_num?: true
    language?: true
  }

  export type ShopsCountAggregateInputType = {
    id?: true
    shop_name?: true
    gst_number?: true
    address?: true
    pan?: true
    mobile_num?: true
    language?: true
    _all?: true
  }

  export type ShopsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which shops to aggregate.
     */
    where?: shopsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of shops to fetch.
     */
    orderBy?: shopsOrderByWithRelationInput | shopsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: shopsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` shops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` shops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned shops
    **/
    _count?: true | ShopsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShopsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShopsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShopsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShopsMaxAggregateInputType
  }

  export type GetShopsAggregateType<T extends ShopsAggregateArgs> = {
        [P in keyof T & keyof AggregateShops]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShops[P]>
      : GetScalarType<T[P], AggregateShops[P]>
  }




  export type shopsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: shopsWhereInput
    orderBy?: shopsOrderByWithAggregationInput | shopsOrderByWithAggregationInput[]
    by: ShopsScalarFieldEnum[] | ShopsScalarFieldEnum
    having?: shopsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShopsCountAggregateInputType | true
    _avg?: ShopsAvgAggregateInputType
    _sum?: ShopsSumAggregateInputType
    _min?: ShopsMinAggregateInputType
    _max?: ShopsMaxAggregateInputType
  }

  export type ShopsGroupByOutputType = {
    id: number
    shop_name: string
    gst_number: string
    address: string
    pan: string | null
    mobile_num: string | null
    language: string | null
    _count: ShopsCountAggregateOutputType | null
    _avg: ShopsAvgAggregateOutputType | null
    _sum: ShopsSumAggregateOutputType | null
    _min: ShopsMinAggregateOutputType | null
    _max: ShopsMaxAggregateOutputType | null
  }

  type GetShopsGroupByPayload<T extends shopsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShopsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShopsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShopsGroupByOutputType[P]>
            : GetScalarType<T[P], ShopsGroupByOutputType[P]>
        }
      >
    >


  export type shopsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    shop_name?: boolean
    gst_number?: boolean
    address?: boolean
    pan?: boolean
    mobile_num?: boolean
    language?: boolean
  }, ExtArgs["result"]["shops"]>

  export type shopsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    shop_name?: boolean
    gst_number?: boolean
    address?: boolean
    pan?: boolean
    mobile_num?: boolean
    language?: boolean
  }, ExtArgs["result"]["shops"]>

  export type shopsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    shop_name?: boolean
    gst_number?: boolean
    address?: boolean
    pan?: boolean
    mobile_num?: boolean
    language?: boolean
  }, ExtArgs["result"]["shops"]>

  export type shopsSelectScalar = {
    id?: boolean
    shop_name?: boolean
    gst_number?: boolean
    address?: boolean
    pan?: boolean
    mobile_num?: boolean
    language?: boolean
  }

  export type shopsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "shop_name" | "gst_number" | "address" | "pan" | "mobile_num" | "language", ExtArgs["result"]["shops"]>

  export type $shopsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "shops"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      shop_name: string
      gst_number: string
      address: string
      pan: string | null
      mobile_num: string | null
      language: string | null
    }, ExtArgs["result"]["shops"]>
    composites: {}
  }

  type shopsGetPayload<S extends boolean | null | undefined | shopsDefaultArgs> = $Result.GetResult<Prisma.$shopsPayload, S>

  type shopsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<shopsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ShopsCountAggregateInputType | true
    }

  export interface shopsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['shops'], meta: { name: 'shops' } }
    /**
     * Find zero or one Shops that matches the filter.
     * @param {shopsFindUniqueArgs} args - Arguments to find a Shops
     * @example
     * // Get one Shops
     * const shops = await prisma.shops.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends shopsFindUniqueArgs>(args: SelectSubset<T, shopsFindUniqueArgs<ExtArgs>>): Prisma__shopsClient<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Shops that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {shopsFindUniqueOrThrowArgs} args - Arguments to find a Shops
     * @example
     * // Get one Shops
     * const shops = await prisma.shops.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends shopsFindUniqueOrThrowArgs>(args: SelectSubset<T, shopsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__shopsClient<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Shops that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {shopsFindFirstArgs} args - Arguments to find a Shops
     * @example
     * // Get one Shops
     * const shops = await prisma.shops.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends shopsFindFirstArgs>(args?: SelectSubset<T, shopsFindFirstArgs<ExtArgs>>): Prisma__shopsClient<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Shops that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {shopsFindFirstOrThrowArgs} args - Arguments to find a Shops
     * @example
     * // Get one Shops
     * const shops = await prisma.shops.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends shopsFindFirstOrThrowArgs>(args?: SelectSubset<T, shopsFindFirstOrThrowArgs<ExtArgs>>): Prisma__shopsClient<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Shops that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {shopsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Shops
     * const shops = await prisma.shops.findMany()
     * 
     * // Get first 10 Shops
     * const shops = await prisma.shops.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shopsWithIdOnly = await prisma.shops.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends shopsFindManyArgs>(args?: SelectSubset<T, shopsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Shops.
     * @param {shopsCreateArgs} args - Arguments to create a Shops.
     * @example
     * // Create one Shops
     * const Shops = await prisma.shops.create({
     *   data: {
     *     // ... data to create a Shops
     *   }
     * })
     * 
     */
    create<T extends shopsCreateArgs>(args: SelectSubset<T, shopsCreateArgs<ExtArgs>>): Prisma__shopsClient<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Shops.
     * @param {shopsCreateManyArgs} args - Arguments to create many Shops.
     * @example
     * // Create many Shops
     * const shops = await prisma.shops.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends shopsCreateManyArgs>(args?: SelectSubset<T, shopsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Shops and returns the data saved in the database.
     * @param {shopsCreateManyAndReturnArgs} args - Arguments to create many Shops.
     * @example
     * // Create many Shops
     * const shops = await prisma.shops.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Shops and only return the `id`
     * const shopsWithIdOnly = await prisma.shops.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends shopsCreateManyAndReturnArgs>(args?: SelectSubset<T, shopsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Shops.
     * @param {shopsDeleteArgs} args - Arguments to delete one Shops.
     * @example
     * // Delete one Shops
     * const Shops = await prisma.shops.delete({
     *   where: {
     *     // ... filter to delete one Shops
     *   }
     * })
     * 
     */
    delete<T extends shopsDeleteArgs>(args: SelectSubset<T, shopsDeleteArgs<ExtArgs>>): Prisma__shopsClient<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Shops.
     * @param {shopsUpdateArgs} args - Arguments to update one Shops.
     * @example
     * // Update one Shops
     * const shops = await prisma.shops.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends shopsUpdateArgs>(args: SelectSubset<T, shopsUpdateArgs<ExtArgs>>): Prisma__shopsClient<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Shops.
     * @param {shopsDeleteManyArgs} args - Arguments to filter Shops to delete.
     * @example
     * // Delete a few Shops
     * const { count } = await prisma.shops.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends shopsDeleteManyArgs>(args?: SelectSubset<T, shopsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {shopsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Shops
     * const shops = await prisma.shops.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends shopsUpdateManyArgs>(args: SelectSubset<T, shopsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shops and returns the data updated in the database.
     * @param {shopsUpdateManyAndReturnArgs} args - Arguments to update many Shops.
     * @example
     * // Update many Shops
     * const shops = await prisma.shops.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Shops and only return the `id`
     * const shopsWithIdOnly = await prisma.shops.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends shopsUpdateManyAndReturnArgs>(args: SelectSubset<T, shopsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Shops.
     * @param {shopsUpsertArgs} args - Arguments to update or create a Shops.
     * @example
     * // Update or create a Shops
     * const shops = await prisma.shops.upsert({
     *   create: {
     *     // ... data to create a Shops
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Shops we want to update
     *   }
     * })
     */
    upsert<T extends shopsUpsertArgs>(args: SelectSubset<T, shopsUpsertArgs<ExtArgs>>): Prisma__shopsClient<$Result.GetResult<Prisma.$shopsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Shops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {shopsCountArgs} args - Arguments to filter Shops to count.
     * @example
     * // Count the number of Shops
     * const count = await prisma.shops.count({
     *   where: {
     *     // ... the filter for the Shops we want to count
     *   }
     * })
    **/
    count<T extends shopsCountArgs>(
      args?: Subset<T, shopsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShopsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Shops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShopsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShopsAggregateArgs>(args: Subset<T, ShopsAggregateArgs>): Prisma.PrismaPromise<GetShopsAggregateType<T>>

    /**
     * Group by Shops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {shopsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends shopsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: shopsGroupByArgs['orderBy'] }
        : { orderBy?: shopsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, shopsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShopsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the shops model
   */
  readonly fields: shopsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for shops.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__shopsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the shops model
   */
  interface shopsFieldRefs {
    readonly id: FieldRef<"shops", 'Int'>
    readonly shop_name: FieldRef<"shops", 'String'>
    readonly gst_number: FieldRef<"shops", 'String'>
    readonly address: FieldRef<"shops", 'String'>
    readonly pan: FieldRef<"shops", 'String'>
    readonly mobile_num: FieldRef<"shops", 'String'>
    readonly language: FieldRef<"shops", 'String'>
  }
    

  // Custom InputTypes
  /**
   * shops findUnique
   */
  export type shopsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * Filter, which shops to fetch.
     */
    where: shopsWhereUniqueInput
  }

  /**
   * shops findUniqueOrThrow
   */
  export type shopsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * Filter, which shops to fetch.
     */
    where: shopsWhereUniqueInput
  }

  /**
   * shops findFirst
   */
  export type shopsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * Filter, which shops to fetch.
     */
    where?: shopsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of shops to fetch.
     */
    orderBy?: shopsOrderByWithRelationInput | shopsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for shops.
     */
    cursor?: shopsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` shops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` shops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of shops.
     */
    distinct?: ShopsScalarFieldEnum | ShopsScalarFieldEnum[]
  }

  /**
   * shops findFirstOrThrow
   */
  export type shopsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * Filter, which shops to fetch.
     */
    where?: shopsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of shops to fetch.
     */
    orderBy?: shopsOrderByWithRelationInput | shopsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for shops.
     */
    cursor?: shopsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` shops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` shops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of shops.
     */
    distinct?: ShopsScalarFieldEnum | ShopsScalarFieldEnum[]
  }

  /**
   * shops findMany
   */
  export type shopsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * Filter, which shops to fetch.
     */
    where?: shopsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of shops to fetch.
     */
    orderBy?: shopsOrderByWithRelationInput | shopsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing shops.
     */
    cursor?: shopsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` shops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` shops.
     */
    skip?: number
    distinct?: ShopsScalarFieldEnum | ShopsScalarFieldEnum[]
  }

  /**
   * shops create
   */
  export type shopsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * The data needed to create a shops.
     */
    data: XOR<shopsCreateInput, shopsUncheckedCreateInput>
  }

  /**
   * shops createMany
   */
  export type shopsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many shops.
     */
    data: shopsCreateManyInput | shopsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * shops createManyAndReturn
   */
  export type shopsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * The data used to create many shops.
     */
    data: shopsCreateManyInput | shopsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * shops update
   */
  export type shopsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * The data needed to update a shops.
     */
    data: XOR<shopsUpdateInput, shopsUncheckedUpdateInput>
    /**
     * Choose, which shops to update.
     */
    where: shopsWhereUniqueInput
  }

  /**
   * shops updateMany
   */
  export type shopsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update shops.
     */
    data: XOR<shopsUpdateManyMutationInput, shopsUncheckedUpdateManyInput>
    /**
     * Filter which shops to update
     */
    where?: shopsWhereInput
    /**
     * Limit how many shops to update.
     */
    limit?: number
  }

  /**
   * shops updateManyAndReturn
   */
  export type shopsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * The data used to update shops.
     */
    data: XOR<shopsUpdateManyMutationInput, shopsUncheckedUpdateManyInput>
    /**
     * Filter which shops to update
     */
    where?: shopsWhereInput
    /**
     * Limit how many shops to update.
     */
    limit?: number
  }

  /**
   * shops upsert
   */
  export type shopsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * The filter to search for the shops to update in case it exists.
     */
    where: shopsWhereUniqueInput
    /**
     * In case the shops found by the `where` argument doesn't exist, create a new shops with this data.
     */
    create: XOR<shopsCreateInput, shopsUncheckedCreateInput>
    /**
     * In case the shops was found with the provided `where` argument, update it with this data.
     */
    update: XOR<shopsUpdateInput, shopsUncheckedUpdateInput>
  }

  /**
   * shops delete
   */
  export type shopsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
    /**
     * Filter which shops to delete.
     */
    where: shopsWhereUniqueInput
  }

  /**
   * shops deleteMany
   */
  export type shopsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which shops to delete
     */
    where?: shopsWhereInput
    /**
     * Limit how many shops to delete.
     */
    limit?: number
  }

  /**
   * shops without action
   */
  export type shopsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the shops
     */
    select?: shopsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the shops
     */
    omit?: shopsOmit<ExtArgs> | null
  }


  /**
   * Model whatsapp_templates
   */

  export type AggregateWhatsapp_templates = {
    _count: Whatsapp_templatesCountAggregateOutputType | null
    _avg: Whatsapp_templatesAvgAggregateOutputType | null
    _sum: Whatsapp_templatesSumAggregateOutputType | null
    _min: Whatsapp_templatesMinAggregateOutputType | null
    _max: Whatsapp_templatesMaxAggregateOutputType | null
  }

  export type Whatsapp_templatesAvgAggregateOutputType = {
    id: number | null
  }

  export type Whatsapp_templatesSumAggregateOutputType = {
    id: number | null
  }

  export type Whatsapp_templatesMinAggregateOutputType = {
    id: number | null
    sid: string | null
    key: string | null
    language: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Whatsapp_templatesMaxAggregateOutputType = {
    id: number | null
    sid: string | null
    key: string | null
    language: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Whatsapp_templatesCountAggregateOutputType = {
    id: number
    sid: number
    key: number
    language: number
    variables: number
    is_active: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Whatsapp_templatesAvgAggregateInputType = {
    id?: true
  }

  export type Whatsapp_templatesSumAggregateInputType = {
    id?: true
  }

  export type Whatsapp_templatesMinAggregateInputType = {
    id?: true
    sid?: true
    key?: true
    language?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type Whatsapp_templatesMaxAggregateInputType = {
    id?: true
    sid?: true
    key?: true
    language?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type Whatsapp_templatesCountAggregateInputType = {
    id?: true
    sid?: true
    key?: true
    language?: true
    variables?: true
    is_active?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Whatsapp_templatesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which whatsapp_templates to aggregate.
     */
    where?: whatsapp_templatesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of whatsapp_templates to fetch.
     */
    orderBy?: whatsapp_templatesOrderByWithRelationInput | whatsapp_templatesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: whatsapp_templatesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` whatsapp_templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` whatsapp_templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned whatsapp_templates
    **/
    _count?: true | Whatsapp_templatesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Whatsapp_templatesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Whatsapp_templatesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Whatsapp_templatesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Whatsapp_templatesMaxAggregateInputType
  }

  export type GetWhatsapp_templatesAggregateType<T extends Whatsapp_templatesAggregateArgs> = {
        [P in keyof T & keyof AggregateWhatsapp_templates]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWhatsapp_templates[P]>
      : GetScalarType<T[P], AggregateWhatsapp_templates[P]>
  }




  export type whatsapp_templatesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: whatsapp_templatesWhereInput
    orderBy?: whatsapp_templatesOrderByWithAggregationInput | whatsapp_templatesOrderByWithAggregationInput[]
    by: Whatsapp_templatesScalarFieldEnum[] | Whatsapp_templatesScalarFieldEnum
    having?: whatsapp_templatesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Whatsapp_templatesCountAggregateInputType | true
    _avg?: Whatsapp_templatesAvgAggregateInputType
    _sum?: Whatsapp_templatesSumAggregateInputType
    _min?: Whatsapp_templatesMinAggregateInputType
    _max?: Whatsapp_templatesMaxAggregateInputType
  }

  export type Whatsapp_templatesGroupByOutputType = {
    id: number
    sid: string
    key: string
    language: string
    variables: JsonValue
    is_active: boolean
    created_at: Date
    updated_at: Date
    _count: Whatsapp_templatesCountAggregateOutputType | null
    _avg: Whatsapp_templatesAvgAggregateOutputType | null
    _sum: Whatsapp_templatesSumAggregateOutputType | null
    _min: Whatsapp_templatesMinAggregateOutputType | null
    _max: Whatsapp_templatesMaxAggregateOutputType | null
  }

  type GetWhatsapp_templatesGroupByPayload<T extends whatsapp_templatesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Whatsapp_templatesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Whatsapp_templatesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Whatsapp_templatesGroupByOutputType[P]>
            : GetScalarType<T[P], Whatsapp_templatesGroupByOutputType[P]>
        }
      >
    >


  export type whatsapp_templatesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sid?: boolean
    key?: boolean
    language?: boolean
    variables?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["whatsapp_templates"]>

  export type whatsapp_templatesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sid?: boolean
    key?: boolean
    language?: boolean
    variables?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["whatsapp_templates"]>

  export type whatsapp_templatesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sid?: boolean
    key?: boolean
    language?: boolean
    variables?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["whatsapp_templates"]>

  export type whatsapp_templatesSelectScalar = {
    id?: boolean
    sid?: boolean
    key?: boolean
    language?: boolean
    variables?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type whatsapp_templatesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sid" | "key" | "language" | "variables" | "is_active" | "created_at" | "updated_at", ExtArgs["result"]["whatsapp_templates"]>

  export type $whatsapp_templatesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "whatsapp_templates"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      sid: string
      key: string
      language: string
      variables: Prisma.JsonValue
      is_active: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["whatsapp_templates"]>
    composites: {}
  }

  type whatsapp_templatesGetPayload<S extends boolean | null | undefined | whatsapp_templatesDefaultArgs> = $Result.GetResult<Prisma.$whatsapp_templatesPayload, S>

  type whatsapp_templatesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<whatsapp_templatesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Whatsapp_templatesCountAggregateInputType | true
    }

  export interface whatsapp_templatesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['whatsapp_templates'], meta: { name: 'whatsapp_templates' } }
    /**
     * Find zero or one Whatsapp_templates that matches the filter.
     * @param {whatsapp_templatesFindUniqueArgs} args - Arguments to find a Whatsapp_templates
     * @example
     * // Get one Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends whatsapp_templatesFindUniqueArgs>(args: SelectSubset<T, whatsapp_templatesFindUniqueArgs<ExtArgs>>): Prisma__whatsapp_templatesClient<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Whatsapp_templates that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {whatsapp_templatesFindUniqueOrThrowArgs} args - Arguments to find a Whatsapp_templates
     * @example
     * // Get one Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends whatsapp_templatesFindUniqueOrThrowArgs>(args: SelectSubset<T, whatsapp_templatesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__whatsapp_templatesClient<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Whatsapp_templates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {whatsapp_templatesFindFirstArgs} args - Arguments to find a Whatsapp_templates
     * @example
     * // Get one Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends whatsapp_templatesFindFirstArgs>(args?: SelectSubset<T, whatsapp_templatesFindFirstArgs<ExtArgs>>): Prisma__whatsapp_templatesClient<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Whatsapp_templates that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {whatsapp_templatesFindFirstOrThrowArgs} args - Arguments to find a Whatsapp_templates
     * @example
     * // Get one Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends whatsapp_templatesFindFirstOrThrowArgs>(args?: SelectSubset<T, whatsapp_templatesFindFirstOrThrowArgs<ExtArgs>>): Prisma__whatsapp_templatesClient<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Whatsapp_templates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {whatsapp_templatesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.findMany()
     * 
     * // Get first 10 Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const whatsapp_templatesWithIdOnly = await prisma.whatsapp_templates.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends whatsapp_templatesFindManyArgs>(args?: SelectSubset<T, whatsapp_templatesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Whatsapp_templates.
     * @param {whatsapp_templatesCreateArgs} args - Arguments to create a Whatsapp_templates.
     * @example
     * // Create one Whatsapp_templates
     * const Whatsapp_templates = await prisma.whatsapp_templates.create({
     *   data: {
     *     // ... data to create a Whatsapp_templates
     *   }
     * })
     * 
     */
    create<T extends whatsapp_templatesCreateArgs>(args: SelectSubset<T, whatsapp_templatesCreateArgs<ExtArgs>>): Prisma__whatsapp_templatesClient<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Whatsapp_templates.
     * @param {whatsapp_templatesCreateManyArgs} args - Arguments to create many Whatsapp_templates.
     * @example
     * // Create many Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends whatsapp_templatesCreateManyArgs>(args?: SelectSubset<T, whatsapp_templatesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Whatsapp_templates and returns the data saved in the database.
     * @param {whatsapp_templatesCreateManyAndReturnArgs} args - Arguments to create many Whatsapp_templates.
     * @example
     * // Create many Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Whatsapp_templates and only return the `id`
     * const whatsapp_templatesWithIdOnly = await prisma.whatsapp_templates.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends whatsapp_templatesCreateManyAndReturnArgs>(args?: SelectSubset<T, whatsapp_templatesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Whatsapp_templates.
     * @param {whatsapp_templatesDeleteArgs} args - Arguments to delete one Whatsapp_templates.
     * @example
     * // Delete one Whatsapp_templates
     * const Whatsapp_templates = await prisma.whatsapp_templates.delete({
     *   where: {
     *     // ... filter to delete one Whatsapp_templates
     *   }
     * })
     * 
     */
    delete<T extends whatsapp_templatesDeleteArgs>(args: SelectSubset<T, whatsapp_templatesDeleteArgs<ExtArgs>>): Prisma__whatsapp_templatesClient<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Whatsapp_templates.
     * @param {whatsapp_templatesUpdateArgs} args - Arguments to update one Whatsapp_templates.
     * @example
     * // Update one Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends whatsapp_templatesUpdateArgs>(args: SelectSubset<T, whatsapp_templatesUpdateArgs<ExtArgs>>): Prisma__whatsapp_templatesClient<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Whatsapp_templates.
     * @param {whatsapp_templatesDeleteManyArgs} args - Arguments to filter Whatsapp_templates to delete.
     * @example
     * // Delete a few Whatsapp_templates
     * const { count } = await prisma.whatsapp_templates.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends whatsapp_templatesDeleteManyArgs>(args?: SelectSubset<T, whatsapp_templatesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Whatsapp_templates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {whatsapp_templatesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends whatsapp_templatesUpdateManyArgs>(args: SelectSubset<T, whatsapp_templatesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Whatsapp_templates and returns the data updated in the database.
     * @param {whatsapp_templatesUpdateManyAndReturnArgs} args - Arguments to update many Whatsapp_templates.
     * @example
     * // Update many Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Whatsapp_templates and only return the `id`
     * const whatsapp_templatesWithIdOnly = await prisma.whatsapp_templates.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends whatsapp_templatesUpdateManyAndReturnArgs>(args: SelectSubset<T, whatsapp_templatesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Whatsapp_templates.
     * @param {whatsapp_templatesUpsertArgs} args - Arguments to update or create a Whatsapp_templates.
     * @example
     * // Update or create a Whatsapp_templates
     * const whatsapp_templates = await prisma.whatsapp_templates.upsert({
     *   create: {
     *     // ... data to create a Whatsapp_templates
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Whatsapp_templates we want to update
     *   }
     * })
     */
    upsert<T extends whatsapp_templatesUpsertArgs>(args: SelectSubset<T, whatsapp_templatesUpsertArgs<ExtArgs>>): Prisma__whatsapp_templatesClient<$Result.GetResult<Prisma.$whatsapp_templatesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Whatsapp_templates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {whatsapp_templatesCountArgs} args - Arguments to filter Whatsapp_templates to count.
     * @example
     * // Count the number of Whatsapp_templates
     * const count = await prisma.whatsapp_templates.count({
     *   where: {
     *     // ... the filter for the Whatsapp_templates we want to count
     *   }
     * })
    **/
    count<T extends whatsapp_templatesCountArgs>(
      args?: Subset<T, whatsapp_templatesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Whatsapp_templatesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Whatsapp_templates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Whatsapp_templatesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Whatsapp_templatesAggregateArgs>(args: Subset<T, Whatsapp_templatesAggregateArgs>): Prisma.PrismaPromise<GetWhatsapp_templatesAggregateType<T>>

    /**
     * Group by Whatsapp_templates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {whatsapp_templatesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends whatsapp_templatesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: whatsapp_templatesGroupByArgs['orderBy'] }
        : { orderBy?: whatsapp_templatesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, whatsapp_templatesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWhatsapp_templatesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the whatsapp_templates model
   */
  readonly fields: whatsapp_templatesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for whatsapp_templates.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__whatsapp_templatesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the whatsapp_templates model
   */
  interface whatsapp_templatesFieldRefs {
    readonly id: FieldRef<"whatsapp_templates", 'Int'>
    readonly sid: FieldRef<"whatsapp_templates", 'String'>
    readonly key: FieldRef<"whatsapp_templates", 'String'>
    readonly language: FieldRef<"whatsapp_templates", 'String'>
    readonly variables: FieldRef<"whatsapp_templates", 'Json'>
    readonly is_active: FieldRef<"whatsapp_templates", 'Boolean'>
    readonly created_at: FieldRef<"whatsapp_templates", 'DateTime'>
    readonly updated_at: FieldRef<"whatsapp_templates", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * whatsapp_templates findUnique
   */
  export type whatsapp_templatesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * Filter, which whatsapp_templates to fetch.
     */
    where: whatsapp_templatesWhereUniqueInput
  }

  /**
   * whatsapp_templates findUniqueOrThrow
   */
  export type whatsapp_templatesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * Filter, which whatsapp_templates to fetch.
     */
    where: whatsapp_templatesWhereUniqueInput
  }

  /**
   * whatsapp_templates findFirst
   */
  export type whatsapp_templatesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * Filter, which whatsapp_templates to fetch.
     */
    where?: whatsapp_templatesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of whatsapp_templates to fetch.
     */
    orderBy?: whatsapp_templatesOrderByWithRelationInput | whatsapp_templatesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for whatsapp_templates.
     */
    cursor?: whatsapp_templatesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` whatsapp_templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` whatsapp_templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of whatsapp_templates.
     */
    distinct?: Whatsapp_templatesScalarFieldEnum | Whatsapp_templatesScalarFieldEnum[]
  }

  /**
   * whatsapp_templates findFirstOrThrow
   */
  export type whatsapp_templatesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * Filter, which whatsapp_templates to fetch.
     */
    where?: whatsapp_templatesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of whatsapp_templates to fetch.
     */
    orderBy?: whatsapp_templatesOrderByWithRelationInput | whatsapp_templatesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for whatsapp_templates.
     */
    cursor?: whatsapp_templatesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` whatsapp_templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` whatsapp_templates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of whatsapp_templates.
     */
    distinct?: Whatsapp_templatesScalarFieldEnum | Whatsapp_templatesScalarFieldEnum[]
  }

  /**
   * whatsapp_templates findMany
   */
  export type whatsapp_templatesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * Filter, which whatsapp_templates to fetch.
     */
    where?: whatsapp_templatesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of whatsapp_templates to fetch.
     */
    orderBy?: whatsapp_templatesOrderByWithRelationInput | whatsapp_templatesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing whatsapp_templates.
     */
    cursor?: whatsapp_templatesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` whatsapp_templates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` whatsapp_templates.
     */
    skip?: number
    distinct?: Whatsapp_templatesScalarFieldEnum | Whatsapp_templatesScalarFieldEnum[]
  }

  /**
   * whatsapp_templates create
   */
  export type whatsapp_templatesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * The data needed to create a whatsapp_templates.
     */
    data: XOR<whatsapp_templatesCreateInput, whatsapp_templatesUncheckedCreateInput>
  }

  /**
   * whatsapp_templates createMany
   */
  export type whatsapp_templatesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many whatsapp_templates.
     */
    data: whatsapp_templatesCreateManyInput | whatsapp_templatesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * whatsapp_templates createManyAndReturn
   */
  export type whatsapp_templatesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * The data used to create many whatsapp_templates.
     */
    data: whatsapp_templatesCreateManyInput | whatsapp_templatesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * whatsapp_templates update
   */
  export type whatsapp_templatesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * The data needed to update a whatsapp_templates.
     */
    data: XOR<whatsapp_templatesUpdateInput, whatsapp_templatesUncheckedUpdateInput>
    /**
     * Choose, which whatsapp_templates to update.
     */
    where: whatsapp_templatesWhereUniqueInput
  }

  /**
   * whatsapp_templates updateMany
   */
  export type whatsapp_templatesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update whatsapp_templates.
     */
    data: XOR<whatsapp_templatesUpdateManyMutationInput, whatsapp_templatesUncheckedUpdateManyInput>
    /**
     * Filter which whatsapp_templates to update
     */
    where?: whatsapp_templatesWhereInput
    /**
     * Limit how many whatsapp_templates to update.
     */
    limit?: number
  }

  /**
   * whatsapp_templates updateManyAndReturn
   */
  export type whatsapp_templatesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * The data used to update whatsapp_templates.
     */
    data: XOR<whatsapp_templatesUpdateManyMutationInput, whatsapp_templatesUncheckedUpdateManyInput>
    /**
     * Filter which whatsapp_templates to update
     */
    where?: whatsapp_templatesWhereInput
    /**
     * Limit how many whatsapp_templates to update.
     */
    limit?: number
  }

  /**
   * whatsapp_templates upsert
   */
  export type whatsapp_templatesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * The filter to search for the whatsapp_templates to update in case it exists.
     */
    where: whatsapp_templatesWhereUniqueInput
    /**
     * In case the whatsapp_templates found by the `where` argument doesn't exist, create a new whatsapp_templates with this data.
     */
    create: XOR<whatsapp_templatesCreateInput, whatsapp_templatesUncheckedCreateInput>
    /**
     * In case the whatsapp_templates was found with the provided `where` argument, update it with this data.
     */
    update: XOR<whatsapp_templatesUpdateInput, whatsapp_templatesUncheckedUpdateInput>
  }

  /**
   * whatsapp_templates delete
   */
  export type whatsapp_templatesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
    /**
     * Filter which whatsapp_templates to delete.
     */
    where: whatsapp_templatesWhereUniqueInput
  }

  /**
   * whatsapp_templates deleteMany
   */
  export type whatsapp_templatesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which whatsapp_templates to delete
     */
    where?: whatsapp_templatesWhereInput
    /**
     * Limit how many whatsapp_templates to delete.
     */
    limit?: number
  }

  /**
   * whatsapp_templates without action
   */
  export type whatsapp_templatesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the whatsapp_templates
     */
    select?: whatsapp_templatesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the whatsapp_templates
     */
    omit?: whatsapp_templatesOmit<ExtArgs> | null
  }


  /**
   * Model business_user
   */

  export type AggregateBusiness_user = {
    _count: Business_userCountAggregateOutputType | null
    _avg: Business_userAvgAggregateOutputType | null
    _sum: Business_userSumAggregateOutputType | null
    _min: Business_userMinAggregateOutputType | null
    _max: Business_userMaxAggregateOutputType | null
  }

  export type Business_userAvgAggregateOutputType = {
    id: number | null
  }

  export type Business_userSumAggregateOutputType = {
    id: number | null
  }

  export type Business_userMinAggregateOutputType = {
    id: number | null
    businessName: string | null
    gstin: string | null
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    notificationPreference: string | null
    tallyNetId: string | null
    tallyNetPassword: string | null
  }

  export type Business_userMaxAggregateOutputType = {
    id: number | null
    businessName: string | null
    gstin: string | null
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    notificationPreference: string | null
    tallyNetId: string | null
    tallyNetPassword: string | null
  }

  export type Business_userCountAggregateOutputType = {
    id: number
    businessName: number
    gstin: number
    contactEmail: number
    contactPhone: number
    address: number
    notificationPreference: number
    tallyNetId: number
    tallyNetPassword: number
    _all: number
  }


  export type Business_userAvgAggregateInputType = {
    id?: true
  }

  export type Business_userSumAggregateInputType = {
    id?: true
  }

  export type Business_userMinAggregateInputType = {
    id?: true
    businessName?: true
    gstin?: true
    contactEmail?: true
    contactPhone?: true
    address?: true
    notificationPreference?: true
    tallyNetId?: true
    tallyNetPassword?: true
  }

  export type Business_userMaxAggregateInputType = {
    id?: true
    businessName?: true
    gstin?: true
    contactEmail?: true
    contactPhone?: true
    address?: true
    notificationPreference?: true
    tallyNetId?: true
    tallyNetPassword?: true
  }

  export type Business_userCountAggregateInputType = {
    id?: true
    businessName?: true
    gstin?: true
    contactEmail?: true
    contactPhone?: true
    address?: true
    notificationPreference?: true
    tallyNetId?: true
    tallyNetPassword?: true
    _all?: true
  }

  export type Business_userAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which business_user to aggregate.
     */
    where?: business_userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of business_users to fetch.
     */
    orderBy?: business_userOrderByWithRelationInput | business_userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: business_userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` business_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` business_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned business_users
    **/
    _count?: true | Business_userCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Business_userAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Business_userSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Business_userMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Business_userMaxAggregateInputType
  }

  export type GetBusiness_userAggregateType<T extends Business_userAggregateArgs> = {
        [P in keyof T & keyof AggregateBusiness_user]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBusiness_user[P]>
      : GetScalarType<T[P], AggregateBusiness_user[P]>
  }




  export type business_userGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: business_userWhereInput
    orderBy?: business_userOrderByWithAggregationInput | business_userOrderByWithAggregationInput[]
    by: Business_userScalarFieldEnum[] | Business_userScalarFieldEnum
    having?: business_userScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Business_userCountAggregateInputType | true
    _avg?: Business_userAvgAggregateInputType
    _sum?: Business_userSumAggregateInputType
    _min?: Business_userMinAggregateInputType
    _max?: Business_userMaxAggregateInputType
  }

  export type Business_userGroupByOutputType = {
    id: number
    businessName: string
    gstin: string
    contactEmail: string
    contactPhone: string
    address: string
    notificationPreference: string
    tallyNetId: string
    tallyNetPassword: string
    _count: Business_userCountAggregateOutputType | null
    _avg: Business_userAvgAggregateOutputType | null
    _sum: Business_userSumAggregateOutputType | null
    _min: Business_userMinAggregateOutputType | null
    _max: Business_userMaxAggregateOutputType | null
  }

  type GetBusiness_userGroupByPayload<T extends business_userGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Business_userGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Business_userGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Business_userGroupByOutputType[P]>
            : GetScalarType<T[P], Business_userGroupByOutputType[P]>
        }
      >
    >


  export type business_userSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    businessName?: boolean
    gstin?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    address?: boolean
    notificationPreference?: boolean
    tallyNetId?: boolean
    tallyNetPassword?: boolean
  }, ExtArgs["result"]["business_user"]>

  export type business_userSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    businessName?: boolean
    gstin?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    address?: boolean
    notificationPreference?: boolean
    tallyNetId?: boolean
    tallyNetPassword?: boolean
  }, ExtArgs["result"]["business_user"]>

  export type business_userSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    businessName?: boolean
    gstin?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    address?: boolean
    notificationPreference?: boolean
    tallyNetId?: boolean
    tallyNetPassword?: boolean
  }, ExtArgs["result"]["business_user"]>

  export type business_userSelectScalar = {
    id?: boolean
    businessName?: boolean
    gstin?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    address?: boolean
    notificationPreference?: boolean
    tallyNetId?: boolean
    tallyNetPassword?: boolean
  }

  export type business_userOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "businessName" | "gstin" | "contactEmail" | "contactPhone" | "address" | "notificationPreference" | "tallyNetId" | "tallyNetPassword", ExtArgs["result"]["business_user"]>

  export type $business_userPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "business_user"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      businessName: string
      gstin: string
      contactEmail: string
      contactPhone: string
      address: string
      notificationPreference: string
      tallyNetId: string
      tallyNetPassword: string
    }, ExtArgs["result"]["business_user"]>
    composites: {}
  }

  type business_userGetPayload<S extends boolean | null | undefined | business_userDefaultArgs> = $Result.GetResult<Prisma.$business_userPayload, S>

  type business_userCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<business_userFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Business_userCountAggregateInputType | true
    }

  export interface business_userDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['business_user'], meta: { name: 'business_user' } }
    /**
     * Find zero or one Business_user that matches the filter.
     * @param {business_userFindUniqueArgs} args - Arguments to find a Business_user
     * @example
     * // Get one Business_user
     * const business_user = await prisma.business_user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends business_userFindUniqueArgs>(args: SelectSubset<T, business_userFindUniqueArgs<ExtArgs>>): Prisma__business_userClient<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Business_user that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {business_userFindUniqueOrThrowArgs} args - Arguments to find a Business_user
     * @example
     * // Get one Business_user
     * const business_user = await prisma.business_user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends business_userFindUniqueOrThrowArgs>(args: SelectSubset<T, business_userFindUniqueOrThrowArgs<ExtArgs>>): Prisma__business_userClient<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Business_user that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {business_userFindFirstArgs} args - Arguments to find a Business_user
     * @example
     * // Get one Business_user
     * const business_user = await prisma.business_user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends business_userFindFirstArgs>(args?: SelectSubset<T, business_userFindFirstArgs<ExtArgs>>): Prisma__business_userClient<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Business_user that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {business_userFindFirstOrThrowArgs} args - Arguments to find a Business_user
     * @example
     * // Get one Business_user
     * const business_user = await prisma.business_user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends business_userFindFirstOrThrowArgs>(args?: SelectSubset<T, business_userFindFirstOrThrowArgs<ExtArgs>>): Prisma__business_userClient<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Business_users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {business_userFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Business_users
     * const business_users = await prisma.business_user.findMany()
     * 
     * // Get first 10 Business_users
     * const business_users = await prisma.business_user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const business_userWithIdOnly = await prisma.business_user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends business_userFindManyArgs>(args?: SelectSubset<T, business_userFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Business_user.
     * @param {business_userCreateArgs} args - Arguments to create a Business_user.
     * @example
     * // Create one Business_user
     * const Business_user = await prisma.business_user.create({
     *   data: {
     *     // ... data to create a Business_user
     *   }
     * })
     * 
     */
    create<T extends business_userCreateArgs>(args: SelectSubset<T, business_userCreateArgs<ExtArgs>>): Prisma__business_userClient<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Business_users.
     * @param {business_userCreateManyArgs} args - Arguments to create many Business_users.
     * @example
     * // Create many Business_users
     * const business_user = await prisma.business_user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends business_userCreateManyArgs>(args?: SelectSubset<T, business_userCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Business_users and returns the data saved in the database.
     * @param {business_userCreateManyAndReturnArgs} args - Arguments to create many Business_users.
     * @example
     * // Create many Business_users
     * const business_user = await prisma.business_user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Business_users and only return the `id`
     * const business_userWithIdOnly = await prisma.business_user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends business_userCreateManyAndReturnArgs>(args?: SelectSubset<T, business_userCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Business_user.
     * @param {business_userDeleteArgs} args - Arguments to delete one Business_user.
     * @example
     * // Delete one Business_user
     * const Business_user = await prisma.business_user.delete({
     *   where: {
     *     // ... filter to delete one Business_user
     *   }
     * })
     * 
     */
    delete<T extends business_userDeleteArgs>(args: SelectSubset<T, business_userDeleteArgs<ExtArgs>>): Prisma__business_userClient<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Business_user.
     * @param {business_userUpdateArgs} args - Arguments to update one Business_user.
     * @example
     * // Update one Business_user
     * const business_user = await prisma.business_user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends business_userUpdateArgs>(args: SelectSubset<T, business_userUpdateArgs<ExtArgs>>): Prisma__business_userClient<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Business_users.
     * @param {business_userDeleteManyArgs} args - Arguments to filter Business_users to delete.
     * @example
     * // Delete a few Business_users
     * const { count } = await prisma.business_user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends business_userDeleteManyArgs>(args?: SelectSubset<T, business_userDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Business_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {business_userUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Business_users
     * const business_user = await prisma.business_user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends business_userUpdateManyArgs>(args: SelectSubset<T, business_userUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Business_users and returns the data updated in the database.
     * @param {business_userUpdateManyAndReturnArgs} args - Arguments to update many Business_users.
     * @example
     * // Update many Business_users
     * const business_user = await prisma.business_user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Business_users and only return the `id`
     * const business_userWithIdOnly = await prisma.business_user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends business_userUpdateManyAndReturnArgs>(args: SelectSubset<T, business_userUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Business_user.
     * @param {business_userUpsertArgs} args - Arguments to update or create a Business_user.
     * @example
     * // Update or create a Business_user
     * const business_user = await prisma.business_user.upsert({
     *   create: {
     *     // ... data to create a Business_user
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Business_user we want to update
     *   }
     * })
     */
    upsert<T extends business_userUpsertArgs>(args: SelectSubset<T, business_userUpsertArgs<ExtArgs>>): Prisma__business_userClient<$Result.GetResult<Prisma.$business_userPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Business_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {business_userCountArgs} args - Arguments to filter Business_users to count.
     * @example
     * // Count the number of Business_users
     * const count = await prisma.business_user.count({
     *   where: {
     *     // ... the filter for the Business_users we want to count
     *   }
     * })
    **/
    count<T extends business_userCountArgs>(
      args?: Subset<T, business_userCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Business_userCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Business_user.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Business_userAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Business_userAggregateArgs>(args: Subset<T, Business_userAggregateArgs>): Prisma.PrismaPromise<GetBusiness_userAggregateType<T>>

    /**
     * Group by Business_user.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {business_userGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends business_userGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: business_userGroupByArgs['orderBy'] }
        : { orderBy?: business_userGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, business_userGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBusiness_userGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the business_user model
   */
  readonly fields: business_userFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for business_user.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__business_userClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the business_user model
   */
  interface business_userFieldRefs {
    readonly id: FieldRef<"business_user", 'Int'>
    readonly businessName: FieldRef<"business_user", 'String'>
    readonly gstin: FieldRef<"business_user", 'String'>
    readonly contactEmail: FieldRef<"business_user", 'String'>
    readonly contactPhone: FieldRef<"business_user", 'String'>
    readonly address: FieldRef<"business_user", 'String'>
    readonly notificationPreference: FieldRef<"business_user", 'String'>
    readonly tallyNetId: FieldRef<"business_user", 'String'>
    readonly tallyNetPassword: FieldRef<"business_user", 'String'>
  }
    

  // Custom InputTypes
  /**
   * business_user findUnique
   */
  export type business_userFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * Filter, which business_user to fetch.
     */
    where: business_userWhereUniqueInput
  }

  /**
   * business_user findUniqueOrThrow
   */
  export type business_userFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * Filter, which business_user to fetch.
     */
    where: business_userWhereUniqueInput
  }

  /**
   * business_user findFirst
   */
  export type business_userFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * Filter, which business_user to fetch.
     */
    where?: business_userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of business_users to fetch.
     */
    orderBy?: business_userOrderByWithRelationInput | business_userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for business_users.
     */
    cursor?: business_userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` business_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` business_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of business_users.
     */
    distinct?: Business_userScalarFieldEnum | Business_userScalarFieldEnum[]
  }

  /**
   * business_user findFirstOrThrow
   */
  export type business_userFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * Filter, which business_user to fetch.
     */
    where?: business_userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of business_users to fetch.
     */
    orderBy?: business_userOrderByWithRelationInput | business_userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for business_users.
     */
    cursor?: business_userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` business_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` business_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of business_users.
     */
    distinct?: Business_userScalarFieldEnum | Business_userScalarFieldEnum[]
  }

  /**
   * business_user findMany
   */
  export type business_userFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * Filter, which business_users to fetch.
     */
    where?: business_userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of business_users to fetch.
     */
    orderBy?: business_userOrderByWithRelationInput | business_userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing business_users.
     */
    cursor?: business_userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` business_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` business_users.
     */
    skip?: number
    distinct?: Business_userScalarFieldEnum | Business_userScalarFieldEnum[]
  }

  /**
   * business_user create
   */
  export type business_userCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * The data needed to create a business_user.
     */
    data: XOR<business_userCreateInput, business_userUncheckedCreateInput>
  }

  /**
   * business_user createMany
   */
  export type business_userCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many business_users.
     */
    data: business_userCreateManyInput | business_userCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * business_user createManyAndReturn
   */
  export type business_userCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * The data used to create many business_users.
     */
    data: business_userCreateManyInput | business_userCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * business_user update
   */
  export type business_userUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * The data needed to update a business_user.
     */
    data: XOR<business_userUpdateInput, business_userUncheckedUpdateInput>
    /**
     * Choose, which business_user to update.
     */
    where: business_userWhereUniqueInput
  }

  /**
   * business_user updateMany
   */
  export type business_userUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update business_users.
     */
    data: XOR<business_userUpdateManyMutationInput, business_userUncheckedUpdateManyInput>
    /**
     * Filter which business_users to update
     */
    where?: business_userWhereInput
    /**
     * Limit how many business_users to update.
     */
    limit?: number
  }

  /**
   * business_user updateManyAndReturn
   */
  export type business_userUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * The data used to update business_users.
     */
    data: XOR<business_userUpdateManyMutationInput, business_userUncheckedUpdateManyInput>
    /**
     * Filter which business_users to update
     */
    where?: business_userWhereInput
    /**
     * Limit how many business_users to update.
     */
    limit?: number
  }

  /**
   * business_user upsert
   */
  export type business_userUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * The filter to search for the business_user to update in case it exists.
     */
    where: business_userWhereUniqueInput
    /**
     * In case the business_user found by the `where` argument doesn't exist, create a new business_user with this data.
     */
    create: XOR<business_userCreateInput, business_userUncheckedCreateInput>
    /**
     * In case the business_user was found with the provided `where` argument, update it with this data.
     */
    update: XOR<business_userUpdateInput, business_userUncheckedUpdateInput>
  }

  /**
   * business_user delete
   */
  export type business_userDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
    /**
     * Filter which business_user to delete.
     */
    where: business_userWhereUniqueInput
  }

  /**
   * business_user deleteMany
   */
  export type business_userDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which business_users to delete
     */
    where?: business_userWhereInput
    /**
     * Limit how many business_users to delete.
     */
    limit?: number
  }

  /**
   * business_user without action
   */
  export type business_userDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the business_user
     */
    select?: business_userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the business_user
     */
    omit?: business_userOmit<ExtArgs> | null
  }


  /**
   * Model OnboardingSession
   */

  export type AggregateOnboardingSession = {
    _count: OnboardingSessionCountAggregateOutputType | null
    _avg: OnboardingSessionAvgAggregateOutputType | null
    _sum: OnboardingSessionSumAggregateOutputType | null
    _min: OnboardingSessionMinAggregateOutputType | null
    _max: OnboardingSessionMaxAggregateOutputType | null
  }

  export type OnboardingSessionAvgAggregateOutputType = {
    id: number | null
    step_index: number | null
  }

  export type OnboardingSessionSumAggregateOutputType = {
    id: number | null
    step_index: number | null
  }

  export type OnboardingSessionMinAggregateOutputType = {
    id: number | null
    phone_number: string | null
    step_index: number | null
    session_id: string | null
    created_at: Date | null
    updated_at: Date | null
    status: string | null
  }

  export type OnboardingSessionMaxAggregateOutputType = {
    id: number | null
    phone_number: string | null
    step_index: number | null
    session_id: string | null
    created_at: Date | null
    updated_at: Date | null
    status: string | null
  }

  export type OnboardingSessionCountAggregateOutputType = {
    id: number
    phone_number: number
    step_index: number
    session_id: number
    created_at: number
    updated_at: number
    status: number
    _all: number
  }


  export type OnboardingSessionAvgAggregateInputType = {
    id?: true
    step_index?: true
  }

  export type OnboardingSessionSumAggregateInputType = {
    id?: true
    step_index?: true
  }

  export type OnboardingSessionMinAggregateInputType = {
    id?: true
    phone_number?: true
    step_index?: true
    session_id?: true
    created_at?: true
    updated_at?: true
    status?: true
  }

  export type OnboardingSessionMaxAggregateInputType = {
    id?: true
    phone_number?: true
    step_index?: true
    session_id?: true
    created_at?: true
    updated_at?: true
    status?: true
  }

  export type OnboardingSessionCountAggregateInputType = {
    id?: true
    phone_number?: true
    step_index?: true
    session_id?: true
    created_at?: true
    updated_at?: true
    status?: true
    _all?: true
  }

  export type OnboardingSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingSession to aggregate.
     */
    where?: OnboardingSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingSessions to fetch.
     */
    orderBy?: OnboardingSessionOrderByWithRelationInput | OnboardingSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingSessions
    **/
    _count?: true | OnboardingSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OnboardingSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OnboardingSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingSessionMaxAggregateInputType
  }

  export type GetOnboardingSessionAggregateType<T extends OnboardingSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingSession[P]>
      : GetScalarType<T[P], AggregateOnboardingSession[P]>
  }




  export type OnboardingSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingSessionWhereInput
    orderBy?: OnboardingSessionOrderByWithAggregationInput | OnboardingSessionOrderByWithAggregationInput[]
    by: OnboardingSessionScalarFieldEnum[] | OnboardingSessionScalarFieldEnum
    having?: OnboardingSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingSessionCountAggregateInputType | true
    _avg?: OnboardingSessionAvgAggregateInputType
    _sum?: OnboardingSessionSumAggregateInputType
    _min?: OnboardingSessionMinAggregateInputType
    _max?: OnboardingSessionMaxAggregateInputType
  }

  export type OnboardingSessionGroupByOutputType = {
    id: number
    phone_number: string
    step_index: number
    session_id: string
    created_at: Date
    updated_at: Date
    status: string
    _count: OnboardingSessionCountAggregateOutputType | null
    _avg: OnboardingSessionAvgAggregateOutputType | null
    _sum: OnboardingSessionSumAggregateOutputType | null
    _min: OnboardingSessionMinAggregateOutputType | null
    _max: OnboardingSessionMaxAggregateOutputType | null
  }

  type GetOnboardingSessionGroupByPayload<T extends OnboardingSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingSessionGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingSessionGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone_number?: boolean
    step_index?: boolean
    session_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    status?: boolean
  }, ExtArgs["result"]["onboardingSession"]>

  export type OnboardingSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone_number?: boolean
    step_index?: boolean
    session_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    status?: boolean
  }, ExtArgs["result"]["onboardingSession"]>

  export type OnboardingSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone_number?: boolean
    step_index?: boolean
    session_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    status?: boolean
  }, ExtArgs["result"]["onboardingSession"]>

  export type OnboardingSessionSelectScalar = {
    id?: boolean
    phone_number?: boolean
    step_index?: boolean
    session_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    status?: boolean
  }

  export type OnboardingSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "phone_number" | "step_index" | "session_id" | "created_at" | "updated_at" | "status", ExtArgs["result"]["onboardingSession"]>

  export type $OnboardingSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingSession"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      phone_number: string
      step_index: number
      session_id: string
      created_at: Date
      updated_at: Date
      status: string
    }, ExtArgs["result"]["onboardingSession"]>
    composites: {}
  }

  type OnboardingSessionGetPayload<S extends boolean | null | undefined | OnboardingSessionDefaultArgs> = $Result.GetResult<Prisma.$OnboardingSessionPayload, S>

  type OnboardingSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingSessionCountAggregateInputType | true
    }

  export interface OnboardingSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingSession'], meta: { name: 'OnboardingSession' } }
    /**
     * Find zero or one OnboardingSession that matches the filter.
     * @param {OnboardingSessionFindUniqueArgs} args - Arguments to find a OnboardingSession
     * @example
     * // Get one OnboardingSession
     * const onboardingSession = await prisma.onboardingSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingSessionFindUniqueArgs>(args: SelectSubset<T, OnboardingSessionFindUniqueArgs<ExtArgs>>): Prisma__OnboardingSessionClient<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingSessionFindUniqueOrThrowArgs} args - Arguments to find a OnboardingSession
     * @example
     * // Get one OnboardingSession
     * const onboardingSession = await prisma.onboardingSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingSessionClient<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingSessionFindFirstArgs} args - Arguments to find a OnboardingSession
     * @example
     * // Get one OnboardingSession
     * const onboardingSession = await prisma.onboardingSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingSessionFindFirstArgs>(args?: SelectSubset<T, OnboardingSessionFindFirstArgs<ExtArgs>>): Prisma__OnboardingSessionClient<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingSessionFindFirstOrThrowArgs} args - Arguments to find a OnboardingSession
     * @example
     * // Get one OnboardingSession
     * const onboardingSession = await prisma.onboardingSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingSessionClient<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingSessions
     * const onboardingSessions = await prisma.onboardingSession.findMany()
     * 
     * // Get first 10 OnboardingSessions
     * const onboardingSessions = await prisma.onboardingSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingSessionWithIdOnly = await prisma.onboardingSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingSessionFindManyArgs>(args?: SelectSubset<T, OnboardingSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingSession.
     * @param {OnboardingSessionCreateArgs} args - Arguments to create a OnboardingSession.
     * @example
     * // Create one OnboardingSession
     * const OnboardingSession = await prisma.onboardingSession.create({
     *   data: {
     *     // ... data to create a OnboardingSession
     *   }
     * })
     * 
     */
    create<T extends OnboardingSessionCreateArgs>(args: SelectSubset<T, OnboardingSessionCreateArgs<ExtArgs>>): Prisma__OnboardingSessionClient<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingSessions.
     * @param {OnboardingSessionCreateManyArgs} args - Arguments to create many OnboardingSessions.
     * @example
     * // Create many OnboardingSessions
     * const onboardingSession = await prisma.onboardingSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingSessionCreateManyArgs>(args?: SelectSubset<T, OnboardingSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingSessions and returns the data saved in the database.
     * @param {OnboardingSessionCreateManyAndReturnArgs} args - Arguments to create many OnboardingSessions.
     * @example
     * // Create many OnboardingSessions
     * const onboardingSession = await prisma.onboardingSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingSessions and only return the `id`
     * const onboardingSessionWithIdOnly = await prisma.onboardingSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingSession.
     * @param {OnboardingSessionDeleteArgs} args - Arguments to delete one OnboardingSession.
     * @example
     * // Delete one OnboardingSession
     * const OnboardingSession = await prisma.onboardingSession.delete({
     *   where: {
     *     // ... filter to delete one OnboardingSession
     *   }
     * })
     * 
     */
    delete<T extends OnboardingSessionDeleteArgs>(args: SelectSubset<T, OnboardingSessionDeleteArgs<ExtArgs>>): Prisma__OnboardingSessionClient<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingSession.
     * @param {OnboardingSessionUpdateArgs} args - Arguments to update one OnboardingSession.
     * @example
     * // Update one OnboardingSession
     * const onboardingSession = await prisma.onboardingSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingSessionUpdateArgs>(args: SelectSubset<T, OnboardingSessionUpdateArgs<ExtArgs>>): Prisma__OnboardingSessionClient<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingSessions.
     * @param {OnboardingSessionDeleteManyArgs} args - Arguments to filter OnboardingSessions to delete.
     * @example
     * // Delete a few OnboardingSessions
     * const { count } = await prisma.onboardingSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingSessionDeleteManyArgs>(args?: SelectSubset<T, OnboardingSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingSessions
     * const onboardingSession = await prisma.onboardingSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingSessionUpdateManyArgs>(args: SelectSubset<T, OnboardingSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingSessions and returns the data updated in the database.
     * @param {OnboardingSessionUpdateManyAndReturnArgs} args - Arguments to update many OnboardingSessions.
     * @example
     * // Update many OnboardingSessions
     * const onboardingSession = await prisma.onboardingSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingSessions and only return the `id`
     * const onboardingSessionWithIdOnly = await prisma.onboardingSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OnboardingSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingSession.
     * @param {OnboardingSessionUpsertArgs} args - Arguments to update or create a OnboardingSession.
     * @example
     * // Update or create a OnboardingSession
     * const onboardingSession = await prisma.onboardingSession.upsert({
     *   create: {
     *     // ... data to create a OnboardingSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingSession we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingSessionUpsertArgs>(args: SelectSubset<T, OnboardingSessionUpsertArgs<ExtArgs>>): Prisma__OnboardingSessionClient<$Result.GetResult<Prisma.$OnboardingSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingSessionCountArgs} args - Arguments to filter OnboardingSessions to count.
     * @example
     * // Count the number of OnboardingSessions
     * const count = await prisma.onboardingSession.count({
     *   where: {
     *     // ... the filter for the OnboardingSessions we want to count
     *   }
     * })
    **/
    count<T extends OnboardingSessionCountArgs>(
      args?: Subset<T, OnboardingSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OnboardingSessionAggregateArgs>(args: Subset<T, OnboardingSessionAggregateArgs>): Prisma.PrismaPromise<GetOnboardingSessionAggregateType<T>>

    /**
     * Group by OnboardingSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OnboardingSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingSessionGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OnboardingSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingSession model
   */
  readonly fields: OnboardingSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OnboardingSession model
   */
  interface OnboardingSessionFieldRefs {
    readonly id: FieldRef<"OnboardingSession", 'Int'>
    readonly phone_number: FieldRef<"OnboardingSession", 'String'>
    readonly step_index: FieldRef<"OnboardingSession", 'Int'>
    readonly session_id: FieldRef<"OnboardingSession", 'String'>
    readonly created_at: FieldRef<"OnboardingSession", 'DateTime'>
    readonly updated_at: FieldRef<"OnboardingSession", 'DateTime'>
    readonly status: FieldRef<"OnboardingSession", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingSession findUnique
   */
  export type OnboardingSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * Filter, which OnboardingSession to fetch.
     */
    where: OnboardingSessionWhereUniqueInput
  }

  /**
   * OnboardingSession findUniqueOrThrow
   */
  export type OnboardingSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * Filter, which OnboardingSession to fetch.
     */
    where: OnboardingSessionWhereUniqueInput
  }

  /**
   * OnboardingSession findFirst
   */
  export type OnboardingSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * Filter, which OnboardingSession to fetch.
     */
    where?: OnboardingSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingSessions to fetch.
     */
    orderBy?: OnboardingSessionOrderByWithRelationInput | OnboardingSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingSessions.
     */
    cursor?: OnboardingSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingSessions.
     */
    distinct?: OnboardingSessionScalarFieldEnum | OnboardingSessionScalarFieldEnum[]
  }

  /**
   * OnboardingSession findFirstOrThrow
   */
  export type OnboardingSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * Filter, which OnboardingSession to fetch.
     */
    where?: OnboardingSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingSessions to fetch.
     */
    orderBy?: OnboardingSessionOrderByWithRelationInput | OnboardingSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingSessions.
     */
    cursor?: OnboardingSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingSessions.
     */
    distinct?: OnboardingSessionScalarFieldEnum | OnboardingSessionScalarFieldEnum[]
  }

  /**
   * OnboardingSession findMany
   */
  export type OnboardingSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * Filter, which OnboardingSessions to fetch.
     */
    where?: OnboardingSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingSessions to fetch.
     */
    orderBy?: OnboardingSessionOrderByWithRelationInput | OnboardingSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingSessions.
     */
    cursor?: OnboardingSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingSessions.
     */
    skip?: number
    distinct?: OnboardingSessionScalarFieldEnum | OnboardingSessionScalarFieldEnum[]
  }

  /**
   * OnboardingSession create
   */
  export type OnboardingSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * The data needed to create a OnboardingSession.
     */
    data: XOR<OnboardingSessionCreateInput, OnboardingSessionUncheckedCreateInput>
  }

  /**
   * OnboardingSession createMany
   */
  export type OnboardingSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingSessions.
     */
    data: OnboardingSessionCreateManyInput | OnboardingSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingSession createManyAndReturn
   */
  export type OnboardingSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingSessions.
     */
    data: OnboardingSessionCreateManyInput | OnboardingSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingSession update
   */
  export type OnboardingSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * The data needed to update a OnboardingSession.
     */
    data: XOR<OnboardingSessionUpdateInput, OnboardingSessionUncheckedUpdateInput>
    /**
     * Choose, which OnboardingSession to update.
     */
    where: OnboardingSessionWhereUniqueInput
  }

  /**
   * OnboardingSession updateMany
   */
  export type OnboardingSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingSessions.
     */
    data: XOR<OnboardingSessionUpdateManyMutationInput, OnboardingSessionUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingSessions to update
     */
    where?: OnboardingSessionWhereInput
    /**
     * Limit how many OnboardingSessions to update.
     */
    limit?: number
  }

  /**
   * OnboardingSession updateManyAndReturn
   */
  export type OnboardingSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingSessions.
     */
    data: XOR<OnboardingSessionUpdateManyMutationInput, OnboardingSessionUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingSessions to update
     */
    where?: OnboardingSessionWhereInput
    /**
     * Limit how many OnboardingSessions to update.
     */
    limit?: number
  }

  /**
   * OnboardingSession upsert
   */
  export type OnboardingSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * The filter to search for the OnboardingSession to update in case it exists.
     */
    where: OnboardingSessionWhereUniqueInput
    /**
     * In case the OnboardingSession found by the `where` argument doesn't exist, create a new OnboardingSession with this data.
     */
    create: XOR<OnboardingSessionCreateInput, OnboardingSessionUncheckedCreateInput>
    /**
     * In case the OnboardingSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingSessionUpdateInput, OnboardingSessionUncheckedUpdateInput>
  }

  /**
   * OnboardingSession delete
   */
  export type OnboardingSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
    /**
     * Filter which OnboardingSession to delete.
     */
    where: OnboardingSessionWhereUniqueInput
  }

  /**
   * OnboardingSession deleteMany
   */
  export type OnboardingSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingSessions to delete
     */
    where?: OnboardingSessionWhereInput
    /**
     * Limit how many OnboardingSessions to delete.
     */
    limit?: number
  }

  /**
   * OnboardingSession without action
   */
  export type OnboardingSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingSession
     */
    select?: OnboardingSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingSession
     */
    omit?: OnboardingSessionOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ShopsScalarFieldEnum: {
    id: 'id',
    shop_name: 'shop_name',
    gst_number: 'gst_number',
    address: 'address',
    pan: 'pan',
    mobile_num: 'mobile_num',
    language: 'language'
  };

  export type ShopsScalarFieldEnum = (typeof ShopsScalarFieldEnum)[keyof typeof ShopsScalarFieldEnum]


  export const Whatsapp_templatesScalarFieldEnum: {
    id: 'id',
    sid: 'sid',
    key: 'key',
    language: 'language',
    variables: 'variables',
    is_active: 'is_active',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Whatsapp_templatesScalarFieldEnum = (typeof Whatsapp_templatesScalarFieldEnum)[keyof typeof Whatsapp_templatesScalarFieldEnum]


  export const Business_userScalarFieldEnum: {
    id: 'id',
    businessName: 'businessName',
    gstin: 'gstin',
    contactEmail: 'contactEmail',
    contactPhone: 'contactPhone',
    address: 'address',
    notificationPreference: 'notificationPreference',
    tallyNetId: 'tallyNetId',
    tallyNetPassword: 'tallyNetPassword'
  };

  export type Business_userScalarFieldEnum = (typeof Business_userScalarFieldEnum)[keyof typeof Business_userScalarFieldEnum]


  export const OnboardingSessionScalarFieldEnum: {
    id: 'id',
    phone_number: 'phone_number',
    step_index: 'step_index',
    session_id: 'session_id',
    created_at: 'created_at',
    updated_at: 'updated_at',
    status: 'status'
  };

  export type OnboardingSessionScalarFieldEnum = (typeof OnboardingSessionScalarFieldEnum)[keyof typeof OnboardingSessionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type shopsWhereInput = {
    AND?: shopsWhereInput | shopsWhereInput[]
    OR?: shopsWhereInput[]
    NOT?: shopsWhereInput | shopsWhereInput[]
    id?: IntFilter<"shops"> | number
    shop_name?: StringFilter<"shops"> | string
    gst_number?: StringFilter<"shops"> | string
    address?: StringFilter<"shops"> | string
    pan?: StringNullableFilter<"shops"> | string | null
    mobile_num?: StringNullableFilter<"shops"> | string | null
    language?: StringNullableFilter<"shops"> | string | null
  }

  export type shopsOrderByWithRelationInput = {
    id?: SortOrder
    shop_name?: SortOrder
    gst_number?: SortOrder
    address?: SortOrder
    pan?: SortOrderInput | SortOrder
    mobile_num?: SortOrderInput | SortOrder
    language?: SortOrderInput | SortOrder
  }

  export type shopsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: shopsWhereInput | shopsWhereInput[]
    OR?: shopsWhereInput[]
    NOT?: shopsWhereInput | shopsWhereInput[]
    shop_name?: StringFilter<"shops"> | string
    gst_number?: StringFilter<"shops"> | string
    address?: StringFilter<"shops"> | string
    pan?: StringNullableFilter<"shops"> | string | null
    mobile_num?: StringNullableFilter<"shops"> | string | null
    language?: StringNullableFilter<"shops"> | string | null
  }, "id">

  export type shopsOrderByWithAggregationInput = {
    id?: SortOrder
    shop_name?: SortOrder
    gst_number?: SortOrder
    address?: SortOrder
    pan?: SortOrderInput | SortOrder
    mobile_num?: SortOrderInput | SortOrder
    language?: SortOrderInput | SortOrder
    _count?: shopsCountOrderByAggregateInput
    _avg?: shopsAvgOrderByAggregateInput
    _max?: shopsMaxOrderByAggregateInput
    _min?: shopsMinOrderByAggregateInput
    _sum?: shopsSumOrderByAggregateInput
  }

  export type shopsScalarWhereWithAggregatesInput = {
    AND?: shopsScalarWhereWithAggregatesInput | shopsScalarWhereWithAggregatesInput[]
    OR?: shopsScalarWhereWithAggregatesInput[]
    NOT?: shopsScalarWhereWithAggregatesInput | shopsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"shops"> | number
    shop_name?: StringWithAggregatesFilter<"shops"> | string
    gst_number?: StringWithAggregatesFilter<"shops"> | string
    address?: StringWithAggregatesFilter<"shops"> | string
    pan?: StringNullableWithAggregatesFilter<"shops"> | string | null
    mobile_num?: StringNullableWithAggregatesFilter<"shops"> | string | null
    language?: StringNullableWithAggregatesFilter<"shops"> | string | null
  }

  export type whatsapp_templatesWhereInput = {
    AND?: whatsapp_templatesWhereInput | whatsapp_templatesWhereInput[]
    OR?: whatsapp_templatesWhereInput[]
    NOT?: whatsapp_templatesWhereInput | whatsapp_templatesWhereInput[]
    id?: IntFilter<"whatsapp_templates"> | number
    sid?: StringFilter<"whatsapp_templates"> | string
    key?: StringFilter<"whatsapp_templates"> | string
    language?: StringFilter<"whatsapp_templates"> | string
    variables?: JsonFilter<"whatsapp_templates">
    is_active?: BoolFilter<"whatsapp_templates"> | boolean
    created_at?: DateTimeFilter<"whatsapp_templates"> | Date | string
    updated_at?: DateTimeFilter<"whatsapp_templates"> | Date | string
  }

  export type whatsapp_templatesOrderByWithRelationInput = {
    id?: SortOrder
    sid?: SortOrder
    key?: SortOrder
    language?: SortOrder
    variables?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type whatsapp_templatesWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: whatsapp_templatesWhereInput | whatsapp_templatesWhereInput[]
    OR?: whatsapp_templatesWhereInput[]
    NOT?: whatsapp_templatesWhereInput | whatsapp_templatesWhereInput[]
    sid?: StringFilter<"whatsapp_templates"> | string
    key?: StringFilter<"whatsapp_templates"> | string
    language?: StringFilter<"whatsapp_templates"> | string
    variables?: JsonFilter<"whatsapp_templates">
    is_active?: BoolFilter<"whatsapp_templates"> | boolean
    created_at?: DateTimeFilter<"whatsapp_templates"> | Date | string
    updated_at?: DateTimeFilter<"whatsapp_templates"> | Date | string
  }, "id">

  export type whatsapp_templatesOrderByWithAggregationInput = {
    id?: SortOrder
    sid?: SortOrder
    key?: SortOrder
    language?: SortOrder
    variables?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: whatsapp_templatesCountOrderByAggregateInput
    _avg?: whatsapp_templatesAvgOrderByAggregateInput
    _max?: whatsapp_templatesMaxOrderByAggregateInput
    _min?: whatsapp_templatesMinOrderByAggregateInput
    _sum?: whatsapp_templatesSumOrderByAggregateInput
  }

  export type whatsapp_templatesScalarWhereWithAggregatesInput = {
    AND?: whatsapp_templatesScalarWhereWithAggregatesInput | whatsapp_templatesScalarWhereWithAggregatesInput[]
    OR?: whatsapp_templatesScalarWhereWithAggregatesInput[]
    NOT?: whatsapp_templatesScalarWhereWithAggregatesInput | whatsapp_templatesScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"whatsapp_templates"> | number
    sid?: StringWithAggregatesFilter<"whatsapp_templates"> | string
    key?: StringWithAggregatesFilter<"whatsapp_templates"> | string
    language?: StringWithAggregatesFilter<"whatsapp_templates"> | string
    variables?: JsonWithAggregatesFilter<"whatsapp_templates">
    is_active?: BoolWithAggregatesFilter<"whatsapp_templates"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"whatsapp_templates"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"whatsapp_templates"> | Date | string
  }

  export type business_userWhereInput = {
    AND?: business_userWhereInput | business_userWhereInput[]
    OR?: business_userWhereInput[]
    NOT?: business_userWhereInput | business_userWhereInput[]
    id?: IntFilter<"business_user"> | number
    businessName?: StringFilter<"business_user"> | string
    gstin?: StringFilter<"business_user"> | string
    contactEmail?: StringFilter<"business_user"> | string
    contactPhone?: StringFilter<"business_user"> | string
    address?: StringFilter<"business_user"> | string
    notificationPreference?: StringFilter<"business_user"> | string
    tallyNetId?: StringFilter<"business_user"> | string
    tallyNetPassword?: StringFilter<"business_user"> | string
  }

  export type business_userOrderByWithRelationInput = {
    id?: SortOrder
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    tallyNetId?: SortOrder
    tallyNetPassword?: SortOrder
  }

  export type business_userWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: business_userWhereInput | business_userWhereInput[]
    OR?: business_userWhereInput[]
    NOT?: business_userWhereInput | business_userWhereInput[]
    businessName?: StringFilter<"business_user"> | string
    gstin?: StringFilter<"business_user"> | string
    contactEmail?: StringFilter<"business_user"> | string
    contactPhone?: StringFilter<"business_user"> | string
    address?: StringFilter<"business_user"> | string
    notificationPreference?: StringFilter<"business_user"> | string
    tallyNetId?: StringFilter<"business_user"> | string
    tallyNetPassword?: StringFilter<"business_user"> | string
  }, "id">

  export type business_userOrderByWithAggregationInput = {
    id?: SortOrder
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    tallyNetId?: SortOrder
    tallyNetPassword?: SortOrder
    _count?: business_userCountOrderByAggregateInput
    _avg?: business_userAvgOrderByAggregateInput
    _max?: business_userMaxOrderByAggregateInput
    _min?: business_userMinOrderByAggregateInput
    _sum?: business_userSumOrderByAggregateInput
  }

  export type business_userScalarWhereWithAggregatesInput = {
    AND?: business_userScalarWhereWithAggregatesInput | business_userScalarWhereWithAggregatesInput[]
    OR?: business_userScalarWhereWithAggregatesInput[]
    NOT?: business_userScalarWhereWithAggregatesInput | business_userScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"business_user"> | number
    businessName?: StringWithAggregatesFilter<"business_user"> | string
    gstin?: StringWithAggregatesFilter<"business_user"> | string
    contactEmail?: StringWithAggregatesFilter<"business_user"> | string
    contactPhone?: StringWithAggregatesFilter<"business_user"> | string
    address?: StringWithAggregatesFilter<"business_user"> | string
    notificationPreference?: StringWithAggregatesFilter<"business_user"> | string
    tallyNetId?: StringWithAggregatesFilter<"business_user"> | string
    tallyNetPassword?: StringWithAggregatesFilter<"business_user"> | string
  }

  export type OnboardingSessionWhereInput = {
    AND?: OnboardingSessionWhereInput | OnboardingSessionWhereInput[]
    OR?: OnboardingSessionWhereInput[]
    NOT?: OnboardingSessionWhereInput | OnboardingSessionWhereInput[]
    id?: IntFilter<"OnboardingSession"> | number
    phone_number?: StringFilter<"OnboardingSession"> | string
    step_index?: IntFilter<"OnboardingSession"> | number
    session_id?: StringFilter<"OnboardingSession"> | string
    created_at?: DateTimeFilter<"OnboardingSession"> | Date | string
    updated_at?: DateTimeFilter<"OnboardingSession"> | Date | string
    status?: StringFilter<"OnboardingSession"> | string
  }

  export type OnboardingSessionOrderByWithRelationInput = {
    id?: SortOrder
    phone_number?: SortOrder
    step_index?: SortOrder
    session_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    status?: SortOrder
  }

  export type OnboardingSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    session_id?: string
    AND?: OnboardingSessionWhereInput | OnboardingSessionWhereInput[]
    OR?: OnboardingSessionWhereInput[]
    NOT?: OnboardingSessionWhereInput | OnboardingSessionWhereInput[]
    phone_number?: StringFilter<"OnboardingSession"> | string
    step_index?: IntFilter<"OnboardingSession"> | number
    created_at?: DateTimeFilter<"OnboardingSession"> | Date | string
    updated_at?: DateTimeFilter<"OnboardingSession"> | Date | string
    status?: StringFilter<"OnboardingSession"> | string
  }, "id" | "session_id">

  export type OnboardingSessionOrderByWithAggregationInput = {
    id?: SortOrder
    phone_number?: SortOrder
    step_index?: SortOrder
    session_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    status?: SortOrder
    _count?: OnboardingSessionCountOrderByAggregateInput
    _avg?: OnboardingSessionAvgOrderByAggregateInput
    _max?: OnboardingSessionMaxOrderByAggregateInput
    _min?: OnboardingSessionMinOrderByAggregateInput
    _sum?: OnboardingSessionSumOrderByAggregateInput
  }

  export type OnboardingSessionScalarWhereWithAggregatesInput = {
    AND?: OnboardingSessionScalarWhereWithAggregatesInput | OnboardingSessionScalarWhereWithAggregatesInput[]
    OR?: OnboardingSessionScalarWhereWithAggregatesInput[]
    NOT?: OnboardingSessionScalarWhereWithAggregatesInput | OnboardingSessionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OnboardingSession"> | number
    phone_number?: StringWithAggregatesFilter<"OnboardingSession"> | string
    step_index?: IntWithAggregatesFilter<"OnboardingSession"> | number
    session_id?: StringWithAggregatesFilter<"OnboardingSession"> | string
    created_at?: DateTimeWithAggregatesFilter<"OnboardingSession"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"OnboardingSession"> | Date | string
    status?: StringWithAggregatesFilter<"OnboardingSession"> | string
  }

  export type shopsCreateInput = {
    shop_name: string
    gst_number: string
    address: string
    pan?: string | null
    mobile_num?: string | null
    language?: string | null
  }

  export type shopsUncheckedCreateInput = {
    id?: number
    shop_name: string
    gst_number: string
    address: string
    pan?: string | null
    mobile_num?: string | null
    language?: string | null
  }

  export type shopsUpdateInput = {
    shop_name?: StringFieldUpdateOperationsInput | string
    gst_number?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    mobile_num?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type shopsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    shop_name?: StringFieldUpdateOperationsInput | string
    gst_number?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    mobile_num?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type shopsCreateManyInput = {
    id?: number
    shop_name: string
    gst_number: string
    address: string
    pan?: string | null
    mobile_num?: string | null
    language?: string | null
  }

  export type shopsUpdateManyMutationInput = {
    shop_name?: StringFieldUpdateOperationsInput | string
    gst_number?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    mobile_num?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type shopsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    shop_name?: StringFieldUpdateOperationsInput | string
    gst_number?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    mobile_num?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type whatsapp_templatesCreateInput = {
    sid: string
    key: string
    language: string
    variables: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type whatsapp_templatesUncheckedCreateInput = {
    id?: number
    sid: string
    key: string
    language: string
    variables: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type whatsapp_templatesUpdateInput = {
    sid?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    variables?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type whatsapp_templatesUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    sid?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    variables?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type whatsapp_templatesCreateManyInput = {
    id?: number
    sid: string
    key: string
    language: string
    variables: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type whatsapp_templatesUpdateManyMutationInput = {
    sid?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    variables?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type whatsapp_templatesUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    sid?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    variables?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type business_userCreateInput = {
    businessName: string
    gstin: string
    contactEmail: string
    contactPhone: string
    address: string
    notificationPreference: string
    tallyNetId: string
    tallyNetPassword: string
  }

  export type business_userUncheckedCreateInput = {
    id?: number
    businessName: string
    gstin: string
    contactEmail: string
    contactPhone: string
    address: string
    notificationPreference: string
    tallyNetId: string
    tallyNetPassword: string
  }

  export type business_userUpdateInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    gstin?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    notificationPreference?: StringFieldUpdateOperationsInput | string
    tallyNetId?: StringFieldUpdateOperationsInput | string
    tallyNetPassword?: StringFieldUpdateOperationsInput | string
  }

  export type business_userUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    businessName?: StringFieldUpdateOperationsInput | string
    gstin?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    notificationPreference?: StringFieldUpdateOperationsInput | string
    tallyNetId?: StringFieldUpdateOperationsInput | string
    tallyNetPassword?: StringFieldUpdateOperationsInput | string
  }

  export type business_userCreateManyInput = {
    id?: number
    businessName: string
    gstin: string
    contactEmail: string
    contactPhone: string
    address: string
    notificationPreference: string
    tallyNetId: string
    tallyNetPassword: string
  }

  export type business_userUpdateManyMutationInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    gstin?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    notificationPreference?: StringFieldUpdateOperationsInput | string
    tallyNetId?: StringFieldUpdateOperationsInput | string
    tallyNetPassword?: StringFieldUpdateOperationsInput | string
  }

  export type business_userUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    businessName?: StringFieldUpdateOperationsInput | string
    gstin?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    notificationPreference?: StringFieldUpdateOperationsInput | string
    tallyNetId?: StringFieldUpdateOperationsInput | string
    tallyNetPassword?: StringFieldUpdateOperationsInput | string
  }

  export type OnboardingSessionCreateInput = {
    phone_number: string
    step_index: number
    session_id: string
    created_at?: Date | string
    updated_at?: Date | string
    status: string
  }

  export type OnboardingSessionUncheckedCreateInput = {
    id?: number
    phone_number: string
    step_index: number
    session_id: string
    created_at?: Date | string
    updated_at?: Date | string
    status: string
  }

  export type OnboardingSessionUpdateInput = {
    phone_number?: StringFieldUpdateOperationsInput | string
    step_index?: IntFieldUpdateOperationsInput | number
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
  }

  export type OnboardingSessionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    phone_number?: StringFieldUpdateOperationsInput | string
    step_index?: IntFieldUpdateOperationsInput | number
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
  }

  export type OnboardingSessionCreateManyInput = {
    id?: number
    phone_number: string
    step_index: number
    session_id: string
    created_at?: Date | string
    updated_at?: Date | string
    status: string
  }

  export type OnboardingSessionUpdateManyMutationInput = {
    phone_number?: StringFieldUpdateOperationsInput | string
    step_index?: IntFieldUpdateOperationsInput | number
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
  }

  export type OnboardingSessionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    phone_number?: StringFieldUpdateOperationsInput | string
    step_index?: IntFieldUpdateOperationsInput | number
    session_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type shopsCountOrderByAggregateInput = {
    id?: SortOrder
    shop_name?: SortOrder
    gst_number?: SortOrder
    address?: SortOrder
    pan?: SortOrder
    mobile_num?: SortOrder
    language?: SortOrder
  }

  export type shopsAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type shopsMaxOrderByAggregateInput = {
    id?: SortOrder
    shop_name?: SortOrder
    gst_number?: SortOrder
    address?: SortOrder
    pan?: SortOrder
    mobile_num?: SortOrder
    language?: SortOrder
  }

  export type shopsMinOrderByAggregateInput = {
    id?: SortOrder
    shop_name?: SortOrder
    gst_number?: SortOrder
    address?: SortOrder
    pan?: SortOrder
    mobile_num?: SortOrder
    language?: SortOrder
  }

  export type shopsSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type whatsapp_templatesCountOrderByAggregateInput = {
    id?: SortOrder
    sid?: SortOrder
    key?: SortOrder
    language?: SortOrder
    variables?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type whatsapp_templatesAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type whatsapp_templatesMaxOrderByAggregateInput = {
    id?: SortOrder
    sid?: SortOrder
    key?: SortOrder
    language?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type whatsapp_templatesMinOrderByAggregateInput = {
    id?: SortOrder
    sid?: SortOrder
    key?: SortOrder
    language?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type whatsapp_templatesSumOrderByAggregateInput = {
    id?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type business_userCountOrderByAggregateInput = {
    id?: SortOrder
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    tallyNetId?: SortOrder
    tallyNetPassword?: SortOrder
  }

  export type business_userAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type business_userMaxOrderByAggregateInput = {
    id?: SortOrder
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    tallyNetId?: SortOrder
    tallyNetPassword?: SortOrder
  }

  export type business_userMinOrderByAggregateInput = {
    id?: SortOrder
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    tallyNetId?: SortOrder
    tallyNetPassword?: SortOrder
  }

  export type business_userSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type OnboardingSessionCountOrderByAggregateInput = {
    id?: SortOrder
    phone_number?: SortOrder
    step_index?: SortOrder
    session_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    status?: SortOrder
  }

  export type OnboardingSessionAvgOrderByAggregateInput = {
    id?: SortOrder
    step_index?: SortOrder
  }

  export type OnboardingSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    phone_number?: SortOrder
    step_index?: SortOrder
    session_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    status?: SortOrder
  }

  export type OnboardingSessionMinOrderByAggregateInput = {
    id?: SortOrder
    phone_number?: SortOrder
    step_index?: SortOrder
    session_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    status?: SortOrder
  }

  export type OnboardingSessionSumOrderByAggregateInput = {
    id?: SortOrder
    step_index?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}