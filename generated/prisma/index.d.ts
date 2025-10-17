
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
 * Model businesses
 * This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
 */
export type businesses = $Result.DefaultSelection<Prisma.$businessesPayload>
/**
 * Model social_accounts
 * This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
 */
export type social_accounts = $Result.DefaultSelection<Prisma.$social_accountsPayload>
/**
 * Model subscription_plans
 * 
 */
export type subscription_plans = $Result.DefaultSelection<Prisma.$subscription_plansPayload>
/**
 * Model tenants
 * 
 */
export type tenants = $Result.DefaultSelection<Prisma.$tenantsPayload>
/**
 * Model roles
 * 
 */
export type roles = $Result.DefaultSelection<Prisma.$rolesPayload>
/**
 * Model role_intents
 * 
 */
export type role_intents = $Result.DefaultSelection<Prisma.$role_intentsPayload>
/**
 * Model intents
 * 
 */
export type intents = $Result.DefaultSelection<Prisma.$intentsPayload>
/**
 * Model notifications
 * 
 */
export type notifications = $Result.DefaultSelection<Prisma.$notificationsPayload>
/**
 * Model users
 * 
 */
export type users = $Result.DefaultSelection<Prisma.$usersPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Businesses
 * const businesses = await prisma.businesses.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
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
   * // Fetch zero or more Businesses
   * const businesses = await prisma.businesses.findMany()
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
   * `prisma.businesses`: Exposes CRUD operations for the **businesses** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Businesses
    * const businesses = await prisma.businesses.findMany()
    * ```
    */
  get businesses(): Prisma.businessesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.social_accounts`: Exposes CRUD operations for the **social_accounts** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Social_accounts
    * const social_accounts = await prisma.social_accounts.findMany()
    * ```
    */
  get social_accounts(): Prisma.social_accountsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.subscription_plans`: Exposes CRUD operations for the **subscription_plans** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Subscription_plans
    * const subscription_plans = await prisma.subscription_plans.findMany()
    * ```
    */
  get subscription_plans(): Prisma.subscription_plansDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenants`: Exposes CRUD operations for the **tenants** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenants.findMany()
    * ```
    */
  get tenants(): Prisma.tenantsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.roles`: Exposes CRUD operations for the **roles** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Roles
    * const roles = await prisma.roles.findMany()
    * ```
    */
  get roles(): Prisma.rolesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.role_intents`: Exposes CRUD operations for the **role_intents** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Role_intents
    * const role_intents = await prisma.role_intents.findMany()
    * ```
    */
  get role_intents(): Prisma.role_intentsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.intents`: Exposes CRUD operations for the **intents** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Intents
    * const intents = await prisma.intents.findMany()
    * ```
    */
  get intents(): Prisma.intentsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notifications`: Exposes CRUD operations for the **notifications** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notifications.findMany()
    * ```
    */
  get notifications(): Prisma.notificationsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.users`: Exposes CRUD operations for the **users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.users.findMany()
    * ```
    */
  get users(): Prisma.usersDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.15.0
   * Query Engine version: 85179d7826409ee107a6ba334b5e305ae3fba9fb
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
    businesses: 'businesses',
    social_accounts: 'social_accounts',
    subscription_plans: 'subscription_plans',
    tenants: 'tenants',
    roles: 'roles',
    role_intents: 'role_intents',
    intents: 'intents',
    notifications: 'notifications',
    users: 'users'
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
      modelProps: "businesses" | "social_accounts" | "subscription_plans" | "tenants" | "roles" | "role_intents" | "intents" | "notifications" | "users"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      businesses: {
        payload: Prisma.$businessesPayload<ExtArgs>
        fields: Prisma.businessesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.businessesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.businessesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>
          }
          findFirst: {
            args: Prisma.businessesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.businessesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>
          }
          findMany: {
            args: Prisma.businessesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>[]
          }
          create: {
            args: Prisma.businessesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>
          }
          createMany: {
            args: Prisma.businessesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.businessesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>[]
          }
          delete: {
            args: Prisma.businessesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>
          }
          update: {
            args: Prisma.businessesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>
          }
          deleteMany: {
            args: Prisma.businessesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.businessesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.businessesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>[]
          }
          upsert: {
            args: Prisma.businessesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$businessesPayload>
          }
          aggregate: {
            args: Prisma.BusinessesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBusinesses>
          }
          groupBy: {
            args: Prisma.businessesGroupByArgs<ExtArgs>
            result: $Utils.Optional<BusinessesGroupByOutputType>[]
          }
          count: {
            args: Prisma.businessesCountArgs<ExtArgs>
            result: $Utils.Optional<BusinessesCountAggregateOutputType> | number
          }
        }
      }
      social_accounts: {
        payload: Prisma.$social_accountsPayload<ExtArgs>
        fields: Prisma.social_accountsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.social_accountsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.social_accountsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>
          }
          findFirst: {
            args: Prisma.social_accountsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.social_accountsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>
          }
          findMany: {
            args: Prisma.social_accountsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>[]
          }
          create: {
            args: Prisma.social_accountsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>
          }
          createMany: {
            args: Prisma.social_accountsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.social_accountsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>[]
          }
          delete: {
            args: Prisma.social_accountsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>
          }
          update: {
            args: Prisma.social_accountsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>
          }
          deleteMany: {
            args: Prisma.social_accountsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.social_accountsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.social_accountsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>[]
          }
          upsert: {
            args: Prisma.social_accountsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$social_accountsPayload>
          }
          aggregate: {
            args: Prisma.Social_accountsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSocial_accounts>
          }
          groupBy: {
            args: Prisma.social_accountsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Social_accountsGroupByOutputType>[]
          }
          count: {
            args: Prisma.social_accountsCountArgs<ExtArgs>
            result: $Utils.Optional<Social_accountsCountAggregateOutputType> | number
          }
        }
      }
      subscription_plans: {
        payload: Prisma.$subscription_plansPayload<ExtArgs>
        fields: Prisma.subscription_plansFieldRefs
        operations: {
          findUnique: {
            args: Prisma.subscription_plansFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.subscription_plansFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>
          }
          findFirst: {
            args: Prisma.subscription_plansFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.subscription_plansFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>
          }
          findMany: {
            args: Prisma.subscription_plansFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>[]
          }
          create: {
            args: Prisma.subscription_plansCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>
          }
          createMany: {
            args: Prisma.subscription_plansCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.subscription_plansCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>[]
          }
          delete: {
            args: Prisma.subscription_plansDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>
          }
          update: {
            args: Prisma.subscription_plansUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>
          }
          deleteMany: {
            args: Prisma.subscription_plansDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.subscription_plansUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.subscription_plansUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>[]
          }
          upsert: {
            args: Prisma.subscription_plansUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subscription_plansPayload>
          }
          aggregate: {
            args: Prisma.Subscription_plansAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubscription_plans>
          }
          groupBy: {
            args: Prisma.subscription_plansGroupByArgs<ExtArgs>
            result: $Utils.Optional<Subscription_plansGroupByOutputType>[]
          }
          count: {
            args: Prisma.subscription_plansCountArgs<ExtArgs>
            result: $Utils.Optional<Subscription_plansCountAggregateOutputType> | number
          }
        }
      }
      tenants: {
        payload: Prisma.$tenantsPayload<ExtArgs>
        fields: Prisma.tenantsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tenantsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tenantsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>
          }
          findFirst: {
            args: Prisma.tenantsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tenantsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>
          }
          findMany: {
            args: Prisma.tenantsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>[]
          }
          create: {
            args: Prisma.tenantsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>
          }
          createMany: {
            args: Prisma.tenantsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.tenantsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>[]
          }
          delete: {
            args: Prisma.tenantsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>
          }
          update: {
            args: Prisma.tenantsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>
          }
          deleteMany: {
            args: Prisma.tenantsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tenantsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.tenantsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>[]
          }
          upsert: {
            args: Prisma.tenantsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tenantsPayload>
          }
          aggregate: {
            args: Prisma.TenantsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenants>
          }
          groupBy: {
            args: Prisma.tenantsGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantsGroupByOutputType>[]
          }
          count: {
            args: Prisma.tenantsCountArgs<ExtArgs>
            result: $Utils.Optional<TenantsCountAggregateOutputType> | number
          }
        }
      }
      roles: {
        payload: Prisma.$rolesPayload<ExtArgs>
        fields: Prisma.rolesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.rolesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.rolesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>
          }
          findFirst: {
            args: Prisma.rolesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.rolesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>
          }
          findMany: {
            args: Prisma.rolesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>[]
          }
          create: {
            args: Prisma.rolesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>
          }
          createMany: {
            args: Prisma.rolesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.rolesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>[]
          }
          delete: {
            args: Prisma.rolesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>
          }
          update: {
            args: Prisma.rolesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>
          }
          deleteMany: {
            args: Prisma.rolesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.rolesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.rolesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>[]
          }
          upsert: {
            args: Prisma.rolesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$rolesPayload>
          }
          aggregate: {
            args: Prisma.RolesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoles>
          }
          groupBy: {
            args: Prisma.rolesGroupByArgs<ExtArgs>
            result: $Utils.Optional<RolesGroupByOutputType>[]
          }
          count: {
            args: Prisma.rolesCountArgs<ExtArgs>
            result: $Utils.Optional<RolesCountAggregateOutputType> | number
          }
        }
      }
      role_intents: {
        payload: Prisma.$role_intentsPayload<ExtArgs>
        fields: Prisma.role_intentsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.role_intentsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.role_intentsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>
          }
          findFirst: {
            args: Prisma.role_intentsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.role_intentsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>
          }
          findMany: {
            args: Prisma.role_intentsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>[]
          }
          create: {
            args: Prisma.role_intentsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>
          }
          createMany: {
            args: Prisma.role_intentsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.role_intentsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>[]
          }
          delete: {
            args: Prisma.role_intentsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>
          }
          update: {
            args: Prisma.role_intentsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>
          }
          deleteMany: {
            args: Prisma.role_intentsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.role_intentsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.role_intentsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>[]
          }
          upsert: {
            args: Prisma.role_intentsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$role_intentsPayload>
          }
          aggregate: {
            args: Prisma.Role_intentsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRole_intents>
          }
          groupBy: {
            args: Prisma.role_intentsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Role_intentsGroupByOutputType>[]
          }
          count: {
            args: Prisma.role_intentsCountArgs<ExtArgs>
            result: $Utils.Optional<Role_intentsCountAggregateOutputType> | number
          }
        }
      }
      intents: {
        payload: Prisma.$intentsPayload<ExtArgs>
        fields: Prisma.intentsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.intentsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.intentsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>
          }
          findFirst: {
            args: Prisma.intentsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.intentsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>
          }
          findMany: {
            args: Prisma.intentsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>[]
          }
          create: {
            args: Prisma.intentsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>
          }
          createMany: {
            args: Prisma.intentsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.intentsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>[]
          }
          delete: {
            args: Prisma.intentsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>
          }
          update: {
            args: Prisma.intentsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>
          }
          deleteMany: {
            args: Prisma.intentsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.intentsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.intentsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>[]
          }
          upsert: {
            args: Prisma.intentsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$intentsPayload>
          }
          aggregate: {
            args: Prisma.IntentsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntents>
          }
          groupBy: {
            args: Prisma.intentsGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntentsGroupByOutputType>[]
          }
          count: {
            args: Prisma.intentsCountArgs<ExtArgs>
            result: $Utils.Optional<IntentsCountAggregateOutputType> | number
          }
        }
      }
      notifications: {
        payload: Prisma.$notificationsPayload<ExtArgs>
        fields: Prisma.notificationsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.notificationsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.notificationsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>
          }
          findFirst: {
            args: Prisma.notificationsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.notificationsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>
          }
          findMany: {
            args: Prisma.notificationsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>[]
          }
          create: {
            args: Prisma.notificationsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>
          }
          createMany: {
            args: Prisma.notificationsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.notificationsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>[]
          }
          delete: {
            args: Prisma.notificationsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>
          }
          update: {
            args: Prisma.notificationsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>
          }
          deleteMany: {
            args: Prisma.notificationsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.notificationsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.notificationsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>[]
          }
          upsert: {
            args: Prisma.notificationsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$notificationsPayload>
          }
          aggregate: {
            args: Prisma.NotificationsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotifications>
          }
          groupBy: {
            args: Prisma.notificationsGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationsGroupByOutputType>[]
          }
          count: {
            args: Prisma.notificationsCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationsCountAggregateOutputType> | number
          }
        }
      }
      users: {
        payload: Prisma.$usersPayload<ExtArgs>
        fields: Prisma.usersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.usersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.usersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findFirst: {
            args: Prisma.usersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.usersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findMany: {
            args: Prisma.usersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          create: {
            args: Prisma.usersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          createMany: {
            args: Prisma.usersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.usersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          delete: {
            args: Prisma.usersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          update: {
            args: Prisma.usersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          deleteMany: {
            args: Prisma.usersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.usersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.usersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          upsert: {
            args: Prisma.usersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          aggregate: {
            args: Prisma.UsersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsers>
          }
          groupBy: {
            args: Prisma.usersGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsersGroupByOutputType>[]
          }
          count: {
            args: Prisma.usersCountArgs<ExtArgs>
            result: $Utils.Optional<UsersCountAggregateOutputType> | number
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
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
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
    businesses?: businessesOmit
    social_accounts?: social_accountsOmit
    subscription_plans?: subscription_plansOmit
    tenants?: tenantsOmit
    roles?: rolesOmit
    role_intents?: role_intentsOmit
    intents?: intentsOmit
    notifications?: notificationsOmit
    users?: usersOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
   * Count Type BusinessesCountOutputType
   */

  export type BusinessesCountOutputType = {
    social_accounts: number
    users: number
  }

  export type BusinessesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    social_accounts?: boolean | BusinessesCountOutputTypeCountSocial_accountsArgs
    users?: boolean | BusinessesCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * BusinessesCountOutputType without action
   */
  export type BusinessesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessesCountOutputType
     */
    select?: BusinessesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BusinessesCountOutputType without action
   */
  export type BusinessesCountOutputTypeCountSocial_accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: social_accountsWhereInput
  }

  /**
   * BusinessesCountOutputType without action
   */
  export type BusinessesCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usersWhereInput
  }


  /**
   * Count Type Subscription_plansCountOutputType
   */

  export type Subscription_plansCountOutputType = {
    businesses: number
  }

  export type Subscription_plansCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | Subscription_plansCountOutputTypeCountBusinessesArgs
  }

  // Custom InputTypes
  /**
   * Subscription_plansCountOutputType without action
   */
  export type Subscription_plansCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription_plansCountOutputType
     */
    select?: Subscription_plansCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Subscription_plansCountOutputType without action
   */
  export type Subscription_plansCountOutputTypeCountBusinessesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: businessesWhereInput
  }


  /**
   * Count Type TenantsCountOutputType
   */

  export type TenantsCountOutputType = {
    businesses: number
  }

  export type TenantsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | TenantsCountOutputTypeCountBusinessesArgs
  }

  // Custom InputTypes
  /**
   * TenantsCountOutputType without action
   */
  export type TenantsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantsCountOutputType
     */
    select?: TenantsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantsCountOutputType without action
   */
  export type TenantsCountOutputTypeCountBusinessesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: businessesWhereInput
  }


  /**
   * Count Type RolesCountOutputType
   */

  export type RolesCountOutputType = {
    users: number
  }

  export type RolesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | RolesCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * RolesCountOutputType without action
   */
  export type RolesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolesCountOutputType
     */
    select?: RolesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RolesCountOutputType without action
   */
  export type RolesCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usersWhereInput
  }


  /**
   * Count Type IntentsCountOutputType
   */

  export type IntentsCountOutputType = {
    role_intents: number
    notifications: number
  }

  export type IntentsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    role_intents?: boolean | IntentsCountOutputTypeCountRole_intentsArgs
    notifications?: boolean | IntentsCountOutputTypeCountNotificationsArgs
  }

  // Custom InputTypes
  /**
   * IntentsCountOutputType without action
   */
  export type IntentsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IntentsCountOutputType
     */
    select?: IntentsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * IntentsCountOutputType without action
   */
  export type IntentsCountOutputTypeCountRole_intentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: role_intentsWhereInput
  }

  /**
   * IntentsCountOutputType without action
   */
  export type IntentsCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: notificationsWhereInput
  }


  /**
   * Count Type UsersCountOutputType
   */

  export type UsersCountOutputType = {
    notifications: number
  }

  export type UsersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    notifications?: boolean | UsersCountOutputTypeCountNotificationsArgs
  }

  // Custom InputTypes
  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsersCountOutputType
     */
    select?: UsersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: notificationsWhereInput
  }


  /**
   * Models
   */

  /**
   * Model businesses
   */

  export type AggregateBusinesses = {
    _count: BusinessesCountAggregateOutputType | null
    _min: BusinessesMinAggregateOutputType | null
    _max: BusinessesMaxAggregateOutputType | null
  }

  export type BusinessesMinAggregateOutputType = {
    business_id: string | null
    tenant_id: string | null
    business_name: string | null
    business_type: string | null
    subscription_plan_id: string | null
    whatsapp_number: string | null
    logo_url: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type BusinessesMaxAggregateOutputType = {
    business_id: string | null
    tenant_id: string | null
    business_name: string | null
    business_type: string | null
    subscription_plan_id: string | null
    whatsapp_number: string | null
    logo_url: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type BusinessesCountAggregateOutputType = {
    business_id: number
    tenant_id: number
    business_name: number
    business_type: number
    subscription_plan_id: number
    whatsapp_number: number
    brand_colors: number
    logo_url: number
    working_hours: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type BusinessesMinAggregateInputType = {
    business_id?: true
    tenant_id?: true
    business_name?: true
    business_type?: true
    subscription_plan_id?: true
    whatsapp_number?: true
    logo_url?: true
    created_at?: true
    updated_at?: true
  }

  export type BusinessesMaxAggregateInputType = {
    business_id?: true
    tenant_id?: true
    business_name?: true
    business_type?: true
    subscription_plan_id?: true
    whatsapp_number?: true
    logo_url?: true
    created_at?: true
    updated_at?: true
  }

  export type BusinessesCountAggregateInputType = {
    business_id?: true
    tenant_id?: true
    business_name?: true
    business_type?: true
    subscription_plan_id?: true
    whatsapp_number?: true
    brand_colors?: true
    logo_url?: true
    working_hours?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type BusinessesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which businesses to aggregate.
     */
    where?: businessesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of businesses to fetch.
     */
    orderBy?: businessesOrderByWithRelationInput | businessesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: businessesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` businesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` businesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned businesses
    **/
    _count?: true | BusinessesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BusinessesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BusinessesMaxAggregateInputType
  }

  export type GetBusinessesAggregateType<T extends BusinessesAggregateArgs> = {
        [P in keyof T & keyof AggregateBusinesses]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBusinesses[P]>
      : GetScalarType<T[P], AggregateBusinesses[P]>
  }




  export type businessesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: businessesWhereInput
    orderBy?: businessesOrderByWithAggregationInput | businessesOrderByWithAggregationInput[]
    by: BusinessesScalarFieldEnum[] | BusinessesScalarFieldEnum
    having?: businessesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BusinessesCountAggregateInputType | true
    _min?: BusinessesMinAggregateInputType
    _max?: BusinessesMaxAggregateInputType
  }

  export type BusinessesGroupByOutputType = {
    business_id: string
    tenant_id: string
    business_name: string
    business_type: string | null
    subscription_plan_id: string | null
    whatsapp_number: string | null
    brand_colors: JsonValue | null
    logo_url: string | null
    working_hours: JsonValue | null
    created_at: Date | null
    updated_at: Date | null
    _count: BusinessesCountAggregateOutputType | null
    _min: BusinessesMinAggregateOutputType | null
    _max: BusinessesMaxAggregateOutputType | null
  }

  type GetBusinessesGroupByPayload<T extends businessesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BusinessesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BusinessesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BusinessesGroupByOutputType[P]>
            : GetScalarType<T[P], BusinessesGroupByOutputType[P]>
        }
      >
    >


  export type businessesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    business_id?: boolean
    tenant_id?: boolean
    business_name?: boolean
    business_type?: boolean
    subscription_plan_id?: boolean
    whatsapp_number?: boolean
    brand_colors?: boolean
    logo_url?: boolean
    working_hours?: boolean
    created_at?: boolean
    updated_at?: boolean
    subscription_plans?: boolean | businesses$subscription_plansArgs<ExtArgs>
    tenants?: boolean | tenantsDefaultArgs<ExtArgs>
    social_accounts?: boolean | businesses$social_accountsArgs<ExtArgs>
    users?: boolean | businesses$usersArgs<ExtArgs>
    _count?: boolean | BusinessesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["businesses"]>

  export type businessesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    business_id?: boolean
    tenant_id?: boolean
    business_name?: boolean
    business_type?: boolean
    subscription_plan_id?: boolean
    whatsapp_number?: boolean
    brand_colors?: boolean
    logo_url?: boolean
    working_hours?: boolean
    created_at?: boolean
    updated_at?: boolean
    subscription_plans?: boolean | businesses$subscription_plansArgs<ExtArgs>
    tenants?: boolean | tenantsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["businesses"]>

  export type businessesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    business_id?: boolean
    tenant_id?: boolean
    business_name?: boolean
    business_type?: boolean
    subscription_plan_id?: boolean
    whatsapp_number?: boolean
    brand_colors?: boolean
    logo_url?: boolean
    working_hours?: boolean
    created_at?: boolean
    updated_at?: boolean
    subscription_plans?: boolean | businesses$subscription_plansArgs<ExtArgs>
    tenants?: boolean | tenantsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["businesses"]>

  export type businessesSelectScalar = {
    business_id?: boolean
    tenant_id?: boolean
    business_name?: boolean
    business_type?: boolean
    subscription_plan_id?: boolean
    whatsapp_number?: boolean
    brand_colors?: boolean
    logo_url?: boolean
    working_hours?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type businessesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"business_id" | "tenant_id" | "business_name" | "business_type" | "subscription_plan_id" | "whatsapp_number" | "brand_colors" | "logo_url" | "working_hours" | "created_at" | "updated_at", ExtArgs["result"]["businesses"]>
  export type businessesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subscription_plans?: boolean | businesses$subscription_plansArgs<ExtArgs>
    tenants?: boolean | tenantsDefaultArgs<ExtArgs>
    social_accounts?: boolean | businesses$social_accountsArgs<ExtArgs>
    users?: boolean | businesses$usersArgs<ExtArgs>
    _count?: boolean | BusinessesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type businessesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subscription_plans?: boolean | businesses$subscription_plansArgs<ExtArgs>
    tenants?: boolean | tenantsDefaultArgs<ExtArgs>
  }
  export type businessesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subscription_plans?: boolean | businesses$subscription_plansArgs<ExtArgs>
    tenants?: boolean | tenantsDefaultArgs<ExtArgs>
  }

  export type $businessesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "businesses"
    objects: {
      subscription_plans: Prisma.$subscription_plansPayload<ExtArgs> | null
      tenants: Prisma.$tenantsPayload<ExtArgs>
      social_accounts: Prisma.$social_accountsPayload<ExtArgs>[]
      users: Prisma.$usersPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      business_id: string
      tenant_id: string
      business_name: string
      business_type: string | null
      subscription_plan_id: string | null
      whatsapp_number: string | null
      brand_colors: Prisma.JsonValue | null
      logo_url: string | null
      working_hours: Prisma.JsonValue | null
      created_at: Date | null
      updated_at: Date | null
    }, ExtArgs["result"]["businesses"]>
    composites: {}
  }

  type businessesGetPayload<S extends boolean | null | undefined | businessesDefaultArgs> = $Result.GetResult<Prisma.$businessesPayload, S>

  type businessesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<businessesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BusinessesCountAggregateInputType | true
    }

  export interface businessesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['businesses'], meta: { name: 'businesses' } }
    /**
     * Find zero or one Businesses that matches the filter.
     * @param {businessesFindUniqueArgs} args - Arguments to find a Businesses
     * @example
     * // Get one Businesses
     * const businesses = await prisma.businesses.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends businessesFindUniqueArgs>(args: SelectSubset<T, businessesFindUniqueArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Businesses that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {businessesFindUniqueOrThrowArgs} args - Arguments to find a Businesses
     * @example
     * // Get one Businesses
     * const businesses = await prisma.businesses.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends businessesFindUniqueOrThrowArgs>(args: SelectSubset<T, businessesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Businesses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {businessesFindFirstArgs} args - Arguments to find a Businesses
     * @example
     * // Get one Businesses
     * const businesses = await prisma.businesses.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends businessesFindFirstArgs>(args?: SelectSubset<T, businessesFindFirstArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Businesses that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {businessesFindFirstOrThrowArgs} args - Arguments to find a Businesses
     * @example
     * // Get one Businesses
     * const businesses = await prisma.businesses.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends businessesFindFirstOrThrowArgs>(args?: SelectSubset<T, businessesFindFirstOrThrowArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Businesses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {businessesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Businesses
     * const businesses = await prisma.businesses.findMany()
     * 
     * // Get first 10 Businesses
     * const businesses = await prisma.businesses.findMany({ take: 10 })
     * 
     * // Only select the `business_id`
     * const businessesWithBusiness_idOnly = await prisma.businesses.findMany({ select: { business_id: true } })
     * 
     */
    findMany<T extends businessesFindManyArgs>(args?: SelectSubset<T, businessesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Businesses.
     * @param {businessesCreateArgs} args - Arguments to create a Businesses.
     * @example
     * // Create one Businesses
     * const Businesses = await prisma.businesses.create({
     *   data: {
     *     // ... data to create a Businesses
     *   }
     * })
     * 
     */
    create<T extends businessesCreateArgs>(args: SelectSubset<T, businessesCreateArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Businesses.
     * @param {businessesCreateManyArgs} args - Arguments to create many Businesses.
     * @example
     * // Create many Businesses
     * const businesses = await prisma.businesses.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends businessesCreateManyArgs>(args?: SelectSubset<T, businessesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Businesses and returns the data saved in the database.
     * @param {businessesCreateManyAndReturnArgs} args - Arguments to create many Businesses.
     * @example
     * // Create many Businesses
     * const businesses = await prisma.businesses.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Businesses and only return the `business_id`
     * const businessesWithBusiness_idOnly = await prisma.businesses.createManyAndReturn({
     *   select: { business_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends businessesCreateManyAndReturnArgs>(args?: SelectSubset<T, businessesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Businesses.
     * @param {businessesDeleteArgs} args - Arguments to delete one Businesses.
     * @example
     * // Delete one Businesses
     * const Businesses = await prisma.businesses.delete({
     *   where: {
     *     // ... filter to delete one Businesses
     *   }
     * })
     * 
     */
    delete<T extends businessesDeleteArgs>(args: SelectSubset<T, businessesDeleteArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Businesses.
     * @param {businessesUpdateArgs} args - Arguments to update one Businesses.
     * @example
     * // Update one Businesses
     * const businesses = await prisma.businesses.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends businessesUpdateArgs>(args: SelectSubset<T, businessesUpdateArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Businesses.
     * @param {businessesDeleteManyArgs} args - Arguments to filter Businesses to delete.
     * @example
     * // Delete a few Businesses
     * const { count } = await prisma.businesses.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends businessesDeleteManyArgs>(args?: SelectSubset<T, businessesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Businesses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {businessesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Businesses
     * const businesses = await prisma.businesses.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends businessesUpdateManyArgs>(args: SelectSubset<T, businessesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Businesses and returns the data updated in the database.
     * @param {businessesUpdateManyAndReturnArgs} args - Arguments to update many Businesses.
     * @example
     * // Update many Businesses
     * const businesses = await prisma.businesses.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Businesses and only return the `business_id`
     * const businessesWithBusiness_idOnly = await prisma.businesses.updateManyAndReturn({
     *   select: { business_id: true },
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
    updateManyAndReturn<T extends businessesUpdateManyAndReturnArgs>(args: SelectSubset<T, businessesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Businesses.
     * @param {businessesUpsertArgs} args - Arguments to update or create a Businesses.
     * @example
     * // Update or create a Businesses
     * const businesses = await prisma.businesses.upsert({
     *   create: {
     *     // ... data to create a Businesses
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Businesses we want to update
     *   }
     * })
     */
    upsert<T extends businessesUpsertArgs>(args: SelectSubset<T, businessesUpsertArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Businesses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {businessesCountArgs} args - Arguments to filter Businesses to count.
     * @example
     * // Count the number of Businesses
     * const count = await prisma.businesses.count({
     *   where: {
     *     // ... the filter for the Businesses we want to count
     *   }
     * })
    **/
    count<T extends businessesCountArgs>(
      args?: Subset<T, businessesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BusinessesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Businesses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BusinessesAggregateArgs>(args: Subset<T, BusinessesAggregateArgs>): Prisma.PrismaPromise<GetBusinessesAggregateType<T>>

    /**
     * Group by Businesses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {businessesGroupByArgs} args - Group by arguments.
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
      T extends businessesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: businessesGroupByArgs['orderBy'] }
        : { orderBy?: businessesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, businessesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBusinessesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the businesses model
   */
  readonly fields: businessesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for businesses.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__businessesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    subscription_plans<T extends businesses$subscription_plansArgs<ExtArgs> = {}>(args?: Subset<T, businesses$subscription_plansArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    tenants<T extends tenantsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, tenantsDefaultArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    social_accounts<T extends businesses$social_accountsArgs<ExtArgs> = {}>(args?: Subset<T, businesses$social_accountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends businesses$usersArgs<ExtArgs> = {}>(args?: Subset<T, businesses$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the businesses model
   */
  interface businessesFieldRefs {
    readonly business_id: FieldRef<"businesses", 'String'>
    readonly tenant_id: FieldRef<"businesses", 'String'>
    readonly business_name: FieldRef<"businesses", 'String'>
    readonly business_type: FieldRef<"businesses", 'String'>
    readonly subscription_plan_id: FieldRef<"businesses", 'String'>
    readonly whatsapp_number: FieldRef<"businesses", 'String'>
    readonly brand_colors: FieldRef<"businesses", 'Json'>
    readonly logo_url: FieldRef<"businesses", 'String'>
    readonly working_hours: FieldRef<"businesses", 'Json'>
    readonly created_at: FieldRef<"businesses", 'DateTime'>
    readonly updated_at: FieldRef<"businesses", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * businesses findUnique
   */
  export type businessesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * Filter, which businesses to fetch.
     */
    where: businessesWhereUniqueInput
  }

  /**
   * businesses findUniqueOrThrow
   */
  export type businessesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * Filter, which businesses to fetch.
     */
    where: businessesWhereUniqueInput
  }

  /**
   * businesses findFirst
   */
  export type businessesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * Filter, which businesses to fetch.
     */
    where?: businessesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of businesses to fetch.
     */
    orderBy?: businessesOrderByWithRelationInput | businessesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for businesses.
     */
    cursor?: businessesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` businesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` businesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of businesses.
     */
    distinct?: BusinessesScalarFieldEnum | BusinessesScalarFieldEnum[]
  }

  /**
   * businesses findFirstOrThrow
   */
  export type businessesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * Filter, which businesses to fetch.
     */
    where?: businessesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of businesses to fetch.
     */
    orderBy?: businessesOrderByWithRelationInput | businessesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for businesses.
     */
    cursor?: businessesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` businesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` businesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of businesses.
     */
    distinct?: BusinessesScalarFieldEnum | BusinessesScalarFieldEnum[]
  }

  /**
   * businesses findMany
   */
  export type businessesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * Filter, which businesses to fetch.
     */
    where?: businessesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of businesses to fetch.
     */
    orderBy?: businessesOrderByWithRelationInput | businessesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing businesses.
     */
    cursor?: businessesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` businesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` businesses.
     */
    skip?: number
    distinct?: BusinessesScalarFieldEnum | BusinessesScalarFieldEnum[]
  }

  /**
   * businesses create
   */
  export type businessesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * The data needed to create a businesses.
     */
    data: XOR<businessesCreateInput, businessesUncheckedCreateInput>
  }

  /**
   * businesses createMany
   */
  export type businessesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many businesses.
     */
    data: businessesCreateManyInput | businessesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * businesses createManyAndReturn
   */
  export type businessesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * The data used to create many businesses.
     */
    data: businessesCreateManyInput | businessesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * businesses update
   */
  export type businessesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * The data needed to update a businesses.
     */
    data: XOR<businessesUpdateInput, businessesUncheckedUpdateInput>
    /**
     * Choose, which businesses to update.
     */
    where: businessesWhereUniqueInput
  }

  /**
   * businesses updateMany
   */
  export type businessesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update businesses.
     */
    data: XOR<businessesUpdateManyMutationInput, businessesUncheckedUpdateManyInput>
    /**
     * Filter which businesses to update
     */
    where?: businessesWhereInput
    /**
     * Limit how many businesses to update.
     */
    limit?: number
  }

  /**
   * businesses updateManyAndReturn
   */
  export type businessesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * The data used to update businesses.
     */
    data: XOR<businessesUpdateManyMutationInput, businessesUncheckedUpdateManyInput>
    /**
     * Filter which businesses to update
     */
    where?: businessesWhereInput
    /**
     * Limit how many businesses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * businesses upsert
   */
  export type businessesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * The filter to search for the businesses to update in case it exists.
     */
    where: businessesWhereUniqueInput
    /**
     * In case the businesses found by the `where` argument doesn't exist, create a new businesses with this data.
     */
    create: XOR<businessesCreateInput, businessesUncheckedCreateInput>
    /**
     * In case the businesses was found with the provided `where` argument, update it with this data.
     */
    update: XOR<businessesUpdateInput, businessesUncheckedUpdateInput>
  }

  /**
   * businesses delete
   */
  export type businessesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    /**
     * Filter which businesses to delete.
     */
    where: businessesWhereUniqueInput
  }

  /**
   * businesses deleteMany
   */
  export type businessesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which businesses to delete
     */
    where?: businessesWhereInput
    /**
     * Limit how many businesses to delete.
     */
    limit?: number
  }

  /**
   * businesses.subscription_plans
   */
  export type businesses$subscription_plansArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    where?: subscription_plansWhereInput
  }

  /**
   * businesses.social_accounts
   */
  export type businesses$social_accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    where?: social_accountsWhereInput
    orderBy?: social_accountsOrderByWithRelationInput | social_accountsOrderByWithRelationInput[]
    cursor?: social_accountsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Social_accountsScalarFieldEnum | Social_accountsScalarFieldEnum[]
  }

  /**
   * businesses.users
   */
  export type businesses$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    where?: usersWhereInput
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    cursor?: usersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * businesses without action
   */
  export type businessesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
  }


  /**
   * Model social_accounts
   */

  export type AggregateSocial_accounts = {
    _count: Social_accountsCountAggregateOutputType | null
    _min: Social_accountsMinAggregateOutputType | null
    _max: Social_accountsMaxAggregateOutputType | null
  }

  export type Social_accountsMinAggregateOutputType = {
    account_id: string | null
    business_id: string | null
    platform: string | null
    platform_user_id: string | null
    page_id: string | null
    access_token: string | null
    token_expiry: Date | null
    is_active: boolean | null
    created_at: Date | null
  }

  export type Social_accountsMaxAggregateOutputType = {
    account_id: string | null
    business_id: string | null
    platform: string | null
    platform_user_id: string | null
    page_id: string | null
    access_token: string | null
    token_expiry: Date | null
    is_active: boolean | null
    created_at: Date | null
  }

  export type Social_accountsCountAggregateOutputType = {
    account_id: number
    business_id: number
    platform: number
    platform_user_id: number
    page_id: number
    access_token: number
    permissions: number
    token_expiry: number
    is_active: number
    created_at: number
    _all: number
  }


  export type Social_accountsMinAggregateInputType = {
    account_id?: true
    business_id?: true
    platform?: true
    platform_user_id?: true
    page_id?: true
    access_token?: true
    token_expiry?: true
    is_active?: true
    created_at?: true
  }

  export type Social_accountsMaxAggregateInputType = {
    account_id?: true
    business_id?: true
    platform?: true
    platform_user_id?: true
    page_id?: true
    access_token?: true
    token_expiry?: true
    is_active?: true
    created_at?: true
  }

  export type Social_accountsCountAggregateInputType = {
    account_id?: true
    business_id?: true
    platform?: true
    platform_user_id?: true
    page_id?: true
    access_token?: true
    permissions?: true
    token_expiry?: true
    is_active?: true
    created_at?: true
    _all?: true
  }

  export type Social_accountsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which social_accounts to aggregate.
     */
    where?: social_accountsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of social_accounts to fetch.
     */
    orderBy?: social_accountsOrderByWithRelationInput | social_accountsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: social_accountsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` social_accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` social_accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned social_accounts
    **/
    _count?: true | Social_accountsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Social_accountsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Social_accountsMaxAggregateInputType
  }

  export type GetSocial_accountsAggregateType<T extends Social_accountsAggregateArgs> = {
        [P in keyof T & keyof AggregateSocial_accounts]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSocial_accounts[P]>
      : GetScalarType<T[P], AggregateSocial_accounts[P]>
  }




  export type social_accountsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: social_accountsWhereInput
    orderBy?: social_accountsOrderByWithAggregationInput | social_accountsOrderByWithAggregationInput[]
    by: Social_accountsScalarFieldEnum[] | Social_accountsScalarFieldEnum
    having?: social_accountsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Social_accountsCountAggregateInputType | true
    _min?: Social_accountsMinAggregateInputType
    _max?: Social_accountsMaxAggregateInputType
  }

  export type Social_accountsGroupByOutputType = {
    account_id: string
    business_id: string
    platform: string
    platform_user_id: string
    page_id: string | null
    access_token: string
    permissions: JsonValue | null
    token_expiry: Date | null
    is_active: boolean | null
    created_at: Date | null
    _count: Social_accountsCountAggregateOutputType | null
    _min: Social_accountsMinAggregateOutputType | null
    _max: Social_accountsMaxAggregateOutputType | null
  }

  type GetSocial_accountsGroupByPayload<T extends social_accountsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Social_accountsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Social_accountsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Social_accountsGroupByOutputType[P]>
            : GetScalarType<T[P], Social_accountsGroupByOutputType[P]>
        }
      >
    >


  export type social_accountsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    account_id?: boolean
    business_id?: boolean
    platform?: boolean
    platform_user_id?: boolean
    page_id?: boolean
    access_token?: boolean
    permissions?: boolean
    token_expiry?: boolean
    is_active?: boolean
    created_at?: boolean
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["social_accounts"]>

  export type social_accountsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    account_id?: boolean
    business_id?: boolean
    platform?: boolean
    platform_user_id?: boolean
    page_id?: boolean
    access_token?: boolean
    permissions?: boolean
    token_expiry?: boolean
    is_active?: boolean
    created_at?: boolean
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["social_accounts"]>

  export type social_accountsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    account_id?: boolean
    business_id?: boolean
    platform?: boolean
    platform_user_id?: boolean
    page_id?: boolean
    access_token?: boolean
    permissions?: boolean
    token_expiry?: boolean
    is_active?: boolean
    created_at?: boolean
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["social_accounts"]>

  export type social_accountsSelectScalar = {
    account_id?: boolean
    business_id?: boolean
    platform?: boolean
    platform_user_id?: boolean
    page_id?: boolean
    access_token?: boolean
    permissions?: boolean
    token_expiry?: boolean
    is_active?: boolean
    created_at?: boolean
  }

  export type social_accountsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"account_id" | "business_id" | "platform" | "platform_user_id" | "page_id" | "access_token" | "permissions" | "token_expiry" | "is_active" | "created_at", ExtArgs["result"]["social_accounts"]>
  export type social_accountsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
  }
  export type social_accountsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
  }
  export type social_accountsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
  }

  export type $social_accountsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "social_accounts"
    objects: {
      businesses: Prisma.$businessesPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      account_id: string
      business_id: string
      platform: string
      platform_user_id: string
      page_id: string | null
      access_token: string
      permissions: Prisma.JsonValue | null
      token_expiry: Date | null
      is_active: boolean | null
      created_at: Date | null
    }, ExtArgs["result"]["social_accounts"]>
    composites: {}
  }

  type social_accountsGetPayload<S extends boolean | null | undefined | social_accountsDefaultArgs> = $Result.GetResult<Prisma.$social_accountsPayload, S>

  type social_accountsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<social_accountsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Social_accountsCountAggregateInputType | true
    }

  export interface social_accountsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['social_accounts'], meta: { name: 'social_accounts' } }
    /**
     * Find zero or one Social_accounts that matches the filter.
     * @param {social_accountsFindUniqueArgs} args - Arguments to find a Social_accounts
     * @example
     * // Get one Social_accounts
     * const social_accounts = await prisma.social_accounts.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends social_accountsFindUniqueArgs>(args: SelectSubset<T, social_accountsFindUniqueArgs<ExtArgs>>): Prisma__social_accountsClient<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Social_accounts that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {social_accountsFindUniqueOrThrowArgs} args - Arguments to find a Social_accounts
     * @example
     * // Get one Social_accounts
     * const social_accounts = await prisma.social_accounts.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends social_accountsFindUniqueOrThrowArgs>(args: SelectSubset<T, social_accountsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__social_accountsClient<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Social_accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {social_accountsFindFirstArgs} args - Arguments to find a Social_accounts
     * @example
     * // Get one Social_accounts
     * const social_accounts = await prisma.social_accounts.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends social_accountsFindFirstArgs>(args?: SelectSubset<T, social_accountsFindFirstArgs<ExtArgs>>): Prisma__social_accountsClient<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Social_accounts that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {social_accountsFindFirstOrThrowArgs} args - Arguments to find a Social_accounts
     * @example
     * // Get one Social_accounts
     * const social_accounts = await prisma.social_accounts.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends social_accountsFindFirstOrThrowArgs>(args?: SelectSubset<T, social_accountsFindFirstOrThrowArgs<ExtArgs>>): Prisma__social_accountsClient<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Social_accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {social_accountsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Social_accounts
     * const social_accounts = await prisma.social_accounts.findMany()
     * 
     * // Get first 10 Social_accounts
     * const social_accounts = await prisma.social_accounts.findMany({ take: 10 })
     * 
     * // Only select the `account_id`
     * const social_accountsWithAccount_idOnly = await prisma.social_accounts.findMany({ select: { account_id: true } })
     * 
     */
    findMany<T extends social_accountsFindManyArgs>(args?: SelectSubset<T, social_accountsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Social_accounts.
     * @param {social_accountsCreateArgs} args - Arguments to create a Social_accounts.
     * @example
     * // Create one Social_accounts
     * const Social_accounts = await prisma.social_accounts.create({
     *   data: {
     *     // ... data to create a Social_accounts
     *   }
     * })
     * 
     */
    create<T extends social_accountsCreateArgs>(args: SelectSubset<T, social_accountsCreateArgs<ExtArgs>>): Prisma__social_accountsClient<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Social_accounts.
     * @param {social_accountsCreateManyArgs} args - Arguments to create many Social_accounts.
     * @example
     * // Create many Social_accounts
     * const social_accounts = await prisma.social_accounts.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends social_accountsCreateManyArgs>(args?: SelectSubset<T, social_accountsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Social_accounts and returns the data saved in the database.
     * @param {social_accountsCreateManyAndReturnArgs} args - Arguments to create many Social_accounts.
     * @example
     * // Create many Social_accounts
     * const social_accounts = await prisma.social_accounts.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Social_accounts and only return the `account_id`
     * const social_accountsWithAccount_idOnly = await prisma.social_accounts.createManyAndReturn({
     *   select: { account_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends social_accountsCreateManyAndReturnArgs>(args?: SelectSubset<T, social_accountsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Social_accounts.
     * @param {social_accountsDeleteArgs} args - Arguments to delete one Social_accounts.
     * @example
     * // Delete one Social_accounts
     * const Social_accounts = await prisma.social_accounts.delete({
     *   where: {
     *     // ... filter to delete one Social_accounts
     *   }
     * })
     * 
     */
    delete<T extends social_accountsDeleteArgs>(args: SelectSubset<T, social_accountsDeleteArgs<ExtArgs>>): Prisma__social_accountsClient<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Social_accounts.
     * @param {social_accountsUpdateArgs} args - Arguments to update one Social_accounts.
     * @example
     * // Update one Social_accounts
     * const social_accounts = await prisma.social_accounts.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends social_accountsUpdateArgs>(args: SelectSubset<T, social_accountsUpdateArgs<ExtArgs>>): Prisma__social_accountsClient<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Social_accounts.
     * @param {social_accountsDeleteManyArgs} args - Arguments to filter Social_accounts to delete.
     * @example
     * // Delete a few Social_accounts
     * const { count } = await prisma.social_accounts.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends social_accountsDeleteManyArgs>(args?: SelectSubset<T, social_accountsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Social_accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {social_accountsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Social_accounts
     * const social_accounts = await prisma.social_accounts.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends social_accountsUpdateManyArgs>(args: SelectSubset<T, social_accountsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Social_accounts and returns the data updated in the database.
     * @param {social_accountsUpdateManyAndReturnArgs} args - Arguments to update many Social_accounts.
     * @example
     * // Update many Social_accounts
     * const social_accounts = await prisma.social_accounts.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Social_accounts and only return the `account_id`
     * const social_accountsWithAccount_idOnly = await prisma.social_accounts.updateManyAndReturn({
     *   select: { account_id: true },
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
    updateManyAndReturn<T extends social_accountsUpdateManyAndReturnArgs>(args: SelectSubset<T, social_accountsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Social_accounts.
     * @param {social_accountsUpsertArgs} args - Arguments to update or create a Social_accounts.
     * @example
     * // Update or create a Social_accounts
     * const social_accounts = await prisma.social_accounts.upsert({
     *   create: {
     *     // ... data to create a Social_accounts
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Social_accounts we want to update
     *   }
     * })
     */
    upsert<T extends social_accountsUpsertArgs>(args: SelectSubset<T, social_accountsUpsertArgs<ExtArgs>>): Prisma__social_accountsClient<$Result.GetResult<Prisma.$social_accountsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Social_accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {social_accountsCountArgs} args - Arguments to filter Social_accounts to count.
     * @example
     * // Count the number of Social_accounts
     * const count = await prisma.social_accounts.count({
     *   where: {
     *     // ... the filter for the Social_accounts we want to count
     *   }
     * })
    **/
    count<T extends social_accountsCountArgs>(
      args?: Subset<T, social_accountsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Social_accountsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Social_accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Social_accountsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Social_accountsAggregateArgs>(args: Subset<T, Social_accountsAggregateArgs>): Prisma.PrismaPromise<GetSocial_accountsAggregateType<T>>

    /**
     * Group by Social_accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {social_accountsGroupByArgs} args - Group by arguments.
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
      T extends social_accountsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: social_accountsGroupByArgs['orderBy'] }
        : { orderBy?: social_accountsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, social_accountsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSocial_accountsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the social_accounts model
   */
  readonly fields: social_accountsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for social_accounts.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__social_accountsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businesses<T extends businessesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, businessesDefaultArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the social_accounts model
   */
  interface social_accountsFieldRefs {
    readonly account_id: FieldRef<"social_accounts", 'String'>
    readonly business_id: FieldRef<"social_accounts", 'String'>
    readonly platform: FieldRef<"social_accounts", 'String'>
    readonly platform_user_id: FieldRef<"social_accounts", 'String'>
    readonly page_id: FieldRef<"social_accounts", 'String'>
    readonly access_token: FieldRef<"social_accounts", 'String'>
    readonly permissions: FieldRef<"social_accounts", 'Json'>
    readonly token_expiry: FieldRef<"social_accounts", 'DateTime'>
    readonly is_active: FieldRef<"social_accounts", 'Boolean'>
    readonly created_at: FieldRef<"social_accounts", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * social_accounts findUnique
   */
  export type social_accountsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * Filter, which social_accounts to fetch.
     */
    where: social_accountsWhereUniqueInput
  }

  /**
   * social_accounts findUniqueOrThrow
   */
  export type social_accountsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * Filter, which social_accounts to fetch.
     */
    where: social_accountsWhereUniqueInput
  }

  /**
   * social_accounts findFirst
   */
  export type social_accountsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * Filter, which social_accounts to fetch.
     */
    where?: social_accountsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of social_accounts to fetch.
     */
    orderBy?: social_accountsOrderByWithRelationInput | social_accountsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for social_accounts.
     */
    cursor?: social_accountsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` social_accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` social_accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of social_accounts.
     */
    distinct?: Social_accountsScalarFieldEnum | Social_accountsScalarFieldEnum[]
  }

  /**
   * social_accounts findFirstOrThrow
   */
  export type social_accountsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * Filter, which social_accounts to fetch.
     */
    where?: social_accountsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of social_accounts to fetch.
     */
    orderBy?: social_accountsOrderByWithRelationInput | social_accountsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for social_accounts.
     */
    cursor?: social_accountsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` social_accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` social_accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of social_accounts.
     */
    distinct?: Social_accountsScalarFieldEnum | Social_accountsScalarFieldEnum[]
  }

  /**
   * social_accounts findMany
   */
  export type social_accountsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * Filter, which social_accounts to fetch.
     */
    where?: social_accountsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of social_accounts to fetch.
     */
    orderBy?: social_accountsOrderByWithRelationInput | social_accountsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing social_accounts.
     */
    cursor?: social_accountsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` social_accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` social_accounts.
     */
    skip?: number
    distinct?: Social_accountsScalarFieldEnum | Social_accountsScalarFieldEnum[]
  }

  /**
   * social_accounts create
   */
  export type social_accountsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * The data needed to create a social_accounts.
     */
    data: XOR<social_accountsCreateInput, social_accountsUncheckedCreateInput>
  }

  /**
   * social_accounts createMany
   */
  export type social_accountsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many social_accounts.
     */
    data: social_accountsCreateManyInput | social_accountsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * social_accounts createManyAndReturn
   */
  export type social_accountsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * The data used to create many social_accounts.
     */
    data: social_accountsCreateManyInput | social_accountsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * social_accounts update
   */
  export type social_accountsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * The data needed to update a social_accounts.
     */
    data: XOR<social_accountsUpdateInput, social_accountsUncheckedUpdateInput>
    /**
     * Choose, which social_accounts to update.
     */
    where: social_accountsWhereUniqueInput
  }

  /**
   * social_accounts updateMany
   */
  export type social_accountsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update social_accounts.
     */
    data: XOR<social_accountsUpdateManyMutationInput, social_accountsUncheckedUpdateManyInput>
    /**
     * Filter which social_accounts to update
     */
    where?: social_accountsWhereInput
    /**
     * Limit how many social_accounts to update.
     */
    limit?: number
  }

  /**
   * social_accounts updateManyAndReturn
   */
  export type social_accountsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * The data used to update social_accounts.
     */
    data: XOR<social_accountsUpdateManyMutationInput, social_accountsUncheckedUpdateManyInput>
    /**
     * Filter which social_accounts to update
     */
    where?: social_accountsWhereInput
    /**
     * Limit how many social_accounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * social_accounts upsert
   */
  export type social_accountsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * The filter to search for the social_accounts to update in case it exists.
     */
    where: social_accountsWhereUniqueInput
    /**
     * In case the social_accounts found by the `where` argument doesn't exist, create a new social_accounts with this data.
     */
    create: XOR<social_accountsCreateInput, social_accountsUncheckedCreateInput>
    /**
     * In case the social_accounts was found with the provided `where` argument, update it with this data.
     */
    update: XOR<social_accountsUpdateInput, social_accountsUncheckedUpdateInput>
  }

  /**
   * social_accounts delete
   */
  export type social_accountsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
    /**
     * Filter which social_accounts to delete.
     */
    where: social_accountsWhereUniqueInput
  }

  /**
   * social_accounts deleteMany
   */
  export type social_accountsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which social_accounts to delete
     */
    where?: social_accountsWhereInput
    /**
     * Limit how many social_accounts to delete.
     */
    limit?: number
  }

  /**
   * social_accounts without action
   */
  export type social_accountsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the social_accounts
     */
    select?: social_accountsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the social_accounts
     */
    omit?: social_accountsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: social_accountsInclude<ExtArgs> | null
  }


  /**
   * Model subscription_plans
   */

  export type AggregateSubscription_plans = {
    _count: Subscription_plansCountAggregateOutputType | null
    _avg: Subscription_plansAvgAggregateOutputType | null
    _sum: Subscription_plansSumAggregateOutputType | null
    _min: Subscription_plansMinAggregateOutputType | null
    _max: Subscription_plansMaxAggregateOutputType | null
  }

  export type Subscription_plansAvgAggregateOutputType = {
    price: Decimal | null
    duration_in_days: number | null
  }

  export type Subscription_plansSumAggregateOutputType = {
    price: Decimal | null
    duration_in_days: number | null
  }

  export type Subscription_plansMinAggregateOutputType = {
    subscription_plan_id: string | null
    plan_name: string | null
    price: Decimal | null
    duration_in_days: number | null
    created_at: Date | null
  }

  export type Subscription_plansMaxAggregateOutputType = {
    subscription_plan_id: string | null
    plan_name: string | null
    price: Decimal | null
    duration_in_days: number | null
    created_at: Date | null
  }

  export type Subscription_plansCountAggregateOutputType = {
    subscription_plan_id: number
    plan_name: number
    price: number
    duration_in_days: number
    created_at: number
    _all: number
  }


  export type Subscription_plansAvgAggregateInputType = {
    price?: true
    duration_in_days?: true
  }

  export type Subscription_plansSumAggregateInputType = {
    price?: true
    duration_in_days?: true
  }

  export type Subscription_plansMinAggregateInputType = {
    subscription_plan_id?: true
    plan_name?: true
    price?: true
    duration_in_days?: true
    created_at?: true
  }

  export type Subscription_plansMaxAggregateInputType = {
    subscription_plan_id?: true
    plan_name?: true
    price?: true
    duration_in_days?: true
    created_at?: true
  }

  export type Subscription_plansCountAggregateInputType = {
    subscription_plan_id?: true
    plan_name?: true
    price?: true
    duration_in_days?: true
    created_at?: true
    _all?: true
  }

  export type Subscription_plansAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which subscription_plans to aggregate.
     */
    where?: subscription_plansWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subscription_plans to fetch.
     */
    orderBy?: subscription_plansOrderByWithRelationInput | subscription_plansOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: subscription_plansWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subscription_plans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subscription_plans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned subscription_plans
    **/
    _count?: true | Subscription_plansCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Subscription_plansAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Subscription_plansSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Subscription_plansMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Subscription_plansMaxAggregateInputType
  }

  export type GetSubscription_plansAggregateType<T extends Subscription_plansAggregateArgs> = {
        [P in keyof T & keyof AggregateSubscription_plans]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubscription_plans[P]>
      : GetScalarType<T[P], AggregateSubscription_plans[P]>
  }




  export type subscription_plansGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: subscription_plansWhereInput
    orderBy?: subscription_plansOrderByWithAggregationInput | subscription_plansOrderByWithAggregationInput[]
    by: Subscription_plansScalarFieldEnum[] | Subscription_plansScalarFieldEnum
    having?: subscription_plansScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Subscription_plansCountAggregateInputType | true
    _avg?: Subscription_plansAvgAggregateInputType
    _sum?: Subscription_plansSumAggregateInputType
    _min?: Subscription_plansMinAggregateInputType
    _max?: Subscription_plansMaxAggregateInputType
  }

  export type Subscription_plansGroupByOutputType = {
    subscription_plan_id: string
    plan_name: string
    price: Decimal | null
    duration_in_days: number | null
    created_at: Date | null
    _count: Subscription_plansCountAggregateOutputType | null
    _avg: Subscription_plansAvgAggregateOutputType | null
    _sum: Subscription_plansSumAggregateOutputType | null
    _min: Subscription_plansMinAggregateOutputType | null
    _max: Subscription_plansMaxAggregateOutputType | null
  }

  type GetSubscription_plansGroupByPayload<T extends subscription_plansGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Subscription_plansGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Subscription_plansGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Subscription_plansGroupByOutputType[P]>
            : GetScalarType<T[P], Subscription_plansGroupByOutputType[P]>
        }
      >
    >


  export type subscription_plansSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    subscription_plan_id?: boolean
    plan_name?: boolean
    price?: boolean
    duration_in_days?: boolean
    created_at?: boolean
    businesses?: boolean | subscription_plans$businessesArgs<ExtArgs>
    _count?: boolean | Subscription_plansCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscription_plans"]>

  export type subscription_plansSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    subscription_plan_id?: boolean
    plan_name?: boolean
    price?: boolean
    duration_in_days?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["subscription_plans"]>

  export type subscription_plansSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    subscription_plan_id?: boolean
    plan_name?: boolean
    price?: boolean
    duration_in_days?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["subscription_plans"]>

  export type subscription_plansSelectScalar = {
    subscription_plan_id?: boolean
    plan_name?: boolean
    price?: boolean
    duration_in_days?: boolean
    created_at?: boolean
  }

  export type subscription_plansOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"subscription_plan_id" | "plan_name" | "price" | "duration_in_days" | "created_at", ExtArgs["result"]["subscription_plans"]>
  export type subscription_plansInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | subscription_plans$businessesArgs<ExtArgs>
    _count?: boolean | Subscription_plansCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type subscription_plansIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type subscription_plansIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $subscription_plansPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "subscription_plans"
    objects: {
      businesses: Prisma.$businessesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      subscription_plan_id: string
      plan_name: string
      price: Prisma.Decimal | null
      duration_in_days: number | null
      created_at: Date | null
    }, ExtArgs["result"]["subscription_plans"]>
    composites: {}
  }

  type subscription_plansGetPayload<S extends boolean | null | undefined | subscription_plansDefaultArgs> = $Result.GetResult<Prisma.$subscription_plansPayload, S>

  type subscription_plansCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<subscription_plansFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Subscription_plansCountAggregateInputType | true
    }

  export interface subscription_plansDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['subscription_plans'], meta: { name: 'subscription_plans' } }
    /**
     * Find zero or one Subscription_plans that matches the filter.
     * @param {subscription_plansFindUniqueArgs} args - Arguments to find a Subscription_plans
     * @example
     * // Get one Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends subscription_plansFindUniqueArgs>(args: SelectSubset<T, subscription_plansFindUniqueArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Subscription_plans that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {subscription_plansFindUniqueOrThrowArgs} args - Arguments to find a Subscription_plans
     * @example
     * // Get one Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends subscription_plansFindUniqueOrThrowArgs>(args: SelectSubset<T, subscription_plansFindUniqueOrThrowArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Subscription_plans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subscription_plansFindFirstArgs} args - Arguments to find a Subscription_plans
     * @example
     * // Get one Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends subscription_plansFindFirstArgs>(args?: SelectSubset<T, subscription_plansFindFirstArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Subscription_plans that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subscription_plansFindFirstOrThrowArgs} args - Arguments to find a Subscription_plans
     * @example
     * // Get one Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends subscription_plansFindFirstOrThrowArgs>(args?: SelectSubset<T, subscription_plansFindFirstOrThrowArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Subscription_plans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subscription_plansFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.findMany()
     * 
     * // Get first 10 Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.findMany({ take: 10 })
     * 
     * // Only select the `subscription_plan_id`
     * const subscription_plansWithSubscription_plan_idOnly = await prisma.subscription_plans.findMany({ select: { subscription_plan_id: true } })
     * 
     */
    findMany<T extends subscription_plansFindManyArgs>(args?: SelectSubset<T, subscription_plansFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Subscription_plans.
     * @param {subscription_plansCreateArgs} args - Arguments to create a Subscription_plans.
     * @example
     * // Create one Subscription_plans
     * const Subscription_plans = await prisma.subscription_plans.create({
     *   data: {
     *     // ... data to create a Subscription_plans
     *   }
     * })
     * 
     */
    create<T extends subscription_plansCreateArgs>(args: SelectSubset<T, subscription_plansCreateArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Subscription_plans.
     * @param {subscription_plansCreateManyArgs} args - Arguments to create many Subscription_plans.
     * @example
     * // Create many Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends subscription_plansCreateManyArgs>(args?: SelectSubset<T, subscription_plansCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Subscription_plans and returns the data saved in the database.
     * @param {subscription_plansCreateManyAndReturnArgs} args - Arguments to create many Subscription_plans.
     * @example
     * // Create many Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Subscription_plans and only return the `subscription_plan_id`
     * const subscription_plansWithSubscription_plan_idOnly = await prisma.subscription_plans.createManyAndReturn({
     *   select: { subscription_plan_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends subscription_plansCreateManyAndReturnArgs>(args?: SelectSubset<T, subscription_plansCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Subscription_plans.
     * @param {subscription_plansDeleteArgs} args - Arguments to delete one Subscription_plans.
     * @example
     * // Delete one Subscription_plans
     * const Subscription_plans = await prisma.subscription_plans.delete({
     *   where: {
     *     // ... filter to delete one Subscription_plans
     *   }
     * })
     * 
     */
    delete<T extends subscription_plansDeleteArgs>(args: SelectSubset<T, subscription_plansDeleteArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Subscription_plans.
     * @param {subscription_plansUpdateArgs} args - Arguments to update one Subscription_plans.
     * @example
     * // Update one Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends subscription_plansUpdateArgs>(args: SelectSubset<T, subscription_plansUpdateArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Subscription_plans.
     * @param {subscription_plansDeleteManyArgs} args - Arguments to filter Subscription_plans to delete.
     * @example
     * // Delete a few Subscription_plans
     * const { count } = await prisma.subscription_plans.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends subscription_plansDeleteManyArgs>(args?: SelectSubset<T, subscription_plansDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subscription_plans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subscription_plansUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends subscription_plansUpdateManyArgs>(args: SelectSubset<T, subscription_plansUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subscription_plans and returns the data updated in the database.
     * @param {subscription_plansUpdateManyAndReturnArgs} args - Arguments to update many Subscription_plans.
     * @example
     * // Update many Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Subscription_plans and only return the `subscription_plan_id`
     * const subscription_plansWithSubscription_plan_idOnly = await prisma.subscription_plans.updateManyAndReturn({
     *   select: { subscription_plan_id: true },
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
    updateManyAndReturn<T extends subscription_plansUpdateManyAndReturnArgs>(args: SelectSubset<T, subscription_plansUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Subscription_plans.
     * @param {subscription_plansUpsertArgs} args - Arguments to update or create a Subscription_plans.
     * @example
     * // Update or create a Subscription_plans
     * const subscription_plans = await prisma.subscription_plans.upsert({
     *   create: {
     *     // ... data to create a Subscription_plans
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Subscription_plans we want to update
     *   }
     * })
     */
    upsert<T extends subscription_plansUpsertArgs>(args: SelectSubset<T, subscription_plansUpsertArgs<ExtArgs>>): Prisma__subscription_plansClient<$Result.GetResult<Prisma.$subscription_plansPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Subscription_plans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subscription_plansCountArgs} args - Arguments to filter Subscription_plans to count.
     * @example
     * // Count the number of Subscription_plans
     * const count = await prisma.subscription_plans.count({
     *   where: {
     *     // ... the filter for the Subscription_plans we want to count
     *   }
     * })
    **/
    count<T extends subscription_plansCountArgs>(
      args?: Subset<T, subscription_plansCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Subscription_plansCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Subscription_plans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Subscription_plansAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Subscription_plansAggregateArgs>(args: Subset<T, Subscription_plansAggregateArgs>): Prisma.PrismaPromise<GetSubscription_plansAggregateType<T>>

    /**
     * Group by Subscription_plans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subscription_plansGroupByArgs} args - Group by arguments.
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
      T extends subscription_plansGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: subscription_plansGroupByArgs['orderBy'] }
        : { orderBy?: subscription_plansGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, subscription_plansGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubscription_plansGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the subscription_plans model
   */
  readonly fields: subscription_plansFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for subscription_plans.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__subscription_plansClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businesses<T extends subscription_plans$businessesArgs<ExtArgs> = {}>(args?: Subset<T, subscription_plans$businessesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the subscription_plans model
   */
  interface subscription_plansFieldRefs {
    readonly subscription_plan_id: FieldRef<"subscription_plans", 'String'>
    readonly plan_name: FieldRef<"subscription_plans", 'String'>
    readonly price: FieldRef<"subscription_plans", 'Decimal'>
    readonly duration_in_days: FieldRef<"subscription_plans", 'Int'>
    readonly created_at: FieldRef<"subscription_plans", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * subscription_plans findUnique
   */
  export type subscription_plansFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * Filter, which subscription_plans to fetch.
     */
    where: subscription_plansWhereUniqueInput
  }

  /**
   * subscription_plans findUniqueOrThrow
   */
  export type subscription_plansFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * Filter, which subscription_plans to fetch.
     */
    where: subscription_plansWhereUniqueInput
  }

  /**
   * subscription_plans findFirst
   */
  export type subscription_plansFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * Filter, which subscription_plans to fetch.
     */
    where?: subscription_plansWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subscription_plans to fetch.
     */
    orderBy?: subscription_plansOrderByWithRelationInput | subscription_plansOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for subscription_plans.
     */
    cursor?: subscription_plansWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subscription_plans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subscription_plans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of subscription_plans.
     */
    distinct?: Subscription_plansScalarFieldEnum | Subscription_plansScalarFieldEnum[]
  }

  /**
   * subscription_plans findFirstOrThrow
   */
  export type subscription_plansFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * Filter, which subscription_plans to fetch.
     */
    where?: subscription_plansWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subscription_plans to fetch.
     */
    orderBy?: subscription_plansOrderByWithRelationInput | subscription_plansOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for subscription_plans.
     */
    cursor?: subscription_plansWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subscription_plans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subscription_plans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of subscription_plans.
     */
    distinct?: Subscription_plansScalarFieldEnum | Subscription_plansScalarFieldEnum[]
  }

  /**
   * subscription_plans findMany
   */
  export type subscription_plansFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * Filter, which subscription_plans to fetch.
     */
    where?: subscription_plansWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subscription_plans to fetch.
     */
    orderBy?: subscription_plansOrderByWithRelationInput | subscription_plansOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing subscription_plans.
     */
    cursor?: subscription_plansWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subscription_plans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subscription_plans.
     */
    skip?: number
    distinct?: Subscription_plansScalarFieldEnum | Subscription_plansScalarFieldEnum[]
  }

  /**
   * subscription_plans create
   */
  export type subscription_plansCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * The data needed to create a subscription_plans.
     */
    data: XOR<subscription_plansCreateInput, subscription_plansUncheckedCreateInput>
  }

  /**
   * subscription_plans createMany
   */
  export type subscription_plansCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many subscription_plans.
     */
    data: subscription_plansCreateManyInput | subscription_plansCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * subscription_plans createManyAndReturn
   */
  export type subscription_plansCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * The data used to create many subscription_plans.
     */
    data: subscription_plansCreateManyInput | subscription_plansCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * subscription_plans update
   */
  export type subscription_plansUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * The data needed to update a subscription_plans.
     */
    data: XOR<subscription_plansUpdateInput, subscription_plansUncheckedUpdateInput>
    /**
     * Choose, which subscription_plans to update.
     */
    where: subscription_plansWhereUniqueInput
  }

  /**
   * subscription_plans updateMany
   */
  export type subscription_plansUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update subscription_plans.
     */
    data: XOR<subscription_plansUpdateManyMutationInput, subscription_plansUncheckedUpdateManyInput>
    /**
     * Filter which subscription_plans to update
     */
    where?: subscription_plansWhereInput
    /**
     * Limit how many subscription_plans to update.
     */
    limit?: number
  }

  /**
   * subscription_plans updateManyAndReturn
   */
  export type subscription_plansUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * The data used to update subscription_plans.
     */
    data: XOR<subscription_plansUpdateManyMutationInput, subscription_plansUncheckedUpdateManyInput>
    /**
     * Filter which subscription_plans to update
     */
    where?: subscription_plansWhereInput
    /**
     * Limit how many subscription_plans to update.
     */
    limit?: number
  }

  /**
   * subscription_plans upsert
   */
  export type subscription_plansUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * The filter to search for the subscription_plans to update in case it exists.
     */
    where: subscription_plansWhereUniqueInput
    /**
     * In case the subscription_plans found by the `where` argument doesn't exist, create a new subscription_plans with this data.
     */
    create: XOR<subscription_plansCreateInput, subscription_plansUncheckedCreateInput>
    /**
     * In case the subscription_plans was found with the provided `where` argument, update it with this data.
     */
    update: XOR<subscription_plansUpdateInput, subscription_plansUncheckedUpdateInput>
  }

  /**
   * subscription_plans delete
   */
  export type subscription_plansDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
    /**
     * Filter which subscription_plans to delete.
     */
    where: subscription_plansWhereUniqueInput
  }

  /**
   * subscription_plans deleteMany
   */
  export type subscription_plansDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which subscription_plans to delete
     */
    where?: subscription_plansWhereInput
    /**
     * Limit how many subscription_plans to delete.
     */
    limit?: number
  }

  /**
   * subscription_plans.businesses
   */
  export type subscription_plans$businessesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    where?: businessesWhereInput
    orderBy?: businessesOrderByWithRelationInput | businessesOrderByWithRelationInput[]
    cursor?: businessesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BusinessesScalarFieldEnum | BusinessesScalarFieldEnum[]
  }

  /**
   * subscription_plans without action
   */
  export type subscription_plansDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subscription_plans
     */
    select?: subscription_plansSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subscription_plans
     */
    omit?: subscription_plansOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subscription_plansInclude<ExtArgs> | null
  }


  /**
   * Model tenants
   */

  export type AggregateTenants = {
    _count: TenantsCountAggregateOutputType | null
    _min: TenantsMinAggregateOutputType | null
    _max: TenantsMaxAggregateOutputType | null
  }

  export type TenantsMinAggregateOutputType = {
    tenant_id: string | null
    tenant_name: string | null
    email: string | null
    phone_number: string | null
    created_at: Date | null
    updated_at: Date | null
    address: string | null
    gst_number: string | null
    pan_number: string | null
    registration_no: string | null
  }

  export type TenantsMaxAggregateOutputType = {
    tenant_id: string | null
    tenant_name: string | null
    email: string | null
    phone_number: string | null
    created_at: Date | null
    updated_at: Date | null
    address: string | null
    gst_number: string | null
    pan_number: string | null
    registration_no: string | null
  }

  export type TenantsCountAggregateOutputType = {
    tenant_id: number
    tenant_name: number
    email: number
    phone_number: number
    created_at: number
    updated_at: number
    address: number
    gst_number: number
    pan_number: number
    registration_no: number
    _all: number
  }


  export type TenantsMinAggregateInputType = {
    tenant_id?: true
    tenant_name?: true
    email?: true
    phone_number?: true
    created_at?: true
    updated_at?: true
    address?: true
    gst_number?: true
    pan_number?: true
    registration_no?: true
  }

  export type TenantsMaxAggregateInputType = {
    tenant_id?: true
    tenant_name?: true
    email?: true
    phone_number?: true
    created_at?: true
    updated_at?: true
    address?: true
    gst_number?: true
    pan_number?: true
    registration_no?: true
  }

  export type TenantsCountAggregateInputType = {
    tenant_id?: true
    tenant_name?: true
    email?: true
    phone_number?: true
    created_at?: true
    updated_at?: true
    address?: true
    gst_number?: true
    pan_number?: true
    registration_no?: true
    _all?: true
  }

  export type TenantsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tenants to aggregate.
     */
    where?: tenantsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenants to fetch.
     */
    orderBy?: tenantsOrderByWithRelationInput | tenantsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tenantsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tenants
    **/
    _count?: true | TenantsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantsMaxAggregateInputType
  }

  export type GetTenantsAggregateType<T extends TenantsAggregateArgs> = {
        [P in keyof T & keyof AggregateTenants]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenants[P]>
      : GetScalarType<T[P], AggregateTenants[P]>
  }




  export type tenantsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tenantsWhereInput
    orderBy?: tenantsOrderByWithAggregationInput | tenantsOrderByWithAggregationInput[]
    by: TenantsScalarFieldEnum[] | TenantsScalarFieldEnum
    having?: tenantsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantsCountAggregateInputType | true
    _min?: TenantsMinAggregateInputType
    _max?: TenantsMaxAggregateInputType
  }

  export type TenantsGroupByOutputType = {
    tenant_id: string
    tenant_name: string
    email: string
    phone_number: string | null
    created_at: Date | null
    updated_at: Date | null
    address: string | null
    gst_number: string | null
    pan_number: string | null
    registration_no: string | null
    _count: TenantsCountAggregateOutputType | null
    _min: TenantsMinAggregateOutputType | null
    _max: TenantsMaxAggregateOutputType | null
  }

  type GetTenantsGroupByPayload<T extends tenantsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantsGroupByOutputType[P]>
            : GetScalarType<T[P], TenantsGroupByOutputType[P]>
        }
      >
    >


  export type tenantsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenant_id?: boolean
    tenant_name?: boolean
    email?: boolean
    phone_number?: boolean
    created_at?: boolean
    updated_at?: boolean
    address?: boolean
    gst_number?: boolean
    pan_number?: boolean
    registration_no?: boolean
    businesses?: boolean | tenants$businessesArgs<ExtArgs>
    _count?: boolean | TenantsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenants"]>

  export type tenantsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenant_id?: boolean
    tenant_name?: boolean
    email?: boolean
    phone_number?: boolean
    created_at?: boolean
    updated_at?: boolean
    address?: boolean
    gst_number?: boolean
    pan_number?: boolean
    registration_no?: boolean
  }, ExtArgs["result"]["tenants"]>

  export type tenantsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenant_id?: boolean
    tenant_name?: boolean
    email?: boolean
    phone_number?: boolean
    created_at?: boolean
    updated_at?: boolean
    address?: boolean
    gst_number?: boolean
    pan_number?: boolean
    registration_no?: boolean
  }, ExtArgs["result"]["tenants"]>

  export type tenantsSelectScalar = {
    tenant_id?: boolean
    tenant_name?: boolean
    email?: boolean
    phone_number?: boolean
    created_at?: boolean
    updated_at?: boolean
    address?: boolean
    gst_number?: boolean
    pan_number?: boolean
    registration_no?: boolean
  }

  export type tenantsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"tenant_id" | "tenant_name" | "email" | "phone_number" | "created_at" | "updated_at" | "address" | "gst_number" | "pan_number" | "registration_no", ExtArgs["result"]["tenants"]>
  export type tenantsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | tenants$businessesArgs<ExtArgs>
    _count?: boolean | TenantsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type tenantsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type tenantsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $tenantsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tenants"
    objects: {
      businesses: Prisma.$businessesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      tenant_id: string
      tenant_name: string
      email: string
      phone_number: string | null
      created_at: Date | null
      updated_at: Date | null
      address: string | null
      gst_number: string | null
      pan_number: string | null
      registration_no: string | null
    }, ExtArgs["result"]["tenants"]>
    composites: {}
  }

  type tenantsGetPayload<S extends boolean | null | undefined | tenantsDefaultArgs> = $Result.GetResult<Prisma.$tenantsPayload, S>

  type tenantsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tenantsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantsCountAggregateInputType | true
    }

  export interface tenantsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tenants'], meta: { name: 'tenants' } }
    /**
     * Find zero or one Tenants that matches the filter.
     * @param {tenantsFindUniqueArgs} args - Arguments to find a Tenants
     * @example
     * // Get one Tenants
     * const tenants = await prisma.tenants.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tenantsFindUniqueArgs>(args: SelectSubset<T, tenantsFindUniqueArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenants that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tenantsFindUniqueOrThrowArgs} args - Arguments to find a Tenants
     * @example
     * // Get one Tenants
     * const tenants = await prisma.tenants.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tenantsFindUniqueOrThrowArgs>(args: SelectSubset<T, tenantsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenantsFindFirstArgs} args - Arguments to find a Tenants
     * @example
     * // Get one Tenants
     * const tenants = await prisma.tenants.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tenantsFindFirstArgs>(args?: SelectSubset<T, tenantsFindFirstArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenants that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenantsFindFirstOrThrowArgs} args - Arguments to find a Tenants
     * @example
     * // Get one Tenants
     * const tenants = await prisma.tenants.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tenantsFindFirstOrThrowArgs>(args?: SelectSubset<T, tenantsFindFirstOrThrowArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenantsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenants.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenants.findMany({ take: 10 })
     * 
     * // Only select the `tenant_id`
     * const tenantsWithTenant_idOnly = await prisma.tenants.findMany({ select: { tenant_id: true } })
     * 
     */
    findMany<T extends tenantsFindManyArgs>(args?: SelectSubset<T, tenantsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenants.
     * @param {tenantsCreateArgs} args - Arguments to create a Tenants.
     * @example
     * // Create one Tenants
     * const Tenants = await prisma.tenants.create({
     *   data: {
     *     // ... data to create a Tenants
     *   }
     * })
     * 
     */
    create<T extends tenantsCreateArgs>(args: SelectSubset<T, tenantsCreateArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {tenantsCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenants = await prisma.tenants.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tenantsCreateManyArgs>(args?: SelectSubset<T, tenantsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {tenantsCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenants = await prisma.tenants.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `tenant_id`
     * const tenantsWithTenant_idOnly = await prisma.tenants.createManyAndReturn({
     *   select: { tenant_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends tenantsCreateManyAndReturnArgs>(args?: SelectSubset<T, tenantsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenants.
     * @param {tenantsDeleteArgs} args - Arguments to delete one Tenants.
     * @example
     * // Delete one Tenants
     * const Tenants = await prisma.tenants.delete({
     *   where: {
     *     // ... filter to delete one Tenants
     *   }
     * })
     * 
     */
    delete<T extends tenantsDeleteArgs>(args: SelectSubset<T, tenantsDeleteArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenants.
     * @param {tenantsUpdateArgs} args - Arguments to update one Tenants.
     * @example
     * // Update one Tenants
     * const tenants = await prisma.tenants.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tenantsUpdateArgs>(args: SelectSubset<T, tenantsUpdateArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {tenantsDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenants.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tenantsDeleteManyArgs>(args?: SelectSubset<T, tenantsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenantsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenants = await prisma.tenants.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tenantsUpdateManyArgs>(args: SelectSubset<T, tenantsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {tenantsUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenants = await prisma.tenants.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `tenant_id`
     * const tenantsWithTenant_idOnly = await prisma.tenants.updateManyAndReturn({
     *   select: { tenant_id: true },
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
    updateManyAndReturn<T extends tenantsUpdateManyAndReturnArgs>(args: SelectSubset<T, tenantsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenants.
     * @param {tenantsUpsertArgs} args - Arguments to update or create a Tenants.
     * @example
     * // Update or create a Tenants
     * const tenants = await prisma.tenants.upsert({
     *   create: {
     *     // ... data to create a Tenants
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenants we want to update
     *   }
     * })
     */
    upsert<T extends tenantsUpsertArgs>(args: SelectSubset<T, tenantsUpsertArgs<ExtArgs>>): Prisma__tenantsClient<$Result.GetResult<Prisma.$tenantsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenantsCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenants.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends tenantsCountArgs>(
      args?: Subset<T, tenantsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantsAggregateArgs>(args: Subset<T, TenantsAggregateArgs>): Prisma.PrismaPromise<GetTenantsAggregateType<T>>

    /**
     * Group by Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tenantsGroupByArgs} args - Group by arguments.
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
      T extends tenantsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tenantsGroupByArgs['orderBy'] }
        : { orderBy?: tenantsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tenantsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tenants model
   */
  readonly fields: tenantsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tenants.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tenantsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businesses<T extends tenants$businessesArgs<ExtArgs> = {}>(args?: Subset<T, tenants$businessesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the tenants model
   */
  interface tenantsFieldRefs {
    readonly tenant_id: FieldRef<"tenants", 'String'>
    readonly tenant_name: FieldRef<"tenants", 'String'>
    readonly email: FieldRef<"tenants", 'String'>
    readonly phone_number: FieldRef<"tenants", 'String'>
    readonly created_at: FieldRef<"tenants", 'DateTime'>
    readonly updated_at: FieldRef<"tenants", 'DateTime'>
    readonly address: FieldRef<"tenants", 'String'>
    readonly gst_number: FieldRef<"tenants", 'String'>
    readonly pan_number: FieldRef<"tenants", 'String'>
    readonly registration_no: FieldRef<"tenants", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tenants findUnique
   */
  export type tenantsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * Filter, which tenants to fetch.
     */
    where: tenantsWhereUniqueInput
  }

  /**
   * tenants findUniqueOrThrow
   */
  export type tenantsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * Filter, which tenants to fetch.
     */
    where: tenantsWhereUniqueInput
  }

  /**
   * tenants findFirst
   */
  export type tenantsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * Filter, which tenants to fetch.
     */
    where?: tenantsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenants to fetch.
     */
    orderBy?: tenantsOrderByWithRelationInput | tenantsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tenants.
     */
    cursor?: tenantsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tenants.
     */
    distinct?: TenantsScalarFieldEnum | TenantsScalarFieldEnum[]
  }

  /**
   * tenants findFirstOrThrow
   */
  export type tenantsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * Filter, which tenants to fetch.
     */
    where?: tenantsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenants to fetch.
     */
    orderBy?: tenantsOrderByWithRelationInput | tenantsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tenants.
     */
    cursor?: tenantsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tenants.
     */
    distinct?: TenantsScalarFieldEnum | TenantsScalarFieldEnum[]
  }

  /**
   * tenants findMany
   */
  export type tenantsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * Filter, which tenants to fetch.
     */
    where?: tenantsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tenants to fetch.
     */
    orderBy?: tenantsOrderByWithRelationInput | tenantsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tenants.
     */
    cursor?: tenantsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tenants.
     */
    skip?: number
    distinct?: TenantsScalarFieldEnum | TenantsScalarFieldEnum[]
  }

  /**
   * tenants create
   */
  export type tenantsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * The data needed to create a tenants.
     */
    data: XOR<tenantsCreateInput, tenantsUncheckedCreateInput>
  }

  /**
   * tenants createMany
   */
  export type tenantsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tenants.
     */
    data: tenantsCreateManyInput | tenantsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tenants createManyAndReturn
   */
  export type tenantsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * The data used to create many tenants.
     */
    data: tenantsCreateManyInput | tenantsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tenants update
   */
  export type tenantsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * The data needed to update a tenants.
     */
    data: XOR<tenantsUpdateInput, tenantsUncheckedUpdateInput>
    /**
     * Choose, which tenants to update.
     */
    where: tenantsWhereUniqueInput
  }

  /**
   * tenants updateMany
   */
  export type tenantsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tenants.
     */
    data: XOR<tenantsUpdateManyMutationInput, tenantsUncheckedUpdateManyInput>
    /**
     * Filter which tenants to update
     */
    where?: tenantsWhereInput
    /**
     * Limit how many tenants to update.
     */
    limit?: number
  }

  /**
   * tenants updateManyAndReturn
   */
  export type tenantsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * The data used to update tenants.
     */
    data: XOR<tenantsUpdateManyMutationInput, tenantsUncheckedUpdateManyInput>
    /**
     * Filter which tenants to update
     */
    where?: tenantsWhereInput
    /**
     * Limit how many tenants to update.
     */
    limit?: number
  }

  /**
   * tenants upsert
   */
  export type tenantsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * The filter to search for the tenants to update in case it exists.
     */
    where: tenantsWhereUniqueInput
    /**
     * In case the tenants found by the `where` argument doesn't exist, create a new tenants with this data.
     */
    create: XOR<tenantsCreateInput, tenantsUncheckedCreateInput>
    /**
     * In case the tenants was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tenantsUpdateInput, tenantsUncheckedUpdateInput>
  }

  /**
   * tenants delete
   */
  export type tenantsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
    /**
     * Filter which tenants to delete.
     */
    where: tenantsWhereUniqueInput
  }

  /**
   * tenants deleteMany
   */
  export type tenantsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tenants to delete
     */
    where?: tenantsWhereInput
    /**
     * Limit how many tenants to delete.
     */
    limit?: number
  }

  /**
   * tenants.businesses
   */
  export type tenants$businessesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the businesses
     */
    select?: businessesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the businesses
     */
    omit?: businessesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: businessesInclude<ExtArgs> | null
    where?: businessesWhereInput
    orderBy?: businessesOrderByWithRelationInput | businessesOrderByWithRelationInput[]
    cursor?: businessesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BusinessesScalarFieldEnum | BusinessesScalarFieldEnum[]
  }

  /**
   * tenants without action
   */
  export type tenantsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tenants
     */
    select?: tenantsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tenants
     */
    omit?: tenantsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tenantsInclude<ExtArgs> | null
  }


  /**
   * Model roles
   */

  export type AggregateRoles = {
    _count: RolesCountAggregateOutputType | null
    _min: RolesMinAggregateOutputType | null
    _max: RolesMaxAggregateOutputType | null
  }

  export type RolesMinAggregateOutputType = {
    role_id: string | null
    role_name: string | null
    created_at: Date | null
  }

  export type RolesMaxAggregateOutputType = {
    role_id: string | null
    role_name: string | null
    created_at: Date | null
  }

  export type RolesCountAggregateOutputType = {
    role_id: number
    role_name: number
    permissions: number
    created_at: number
    _all: number
  }


  export type RolesMinAggregateInputType = {
    role_id?: true
    role_name?: true
    created_at?: true
  }

  export type RolesMaxAggregateInputType = {
    role_id?: true
    role_name?: true
    created_at?: true
  }

  export type RolesCountAggregateInputType = {
    role_id?: true
    role_name?: true
    permissions?: true
    created_at?: true
    _all?: true
  }

  export type RolesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which roles to aggregate.
     */
    where?: rolesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of roles to fetch.
     */
    orderBy?: rolesOrderByWithRelationInput | rolesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: rolesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned roles
    **/
    _count?: true | RolesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RolesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RolesMaxAggregateInputType
  }

  export type GetRolesAggregateType<T extends RolesAggregateArgs> = {
        [P in keyof T & keyof AggregateRoles]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoles[P]>
      : GetScalarType<T[P], AggregateRoles[P]>
  }




  export type rolesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: rolesWhereInput
    orderBy?: rolesOrderByWithAggregationInput | rolesOrderByWithAggregationInput[]
    by: RolesScalarFieldEnum[] | RolesScalarFieldEnum
    having?: rolesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RolesCountAggregateInputType | true
    _min?: RolesMinAggregateInputType
    _max?: RolesMaxAggregateInputType
  }

  export type RolesGroupByOutputType = {
    role_id: string
    role_name: string
    permissions: JsonValue | null
    created_at: Date
    _count: RolesCountAggregateOutputType | null
    _min: RolesMinAggregateOutputType | null
    _max: RolesMaxAggregateOutputType | null
  }

  type GetRolesGroupByPayload<T extends rolesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RolesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RolesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RolesGroupByOutputType[P]>
            : GetScalarType<T[P], RolesGroupByOutputType[P]>
        }
      >
    >


  export type rolesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    role_name?: boolean
    permissions?: boolean
    created_at?: boolean
    users?: boolean | roles$usersArgs<ExtArgs>
    _count?: boolean | RolesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["roles"]>

  export type rolesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    role_name?: boolean
    permissions?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["roles"]>

  export type rolesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    role_name?: boolean
    permissions?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["roles"]>

  export type rolesSelectScalar = {
    role_id?: boolean
    role_name?: boolean
    permissions?: boolean
    created_at?: boolean
  }

  export type rolesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"role_id" | "role_name" | "permissions" | "created_at", ExtArgs["result"]["roles"]>
  export type rolesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | roles$usersArgs<ExtArgs>
    _count?: boolean | RolesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type rolesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type rolesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $rolesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "roles"
    objects: {
      users: Prisma.$usersPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      role_id: string
      role_name: string
      permissions: Prisma.JsonValue | null
      created_at: Date
    }, ExtArgs["result"]["roles"]>
    composites: {}
  }

  type rolesGetPayload<S extends boolean | null | undefined | rolesDefaultArgs> = $Result.GetResult<Prisma.$rolesPayload, S>

  type rolesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<rolesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RolesCountAggregateInputType | true
    }

  export interface rolesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['roles'], meta: { name: 'roles' } }
    /**
     * Find zero or one Roles that matches the filter.
     * @param {rolesFindUniqueArgs} args - Arguments to find a Roles
     * @example
     * // Get one Roles
     * const roles = await prisma.roles.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends rolesFindUniqueArgs>(args: SelectSubset<T, rolesFindUniqueArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Roles that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {rolesFindUniqueOrThrowArgs} args - Arguments to find a Roles
     * @example
     * // Get one Roles
     * const roles = await prisma.roles.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends rolesFindUniqueOrThrowArgs>(args: SelectSubset<T, rolesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Roles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rolesFindFirstArgs} args - Arguments to find a Roles
     * @example
     * // Get one Roles
     * const roles = await prisma.roles.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends rolesFindFirstArgs>(args?: SelectSubset<T, rolesFindFirstArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Roles that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rolesFindFirstOrThrowArgs} args - Arguments to find a Roles
     * @example
     * // Get one Roles
     * const roles = await prisma.roles.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends rolesFindFirstOrThrowArgs>(args?: SelectSubset<T, rolesFindFirstOrThrowArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Roles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rolesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Roles
     * const roles = await prisma.roles.findMany()
     * 
     * // Get first 10 Roles
     * const roles = await prisma.roles.findMany({ take: 10 })
     * 
     * // Only select the `role_id`
     * const rolesWithRole_idOnly = await prisma.roles.findMany({ select: { role_id: true } })
     * 
     */
    findMany<T extends rolesFindManyArgs>(args?: SelectSubset<T, rolesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Roles.
     * @param {rolesCreateArgs} args - Arguments to create a Roles.
     * @example
     * // Create one Roles
     * const Roles = await prisma.roles.create({
     *   data: {
     *     // ... data to create a Roles
     *   }
     * })
     * 
     */
    create<T extends rolesCreateArgs>(args: SelectSubset<T, rolesCreateArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Roles.
     * @param {rolesCreateManyArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const roles = await prisma.roles.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends rolesCreateManyArgs>(args?: SelectSubset<T, rolesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Roles and returns the data saved in the database.
     * @param {rolesCreateManyAndReturnArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const roles = await prisma.roles.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Roles and only return the `role_id`
     * const rolesWithRole_idOnly = await prisma.roles.createManyAndReturn({
     *   select: { role_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends rolesCreateManyAndReturnArgs>(args?: SelectSubset<T, rolesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Roles.
     * @param {rolesDeleteArgs} args - Arguments to delete one Roles.
     * @example
     * // Delete one Roles
     * const Roles = await prisma.roles.delete({
     *   where: {
     *     // ... filter to delete one Roles
     *   }
     * })
     * 
     */
    delete<T extends rolesDeleteArgs>(args: SelectSubset<T, rolesDeleteArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Roles.
     * @param {rolesUpdateArgs} args - Arguments to update one Roles.
     * @example
     * // Update one Roles
     * const roles = await prisma.roles.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends rolesUpdateArgs>(args: SelectSubset<T, rolesUpdateArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Roles.
     * @param {rolesDeleteManyArgs} args - Arguments to filter Roles to delete.
     * @example
     * // Delete a few Roles
     * const { count } = await prisma.roles.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends rolesDeleteManyArgs>(args?: SelectSubset<T, rolesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rolesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Roles
     * const roles = await prisma.roles.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends rolesUpdateManyArgs>(args: SelectSubset<T, rolesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles and returns the data updated in the database.
     * @param {rolesUpdateManyAndReturnArgs} args - Arguments to update many Roles.
     * @example
     * // Update many Roles
     * const roles = await prisma.roles.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Roles and only return the `role_id`
     * const rolesWithRole_idOnly = await prisma.roles.updateManyAndReturn({
     *   select: { role_id: true },
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
    updateManyAndReturn<T extends rolesUpdateManyAndReturnArgs>(args: SelectSubset<T, rolesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Roles.
     * @param {rolesUpsertArgs} args - Arguments to update or create a Roles.
     * @example
     * // Update or create a Roles
     * const roles = await prisma.roles.upsert({
     *   create: {
     *     // ... data to create a Roles
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Roles we want to update
     *   }
     * })
     */
    upsert<T extends rolesUpsertArgs>(args: SelectSubset<T, rolesUpsertArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rolesCountArgs} args - Arguments to filter Roles to count.
     * @example
     * // Count the number of Roles
     * const count = await prisma.roles.count({
     *   where: {
     *     // ... the filter for the Roles we want to count
     *   }
     * })
    **/
    count<T extends rolesCountArgs>(
      args?: Subset<T, rolesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RolesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RolesAggregateArgs>(args: Subset<T, RolesAggregateArgs>): Prisma.PrismaPromise<GetRolesAggregateType<T>>

    /**
     * Group by Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {rolesGroupByArgs} args - Group by arguments.
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
      T extends rolesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: rolesGroupByArgs['orderBy'] }
        : { orderBy?: rolesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, rolesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRolesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the roles model
   */
  readonly fields: rolesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for roles.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__rolesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends roles$usersArgs<ExtArgs> = {}>(args?: Subset<T, roles$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the roles model
   */
  interface rolesFieldRefs {
    readonly role_id: FieldRef<"roles", 'String'>
    readonly role_name: FieldRef<"roles", 'String'>
    readonly permissions: FieldRef<"roles", 'Json'>
    readonly created_at: FieldRef<"roles", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * roles findUnique
   */
  export type rolesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * Filter, which roles to fetch.
     */
    where: rolesWhereUniqueInput
  }

  /**
   * roles findUniqueOrThrow
   */
  export type rolesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * Filter, which roles to fetch.
     */
    where: rolesWhereUniqueInput
  }

  /**
   * roles findFirst
   */
  export type rolesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * Filter, which roles to fetch.
     */
    where?: rolesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of roles to fetch.
     */
    orderBy?: rolesOrderByWithRelationInput | rolesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for roles.
     */
    cursor?: rolesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of roles.
     */
    distinct?: RolesScalarFieldEnum | RolesScalarFieldEnum[]
  }

  /**
   * roles findFirstOrThrow
   */
  export type rolesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * Filter, which roles to fetch.
     */
    where?: rolesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of roles to fetch.
     */
    orderBy?: rolesOrderByWithRelationInput | rolesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for roles.
     */
    cursor?: rolesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of roles.
     */
    distinct?: RolesScalarFieldEnum | RolesScalarFieldEnum[]
  }

  /**
   * roles findMany
   */
  export type rolesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * Filter, which roles to fetch.
     */
    where?: rolesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of roles to fetch.
     */
    orderBy?: rolesOrderByWithRelationInput | rolesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing roles.
     */
    cursor?: rolesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` roles.
     */
    skip?: number
    distinct?: RolesScalarFieldEnum | RolesScalarFieldEnum[]
  }

  /**
   * roles create
   */
  export type rolesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * The data needed to create a roles.
     */
    data: XOR<rolesCreateInput, rolesUncheckedCreateInput>
  }

  /**
   * roles createMany
   */
  export type rolesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many roles.
     */
    data: rolesCreateManyInput | rolesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * roles createManyAndReturn
   */
  export type rolesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * The data used to create many roles.
     */
    data: rolesCreateManyInput | rolesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * roles update
   */
  export type rolesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * The data needed to update a roles.
     */
    data: XOR<rolesUpdateInput, rolesUncheckedUpdateInput>
    /**
     * Choose, which roles to update.
     */
    where: rolesWhereUniqueInput
  }

  /**
   * roles updateMany
   */
  export type rolesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update roles.
     */
    data: XOR<rolesUpdateManyMutationInput, rolesUncheckedUpdateManyInput>
    /**
     * Filter which roles to update
     */
    where?: rolesWhereInput
    /**
     * Limit how many roles to update.
     */
    limit?: number
  }

  /**
   * roles updateManyAndReturn
   */
  export type rolesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * The data used to update roles.
     */
    data: XOR<rolesUpdateManyMutationInput, rolesUncheckedUpdateManyInput>
    /**
     * Filter which roles to update
     */
    where?: rolesWhereInput
    /**
     * Limit how many roles to update.
     */
    limit?: number
  }

  /**
   * roles upsert
   */
  export type rolesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * The filter to search for the roles to update in case it exists.
     */
    where: rolesWhereUniqueInput
    /**
     * In case the roles found by the `where` argument doesn't exist, create a new roles with this data.
     */
    create: XOR<rolesCreateInput, rolesUncheckedCreateInput>
    /**
     * In case the roles was found with the provided `where` argument, update it with this data.
     */
    update: XOR<rolesUpdateInput, rolesUncheckedUpdateInput>
  }

  /**
   * roles delete
   */
  export type rolesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
    /**
     * Filter which roles to delete.
     */
    where: rolesWhereUniqueInput
  }

  /**
   * roles deleteMany
   */
  export type rolesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which roles to delete
     */
    where?: rolesWhereInput
    /**
     * Limit how many roles to delete.
     */
    limit?: number
  }

  /**
   * roles.users
   */
  export type roles$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    where?: usersWhereInput
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    cursor?: usersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * roles without action
   */
  export type rolesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the roles
     */
    select?: rolesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the roles
     */
    omit?: rolesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: rolesInclude<ExtArgs> | null
  }


  /**
   * Model role_intents
   */

  export type AggregateRole_intents = {
    _count: Role_intentsCountAggregateOutputType | null
    _min: Role_intentsMinAggregateOutputType | null
    _max: Role_intentsMaxAggregateOutputType | null
  }

  export type Role_intentsMinAggregateOutputType = {
    role_id: string | null
    intent_id: string | null
    created_at: Date | null
  }

  export type Role_intentsMaxAggregateOutputType = {
    role_id: string | null
    intent_id: string | null
    created_at: Date | null
  }

  export type Role_intentsCountAggregateOutputType = {
    role_id: number
    intent_id: number
    created_at: number
    _all: number
  }


  export type Role_intentsMinAggregateInputType = {
    role_id?: true
    intent_id?: true
    created_at?: true
  }

  export type Role_intentsMaxAggregateInputType = {
    role_id?: true
    intent_id?: true
    created_at?: true
  }

  export type Role_intentsCountAggregateInputType = {
    role_id?: true
    intent_id?: true
    created_at?: true
    _all?: true
  }

  export type Role_intentsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which role_intents to aggregate.
     */
    where?: role_intentsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of role_intents to fetch.
     */
    orderBy?: role_intentsOrderByWithRelationInput | role_intentsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: role_intentsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` role_intents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` role_intents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned role_intents
    **/
    _count?: true | Role_intentsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Role_intentsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Role_intentsMaxAggregateInputType
  }

  export type GetRole_intentsAggregateType<T extends Role_intentsAggregateArgs> = {
        [P in keyof T & keyof AggregateRole_intents]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRole_intents[P]>
      : GetScalarType<T[P], AggregateRole_intents[P]>
  }




  export type role_intentsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: role_intentsWhereInput
    orderBy?: role_intentsOrderByWithAggregationInput | role_intentsOrderByWithAggregationInput[]
    by: Role_intentsScalarFieldEnum[] | Role_intentsScalarFieldEnum
    having?: role_intentsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Role_intentsCountAggregateInputType | true
    _min?: Role_intentsMinAggregateInputType
    _max?: Role_intentsMaxAggregateInputType
  }

  export type Role_intentsGroupByOutputType = {
    role_id: string
    intent_id: string
    created_at: Date | null
    _count: Role_intentsCountAggregateOutputType | null
    _min: Role_intentsMinAggregateOutputType | null
    _max: Role_intentsMaxAggregateOutputType | null
  }

  type GetRole_intentsGroupByPayload<T extends role_intentsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Role_intentsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Role_intentsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Role_intentsGroupByOutputType[P]>
            : GetScalarType<T[P], Role_intentsGroupByOutputType[P]>
        }
      >
    >


  export type role_intentsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    intent_id?: boolean
    created_at?: boolean
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["role_intents"]>

  export type role_intentsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    intent_id?: boolean
    created_at?: boolean
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["role_intents"]>

  export type role_intentsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    role_id?: boolean
    intent_id?: boolean
    created_at?: boolean
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["role_intents"]>

  export type role_intentsSelectScalar = {
    role_id?: boolean
    intent_id?: boolean
    created_at?: boolean
  }

  export type role_intentsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"role_id" | "intent_id" | "created_at", ExtArgs["result"]["role_intents"]>
  export type role_intentsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }
  export type role_intentsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }
  export type role_intentsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }

  export type $role_intentsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "role_intents"
    objects: {
      intent: Prisma.$intentsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      role_id: string
      intent_id: string
      created_at: Date | null
    }, ExtArgs["result"]["role_intents"]>
    composites: {}
  }

  type role_intentsGetPayload<S extends boolean | null | undefined | role_intentsDefaultArgs> = $Result.GetResult<Prisma.$role_intentsPayload, S>

  type role_intentsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<role_intentsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Role_intentsCountAggregateInputType | true
    }

  export interface role_intentsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['role_intents'], meta: { name: 'role_intents' } }
    /**
     * Find zero or one Role_intents that matches the filter.
     * @param {role_intentsFindUniqueArgs} args - Arguments to find a Role_intents
     * @example
     * // Get one Role_intents
     * const role_intents = await prisma.role_intents.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends role_intentsFindUniqueArgs>(args: SelectSubset<T, role_intentsFindUniqueArgs<ExtArgs>>): Prisma__role_intentsClient<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Role_intents that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {role_intentsFindUniqueOrThrowArgs} args - Arguments to find a Role_intents
     * @example
     * // Get one Role_intents
     * const role_intents = await prisma.role_intents.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends role_intentsFindUniqueOrThrowArgs>(args: SelectSubset<T, role_intentsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__role_intentsClient<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Role_intents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {role_intentsFindFirstArgs} args - Arguments to find a Role_intents
     * @example
     * // Get one Role_intents
     * const role_intents = await prisma.role_intents.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends role_intentsFindFirstArgs>(args?: SelectSubset<T, role_intentsFindFirstArgs<ExtArgs>>): Prisma__role_intentsClient<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Role_intents that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {role_intentsFindFirstOrThrowArgs} args - Arguments to find a Role_intents
     * @example
     * // Get one Role_intents
     * const role_intents = await prisma.role_intents.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends role_intentsFindFirstOrThrowArgs>(args?: SelectSubset<T, role_intentsFindFirstOrThrowArgs<ExtArgs>>): Prisma__role_intentsClient<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Role_intents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {role_intentsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Role_intents
     * const role_intents = await prisma.role_intents.findMany()
     * 
     * // Get first 10 Role_intents
     * const role_intents = await prisma.role_intents.findMany({ take: 10 })
     * 
     * // Only select the `role_id`
     * const role_intentsWithRole_idOnly = await prisma.role_intents.findMany({ select: { role_id: true } })
     * 
     */
    findMany<T extends role_intentsFindManyArgs>(args?: SelectSubset<T, role_intentsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Role_intents.
     * @param {role_intentsCreateArgs} args - Arguments to create a Role_intents.
     * @example
     * // Create one Role_intents
     * const Role_intents = await prisma.role_intents.create({
     *   data: {
     *     // ... data to create a Role_intents
     *   }
     * })
     * 
     */
    create<T extends role_intentsCreateArgs>(args: SelectSubset<T, role_intentsCreateArgs<ExtArgs>>): Prisma__role_intentsClient<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Role_intents.
     * @param {role_intentsCreateManyArgs} args - Arguments to create many Role_intents.
     * @example
     * // Create many Role_intents
     * const role_intents = await prisma.role_intents.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends role_intentsCreateManyArgs>(args?: SelectSubset<T, role_intentsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Role_intents and returns the data saved in the database.
     * @param {role_intentsCreateManyAndReturnArgs} args - Arguments to create many Role_intents.
     * @example
     * // Create many Role_intents
     * const role_intents = await prisma.role_intents.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Role_intents and only return the `role_id`
     * const role_intentsWithRole_idOnly = await prisma.role_intents.createManyAndReturn({
     *   select: { role_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends role_intentsCreateManyAndReturnArgs>(args?: SelectSubset<T, role_intentsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Role_intents.
     * @param {role_intentsDeleteArgs} args - Arguments to delete one Role_intents.
     * @example
     * // Delete one Role_intents
     * const Role_intents = await prisma.role_intents.delete({
     *   where: {
     *     // ... filter to delete one Role_intents
     *   }
     * })
     * 
     */
    delete<T extends role_intentsDeleteArgs>(args: SelectSubset<T, role_intentsDeleteArgs<ExtArgs>>): Prisma__role_intentsClient<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Role_intents.
     * @param {role_intentsUpdateArgs} args - Arguments to update one Role_intents.
     * @example
     * // Update one Role_intents
     * const role_intents = await prisma.role_intents.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends role_intentsUpdateArgs>(args: SelectSubset<T, role_intentsUpdateArgs<ExtArgs>>): Prisma__role_intentsClient<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Role_intents.
     * @param {role_intentsDeleteManyArgs} args - Arguments to filter Role_intents to delete.
     * @example
     * // Delete a few Role_intents
     * const { count } = await prisma.role_intents.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends role_intentsDeleteManyArgs>(args?: SelectSubset<T, role_intentsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Role_intents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {role_intentsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Role_intents
     * const role_intents = await prisma.role_intents.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends role_intentsUpdateManyArgs>(args: SelectSubset<T, role_intentsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Role_intents and returns the data updated in the database.
     * @param {role_intentsUpdateManyAndReturnArgs} args - Arguments to update many Role_intents.
     * @example
     * // Update many Role_intents
     * const role_intents = await prisma.role_intents.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Role_intents and only return the `role_id`
     * const role_intentsWithRole_idOnly = await prisma.role_intents.updateManyAndReturn({
     *   select: { role_id: true },
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
    updateManyAndReturn<T extends role_intentsUpdateManyAndReturnArgs>(args: SelectSubset<T, role_intentsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Role_intents.
     * @param {role_intentsUpsertArgs} args - Arguments to update or create a Role_intents.
     * @example
     * // Update or create a Role_intents
     * const role_intents = await prisma.role_intents.upsert({
     *   create: {
     *     // ... data to create a Role_intents
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Role_intents we want to update
     *   }
     * })
     */
    upsert<T extends role_intentsUpsertArgs>(args: SelectSubset<T, role_intentsUpsertArgs<ExtArgs>>): Prisma__role_intentsClient<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Role_intents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {role_intentsCountArgs} args - Arguments to filter Role_intents to count.
     * @example
     * // Count the number of Role_intents
     * const count = await prisma.role_intents.count({
     *   where: {
     *     // ... the filter for the Role_intents we want to count
     *   }
     * })
    **/
    count<T extends role_intentsCountArgs>(
      args?: Subset<T, role_intentsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Role_intentsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Role_intents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Role_intentsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Role_intentsAggregateArgs>(args: Subset<T, Role_intentsAggregateArgs>): Prisma.PrismaPromise<GetRole_intentsAggregateType<T>>

    /**
     * Group by Role_intents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {role_intentsGroupByArgs} args - Group by arguments.
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
      T extends role_intentsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: role_intentsGroupByArgs['orderBy'] }
        : { orderBy?: role_intentsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, role_intentsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRole_intentsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the role_intents model
   */
  readonly fields: role_intentsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for role_intents.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__role_intentsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    intent<T extends intentsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, intentsDefaultArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the role_intents model
   */
  interface role_intentsFieldRefs {
    readonly role_id: FieldRef<"role_intents", 'String'>
    readonly intent_id: FieldRef<"role_intents", 'String'>
    readonly created_at: FieldRef<"role_intents", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * role_intents findUnique
   */
  export type role_intentsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * Filter, which role_intents to fetch.
     */
    where: role_intentsWhereUniqueInput
  }

  /**
   * role_intents findUniqueOrThrow
   */
  export type role_intentsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * Filter, which role_intents to fetch.
     */
    where: role_intentsWhereUniqueInput
  }

  /**
   * role_intents findFirst
   */
  export type role_intentsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * Filter, which role_intents to fetch.
     */
    where?: role_intentsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of role_intents to fetch.
     */
    orderBy?: role_intentsOrderByWithRelationInput | role_intentsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for role_intents.
     */
    cursor?: role_intentsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` role_intents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` role_intents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of role_intents.
     */
    distinct?: Role_intentsScalarFieldEnum | Role_intentsScalarFieldEnum[]
  }

  /**
   * role_intents findFirstOrThrow
   */
  export type role_intentsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * Filter, which role_intents to fetch.
     */
    where?: role_intentsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of role_intents to fetch.
     */
    orderBy?: role_intentsOrderByWithRelationInput | role_intentsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for role_intents.
     */
    cursor?: role_intentsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` role_intents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` role_intents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of role_intents.
     */
    distinct?: Role_intentsScalarFieldEnum | Role_intentsScalarFieldEnum[]
  }

  /**
   * role_intents findMany
   */
  export type role_intentsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * Filter, which role_intents to fetch.
     */
    where?: role_intentsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of role_intents to fetch.
     */
    orderBy?: role_intentsOrderByWithRelationInput | role_intentsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing role_intents.
     */
    cursor?: role_intentsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` role_intents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` role_intents.
     */
    skip?: number
    distinct?: Role_intentsScalarFieldEnum | Role_intentsScalarFieldEnum[]
  }

  /**
   * role_intents create
   */
  export type role_intentsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * The data needed to create a role_intents.
     */
    data: XOR<role_intentsCreateInput, role_intentsUncheckedCreateInput>
  }

  /**
   * role_intents createMany
   */
  export type role_intentsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many role_intents.
     */
    data: role_intentsCreateManyInput | role_intentsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * role_intents createManyAndReturn
   */
  export type role_intentsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * The data used to create many role_intents.
     */
    data: role_intentsCreateManyInput | role_intentsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * role_intents update
   */
  export type role_intentsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * The data needed to update a role_intents.
     */
    data: XOR<role_intentsUpdateInput, role_intentsUncheckedUpdateInput>
    /**
     * Choose, which role_intents to update.
     */
    where: role_intentsWhereUniqueInput
  }

  /**
   * role_intents updateMany
   */
  export type role_intentsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update role_intents.
     */
    data: XOR<role_intentsUpdateManyMutationInput, role_intentsUncheckedUpdateManyInput>
    /**
     * Filter which role_intents to update
     */
    where?: role_intentsWhereInput
    /**
     * Limit how many role_intents to update.
     */
    limit?: number
  }

  /**
   * role_intents updateManyAndReturn
   */
  export type role_intentsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * The data used to update role_intents.
     */
    data: XOR<role_intentsUpdateManyMutationInput, role_intentsUncheckedUpdateManyInput>
    /**
     * Filter which role_intents to update
     */
    where?: role_intentsWhereInput
    /**
     * Limit how many role_intents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * role_intents upsert
   */
  export type role_intentsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * The filter to search for the role_intents to update in case it exists.
     */
    where: role_intentsWhereUniqueInput
    /**
     * In case the role_intents found by the `where` argument doesn't exist, create a new role_intents with this data.
     */
    create: XOR<role_intentsCreateInput, role_intentsUncheckedCreateInput>
    /**
     * In case the role_intents was found with the provided `where` argument, update it with this data.
     */
    update: XOR<role_intentsUpdateInput, role_intentsUncheckedUpdateInput>
  }

  /**
   * role_intents delete
   */
  export type role_intentsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    /**
     * Filter which role_intents to delete.
     */
    where: role_intentsWhereUniqueInput
  }

  /**
   * role_intents deleteMany
   */
  export type role_intentsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which role_intents to delete
     */
    where?: role_intentsWhereInput
    /**
     * Limit how many role_intents to delete.
     */
    limit?: number
  }

  /**
   * role_intents without action
   */
  export type role_intentsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
  }


  /**
   * Model intents
   */

  export type AggregateIntents = {
    _count: IntentsCountAggregateOutputType | null
    _min: IntentsMinAggregateOutputType | null
    _max: IntentsMaxAggregateOutputType | null
  }

  export type IntentsMinAggregateOutputType = {
    intent_id: string | null
    intent_name: string | null
    created_at: Date | null
  }

  export type IntentsMaxAggregateOutputType = {
    intent_id: string | null
    intent_name: string | null
    created_at: Date | null
  }

  export type IntentsCountAggregateOutputType = {
    intent_id: number
    intent_name: number
    created_at: number
    _all: number
  }


  export type IntentsMinAggregateInputType = {
    intent_id?: true
    intent_name?: true
    created_at?: true
  }

  export type IntentsMaxAggregateInputType = {
    intent_id?: true
    intent_name?: true
    created_at?: true
  }

  export type IntentsCountAggregateInputType = {
    intent_id?: true
    intent_name?: true
    created_at?: true
    _all?: true
  }

  export type IntentsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which intents to aggregate.
     */
    where?: intentsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of intents to fetch.
     */
    orderBy?: intentsOrderByWithRelationInput | intentsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: intentsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` intents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` intents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned intents
    **/
    _count?: true | IntentsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntentsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntentsMaxAggregateInputType
  }

  export type GetIntentsAggregateType<T extends IntentsAggregateArgs> = {
        [P in keyof T & keyof AggregateIntents]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntents[P]>
      : GetScalarType<T[P], AggregateIntents[P]>
  }




  export type intentsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: intentsWhereInput
    orderBy?: intentsOrderByWithAggregationInput | intentsOrderByWithAggregationInput[]
    by: IntentsScalarFieldEnum[] | IntentsScalarFieldEnum
    having?: intentsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntentsCountAggregateInputType | true
    _min?: IntentsMinAggregateInputType
    _max?: IntentsMaxAggregateInputType
  }

  export type IntentsGroupByOutputType = {
    intent_id: string
    intent_name: string
    created_at: Date | null
    _count: IntentsCountAggregateOutputType | null
    _min: IntentsMinAggregateOutputType | null
    _max: IntentsMaxAggregateOutputType | null
  }

  type GetIntentsGroupByPayload<T extends intentsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntentsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntentsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntentsGroupByOutputType[P]>
            : GetScalarType<T[P], IntentsGroupByOutputType[P]>
        }
      >
    >


  export type intentsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    intent_id?: boolean
    intent_name?: boolean
    created_at?: boolean
    role_intents?: boolean | intents$role_intentsArgs<ExtArgs>
    notifications?: boolean | intents$notificationsArgs<ExtArgs>
    _count?: boolean | IntentsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["intents"]>

  export type intentsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    intent_id?: boolean
    intent_name?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["intents"]>

  export type intentsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    intent_id?: boolean
    intent_name?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["intents"]>

  export type intentsSelectScalar = {
    intent_id?: boolean
    intent_name?: boolean
    created_at?: boolean
  }

  export type intentsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"intent_id" | "intent_name" | "created_at", ExtArgs["result"]["intents"]>
  export type intentsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    role_intents?: boolean | intents$role_intentsArgs<ExtArgs>
    notifications?: boolean | intents$notificationsArgs<ExtArgs>
    _count?: boolean | IntentsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type intentsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type intentsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $intentsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "intents"
    objects: {
      role_intents: Prisma.$role_intentsPayload<ExtArgs>[]
      notifications: Prisma.$notificationsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      intent_id: string
      intent_name: string
      created_at: Date | null
    }, ExtArgs["result"]["intents"]>
    composites: {}
  }

  type intentsGetPayload<S extends boolean | null | undefined | intentsDefaultArgs> = $Result.GetResult<Prisma.$intentsPayload, S>

  type intentsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<intentsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IntentsCountAggregateInputType | true
    }

  export interface intentsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['intents'], meta: { name: 'intents' } }
    /**
     * Find zero or one Intents that matches the filter.
     * @param {intentsFindUniqueArgs} args - Arguments to find a Intents
     * @example
     * // Get one Intents
     * const intents = await prisma.intents.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends intentsFindUniqueArgs>(args: SelectSubset<T, intentsFindUniqueArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Intents that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {intentsFindUniqueOrThrowArgs} args - Arguments to find a Intents
     * @example
     * // Get one Intents
     * const intents = await prisma.intents.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends intentsFindUniqueOrThrowArgs>(args: SelectSubset<T, intentsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Intents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {intentsFindFirstArgs} args - Arguments to find a Intents
     * @example
     * // Get one Intents
     * const intents = await prisma.intents.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends intentsFindFirstArgs>(args?: SelectSubset<T, intentsFindFirstArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Intents that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {intentsFindFirstOrThrowArgs} args - Arguments to find a Intents
     * @example
     * // Get one Intents
     * const intents = await prisma.intents.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends intentsFindFirstOrThrowArgs>(args?: SelectSubset<T, intentsFindFirstOrThrowArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Intents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {intentsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Intents
     * const intents = await prisma.intents.findMany()
     * 
     * // Get first 10 Intents
     * const intents = await prisma.intents.findMany({ take: 10 })
     * 
     * // Only select the `intent_id`
     * const intentsWithIntent_idOnly = await prisma.intents.findMany({ select: { intent_id: true } })
     * 
     */
    findMany<T extends intentsFindManyArgs>(args?: SelectSubset<T, intentsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Intents.
     * @param {intentsCreateArgs} args - Arguments to create a Intents.
     * @example
     * // Create one Intents
     * const Intents = await prisma.intents.create({
     *   data: {
     *     // ... data to create a Intents
     *   }
     * })
     * 
     */
    create<T extends intentsCreateArgs>(args: SelectSubset<T, intentsCreateArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Intents.
     * @param {intentsCreateManyArgs} args - Arguments to create many Intents.
     * @example
     * // Create many Intents
     * const intents = await prisma.intents.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends intentsCreateManyArgs>(args?: SelectSubset<T, intentsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Intents and returns the data saved in the database.
     * @param {intentsCreateManyAndReturnArgs} args - Arguments to create many Intents.
     * @example
     * // Create many Intents
     * const intents = await prisma.intents.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Intents and only return the `intent_id`
     * const intentsWithIntent_idOnly = await prisma.intents.createManyAndReturn({
     *   select: { intent_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends intentsCreateManyAndReturnArgs>(args?: SelectSubset<T, intentsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Intents.
     * @param {intentsDeleteArgs} args - Arguments to delete one Intents.
     * @example
     * // Delete one Intents
     * const Intents = await prisma.intents.delete({
     *   where: {
     *     // ... filter to delete one Intents
     *   }
     * })
     * 
     */
    delete<T extends intentsDeleteArgs>(args: SelectSubset<T, intentsDeleteArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Intents.
     * @param {intentsUpdateArgs} args - Arguments to update one Intents.
     * @example
     * // Update one Intents
     * const intents = await prisma.intents.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends intentsUpdateArgs>(args: SelectSubset<T, intentsUpdateArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Intents.
     * @param {intentsDeleteManyArgs} args - Arguments to filter Intents to delete.
     * @example
     * // Delete a few Intents
     * const { count } = await prisma.intents.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends intentsDeleteManyArgs>(args?: SelectSubset<T, intentsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Intents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {intentsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Intents
     * const intents = await prisma.intents.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends intentsUpdateManyArgs>(args: SelectSubset<T, intentsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Intents and returns the data updated in the database.
     * @param {intentsUpdateManyAndReturnArgs} args - Arguments to update many Intents.
     * @example
     * // Update many Intents
     * const intents = await prisma.intents.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Intents and only return the `intent_id`
     * const intentsWithIntent_idOnly = await prisma.intents.updateManyAndReturn({
     *   select: { intent_id: true },
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
    updateManyAndReturn<T extends intentsUpdateManyAndReturnArgs>(args: SelectSubset<T, intentsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Intents.
     * @param {intentsUpsertArgs} args - Arguments to update or create a Intents.
     * @example
     * // Update or create a Intents
     * const intents = await prisma.intents.upsert({
     *   create: {
     *     // ... data to create a Intents
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Intents we want to update
     *   }
     * })
     */
    upsert<T extends intentsUpsertArgs>(args: SelectSubset<T, intentsUpsertArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Intents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {intentsCountArgs} args - Arguments to filter Intents to count.
     * @example
     * // Count the number of Intents
     * const count = await prisma.intents.count({
     *   where: {
     *     // ... the filter for the Intents we want to count
     *   }
     * })
    **/
    count<T extends intentsCountArgs>(
      args?: Subset<T, intentsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntentsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Intents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntentsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IntentsAggregateArgs>(args: Subset<T, IntentsAggregateArgs>): Prisma.PrismaPromise<GetIntentsAggregateType<T>>

    /**
     * Group by Intents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {intentsGroupByArgs} args - Group by arguments.
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
      T extends intentsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: intentsGroupByArgs['orderBy'] }
        : { orderBy?: intentsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, intentsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntentsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the intents model
   */
  readonly fields: intentsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for intents.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__intentsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    role_intents<T extends intents$role_intentsArgs<ExtArgs> = {}>(args?: Subset<T, intents$role_intentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$role_intentsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notifications<T extends intents$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, intents$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the intents model
   */
  interface intentsFieldRefs {
    readonly intent_id: FieldRef<"intents", 'String'>
    readonly intent_name: FieldRef<"intents", 'String'>
    readonly created_at: FieldRef<"intents", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * intents findUnique
   */
  export type intentsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * Filter, which intents to fetch.
     */
    where: intentsWhereUniqueInput
  }

  /**
   * intents findUniqueOrThrow
   */
  export type intentsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * Filter, which intents to fetch.
     */
    where: intentsWhereUniqueInput
  }

  /**
   * intents findFirst
   */
  export type intentsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * Filter, which intents to fetch.
     */
    where?: intentsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of intents to fetch.
     */
    orderBy?: intentsOrderByWithRelationInput | intentsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for intents.
     */
    cursor?: intentsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` intents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` intents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of intents.
     */
    distinct?: IntentsScalarFieldEnum | IntentsScalarFieldEnum[]
  }

  /**
   * intents findFirstOrThrow
   */
  export type intentsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * Filter, which intents to fetch.
     */
    where?: intentsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of intents to fetch.
     */
    orderBy?: intentsOrderByWithRelationInput | intentsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for intents.
     */
    cursor?: intentsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` intents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` intents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of intents.
     */
    distinct?: IntentsScalarFieldEnum | IntentsScalarFieldEnum[]
  }

  /**
   * intents findMany
   */
  export type intentsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * Filter, which intents to fetch.
     */
    where?: intentsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of intents to fetch.
     */
    orderBy?: intentsOrderByWithRelationInput | intentsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing intents.
     */
    cursor?: intentsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` intents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` intents.
     */
    skip?: number
    distinct?: IntentsScalarFieldEnum | IntentsScalarFieldEnum[]
  }

  /**
   * intents create
   */
  export type intentsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * The data needed to create a intents.
     */
    data: XOR<intentsCreateInput, intentsUncheckedCreateInput>
  }

  /**
   * intents createMany
   */
  export type intentsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many intents.
     */
    data: intentsCreateManyInput | intentsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * intents createManyAndReturn
   */
  export type intentsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * The data used to create many intents.
     */
    data: intentsCreateManyInput | intentsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * intents update
   */
  export type intentsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * The data needed to update a intents.
     */
    data: XOR<intentsUpdateInput, intentsUncheckedUpdateInput>
    /**
     * Choose, which intents to update.
     */
    where: intentsWhereUniqueInput
  }

  /**
   * intents updateMany
   */
  export type intentsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update intents.
     */
    data: XOR<intentsUpdateManyMutationInput, intentsUncheckedUpdateManyInput>
    /**
     * Filter which intents to update
     */
    where?: intentsWhereInput
    /**
     * Limit how many intents to update.
     */
    limit?: number
  }

  /**
   * intents updateManyAndReturn
   */
  export type intentsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * The data used to update intents.
     */
    data: XOR<intentsUpdateManyMutationInput, intentsUncheckedUpdateManyInput>
    /**
     * Filter which intents to update
     */
    where?: intentsWhereInput
    /**
     * Limit how many intents to update.
     */
    limit?: number
  }

  /**
   * intents upsert
   */
  export type intentsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * The filter to search for the intents to update in case it exists.
     */
    where: intentsWhereUniqueInput
    /**
     * In case the intents found by the `where` argument doesn't exist, create a new intents with this data.
     */
    create: XOR<intentsCreateInput, intentsUncheckedCreateInput>
    /**
     * In case the intents was found with the provided `where` argument, update it with this data.
     */
    update: XOR<intentsUpdateInput, intentsUncheckedUpdateInput>
  }

  /**
   * intents delete
   */
  export type intentsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
    /**
     * Filter which intents to delete.
     */
    where: intentsWhereUniqueInput
  }

  /**
   * intents deleteMany
   */
  export type intentsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which intents to delete
     */
    where?: intentsWhereInput
    /**
     * Limit how many intents to delete.
     */
    limit?: number
  }

  /**
   * intents.role_intents
   */
  export type intents$role_intentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the role_intents
     */
    select?: role_intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the role_intents
     */
    omit?: role_intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: role_intentsInclude<ExtArgs> | null
    where?: role_intentsWhereInput
    orderBy?: role_intentsOrderByWithRelationInput | role_intentsOrderByWithRelationInput[]
    cursor?: role_intentsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Role_intentsScalarFieldEnum | Role_intentsScalarFieldEnum[]
  }

  /**
   * intents.notifications
   */
  export type intents$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    where?: notificationsWhereInput
    orderBy?: notificationsOrderByWithRelationInput | notificationsOrderByWithRelationInput[]
    cursor?: notificationsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationsScalarFieldEnum | NotificationsScalarFieldEnum[]
  }

  /**
   * intents without action
   */
  export type intentsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the intents
     */
    select?: intentsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the intents
     */
    omit?: intentsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: intentsInclude<ExtArgs> | null
  }


  /**
   * Model notifications
   */

  export type AggregateNotifications = {
    _count: NotificationsCountAggregateOutputType | null
    _min: NotificationsMinAggregateOutputType | null
    _max: NotificationsMaxAggregateOutputType | null
  }

  export type NotificationsMinAggregateOutputType = {
    notification_id: string | null
    user_id: string | null
    intent_id: string | null
    message: string | null
    read_status: boolean | null
    created_at: Date | null
  }

  export type NotificationsMaxAggregateOutputType = {
    notification_id: string | null
    user_id: string | null
    intent_id: string | null
    message: string | null
    read_status: boolean | null
    created_at: Date | null
  }

  export type NotificationsCountAggregateOutputType = {
    notification_id: number
    user_id: number
    intent_id: number
    message: number
    read_status: number
    created_at: number
    _all: number
  }


  export type NotificationsMinAggregateInputType = {
    notification_id?: true
    user_id?: true
    intent_id?: true
    message?: true
    read_status?: true
    created_at?: true
  }

  export type NotificationsMaxAggregateInputType = {
    notification_id?: true
    user_id?: true
    intent_id?: true
    message?: true
    read_status?: true
    created_at?: true
  }

  export type NotificationsCountAggregateInputType = {
    notification_id?: true
    user_id?: true
    intent_id?: true
    message?: true
    read_status?: true
    created_at?: true
    _all?: true
  }

  export type NotificationsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which notifications to aggregate.
     */
    where?: notificationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of notifications to fetch.
     */
    orderBy?: notificationsOrderByWithRelationInput | notificationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: notificationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned notifications
    **/
    _count?: true | NotificationsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationsMaxAggregateInputType
  }

  export type GetNotificationsAggregateType<T extends NotificationsAggregateArgs> = {
        [P in keyof T & keyof AggregateNotifications]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotifications[P]>
      : GetScalarType<T[P], AggregateNotifications[P]>
  }




  export type notificationsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: notificationsWhereInput
    orderBy?: notificationsOrderByWithAggregationInput | notificationsOrderByWithAggregationInput[]
    by: NotificationsScalarFieldEnum[] | NotificationsScalarFieldEnum
    having?: notificationsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationsCountAggregateInputType | true
    _min?: NotificationsMinAggregateInputType
    _max?: NotificationsMaxAggregateInputType
  }

  export type NotificationsGroupByOutputType = {
    notification_id: string
    user_id: string
    intent_id: string
    message: string
    read_status: boolean
    created_at: Date | null
    _count: NotificationsCountAggregateOutputType | null
    _min: NotificationsMinAggregateOutputType | null
    _max: NotificationsMaxAggregateOutputType | null
  }

  type GetNotificationsGroupByPayload<T extends notificationsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationsGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationsGroupByOutputType[P]>
        }
      >
    >


  export type notificationsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    notification_id?: boolean
    user_id?: boolean
    intent_id?: boolean
    message?: boolean
    read_status?: boolean
    created_at?: boolean
    user?: boolean | usersDefaultArgs<ExtArgs>
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notifications"]>

  export type notificationsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    notification_id?: boolean
    user_id?: boolean
    intent_id?: boolean
    message?: boolean
    read_status?: boolean
    created_at?: boolean
    user?: boolean | usersDefaultArgs<ExtArgs>
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notifications"]>

  export type notificationsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    notification_id?: boolean
    user_id?: boolean
    intent_id?: boolean
    message?: boolean
    read_status?: boolean
    created_at?: boolean
    user?: boolean | usersDefaultArgs<ExtArgs>
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notifications"]>

  export type notificationsSelectScalar = {
    notification_id?: boolean
    user_id?: boolean
    intent_id?: boolean
    message?: boolean
    read_status?: boolean
    created_at?: boolean
  }

  export type notificationsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"notification_id" | "user_id" | "intent_id" | "message" | "read_status" | "created_at", ExtArgs["result"]["notifications"]>
  export type notificationsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | usersDefaultArgs<ExtArgs>
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }
  export type notificationsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | usersDefaultArgs<ExtArgs>
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }
  export type notificationsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | usersDefaultArgs<ExtArgs>
    intent?: boolean | intentsDefaultArgs<ExtArgs>
  }

  export type $notificationsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "notifications"
    objects: {
      user: Prisma.$usersPayload<ExtArgs>
      intent: Prisma.$intentsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      notification_id: string
      user_id: string
      intent_id: string
      message: string
      read_status: boolean
      created_at: Date | null
    }, ExtArgs["result"]["notifications"]>
    composites: {}
  }

  type notificationsGetPayload<S extends boolean | null | undefined | notificationsDefaultArgs> = $Result.GetResult<Prisma.$notificationsPayload, S>

  type notificationsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<notificationsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationsCountAggregateInputType | true
    }

  export interface notificationsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['notifications'], meta: { name: 'notifications' } }
    /**
     * Find zero or one Notifications that matches the filter.
     * @param {notificationsFindUniqueArgs} args - Arguments to find a Notifications
     * @example
     * // Get one Notifications
     * const notifications = await prisma.notifications.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends notificationsFindUniqueArgs>(args: SelectSubset<T, notificationsFindUniqueArgs<ExtArgs>>): Prisma__notificationsClient<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notifications that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {notificationsFindUniqueOrThrowArgs} args - Arguments to find a Notifications
     * @example
     * // Get one Notifications
     * const notifications = await prisma.notifications.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends notificationsFindUniqueOrThrowArgs>(args: SelectSubset<T, notificationsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__notificationsClient<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {notificationsFindFirstArgs} args - Arguments to find a Notifications
     * @example
     * // Get one Notifications
     * const notifications = await prisma.notifications.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends notificationsFindFirstArgs>(args?: SelectSubset<T, notificationsFindFirstArgs<ExtArgs>>): Prisma__notificationsClient<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notifications that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {notificationsFindFirstOrThrowArgs} args - Arguments to find a Notifications
     * @example
     * // Get one Notifications
     * const notifications = await prisma.notifications.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends notificationsFindFirstOrThrowArgs>(args?: SelectSubset<T, notificationsFindFirstOrThrowArgs<ExtArgs>>): Prisma__notificationsClient<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {notificationsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notifications.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notifications.findMany({ take: 10 })
     * 
     * // Only select the `notification_id`
     * const notificationsWithNotification_idOnly = await prisma.notifications.findMany({ select: { notification_id: true } })
     * 
     */
    findMany<T extends notificationsFindManyArgs>(args?: SelectSubset<T, notificationsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notifications.
     * @param {notificationsCreateArgs} args - Arguments to create a Notifications.
     * @example
     * // Create one Notifications
     * const Notifications = await prisma.notifications.create({
     *   data: {
     *     // ... data to create a Notifications
     *   }
     * })
     * 
     */
    create<T extends notificationsCreateArgs>(args: SelectSubset<T, notificationsCreateArgs<ExtArgs>>): Prisma__notificationsClient<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {notificationsCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notifications = await prisma.notifications.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends notificationsCreateManyArgs>(args?: SelectSubset<T, notificationsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {notificationsCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notifications = await prisma.notifications.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `notification_id`
     * const notificationsWithNotification_idOnly = await prisma.notifications.createManyAndReturn({
     *   select: { notification_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends notificationsCreateManyAndReturnArgs>(args?: SelectSubset<T, notificationsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notifications.
     * @param {notificationsDeleteArgs} args - Arguments to delete one Notifications.
     * @example
     * // Delete one Notifications
     * const Notifications = await prisma.notifications.delete({
     *   where: {
     *     // ... filter to delete one Notifications
     *   }
     * })
     * 
     */
    delete<T extends notificationsDeleteArgs>(args: SelectSubset<T, notificationsDeleteArgs<ExtArgs>>): Prisma__notificationsClient<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notifications.
     * @param {notificationsUpdateArgs} args - Arguments to update one Notifications.
     * @example
     * // Update one Notifications
     * const notifications = await prisma.notifications.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends notificationsUpdateArgs>(args: SelectSubset<T, notificationsUpdateArgs<ExtArgs>>): Prisma__notificationsClient<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {notificationsDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notifications.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends notificationsDeleteManyArgs>(args?: SelectSubset<T, notificationsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {notificationsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notifications = await prisma.notifications.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends notificationsUpdateManyArgs>(args: SelectSubset<T, notificationsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {notificationsUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notifications = await prisma.notifications.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `notification_id`
     * const notificationsWithNotification_idOnly = await prisma.notifications.updateManyAndReturn({
     *   select: { notification_id: true },
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
    updateManyAndReturn<T extends notificationsUpdateManyAndReturnArgs>(args: SelectSubset<T, notificationsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notifications.
     * @param {notificationsUpsertArgs} args - Arguments to update or create a Notifications.
     * @example
     * // Update or create a Notifications
     * const notifications = await prisma.notifications.upsert({
     *   create: {
     *     // ... data to create a Notifications
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notifications we want to update
     *   }
     * })
     */
    upsert<T extends notificationsUpsertArgs>(args: SelectSubset<T, notificationsUpsertArgs<ExtArgs>>): Prisma__notificationsClient<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {notificationsCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notifications.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends notificationsCountArgs>(
      args?: Subset<T, notificationsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends NotificationsAggregateArgs>(args: Subset<T, NotificationsAggregateArgs>): Prisma.PrismaPromise<GetNotificationsAggregateType<T>>

    /**
     * Group by Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {notificationsGroupByArgs} args - Group by arguments.
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
      T extends notificationsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: notificationsGroupByArgs['orderBy'] }
        : { orderBy?: notificationsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, notificationsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the notifications model
   */
  readonly fields: notificationsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for notifications.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__notificationsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends usersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, usersDefaultArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    intent<T extends intentsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, intentsDefaultArgs<ExtArgs>>): Prisma__intentsClient<$Result.GetResult<Prisma.$intentsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the notifications model
   */
  interface notificationsFieldRefs {
    readonly notification_id: FieldRef<"notifications", 'String'>
    readonly user_id: FieldRef<"notifications", 'String'>
    readonly intent_id: FieldRef<"notifications", 'String'>
    readonly message: FieldRef<"notifications", 'String'>
    readonly read_status: FieldRef<"notifications", 'Boolean'>
    readonly created_at: FieldRef<"notifications", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * notifications findUnique
   */
  export type notificationsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * Filter, which notifications to fetch.
     */
    where: notificationsWhereUniqueInput
  }

  /**
   * notifications findUniqueOrThrow
   */
  export type notificationsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * Filter, which notifications to fetch.
     */
    where: notificationsWhereUniqueInput
  }

  /**
   * notifications findFirst
   */
  export type notificationsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * Filter, which notifications to fetch.
     */
    where?: notificationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of notifications to fetch.
     */
    orderBy?: notificationsOrderByWithRelationInput | notificationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for notifications.
     */
    cursor?: notificationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of notifications.
     */
    distinct?: NotificationsScalarFieldEnum | NotificationsScalarFieldEnum[]
  }

  /**
   * notifications findFirstOrThrow
   */
  export type notificationsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * Filter, which notifications to fetch.
     */
    where?: notificationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of notifications to fetch.
     */
    orderBy?: notificationsOrderByWithRelationInput | notificationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for notifications.
     */
    cursor?: notificationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of notifications.
     */
    distinct?: NotificationsScalarFieldEnum | NotificationsScalarFieldEnum[]
  }

  /**
   * notifications findMany
   */
  export type notificationsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * Filter, which notifications to fetch.
     */
    where?: notificationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of notifications to fetch.
     */
    orderBy?: notificationsOrderByWithRelationInput | notificationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing notifications.
     */
    cursor?: notificationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` notifications.
     */
    skip?: number
    distinct?: NotificationsScalarFieldEnum | NotificationsScalarFieldEnum[]
  }

  /**
   * notifications create
   */
  export type notificationsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * The data needed to create a notifications.
     */
    data: XOR<notificationsCreateInput, notificationsUncheckedCreateInput>
  }

  /**
   * notifications createMany
   */
  export type notificationsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many notifications.
     */
    data: notificationsCreateManyInput | notificationsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * notifications createManyAndReturn
   */
  export type notificationsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * The data used to create many notifications.
     */
    data: notificationsCreateManyInput | notificationsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * notifications update
   */
  export type notificationsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * The data needed to update a notifications.
     */
    data: XOR<notificationsUpdateInput, notificationsUncheckedUpdateInput>
    /**
     * Choose, which notifications to update.
     */
    where: notificationsWhereUniqueInput
  }

  /**
   * notifications updateMany
   */
  export type notificationsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update notifications.
     */
    data: XOR<notificationsUpdateManyMutationInput, notificationsUncheckedUpdateManyInput>
    /**
     * Filter which notifications to update
     */
    where?: notificationsWhereInput
    /**
     * Limit how many notifications to update.
     */
    limit?: number
  }

  /**
   * notifications updateManyAndReturn
   */
  export type notificationsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * The data used to update notifications.
     */
    data: XOR<notificationsUpdateManyMutationInput, notificationsUncheckedUpdateManyInput>
    /**
     * Filter which notifications to update
     */
    where?: notificationsWhereInput
    /**
     * Limit how many notifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * notifications upsert
   */
  export type notificationsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * The filter to search for the notifications to update in case it exists.
     */
    where: notificationsWhereUniqueInput
    /**
     * In case the notifications found by the `where` argument doesn't exist, create a new notifications with this data.
     */
    create: XOR<notificationsCreateInput, notificationsUncheckedCreateInput>
    /**
     * In case the notifications was found with the provided `where` argument, update it with this data.
     */
    update: XOR<notificationsUpdateInput, notificationsUncheckedUpdateInput>
  }

  /**
   * notifications delete
   */
  export type notificationsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    /**
     * Filter which notifications to delete.
     */
    where: notificationsWhereUniqueInput
  }

  /**
   * notifications deleteMany
   */
  export type notificationsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which notifications to delete
     */
    where?: notificationsWhereInput
    /**
     * Limit how many notifications to delete.
     */
    limit?: number
  }

  /**
   * notifications without action
   */
  export type notificationsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
  }


  /**
   * Model users
   */

  export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  export type UsersMinAggregateOutputType = {
    user_id: string | null
    business_id: string | null
    role_id: string | null
    email: string | null
    name: string | null
    is_active: boolean | null
    created_at: Date | null
  }

  export type UsersMaxAggregateOutputType = {
    user_id: string | null
    business_id: string | null
    role_id: string | null
    email: string | null
    name: string | null
    is_active: boolean | null
    created_at: Date | null
  }

  export type UsersCountAggregateOutputType = {
    user_id: number
    business_id: number
    role_id: number
    email: number
    name: number
    is_active: number
    created_at: number
    _all: number
  }


  export type UsersMinAggregateInputType = {
    user_id?: true
    business_id?: true
    role_id?: true
    email?: true
    name?: true
    is_active?: true
    created_at?: true
  }

  export type UsersMaxAggregateInputType = {
    user_id?: true
    business_id?: true
    role_id?: true
    email?: true
    name?: true
    is_active?: true
    created_at?: true
  }

  export type UsersCountAggregateInputType = {
    user_id?: true
    business_id?: true
    role_id?: true
    email?: true
    name?: true
    is_active?: true
    created_at?: true
    _all?: true
  }

  export type UsersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to aggregate.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned users
    **/
    _count?: true | UsersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsersMaxAggregateInputType
  }

  export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
        [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsers[P]>
      : GetScalarType<T[P], AggregateUsers[P]>
  }




  export type usersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usersWhereInput
    orderBy?: usersOrderByWithAggregationInput | usersOrderByWithAggregationInput[]
    by: UsersScalarFieldEnum[] | UsersScalarFieldEnum
    having?: usersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsersCountAggregateInputType | true
    _min?: UsersMinAggregateInputType
    _max?: UsersMaxAggregateInputType
  }

  export type UsersGroupByOutputType = {
    user_id: string
    business_id: string
    role_id: string
    email: string
    name: string
    is_active: boolean | null
    created_at: Date | null
    _count: UsersCountAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  type GetUsersGroupByPayload<T extends usersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsersGroupByOutputType[P]>
            : GetScalarType<T[P], UsersGroupByOutputType[P]>
        }
      >
    >


  export type usersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    business_id?: boolean
    role_id?: boolean
    email?: boolean
    name?: boolean
    is_active?: boolean
    created_at?: boolean
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
    role?: boolean | rolesDefaultArgs<ExtArgs>
    notifications?: boolean | users$notificationsArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["users"]>

  export type usersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    business_id?: boolean
    role_id?: boolean
    email?: boolean
    name?: boolean
    is_active?: boolean
    created_at?: boolean
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
    role?: boolean | rolesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["users"]>

  export type usersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    business_id?: boolean
    role_id?: boolean
    email?: boolean
    name?: boolean
    is_active?: boolean
    created_at?: boolean
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
    role?: boolean | rolesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["users"]>

  export type usersSelectScalar = {
    user_id?: boolean
    business_id?: boolean
    role_id?: boolean
    email?: boolean
    name?: boolean
    is_active?: boolean
    created_at?: boolean
  }

  export type usersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"user_id" | "business_id" | "role_id" | "email" | "name" | "is_active" | "created_at", ExtArgs["result"]["users"]>
  export type usersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
    role?: boolean | rolesDefaultArgs<ExtArgs>
    notifications?: boolean | users$notificationsArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type usersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
    role?: boolean | rolesDefaultArgs<ExtArgs>
  }
  export type usersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businesses?: boolean | businessesDefaultArgs<ExtArgs>
    role?: boolean | rolesDefaultArgs<ExtArgs>
  }

  export type $usersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "users"
    objects: {
      businesses: Prisma.$businessesPayload<ExtArgs>
      role: Prisma.$rolesPayload<ExtArgs>
      notifications: Prisma.$notificationsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      user_id: string
      business_id: string
      role_id: string
      email: string
      name: string
      is_active: boolean | null
      created_at: Date | null
    }, ExtArgs["result"]["users"]>
    composites: {}
  }

  type usersGetPayload<S extends boolean | null | undefined | usersDefaultArgs> = $Result.GetResult<Prisma.$usersPayload, S>

  type usersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<usersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsersCountAggregateInputType | true
    }

  export interface usersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['users'], meta: { name: 'users' } }
    /**
     * Find zero or one Users that matches the filter.
     * @param {usersFindUniqueArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends usersFindUniqueArgs>(args: SelectSubset<T, usersFindUniqueArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {usersFindUniqueOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends usersFindUniqueOrThrowArgs>(args: SelectSubset<T, usersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends usersFindFirstArgs>(args?: SelectSubset<T, usersFindFirstArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends usersFindFirstOrThrowArgs>(args?: SelectSubset<T, usersFindFirstOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.users.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.users.findMany({ take: 10 })
     * 
     * // Only select the `user_id`
     * const usersWithUser_idOnly = await prisma.users.findMany({ select: { user_id: true } })
     * 
     */
    findMany<T extends usersFindManyArgs>(args?: SelectSubset<T, usersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Users.
     * @param {usersCreateArgs} args - Arguments to create a Users.
     * @example
     * // Create one Users
     * const Users = await prisma.users.create({
     *   data: {
     *     // ... data to create a Users
     *   }
     * })
     * 
     */
    create<T extends usersCreateArgs>(args: SelectSubset<T, usersCreateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {usersCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends usersCreateManyArgs>(args?: SelectSubset<T, usersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {usersCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `user_id`
     * const usersWithUser_idOnly = await prisma.users.createManyAndReturn({
     *   select: { user_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends usersCreateManyAndReturnArgs>(args?: SelectSubset<T, usersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Users.
     * @param {usersDeleteArgs} args - Arguments to delete one Users.
     * @example
     * // Delete one Users
     * const Users = await prisma.users.delete({
     *   where: {
     *     // ... filter to delete one Users
     *   }
     * })
     * 
     */
    delete<T extends usersDeleteArgs>(args: SelectSubset<T, usersDeleteArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Users.
     * @param {usersUpdateArgs} args - Arguments to update one Users.
     * @example
     * // Update one Users
     * const users = await prisma.users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends usersUpdateArgs>(args: SelectSubset<T, usersUpdateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {usersDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends usersDeleteManyArgs>(args?: SelectSubset<T, usersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends usersUpdateManyArgs>(args: SelectSubset<T, usersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {usersUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `user_id`
     * const usersWithUser_idOnly = await prisma.users.updateManyAndReturn({
     *   select: { user_id: true },
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
    updateManyAndReturn<T extends usersUpdateManyAndReturnArgs>(args: SelectSubset<T, usersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Users.
     * @param {usersUpsertArgs} args - Arguments to update or create a Users.
     * @example
     * // Update or create a Users
     * const users = await prisma.users.upsert({
     *   create: {
     *     // ... data to create a Users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Users we want to update
     *   }
     * })
     */
    upsert<T extends usersUpsertArgs>(args: SelectSubset<T, usersUpsertArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.users.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends usersCountArgs>(
      args?: Subset<T, usersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UsersAggregateArgs>(args: Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>

    /**
     * Group by Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersGroupByArgs} args - Group by arguments.
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
      T extends usersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: usersGroupByArgs['orderBy'] }
        : { orderBy?: usersGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, usersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the users model
   */
  readonly fields: usersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__usersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businesses<T extends businessesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, businessesDefaultArgs<ExtArgs>>): Prisma__businessesClient<$Result.GetResult<Prisma.$businessesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    role<T extends rolesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, rolesDefaultArgs<ExtArgs>>): Prisma__rolesClient<$Result.GetResult<Prisma.$rolesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    notifications<T extends users$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, users$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$notificationsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the users model
   */
  interface usersFieldRefs {
    readonly user_id: FieldRef<"users", 'String'>
    readonly business_id: FieldRef<"users", 'String'>
    readonly role_id: FieldRef<"users", 'String'>
    readonly email: FieldRef<"users", 'String'>
    readonly name: FieldRef<"users", 'String'>
    readonly is_active: FieldRef<"users", 'Boolean'>
    readonly created_at: FieldRef<"users", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * users findUnique
   */
  export type usersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findUniqueOrThrow
   */
  export type usersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findFirst
   */
  export type usersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findFirstOrThrow
   */
  export type usersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findMany
   */
  export type usersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users create
   */
  export type usersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The data needed to create a users.
     */
    data: XOR<usersCreateInput, usersUncheckedCreateInput>
  }

  /**
   * users createMany
   */
  export type usersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * users createManyAndReturn
   */
  export type usersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * users update
   */
  export type usersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The data needed to update a users.
     */
    data: XOR<usersUpdateInput, usersUncheckedUpdateInput>
    /**
     * Choose, which users to update.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users updateMany
   */
  export type usersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * users updateManyAndReturn
   */
  export type usersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * users upsert
   */
  export type usersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The filter to search for the users to update in case it exists.
     */
    where: usersWhereUniqueInput
    /**
     * In case the users found by the `where` argument doesn't exist, create a new users with this data.
     */
    create: XOR<usersCreateInput, usersUncheckedCreateInput>
    /**
     * In case the users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<usersUpdateInput, usersUncheckedUpdateInput>
  }

  /**
   * users delete
   */
  export type usersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter which users to delete.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users deleteMany
   */
  export type usersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to delete
     */
    where?: usersWhereInput
    /**
     * Limit how many users to delete.
     */
    limit?: number
  }

  /**
   * users.notifications
   */
  export type users$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the notifications
     */
    select?: notificationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the notifications
     */
    omit?: notificationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: notificationsInclude<ExtArgs> | null
    where?: notificationsWhereInput
    orderBy?: notificationsOrderByWithRelationInput | notificationsOrderByWithRelationInput[]
    cursor?: notificationsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationsScalarFieldEnum | NotificationsScalarFieldEnum[]
  }

  /**
   * users without action
   */
  export type usersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
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


  export const BusinessesScalarFieldEnum: {
    business_id: 'business_id',
    tenant_id: 'tenant_id',
    business_name: 'business_name',
    business_type: 'business_type',
    subscription_plan_id: 'subscription_plan_id',
    whatsapp_number: 'whatsapp_number',
    brand_colors: 'brand_colors',
    logo_url: 'logo_url',
    working_hours: 'working_hours',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type BusinessesScalarFieldEnum = (typeof BusinessesScalarFieldEnum)[keyof typeof BusinessesScalarFieldEnum]


  export const Social_accountsScalarFieldEnum: {
    account_id: 'account_id',
    business_id: 'business_id',
    platform: 'platform',
    platform_user_id: 'platform_user_id',
    page_id: 'page_id',
    access_token: 'access_token',
    permissions: 'permissions',
    token_expiry: 'token_expiry',
    is_active: 'is_active',
    created_at: 'created_at'
  };

  export type Social_accountsScalarFieldEnum = (typeof Social_accountsScalarFieldEnum)[keyof typeof Social_accountsScalarFieldEnum]


  export const Subscription_plansScalarFieldEnum: {
    subscription_plan_id: 'subscription_plan_id',
    plan_name: 'plan_name',
    price: 'price',
    duration_in_days: 'duration_in_days',
    created_at: 'created_at'
  };

  export type Subscription_plansScalarFieldEnum = (typeof Subscription_plansScalarFieldEnum)[keyof typeof Subscription_plansScalarFieldEnum]


  export const TenantsScalarFieldEnum: {
    tenant_id: 'tenant_id',
    tenant_name: 'tenant_name',
    email: 'email',
    phone_number: 'phone_number',
    created_at: 'created_at',
    updated_at: 'updated_at',
    address: 'address',
    gst_number: 'gst_number',
    pan_number: 'pan_number',
    registration_no: 'registration_no'
  };

  export type TenantsScalarFieldEnum = (typeof TenantsScalarFieldEnum)[keyof typeof TenantsScalarFieldEnum]


  export const RolesScalarFieldEnum: {
    role_id: 'role_id',
    role_name: 'role_name',
    permissions: 'permissions',
    created_at: 'created_at'
  };

  export type RolesScalarFieldEnum = (typeof RolesScalarFieldEnum)[keyof typeof RolesScalarFieldEnum]


  export const Role_intentsScalarFieldEnum: {
    role_id: 'role_id',
    intent_id: 'intent_id',
    created_at: 'created_at'
  };

  export type Role_intentsScalarFieldEnum = (typeof Role_intentsScalarFieldEnum)[keyof typeof Role_intentsScalarFieldEnum]


  export const IntentsScalarFieldEnum: {
    intent_id: 'intent_id',
    intent_name: 'intent_name',
    created_at: 'created_at'
  };

  export type IntentsScalarFieldEnum = (typeof IntentsScalarFieldEnum)[keyof typeof IntentsScalarFieldEnum]


  export const NotificationsScalarFieldEnum: {
    notification_id: 'notification_id',
    user_id: 'user_id',
    intent_id: 'intent_id',
    message: 'message',
    read_status: 'read_status',
    created_at: 'created_at'
  };

  export type NotificationsScalarFieldEnum = (typeof NotificationsScalarFieldEnum)[keyof typeof NotificationsScalarFieldEnum]


  export const UsersScalarFieldEnum: {
    user_id: 'user_id',
    business_id: 'business_id',
    role_id: 'role_id',
    email: 'email',
    name: 'name',
    is_active: 'is_active',
    created_at: 'created_at'
  };

  export type UsersScalarFieldEnum = (typeof UsersScalarFieldEnum)[keyof typeof UsersScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


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
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type businessesWhereInput = {
    AND?: businessesWhereInput | businessesWhereInput[]
    OR?: businessesWhereInput[]
    NOT?: businessesWhereInput | businessesWhereInput[]
    business_id?: UuidFilter<"businesses"> | string
    tenant_id?: UuidFilter<"businesses"> | string
    business_name?: StringFilter<"businesses"> | string
    business_type?: StringNullableFilter<"businesses"> | string | null
    subscription_plan_id?: UuidNullableFilter<"businesses"> | string | null
    whatsapp_number?: StringNullableFilter<"businesses"> | string | null
    brand_colors?: JsonNullableFilter<"businesses">
    logo_url?: StringNullableFilter<"businesses"> | string | null
    working_hours?: JsonNullableFilter<"businesses">
    created_at?: DateTimeNullableFilter<"businesses"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"businesses"> | Date | string | null
    subscription_plans?: XOR<Subscription_plansNullableScalarRelationFilter, subscription_plansWhereInput> | null
    tenants?: XOR<TenantsScalarRelationFilter, tenantsWhereInput>
    social_accounts?: Social_accountsListRelationFilter
    users?: UsersListRelationFilter
  }

  export type businessesOrderByWithRelationInput = {
    business_id?: SortOrder
    tenant_id?: SortOrder
    business_name?: SortOrder
    business_type?: SortOrderInput | SortOrder
    subscription_plan_id?: SortOrderInput | SortOrder
    whatsapp_number?: SortOrderInput | SortOrder
    brand_colors?: SortOrderInput | SortOrder
    logo_url?: SortOrderInput | SortOrder
    working_hours?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    subscription_plans?: subscription_plansOrderByWithRelationInput
    tenants?: tenantsOrderByWithRelationInput
    social_accounts?: social_accountsOrderByRelationAggregateInput
    users?: usersOrderByRelationAggregateInput
  }

  export type businessesWhereUniqueInput = Prisma.AtLeast<{
    business_id?: string
    AND?: businessesWhereInput | businessesWhereInput[]
    OR?: businessesWhereInput[]
    NOT?: businessesWhereInput | businessesWhereInput[]
    tenant_id?: UuidFilter<"businesses"> | string
    business_name?: StringFilter<"businesses"> | string
    business_type?: StringNullableFilter<"businesses"> | string | null
    subscription_plan_id?: UuidNullableFilter<"businesses"> | string | null
    whatsapp_number?: StringNullableFilter<"businesses"> | string | null
    brand_colors?: JsonNullableFilter<"businesses">
    logo_url?: StringNullableFilter<"businesses"> | string | null
    working_hours?: JsonNullableFilter<"businesses">
    created_at?: DateTimeNullableFilter<"businesses"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"businesses"> | Date | string | null
    subscription_plans?: XOR<Subscription_plansNullableScalarRelationFilter, subscription_plansWhereInput> | null
    tenants?: XOR<TenantsScalarRelationFilter, tenantsWhereInput>
    social_accounts?: Social_accountsListRelationFilter
    users?: UsersListRelationFilter
  }, "business_id">

  export type businessesOrderByWithAggregationInput = {
    business_id?: SortOrder
    tenant_id?: SortOrder
    business_name?: SortOrder
    business_type?: SortOrderInput | SortOrder
    subscription_plan_id?: SortOrderInput | SortOrder
    whatsapp_number?: SortOrderInput | SortOrder
    brand_colors?: SortOrderInput | SortOrder
    logo_url?: SortOrderInput | SortOrder
    working_hours?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    _count?: businessesCountOrderByAggregateInput
    _max?: businessesMaxOrderByAggregateInput
    _min?: businessesMinOrderByAggregateInput
  }

  export type businessesScalarWhereWithAggregatesInput = {
    AND?: businessesScalarWhereWithAggregatesInput | businessesScalarWhereWithAggregatesInput[]
    OR?: businessesScalarWhereWithAggregatesInput[]
    NOT?: businessesScalarWhereWithAggregatesInput | businessesScalarWhereWithAggregatesInput[]
    business_id?: UuidWithAggregatesFilter<"businesses"> | string
    tenant_id?: UuidWithAggregatesFilter<"businesses"> | string
    business_name?: StringWithAggregatesFilter<"businesses"> | string
    business_type?: StringNullableWithAggregatesFilter<"businesses"> | string | null
    subscription_plan_id?: UuidNullableWithAggregatesFilter<"businesses"> | string | null
    whatsapp_number?: StringNullableWithAggregatesFilter<"businesses"> | string | null
    brand_colors?: JsonNullableWithAggregatesFilter<"businesses">
    logo_url?: StringNullableWithAggregatesFilter<"businesses"> | string | null
    working_hours?: JsonNullableWithAggregatesFilter<"businesses">
    created_at?: DateTimeNullableWithAggregatesFilter<"businesses"> | Date | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"businesses"> | Date | string | null
  }

  export type social_accountsWhereInput = {
    AND?: social_accountsWhereInput | social_accountsWhereInput[]
    OR?: social_accountsWhereInput[]
    NOT?: social_accountsWhereInput | social_accountsWhereInput[]
    account_id?: UuidFilter<"social_accounts"> | string
    business_id?: UuidFilter<"social_accounts"> | string
    platform?: StringFilter<"social_accounts"> | string
    platform_user_id?: StringFilter<"social_accounts"> | string
    page_id?: StringNullableFilter<"social_accounts"> | string | null
    access_token?: StringFilter<"social_accounts"> | string
    permissions?: JsonNullableFilter<"social_accounts">
    token_expiry?: DateTimeNullableFilter<"social_accounts"> | Date | string | null
    is_active?: BoolNullableFilter<"social_accounts"> | boolean | null
    created_at?: DateTimeNullableFilter<"social_accounts"> | Date | string | null
    businesses?: XOR<BusinessesScalarRelationFilter, businessesWhereInput>
  }

  export type social_accountsOrderByWithRelationInput = {
    account_id?: SortOrder
    business_id?: SortOrder
    platform?: SortOrder
    platform_user_id?: SortOrder
    page_id?: SortOrderInput | SortOrder
    access_token?: SortOrder
    permissions?: SortOrderInput | SortOrder
    token_expiry?: SortOrderInput | SortOrder
    is_active?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    businesses?: businessesOrderByWithRelationInput
  }

  export type social_accountsWhereUniqueInput = Prisma.AtLeast<{
    account_id?: string
    AND?: social_accountsWhereInput | social_accountsWhereInput[]
    OR?: social_accountsWhereInput[]
    NOT?: social_accountsWhereInput | social_accountsWhereInput[]
    business_id?: UuidFilter<"social_accounts"> | string
    platform?: StringFilter<"social_accounts"> | string
    platform_user_id?: StringFilter<"social_accounts"> | string
    page_id?: StringNullableFilter<"social_accounts"> | string | null
    access_token?: StringFilter<"social_accounts"> | string
    permissions?: JsonNullableFilter<"social_accounts">
    token_expiry?: DateTimeNullableFilter<"social_accounts"> | Date | string | null
    is_active?: BoolNullableFilter<"social_accounts"> | boolean | null
    created_at?: DateTimeNullableFilter<"social_accounts"> | Date | string | null
    businesses?: XOR<BusinessesScalarRelationFilter, businessesWhereInput>
  }, "account_id">

  export type social_accountsOrderByWithAggregationInput = {
    account_id?: SortOrder
    business_id?: SortOrder
    platform?: SortOrder
    platform_user_id?: SortOrder
    page_id?: SortOrderInput | SortOrder
    access_token?: SortOrder
    permissions?: SortOrderInput | SortOrder
    token_expiry?: SortOrderInput | SortOrder
    is_active?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    _count?: social_accountsCountOrderByAggregateInput
    _max?: social_accountsMaxOrderByAggregateInput
    _min?: social_accountsMinOrderByAggregateInput
  }

  export type social_accountsScalarWhereWithAggregatesInput = {
    AND?: social_accountsScalarWhereWithAggregatesInput | social_accountsScalarWhereWithAggregatesInput[]
    OR?: social_accountsScalarWhereWithAggregatesInput[]
    NOT?: social_accountsScalarWhereWithAggregatesInput | social_accountsScalarWhereWithAggregatesInput[]
    account_id?: UuidWithAggregatesFilter<"social_accounts"> | string
    business_id?: UuidWithAggregatesFilter<"social_accounts"> | string
    platform?: StringWithAggregatesFilter<"social_accounts"> | string
    platform_user_id?: StringWithAggregatesFilter<"social_accounts"> | string
    page_id?: StringNullableWithAggregatesFilter<"social_accounts"> | string | null
    access_token?: StringWithAggregatesFilter<"social_accounts"> | string
    permissions?: JsonNullableWithAggregatesFilter<"social_accounts">
    token_expiry?: DateTimeNullableWithAggregatesFilter<"social_accounts"> | Date | string | null
    is_active?: BoolNullableWithAggregatesFilter<"social_accounts"> | boolean | null
    created_at?: DateTimeNullableWithAggregatesFilter<"social_accounts"> | Date | string | null
  }

  export type subscription_plansWhereInput = {
    AND?: subscription_plansWhereInput | subscription_plansWhereInput[]
    OR?: subscription_plansWhereInput[]
    NOT?: subscription_plansWhereInput | subscription_plansWhereInput[]
    subscription_plan_id?: UuidFilter<"subscription_plans"> | string
    plan_name?: StringFilter<"subscription_plans"> | string
    price?: DecimalNullableFilter<"subscription_plans"> | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: IntNullableFilter<"subscription_plans"> | number | null
    created_at?: DateTimeNullableFilter<"subscription_plans"> | Date | string | null
    businesses?: BusinessesListRelationFilter
  }

  export type subscription_plansOrderByWithRelationInput = {
    subscription_plan_id?: SortOrder
    plan_name?: SortOrder
    price?: SortOrderInput | SortOrder
    duration_in_days?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    businesses?: businessesOrderByRelationAggregateInput
  }

  export type subscription_plansWhereUniqueInput = Prisma.AtLeast<{
    subscription_plan_id?: string
    AND?: subscription_plansWhereInput | subscription_plansWhereInput[]
    OR?: subscription_plansWhereInput[]
    NOT?: subscription_plansWhereInput | subscription_plansWhereInput[]
    plan_name?: StringFilter<"subscription_plans"> | string
    price?: DecimalNullableFilter<"subscription_plans"> | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: IntNullableFilter<"subscription_plans"> | number | null
    created_at?: DateTimeNullableFilter<"subscription_plans"> | Date | string | null
    businesses?: BusinessesListRelationFilter
  }, "subscription_plan_id">

  export type subscription_plansOrderByWithAggregationInput = {
    subscription_plan_id?: SortOrder
    plan_name?: SortOrder
    price?: SortOrderInput | SortOrder
    duration_in_days?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    _count?: subscription_plansCountOrderByAggregateInput
    _avg?: subscription_plansAvgOrderByAggregateInput
    _max?: subscription_plansMaxOrderByAggregateInput
    _min?: subscription_plansMinOrderByAggregateInput
    _sum?: subscription_plansSumOrderByAggregateInput
  }

  export type subscription_plansScalarWhereWithAggregatesInput = {
    AND?: subscription_plansScalarWhereWithAggregatesInput | subscription_plansScalarWhereWithAggregatesInput[]
    OR?: subscription_plansScalarWhereWithAggregatesInput[]
    NOT?: subscription_plansScalarWhereWithAggregatesInput | subscription_plansScalarWhereWithAggregatesInput[]
    subscription_plan_id?: UuidWithAggregatesFilter<"subscription_plans"> | string
    plan_name?: StringWithAggregatesFilter<"subscription_plans"> | string
    price?: DecimalNullableWithAggregatesFilter<"subscription_plans"> | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: IntNullableWithAggregatesFilter<"subscription_plans"> | number | null
    created_at?: DateTimeNullableWithAggregatesFilter<"subscription_plans"> | Date | string | null
  }

  export type tenantsWhereInput = {
    AND?: tenantsWhereInput | tenantsWhereInput[]
    OR?: tenantsWhereInput[]
    NOT?: tenantsWhereInput | tenantsWhereInput[]
    tenant_id?: UuidFilter<"tenants"> | string
    tenant_name?: StringFilter<"tenants"> | string
    email?: StringFilter<"tenants"> | string
    phone_number?: StringNullableFilter<"tenants"> | string | null
    created_at?: DateTimeNullableFilter<"tenants"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"tenants"> | Date | string | null
    address?: StringNullableFilter<"tenants"> | string | null
    gst_number?: StringNullableFilter<"tenants"> | string | null
    pan_number?: StringNullableFilter<"tenants"> | string | null
    registration_no?: StringNullableFilter<"tenants"> | string | null
    businesses?: BusinessesListRelationFilter
  }

  export type tenantsOrderByWithRelationInput = {
    tenant_id?: SortOrder
    tenant_name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    gst_number?: SortOrderInput | SortOrder
    pan_number?: SortOrderInput | SortOrder
    registration_no?: SortOrderInput | SortOrder
    businesses?: businessesOrderByRelationAggregateInput
  }

  export type tenantsWhereUniqueInput = Prisma.AtLeast<{
    tenant_id?: string
    email?: string
    AND?: tenantsWhereInput | tenantsWhereInput[]
    OR?: tenantsWhereInput[]
    NOT?: tenantsWhereInput | tenantsWhereInput[]
    tenant_name?: StringFilter<"tenants"> | string
    phone_number?: StringNullableFilter<"tenants"> | string | null
    created_at?: DateTimeNullableFilter<"tenants"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"tenants"> | Date | string | null
    address?: StringNullableFilter<"tenants"> | string | null
    gst_number?: StringNullableFilter<"tenants"> | string | null
    pan_number?: StringNullableFilter<"tenants"> | string | null
    registration_no?: StringNullableFilter<"tenants"> | string | null
    businesses?: BusinessesListRelationFilter
  }, "tenant_id" | "email">

  export type tenantsOrderByWithAggregationInput = {
    tenant_id?: SortOrder
    tenant_name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    gst_number?: SortOrderInput | SortOrder
    pan_number?: SortOrderInput | SortOrder
    registration_no?: SortOrderInput | SortOrder
    _count?: tenantsCountOrderByAggregateInput
    _max?: tenantsMaxOrderByAggregateInput
    _min?: tenantsMinOrderByAggregateInput
  }

  export type tenantsScalarWhereWithAggregatesInput = {
    AND?: tenantsScalarWhereWithAggregatesInput | tenantsScalarWhereWithAggregatesInput[]
    OR?: tenantsScalarWhereWithAggregatesInput[]
    NOT?: tenantsScalarWhereWithAggregatesInput | tenantsScalarWhereWithAggregatesInput[]
    tenant_id?: UuidWithAggregatesFilter<"tenants"> | string
    tenant_name?: StringWithAggregatesFilter<"tenants"> | string
    email?: StringWithAggregatesFilter<"tenants"> | string
    phone_number?: StringNullableWithAggregatesFilter<"tenants"> | string | null
    created_at?: DateTimeNullableWithAggregatesFilter<"tenants"> | Date | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"tenants"> | Date | string | null
    address?: StringNullableWithAggregatesFilter<"tenants"> | string | null
    gst_number?: StringNullableWithAggregatesFilter<"tenants"> | string | null
    pan_number?: StringNullableWithAggregatesFilter<"tenants"> | string | null
    registration_no?: StringNullableWithAggregatesFilter<"tenants"> | string | null
  }

  export type rolesWhereInput = {
    AND?: rolesWhereInput | rolesWhereInput[]
    OR?: rolesWhereInput[]
    NOT?: rolesWhereInput | rolesWhereInput[]
    role_id?: UuidFilter<"roles"> | string
    role_name?: StringFilter<"roles"> | string
    permissions?: JsonNullableFilter<"roles">
    created_at?: DateTimeFilter<"roles"> | Date | string
    users?: UsersListRelationFilter
  }

  export type rolesOrderByWithRelationInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    permissions?: SortOrderInput | SortOrder
    created_at?: SortOrder
    users?: usersOrderByRelationAggregateInput
  }

  export type rolesWhereUniqueInput = Prisma.AtLeast<{
    role_id?: string
    role_name?: string
    AND?: rolesWhereInput | rolesWhereInput[]
    OR?: rolesWhereInput[]
    NOT?: rolesWhereInput | rolesWhereInput[]
    permissions?: JsonNullableFilter<"roles">
    created_at?: DateTimeFilter<"roles"> | Date | string
    users?: UsersListRelationFilter
  }, "role_id" | "role_name">

  export type rolesOrderByWithAggregationInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    permissions?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: rolesCountOrderByAggregateInput
    _max?: rolesMaxOrderByAggregateInput
    _min?: rolesMinOrderByAggregateInput
  }

  export type rolesScalarWhereWithAggregatesInput = {
    AND?: rolesScalarWhereWithAggregatesInput | rolesScalarWhereWithAggregatesInput[]
    OR?: rolesScalarWhereWithAggregatesInput[]
    NOT?: rolesScalarWhereWithAggregatesInput | rolesScalarWhereWithAggregatesInput[]
    role_id?: UuidWithAggregatesFilter<"roles"> | string
    role_name?: StringWithAggregatesFilter<"roles"> | string
    permissions?: JsonNullableWithAggregatesFilter<"roles">
    created_at?: DateTimeWithAggregatesFilter<"roles"> | Date | string
  }

  export type role_intentsWhereInput = {
    AND?: role_intentsWhereInput | role_intentsWhereInput[]
    OR?: role_intentsWhereInput[]
    NOT?: role_intentsWhereInput | role_intentsWhereInput[]
    role_id?: UuidFilter<"role_intents"> | string
    intent_id?: UuidFilter<"role_intents"> | string
    created_at?: DateTimeNullableFilter<"role_intents"> | Date | string | null
    intent?: XOR<IntentsScalarRelationFilter, intentsWhereInput>
  }

  export type role_intentsOrderByWithRelationInput = {
    role_id?: SortOrder
    intent_id?: SortOrder
    created_at?: SortOrderInput | SortOrder
    intent?: intentsOrderByWithRelationInput
  }

  export type role_intentsWhereUniqueInput = Prisma.AtLeast<{
    role_id_intent_id?: role_intentsRole_idIntent_idCompoundUniqueInput
    AND?: role_intentsWhereInput | role_intentsWhereInput[]
    OR?: role_intentsWhereInput[]
    NOT?: role_intentsWhereInput | role_intentsWhereInput[]
    role_id?: UuidFilter<"role_intents"> | string
    intent_id?: UuidFilter<"role_intents"> | string
    created_at?: DateTimeNullableFilter<"role_intents"> | Date | string | null
    intent?: XOR<IntentsScalarRelationFilter, intentsWhereInput>
  }, "role_id_intent_id">

  export type role_intentsOrderByWithAggregationInput = {
    role_id?: SortOrder
    intent_id?: SortOrder
    created_at?: SortOrderInput | SortOrder
    _count?: role_intentsCountOrderByAggregateInput
    _max?: role_intentsMaxOrderByAggregateInput
    _min?: role_intentsMinOrderByAggregateInput
  }

  export type role_intentsScalarWhereWithAggregatesInput = {
    AND?: role_intentsScalarWhereWithAggregatesInput | role_intentsScalarWhereWithAggregatesInput[]
    OR?: role_intentsScalarWhereWithAggregatesInput[]
    NOT?: role_intentsScalarWhereWithAggregatesInput | role_intentsScalarWhereWithAggregatesInput[]
    role_id?: UuidWithAggregatesFilter<"role_intents"> | string
    intent_id?: UuidWithAggregatesFilter<"role_intents"> | string
    created_at?: DateTimeNullableWithAggregatesFilter<"role_intents"> | Date | string | null
  }

  export type intentsWhereInput = {
    AND?: intentsWhereInput | intentsWhereInput[]
    OR?: intentsWhereInput[]
    NOT?: intentsWhereInput | intentsWhereInput[]
    intent_id?: UuidFilter<"intents"> | string
    intent_name?: StringFilter<"intents"> | string
    created_at?: DateTimeNullableFilter<"intents"> | Date | string | null
    role_intents?: Role_intentsListRelationFilter
    notifications?: NotificationsListRelationFilter
  }

  export type intentsOrderByWithRelationInput = {
    intent_id?: SortOrder
    intent_name?: SortOrder
    created_at?: SortOrderInput | SortOrder
    role_intents?: role_intentsOrderByRelationAggregateInput
    notifications?: notificationsOrderByRelationAggregateInput
  }

  export type intentsWhereUniqueInput = Prisma.AtLeast<{
    intent_id?: string
    AND?: intentsWhereInput | intentsWhereInput[]
    OR?: intentsWhereInput[]
    NOT?: intentsWhereInput | intentsWhereInput[]
    intent_name?: StringFilter<"intents"> | string
    created_at?: DateTimeNullableFilter<"intents"> | Date | string | null
    role_intents?: Role_intentsListRelationFilter
    notifications?: NotificationsListRelationFilter
  }, "intent_id">

  export type intentsOrderByWithAggregationInput = {
    intent_id?: SortOrder
    intent_name?: SortOrder
    created_at?: SortOrderInput | SortOrder
    _count?: intentsCountOrderByAggregateInput
    _max?: intentsMaxOrderByAggregateInput
    _min?: intentsMinOrderByAggregateInput
  }

  export type intentsScalarWhereWithAggregatesInput = {
    AND?: intentsScalarWhereWithAggregatesInput | intentsScalarWhereWithAggregatesInput[]
    OR?: intentsScalarWhereWithAggregatesInput[]
    NOT?: intentsScalarWhereWithAggregatesInput | intentsScalarWhereWithAggregatesInput[]
    intent_id?: UuidWithAggregatesFilter<"intents"> | string
    intent_name?: StringWithAggregatesFilter<"intents"> | string
    created_at?: DateTimeNullableWithAggregatesFilter<"intents"> | Date | string | null
  }

  export type notificationsWhereInput = {
    AND?: notificationsWhereInput | notificationsWhereInput[]
    OR?: notificationsWhereInput[]
    NOT?: notificationsWhereInput | notificationsWhereInput[]
    notification_id?: UuidFilter<"notifications"> | string
    user_id?: UuidFilter<"notifications"> | string
    intent_id?: UuidFilter<"notifications"> | string
    message?: StringFilter<"notifications"> | string
    read_status?: BoolFilter<"notifications"> | boolean
    created_at?: DateTimeNullableFilter<"notifications"> | Date | string | null
    user?: XOR<UsersScalarRelationFilter, usersWhereInput>
    intent?: XOR<IntentsScalarRelationFilter, intentsWhereInput>
  }

  export type notificationsOrderByWithRelationInput = {
    notification_id?: SortOrder
    user_id?: SortOrder
    intent_id?: SortOrder
    message?: SortOrder
    read_status?: SortOrder
    created_at?: SortOrderInput | SortOrder
    user?: usersOrderByWithRelationInput
    intent?: intentsOrderByWithRelationInput
  }

  export type notificationsWhereUniqueInput = Prisma.AtLeast<{
    notification_id?: string
    AND?: notificationsWhereInput | notificationsWhereInput[]
    OR?: notificationsWhereInput[]
    NOT?: notificationsWhereInput | notificationsWhereInput[]
    user_id?: UuidFilter<"notifications"> | string
    intent_id?: UuidFilter<"notifications"> | string
    message?: StringFilter<"notifications"> | string
    read_status?: BoolFilter<"notifications"> | boolean
    created_at?: DateTimeNullableFilter<"notifications"> | Date | string | null
    user?: XOR<UsersScalarRelationFilter, usersWhereInput>
    intent?: XOR<IntentsScalarRelationFilter, intentsWhereInput>
  }, "notification_id">

  export type notificationsOrderByWithAggregationInput = {
    notification_id?: SortOrder
    user_id?: SortOrder
    intent_id?: SortOrder
    message?: SortOrder
    read_status?: SortOrder
    created_at?: SortOrderInput | SortOrder
    _count?: notificationsCountOrderByAggregateInput
    _max?: notificationsMaxOrderByAggregateInput
    _min?: notificationsMinOrderByAggregateInput
  }

  export type notificationsScalarWhereWithAggregatesInput = {
    AND?: notificationsScalarWhereWithAggregatesInput | notificationsScalarWhereWithAggregatesInput[]
    OR?: notificationsScalarWhereWithAggregatesInput[]
    NOT?: notificationsScalarWhereWithAggregatesInput | notificationsScalarWhereWithAggregatesInput[]
    notification_id?: UuidWithAggregatesFilter<"notifications"> | string
    user_id?: UuidWithAggregatesFilter<"notifications"> | string
    intent_id?: UuidWithAggregatesFilter<"notifications"> | string
    message?: StringWithAggregatesFilter<"notifications"> | string
    read_status?: BoolWithAggregatesFilter<"notifications"> | boolean
    created_at?: DateTimeNullableWithAggregatesFilter<"notifications"> | Date | string | null
  }

  export type usersWhereInput = {
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    user_id?: UuidFilter<"users"> | string
    business_id?: UuidFilter<"users"> | string
    role_id?: UuidFilter<"users"> | string
    email?: StringFilter<"users"> | string
    name?: StringFilter<"users"> | string
    is_active?: BoolNullableFilter<"users"> | boolean | null
    created_at?: DateTimeNullableFilter<"users"> | Date | string | null
    businesses?: XOR<BusinessesScalarRelationFilter, businessesWhereInput>
    role?: XOR<RolesScalarRelationFilter, rolesWhereInput>
    notifications?: NotificationsListRelationFilter
  }

  export type usersOrderByWithRelationInput = {
    user_id?: SortOrder
    business_id?: SortOrder
    role_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    is_active?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    businesses?: businessesOrderByWithRelationInput
    role?: rolesOrderByWithRelationInput
    notifications?: notificationsOrderByRelationAggregateInput
  }

  export type usersWhereUniqueInput = Prisma.AtLeast<{
    user_id?: string
    email?: string
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    business_id?: UuidFilter<"users"> | string
    role_id?: UuidFilter<"users"> | string
    name?: StringFilter<"users"> | string
    is_active?: BoolNullableFilter<"users"> | boolean | null
    created_at?: DateTimeNullableFilter<"users"> | Date | string | null
    businesses?: XOR<BusinessesScalarRelationFilter, businessesWhereInput>
    role?: XOR<RolesScalarRelationFilter, rolesWhereInput>
    notifications?: NotificationsListRelationFilter
  }, "user_id" | "email">

  export type usersOrderByWithAggregationInput = {
    user_id?: SortOrder
    business_id?: SortOrder
    role_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    is_active?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    _count?: usersCountOrderByAggregateInput
    _max?: usersMaxOrderByAggregateInput
    _min?: usersMinOrderByAggregateInput
  }

  export type usersScalarWhereWithAggregatesInput = {
    AND?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    OR?: usersScalarWhereWithAggregatesInput[]
    NOT?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    user_id?: UuidWithAggregatesFilter<"users"> | string
    business_id?: UuidWithAggregatesFilter<"users"> | string
    role_id?: UuidWithAggregatesFilter<"users"> | string
    email?: StringWithAggregatesFilter<"users"> | string
    name?: StringWithAggregatesFilter<"users"> | string
    is_active?: BoolNullableWithAggregatesFilter<"users"> | boolean | null
    created_at?: DateTimeNullableWithAggregatesFilter<"users"> | Date | string | null
  }

  export type businessesCreateInput = {
    business_id?: string
    business_name: string
    business_type?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    subscription_plans?: subscription_plansCreateNestedOneWithoutBusinessesInput
    tenants: tenantsCreateNestedOneWithoutBusinessesInput
    social_accounts?: social_accountsCreateNestedManyWithoutBusinessesInput
    users?: usersCreateNestedManyWithoutBusinessesInput
  }

  export type businessesUncheckedCreateInput = {
    business_id?: string
    tenant_id: string
    business_name: string
    business_type?: string | null
    subscription_plan_id?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    social_accounts?: social_accountsUncheckedCreateNestedManyWithoutBusinessesInput
    users?: usersUncheckedCreateNestedManyWithoutBusinessesInput
  }

  export type businessesUpdateInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscription_plans?: subscription_plansUpdateOneWithoutBusinessesNestedInput
    tenants?: tenantsUpdateOneRequiredWithoutBusinessesNestedInput
    social_accounts?: social_accountsUpdateManyWithoutBusinessesNestedInput
    users?: usersUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesUncheckedUpdateInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_plan_id?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    social_accounts?: social_accountsUncheckedUpdateManyWithoutBusinessesNestedInput
    users?: usersUncheckedUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesCreateManyInput = {
    business_id?: string
    tenant_id: string
    business_name: string
    business_type?: string | null
    subscription_plan_id?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type businessesUpdateManyMutationInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type businessesUncheckedUpdateManyInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_plan_id?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type social_accountsCreateInput = {
    account_id?: string
    platform: string
    platform_user_id: string
    page_id?: string | null
    access_token: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: Date | string | null
    is_active?: boolean | null
    created_at?: Date | string | null
    businesses: businessesCreateNestedOneWithoutSocial_accountsInput
  }

  export type social_accountsUncheckedCreateInput = {
    account_id?: string
    business_id: string
    platform: string
    platform_user_id: string
    page_id?: string | null
    access_token: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: Date | string | null
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type social_accountsUpdateInput = {
    account_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platform_user_id?: StringFieldUpdateOperationsInput | string
    page_id?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    businesses?: businessesUpdateOneRequiredWithoutSocial_accountsNestedInput
  }

  export type social_accountsUncheckedUpdateInput = {
    account_id?: StringFieldUpdateOperationsInput | string
    business_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platform_user_id?: StringFieldUpdateOperationsInput | string
    page_id?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type social_accountsCreateManyInput = {
    account_id?: string
    business_id: string
    platform: string
    platform_user_id: string
    page_id?: string | null
    access_token: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: Date | string | null
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type social_accountsUpdateManyMutationInput = {
    account_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platform_user_id?: StringFieldUpdateOperationsInput | string
    page_id?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type social_accountsUncheckedUpdateManyInput = {
    account_id?: StringFieldUpdateOperationsInput | string
    business_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platform_user_id?: StringFieldUpdateOperationsInput | string
    page_id?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type subscription_plansCreateInput = {
    subscription_plan_id?: string
    plan_name: string
    price?: Decimal | DecimalJsLike | number | string | null
    duration_in_days?: number | null
    created_at?: Date | string | null
    businesses?: businessesCreateNestedManyWithoutSubscription_plansInput
  }

  export type subscription_plansUncheckedCreateInput = {
    subscription_plan_id?: string
    plan_name: string
    price?: Decimal | DecimalJsLike | number | string | null
    duration_in_days?: number | null
    created_at?: Date | string | null
    businesses?: businessesUncheckedCreateNestedManyWithoutSubscription_plansInput
  }

  export type subscription_plansUpdateInput = {
    subscription_plan_id?: StringFieldUpdateOperationsInput | string
    plan_name?: StringFieldUpdateOperationsInput | string
    price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    businesses?: businessesUpdateManyWithoutSubscription_plansNestedInput
  }

  export type subscription_plansUncheckedUpdateInput = {
    subscription_plan_id?: StringFieldUpdateOperationsInput | string
    plan_name?: StringFieldUpdateOperationsInput | string
    price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    businesses?: businessesUncheckedUpdateManyWithoutSubscription_plansNestedInput
  }

  export type subscription_plansCreateManyInput = {
    subscription_plan_id?: string
    plan_name: string
    price?: Decimal | DecimalJsLike | number | string | null
    duration_in_days?: number | null
    created_at?: Date | string | null
  }

  export type subscription_plansUpdateManyMutationInput = {
    subscription_plan_id?: StringFieldUpdateOperationsInput | string
    plan_name?: StringFieldUpdateOperationsInput | string
    price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type subscription_plansUncheckedUpdateManyInput = {
    subscription_plan_id?: StringFieldUpdateOperationsInput | string
    plan_name?: StringFieldUpdateOperationsInput | string
    price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tenantsCreateInput = {
    tenant_id?: string
    tenant_name: string
    email: string
    phone_number?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    address?: string | null
    gst_number?: string | null
    pan_number?: string | null
    registration_no?: string | null
    businesses?: businessesCreateNestedManyWithoutTenantsInput
  }

  export type tenantsUncheckedCreateInput = {
    tenant_id?: string
    tenant_name: string
    email: string
    phone_number?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    address?: string | null
    gst_number?: string | null
    pan_number?: string | null
    registration_no?: string | null
    businesses?: businessesUncheckedCreateNestedManyWithoutTenantsInput
  }

  export type tenantsUpdateInput = {
    tenant_id?: StringFieldUpdateOperationsInput | string
    tenant_name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gst_number?: NullableStringFieldUpdateOperationsInput | string | null
    pan_number?: NullableStringFieldUpdateOperationsInput | string | null
    registration_no?: NullableStringFieldUpdateOperationsInput | string | null
    businesses?: businessesUpdateManyWithoutTenantsNestedInput
  }

  export type tenantsUncheckedUpdateInput = {
    tenant_id?: StringFieldUpdateOperationsInput | string
    tenant_name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gst_number?: NullableStringFieldUpdateOperationsInput | string | null
    pan_number?: NullableStringFieldUpdateOperationsInput | string | null
    registration_no?: NullableStringFieldUpdateOperationsInput | string | null
    businesses?: businessesUncheckedUpdateManyWithoutTenantsNestedInput
  }

  export type tenantsCreateManyInput = {
    tenant_id?: string
    tenant_name: string
    email: string
    phone_number?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    address?: string | null
    gst_number?: string | null
    pan_number?: string | null
    registration_no?: string | null
  }

  export type tenantsUpdateManyMutationInput = {
    tenant_id?: StringFieldUpdateOperationsInput | string
    tenant_name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gst_number?: NullableStringFieldUpdateOperationsInput | string | null
    pan_number?: NullableStringFieldUpdateOperationsInput | string | null
    registration_no?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tenantsUncheckedUpdateManyInput = {
    tenant_id?: StringFieldUpdateOperationsInput | string
    tenant_name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gst_number?: NullableStringFieldUpdateOperationsInput | string | null
    pan_number?: NullableStringFieldUpdateOperationsInput | string | null
    registration_no?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type rolesCreateInput = {
    role_id?: string
    role_name: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    users?: usersCreateNestedManyWithoutRoleInput
  }

  export type rolesUncheckedCreateInput = {
    role_id?: string
    role_name: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    users?: usersUncheckedCreateNestedManyWithoutRoleInput
  }

  export type rolesUpdateInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: usersUpdateManyWithoutRoleNestedInput
  }

  export type rolesUncheckedUpdateInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: usersUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type rolesCreateManyInput = {
    role_id?: string
    role_name: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type rolesUpdateManyMutationInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type rolesUncheckedUpdateManyInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type role_intentsCreateInput = {
    role_id: string
    created_at?: Date | string | null
    intent: intentsCreateNestedOneWithoutRole_intentsInput
  }

  export type role_intentsUncheckedCreateInput = {
    role_id: string
    intent_id: string
    created_at?: Date | string | null
  }

  export type role_intentsUpdateInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    intent?: intentsUpdateOneRequiredWithoutRole_intentsNestedInput
  }

  export type role_intentsUncheckedUpdateInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    intent_id?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type role_intentsCreateManyInput = {
    role_id: string
    intent_id: string
    created_at?: Date | string | null
  }

  export type role_intentsUpdateManyMutationInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type role_intentsUncheckedUpdateManyInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    intent_id?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type intentsCreateInput = {
    intent_id?: string
    intent_name: string
    created_at?: Date | string | null
    role_intents?: role_intentsCreateNestedManyWithoutIntentInput
    notifications?: notificationsCreateNestedManyWithoutIntentInput
  }

  export type intentsUncheckedCreateInput = {
    intent_id?: string
    intent_name: string
    created_at?: Date | string | null
    role_intents?: role_intentsUncheckedCreateNestedManyWithoutIntentInput
    notifications?: notificationsUncheckedCreateNestedManyWithoutIntentInput
  }

  export type intentsUpdateInput = {
    intent_id?: StringFieldUpdateOperationsInput | string
    intent_name?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role_intents?: role_intentsUpdateManyWithoutIntentNestedInput
    notifications?: notificationsUpdateManyWithoutIntentNestedInput
  }

  export type intentsUncheckedUpdateInput = {
    intent_id?: StringFieldUpdateOperationsInput | string
    intent_name?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role_intents?: role_intentsUncheckedUpdateManyWithoutIntentNestedInput
    notifications?: notificationsUncheckedUpdateManyWithoutIntentNestedInput
  }

  export type intentsCreateManyInput = {
    intent_id?: string
    intent_name: string
    created_at?: Date | string | null
  }

  export type intentsUpdateManyMutationInput = {
    intent_id?: StringFieldUpdateOperationsInput | string
    intent_name?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type intentsUncheckedUpdateManyInput = {
    intent_id?: StringFieldUpdateOperationsInput | string
    intent_name?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type notificationsCreateInput = {
    notification_id?: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
    user: usersCreateNestedOneWithoutNotificationsInput
    intent: intentsCreateNestedOneWithoutNotificationsInput
  }

  export type notificationsUncheckedCreateInput = {
    notification_id?: string
    user_id: string
    intent_id: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
  }

  export type notificationsUpdateInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: usersUpdateOneRequiredWithoutNotificationsNestedInput
    intent?: intentsUpdateOneRequiredWithoutNotificationsNestedInput
  }

  export type notificationsUncheckedUpdateInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    intent_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type notificationsCreateManyInput = {
    notification_id?: string
    user_id: string
    intent_id: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
  }

  export type notificationsUpdateManyMutationInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type notificationsUncheckedUpdateManyInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    intent_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type usersCreateInput = {
    user_id?: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
    businesses: businessesCreateNestedOneWithoutUsersInput
    role: rolesCreateNestedOneWithoutUsersInput
    notifications?: notificationsCreateNestedManyWithoutUserInput
  }

  export type usersUncheckedCreateInput = {
    user_id?: string
    business_id: string
    role_id: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
    notifications?: notificationsUncheckedCreateNestedManyWithoutUserInput
  }

  export type usersUpdateInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    businesses?: businessesUpdateOneRequiredWithoutUsersNestedInput
    role?: rolesUpdateOneRequiredWithoutUsersNestedInput
    notifications?: notificationsUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    business_id?: StringFieldUpdateOperationsInput | string
    role_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notifications?: notificationsUncheckedUpdateManyWithoutUserNestedInput
  }

  export type usersCreateManyInput = {
    user_id?: string
    business_id: string
    role_id: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type usersUpdateManyMutationInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type usersUncheckedUpdateManyInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    business_id?: StringFieldUpdateOperationsInput | string
    role_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
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

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type Subscription_plansNullableScalarRelationFilter = {
    is?: subscription_plansWhereInput | null
    isNot?: subscription_plansWhereInput | null
  }

  export type TenantsScalarRelationFilter = {
    is?: tenantsWhereInput
    isNot?: tenantsWhereInput
  }

  export type Social_accountsListRelationFilter = {
    every?: social_accountsWhereInput
    some?: social_accountsWhereInput
    none?: social_accountsWhereInput
  }

  export type UsersListRelationFilter = {
    every?: usersWhereInput
    some?: usersWhereInput
    none?: usersWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type social_accountsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type usersOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type businessesCountOrderByAggregateInput = {
    business_id?: SortOrder
    tenant_id?: SortOrder
    business_name?: SortOrder
    business_type?: SortOrder
    subscription_plan_id?: SortOrder
    whatsapp_number?: SortOrder
    brand_colors?: SortOrder
    logo_url?: SortOrder
    working_hours?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type businessesMaxOrderByAggregateInput = {
    business_id?: SortOrder
    tenant_id?: SortOrder
    business_name?: SortOrder
    business_type?: SortOrder
    subscription_plan_id?: SortOrder
    whatsapp_number?: SortOrder
    logo_url?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type businessesMinOrderByAggregateInput = {
    business_id?: SortOrder
    tenant_id?: SortOrder
    business_name?: SortOrder
    business_type?: SortOrder
    subscription_plan_id?: SortOrder
    whatsapp_number?: SortOrder
    logo_url?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type BusinessesScalarRelationFilter = {
    is?: businessesWhereInput
    isNot?: businessesWhereInput
  }

  export type social_accountsCountOrderByAggregateInput = {
    account_id?: SortOrder
    business_id?: SortOrder
    platform?: SortOrder
    platform_user_id?: SortOrder
    page_id?: SortOrder
    access_token?: SortOrder
    permissions?: SortOrder
    token_expiry?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
  }

  export type social_accountsMaxOrderByAggregateInput = {
    account_id?: SortOrder
    business_id?: SortOrder
    platform?: SortOrder
    platform_user_id?: SortOrder
    page_id?: SortOrder
    access_token?: SortOrder
    token_expiry?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
  }

  export type social_accountsMinOrderByAggregateInput = {
    account_id?: SortOrder
    business_id?: SortOrder
    platform?: SortOrder
    platform_user_id?: SortOrder
    page_id?: SortOrder
    access_token?: SortOrder
    token_expiry?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BusinessesListRelationFilter = {
    every?: businessesWhereInput
    some?: businessesWhereInput
    none?: businessesWhereInput
  }

  export type businessesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type subscription_plansCountOrderByAggregateInput = {
    subscription_plan_id?: SortOrder
    plan_name?: SortOrder
    price?: SortOrder
    duration_in_days?: SortOrder
    created_at?: SortOrder
  }

  export type subscription_plansAvgOrderByAggregateInput = {
    price?: SortOrder
    duration_in_days?: SortOrder
  }

  export type subscription_plansMaxOrderByAggregateInput = {
    subscription_plan_id?: SortOrder
    plan_name?: SortOrder
    price?: SortOrder
    duration_in_days?: SortOrder
    created_at?: SortOrder
  }

  export type subscription_plansMinOrderByAggregateInput = {
    subscription_plan_id?: SortOrder
    plan_name?: SortOrder
    price?: SortOrder
    duration_in_days?: SortOrder
    created_at?: SortOrder
  }

  export type subscription_plansSumOrderByAggregateInput = {
    price?: SortOrder
    duration_in_days?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type tenantsCountOrderByAggregateInput = {
    tenant_id?: SortOrder
    tenant_name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    address?: SortOrder
    gst_number?: SortOrder
    pan_number?: SortOrder
    registration_no?: SortOrder
  }

  export type tenantsMaxOrderByAggregateInput = {
    tenant_id?: SortOrder
    tenant_name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    address?: SortOrder
    gst_number?: SortOrder
    pan_number?: SortOrder
    registration_no?: SortOrder
  }

  export type tenantsMinOrderByAggregateInput = {
    tenant_id?: SortOrder
    tenant_name?: SortOrder
    email?: SortOrder
    phone_number?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    address?: SortOrder
    gst_number?: SortOrder
    pan_number?: SortOrder
    registration_no?: SortOrder
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

  export type rolesCountOrderByAggregateInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    permissions?: SortOrder
    created_at?: SortOrder
  }

  export type rolesMaxOrderByAggregateInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    created_at?: SortOrder
  }

  export type rolesMinOrderByAggregateInput = {
    role_id?: SortOrder
    role_name?: SortOrder
    created_at?: SortOrder
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

  export type IntentsScalarRelationFilter = {
    is?: intentsWhereInput
    isNot?: intentsWhereInput
  }

  export type role_intentsRole_idIntent_idCompoundUniqueInput = {
    role_id: string
    intent_id: string
  }

  export type role_intentsCountOrderByAggregateInput = {
    role_id?: SortOrder
    intent_id?: SortOrder
    created_at?: SortOrder
  }

  export type role_intentsMaxOrderByAggregateInput = {
    role_id?: SortOrder
    intent_id?: SortOrder
    created_at?: SortOrder
  }

  export type role_intentsMinOrderByAggregateInput = {
    role_id?: SortOrder
    intent_id?: SortOrder
    created_at?: SortOrder
  }

  export type Role_intentsListRelationFilter = {
    every?: role_intentsWhereInput
    some?: role_intentsWhereInput
    none?: role_intentsWhereInput
  }

  export type NotificationsListRelationFilter = {
    every?: notificationsWhereInput
    some?: notificationsWhereInput
    none?: notificationsWhereInput
  }

  export type role_intentsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type notificationsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type intentsCountOrderByAggregateInput = {
    intent_id?: SortOrder
    intent_name?: SortOrder
    created_at?: SortOrder
  }

  export type intentsMaxOrderByAggregateInput = {
    intent_id?: SortOrder
    intent_name?: SortOrder
    created_at?: SortOrder
  }

  export type intentsMinOrderByAggregateInput = {
    intent_id?: SortOrder
    intent_name?: SortOrder
    created_at?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UsersScalarRelationFilter = {
    is?: usersWhereInput
    isNot?: usersWhereInput
  }

  export type notificationsCountOrderByAggregateInput = {
    notification_id?: SortOrder
    user_id?: SortOrder
    intent_id?: SortOrder
    message?: SortOrder
    read_status?: SortOrder
    created_at?: SortOrder
  }

  export type notificationsMaxOrderByAggregateInput = {
    notification_id?: SortOrder
    user_id?: SortOrder
    intent_id?: SortOrder
    message?: SortOrder
    read_status?: SortOrder
    created_at?: SortOrder
  }

  export type notificationsMinOrderByAggregateInput = {
    notification_id?: SortOrder
    user_id?: SortOrder
    intent_id?: SortOrder
    message?: SortOrder
    read_status?: SortOrder
    created_at?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type RolesScalarRelationFilter = {
    is?: rolesWhereInput
    isNot?: rolesWhereInput
  }

  export type usersCountOrderByAggregateInput = {
    user_id?: SortOrder
    business_id?: SortOrder
    role_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
  }

  export type usersMaxOrderByAggregateInput = {
    user_id?: SortOrder
    business_id?: SortOrder
    role_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
  }

  export type usersMinOrderByAggregateInput = {
    user_id?: SortOrder
    business_id?: SortOrder
    role_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
  }

  export type subscription_plansCreateNestedOneWithoutBusinessesInput = {
    create?: XOR<subscription_plansCreateWithoutBusinessesInput, subscription_plansUncheckedCreateWithoutBusinessesInput>
    connectOrCreate?: subscription_plansCreateOrConnectWithoutBusinessesInput
    connect?: subscription_plansWhereUniqueInput
  }

  export type tenantsCreateNestedOneWithoutBusinessesInput = {
    create?: XOR<tenantsCreateWithoutBusinessesInput, tenantsUncheckedCreateWithoutBusinessesInput>
    connectOrCreate?: tenantsCreateOrConnectWithoutBusinessesInput
    connect?: tenantsWhereUniqueInput
  }

  export type social_accountsCreateNestedManyWithoutBusinessesInput = {
    create?: XOR<social_accountsCreateWithoutBusinessesInput, social_accountsUncheckedCreateWithoutBusinessesInput> | social_accountsCreateWithoutBusinessesInput[] | social_accountsUncheckedCreateWithoutBusinessesInput[]
    connectOrCreate?: social_accountsCreateOrConnectWithoutBusinessesInput | social_accountsCreateOrConnectWithoutBusinessesInput[]
    createMany?: social_accountsCreateManyBusinessesInputEnvelope
    connect?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
  }

  export type usersCreateNestedManyWithoutBusinessesInput = {
    create?: XOR<usersCreateWithoutBusinessesInput, usersUncheckedCreateWithoutBusinessesInput> | usersCreateWithoutBusinessesInput[] | usersUncheckedCreateWithoutBusinessesInput[]
    connectOrCreate?: usersCreateOrConnectWithoutBusinessesInput | usersCreateOrConnectWithoutBusinessesInput[]
    createMany?: usersCreateManyBusinessesInputEnvelope
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
  }

  export type social_accountsUncheckedCreateNestedManyWithoutBusinessesInput = {
    create?: XOR<social_accountsCreateWithoutBusinessesInput, social_accountsUncheckedCreateWithoutBusinessesInput> | social_accountsCreateWithoutBusinessesInput[] | social_accountsUncheckedCreateWithoutBusinessesInput[]
    connectOrCreate?: social_accountsCreateOrConnectWithoutBusinessesInput | social_accountsCreateOrConnectWithoutBusinessesInput[]
    createMany?: social_accountsCreateManyBusinessesInputEnvelope
    connect?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
  }

  export type usersUncheckedCreateNestedManyWithoutBusinessesInput = {
    create?: XOR<usersCreateWithoutBusinessesInput, usersUncheckedCreateWithoutBusinessesInput> | usersCreateWithoutBusinessesInput[] | usersUncheckedCreateWithoutBusinessesInput[]
    connectOrCreate?: usersCreateOrConnectWithoutBusinessesInput | usersCreateOrConnectWithoutBusinessesInput[]
    createMany?: usersCreateManyBusinessesInputEnvelope
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type subscription_plansUpdateOneWithoutBusinessesNestedInput = {
    create?: XOR<subscription_plansCreateWithoutBusinessesInput, subscription_plansUncheckedCreateWithoutBusinessesInput>
    connectOrCreate?: subscription_plansCreateOrConnectWithoutBusinessesInput
    upsert?: subscription_plansUpsertWithoutBusinessesInput
    disconnect?: subscription_plansWhereInput | boolean
    delete?: subscription_plansWhereInput | boolean
    connect?: subscription_plansWhereUniqueInput
    update?: XOR<XOR<subscription_plansUpdateToOneWithWhereWithoutBusinessesInput, subscription_plansUpdateWithoutBusinessesInput>, subscription_plansUncheckedUpdateWithoutBusinessesInput>
  }

  export type tenantsUpdateOneRequiredWithoutBusinessesNestedInput = {
    create?: XOR<tenantsCreateWithoutBusinessesInput, tenantsUncheckedCreateWithoutBusinessesInput>
    connectOrCreate?: tenantsCreateOrConnectWithoutBusinessesInput
    upsert?: tenantsUpsertWithoutBusinessesInput
    connect?: tenantsWhereUniqueInput
    update?: XOR<XOR<tenantsUpdateToOneWithWhereWithoutBusinessesInput, tenantsUpdateWithoutBusinessesInput>, tenantsUncheckedUpdateWithoutBusinessesInput>
  }

  export type social_accountsUpdateManyWithoutBusinessesNestedInput = {
    create?: XOR<social_accountsCreateWithoutBusinessesInput, social_accountsUncheckedCreateWithoutBusinessesInput> | social_accountsCreateWithoutBusinessesInput[] | social_accountsUncheckedCreateWithoutBusinessesInput[]
    connectOrCreate?: social_accountsCreateOrConnectWithoutBusinessesInput | social_accountsCreateOrConnectWithoutBusinessesInput[]
    upsert?: social_accountsUpsertWithWhereUniqueWithoutBusinessesInput | social_accountsUpsertWithWhereUniqueWithoutBusinessesInput[]
    createMany?: social_accountsCreateManyBusinessesInputEnvelope
    set?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
    disconnect?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
    delete?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
    connect?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
    update?: social_accountsUpdateWithWhereUniqueWithoutBusinessesInput | social_accountsUpdateWithWhereUniqueWithoutBusinessesInput[]
    updateMany?: social_accountsUpdateManyWithWhereWithoutBusinessesInput | social_accountsUpdateManyWithWhereWithoutBusinessesInput[]
    deleteMany?: social_accountsScalarWhereInput | social_accountsScalarWhereInput[]
  }

  export type usersUpdateManyWithoutBusinessesNestedInput = {
    create?: XOR<usersCreateWithoutBusinessesInput, usersUncheckedCreateWithoutBusinessesInput> | usersCreateWithoutBusinessesInput[] | usersUncheckedCreateWithoutBusinessesInput[]
    connectOrCreate?: usersCreateOrConnectWithoutBusinessesInput | usersCreateOrConnectWithoutBusinessesInput[]
    upsert?: usersUpsertWithWhereUniqueWithoutBusinessesInput | usersUpsertWithWhereUniqueWithoutBusinessesInput[]
    createMany?: usersCreateManyBusinessesInputEnvelope
    set?: usersWhereUniqueInput | usersWhereUniqueInput[]
    disconnect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    delete?: usersWhereUniqueInput | usersWhereUniqueInput[]
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    update?: usersUpdateWithWhereUniqueWithoutBusinessesInput | usersUpdateWithWhereUniqueWithoutBusinessesInput[]
    updateMany?: usersUpdateManyWithWhereWithoutBusinessesInput | usersUpdateManyWithWhereWithoutBusinessesInput[]
    deleteMany?: usersScalarWhereInput | usersScalarWhereInput[]
  }

  export type social_accountsUncheckedUpdateManyWithoutBusinessesNestedInput = {
    create?: XOR<social_accountsCreateWithoutBusinessesInput, social_accountsUncheckedCreateWithoutBusinessesInput> | social_accountsCreateWithoutBusinessesInput[] | social_accountsUncheckedCreateWithoutBusinessesInput[]
    connectOrCreate?: social_accountsCreateOrConnectWithoutBusinessesInput | social_accountsCreateOrConnectWithoutBusinessesInput[]
    upsert?: social_accountsUpsertWithWhereUniqueWithoutBusinessesInput | social_accountsUpsertWithWhereUniqueWithoutBusinessesInput[]
    createMany?: social_accountsCreateManyBusinessesInputEnvelope
    set?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
    disconnect?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
    delete?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
    connect?: social_accountsWhereUniqueInput | social_accountsWhereUniqueInput[]
    update?: social_accountsUpdateWithWhereUniqueWithoutBusinessesInput | social_accountsUpdateWithWhereUniqueWithoutBusinessesInput[]
    updateMany?: social_accountsUpdateManyWithWhereWithoutBusinessesInput | social_accountsUpdateManyWithWhereWithoutBusinessesInput[]
    deleteMany?: social_accountsScalarWhereInput | social_accountsScalarWhereInput[]
  }

  export type usersUncheckedUpdateManyWithoutBusinessesNestedInput = {
    create?: XOR<usersCreateWithoutBusinessesInput, usersUncheckedCreateWithoutBusinessesInput> | usersCreateWithoutBusinessesInput[] | usersUncheckedCreateWithoutBusinessesInput[]
    connectOrCreate?: usersCreateOrConnectWithoutBusinessesInput | usersCreateOrConnectWithoutBusinessesInput[]
    upsert?: usersUpsertWithWhereUniqueWithoutBusinessesInput | usersUpsertWithWhereUniqueWithoutBusinessesInput[]
    createMany?: usersCreateManyBusinessesInputEnvelope
    set?: usersWhereUniqueInput | usersWhereUniqueInput[]
    disconnect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    delete?: usersWhereUniqueInput | usersWhereUniqueInput[]
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    update?: usersUpdateWithWhereUniqueWithoutBusinessesInput | usersUpdateWithWhereUniqueWithoutBusinessesInput[]
    updateMany?: usersUpdateManyWithWhereWithoutBusinessesInput | usersUpdateManyWithWhereWithoutBusinessesInput[]
    deleteMany?: usersScalarWhereInput | usersScalarWhereInput[]
  }

  export type businessesCreateNestedOneWithoutSocial_accountsInput = {
    create?: XOR<businessesCreateWithoutSocial_accountsInput, businessesUncheckedCreateWithoutSocial_accountsInput>
    connectOrCreate?: businessesCreateOrConnectWithoutSocial_accountsInput
    connect?: businessesWhereUniqueInput
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type businessesUpdateOneRequiredWithoutSocial_accountsNestedInput = {
    create?: XOR<businessesCreateWithoutSocial_accountsInput, businessesUncheckedCreateWithoutSocial_accountsInput>
    connectOrCreate?: businessesCreateOrConnectWithoutSocial_accountsInput
    upsert?: businessesUpsertWithoutSocial_accountsInput
    connect?: businessesWhereUniqueInput
    update?: XOR<XOR<businessesUpdateToOneWithWhereWithoutSocial_accountsInput, businessesUpdateWithoutSocial_accountsInput>, businessesUncheckedUpdateWithoutSocial_accountsInput>
  }

  export type businessesCreateNestedManyWithoutSubscription_plansInput = {
    create?: XOR<businessesCreateWithoutSubscription_plansInput, businessesUncheckedCreateWithoutSubscription_plansInput> | businessesCreateWithoutSubscription_plansInput[] | businessesUncheckedCreateWithoutSubscription_plansInput[]
    connectOrCreate?: businessesCreateOrConnectWithoutSubscription_plansInput | businessesCreateOrConnectWithoutSubscription_plansInput[]
    createMany?: businessesCreateManySubscription_plansInputEnvelope
    connect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
  }

  export type businessesUncheckedCreateNestedManyWithoutSubscription_plansInput = {
    create?: XOR<businessesCreateWithoutSubscription_plansInput, businessesUncheckedCreateWithoutSubscription_plansInput> | businessesCreateWithoutSubscription_plansInput[] | businessesUncheckedCreateWithoutSubscription_plansInput[]
    connectOrCreate?: businessesCreateOrConnectWithoutSubscription_plansInput | businessesCreateOrConnectWithoutSubscription_plansInput[]
    createMany?: businessesCreateManySubscription_plansInputEnvelope
    connect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type businessesUpdateManyWithoutSubscription_plansNestedInput = {
    create?: XOR<businessesCreateWithoutSubscription_plansInput, businessesUncheckedCreateWithoutSubscription_plansInput> | businessesCreateWithoutSubscription_plansInput[] | businessesUncheckedCreateWithoutSubscription_plansInput[]
    connectOrCreate?: businessesCreateOrConnectWithoutSubscription_plansInput | businessesCreateOrConnectWithoutSubscription_plansInput[]
    upsert?: businessesUpsertWithWhereUniqueWithoutSubscription_plansInput | businessesUpsertWithWhereUniqueWithoutSubscription_plansInput[]
    createMany?: businessesCreateManySubscription_plansInputEnvelope
    set?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    disconnect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    delete?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    connect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    update?: businessesUpdateWithWhereUniqueWithoutSubscription_plansInput | businessesUpdateWithWhereUniqueWithoutSubscription_plansInput[]
    updateMany?: businessesUpdateManyWithWhereWithoutSubscription_plansInput | businessesUpdateManyWithWhereWithoutSubscription_plansInput[]
    deleteMany?: businessesScalarWhereInput | businessesScalarWhereInput[]
  }

  export type businessesUncheckedUpdateManyWithoutSubscription_plansNestedInput = {
    create?: XOR<businessesCreateWithoutSubscription_plansInput, businessesUncheckedCreateWithoutSubscription_plansInput> | businessesCreateWithoutSubscription_plansInput[] | businessesUncheckedCreateWithoutSubscription_plansInput[]
    connectOrCreate?: businessesCreateOrConnectWithoutSubscription_plansInput | businessesCreateOrConnectWithoutSubscription_plansInput[]
    upsert?: businessesUpsertWithWhereUniqueWithoutSubscription_plansInput | businessesUpsertWithWhereUniqueWithoutSubscription_plansInput[]
    createMany?: businessesCreateManySubscription_plansInputEnvelope
    set?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    disconnect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    delete?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    connect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    update?: businessesUpdateWithWhereUniqueWithoutSubscription_plansInput | businessesUpdateWithWhereUniqueWithoutSubscription_plansInput[]
    updateMany?: businessesUpdateManyWithWhereWithoutSubscription_plansInput | businessesUpdateManyWithWhereWithoutSubscription_plansInput[]
    deleteMany?: businessesScalarWhereInput | businessesScalarWhereInput[]
  }

  export type businessesCreateNestedManyWithoutTenantsInput = {
    create?: XOR<businessesCreateWithoutTenantsInput, businessesUncheckedCreateWithoutTenantsInput> | businessesCreateWithoutTenantsInput[] | businessesUncheckedCreateWithoutTenantsInput[]
    connectOrCreate?: businessesCreateOrConnectWithoutTenantsInput | businessesCreateOrConnectWithoutTenantsInput[]
    createMany?: businessesCreateManyTenantsInputEnvelope
    connect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
  }

  export type businessesUncheckedCreateNestedManyWithoutTenantsInput = {
    create?: XOR<businessesCreateWithoutTenantsInput, businessesUncheckedCreateWithoutTenantsInput> | businessesCreateWithoutTenantsInput[] | businessesUncheckedCreateWithoutTenantsInput[]
    connectOrCreate?: businessesCreateOrConnectWithoutTenantsInput | businessesCreateOrConnectWithoutTenantsInput[]
    createMany?: businessesCreateManyTenantsInputEnvelope
    connect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
  }

  export type businessesUpdateManyWithoutTenantsNestedInput = {
    create?: XOR<businessesCreateWithoutTenantsInput, businessesUncheckedCreateWithoutTenantsInput> | businessesCreateWithoutTenantsInput[] | businessesUncheckedCreateWithoutTenantsInput[]
    connectOrCreate?: businessesCreateOrConnectWithoutTenantsInput | businessesCreateOrConnectWithoutTenantsInput[]
    upsert?: businessesUpsertWithWhereUniqueWithoutTenantsInput | businessesUpsertWithWhereUniqueWithoutTenantsInput[]
    createMany?: businessesCreateManyTenantsInputEnvelope
    set?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    disconnect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    delete?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    connect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    update?: businessesUpdateWithWhereUniqueWithoutTenantsInput | businessesUpdateWithWhereUniqueWithoutTenantsInput[]
    updateMany?: businessesUpdateManyWithWhereWithoutTenantsInput | businessesUpdateManyWithWhereWithoutTenantsInput[]
    deleteMany?: businessesScalarWhereInput | businessesScalarWhereInput[]
  }

  export type businessesUncheckedUpdateManyWithoutTenantsNestedInput = {
    create?: XOR<businessesCreateWithoutTenantsInput, businessesUncheckedCreateWithoutTenantsInput> | businessesCreateWithoutTenantsInput[] | businessesUncheckedCreateWithoutTenantsInput[]
    connectOrCreate?: businessesCreateOrConnectWithoutTenantsInput | businessesCreateOrConnectWithoutTenantsInput[]
    upsert?: businessesUpsertWithWhereUniqueWithoutTenantsInput | businessesUpsertWithWhereUniqueWithoutTenantsInput[]
    createMany?: businessesCreateManyTenantsInputEnvelope
    set?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    disconnect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    delete?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    connect?: businessesWhereUniqueInput | businessesWhereUniqueInput[]
    update?: businessesUpdateWithWhereUniqueWithoutTenantsInput | businessesUpdateWithWhereUniqueWithoutTenantsInput[]
    updateMany?: businessesUpdateManyWithWhereWithoutTenantsInput | businessesUpdateManyWithWhereWithoutTenantsInput[]
    deleteMany?: businessesScalarWhereInput | businessesScalarWhereInput[]
  }

  export type usersCreateNestedManyWithoutRoleInput = {
    create?: XOR<usersCreateWithoutRoleInput, usersUncheckedCreateWithoutRoleInput> | usersCreateWithoutRoleInput[] | usersUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: usersCreateOrConnectWithoutRoleInput | usersCreateOrConnectWithoutRoleInput[]
    createMany?: usersCreateManyRoleInputEnvelope
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
  }

  export type usersUncheckedCreateNestedManyWithoutRoleInput = {
    create?: XOR<usersCreateWithoutRoleInput, usersUncheckedCreateWithoutRoleInput> | usersCreateWithoutRoleInput[] | usersUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: usersCreateOrConnectWithoutRoleInput | usersCreateOrConnectWithoutRoleInput[]
    createMany?: usersCreateManyRoleInputEnvelope
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type usersUpdateManyWithoutRoleNestedInput = {
    create?: XOR<usersCreateWithoutRoleInput, usersUncheckedCreateWithoutRoleInput> | usersCreateWithoutRoleInput[] | usersUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: usersCreateOrConnectWithoutRoleInput | usersCreateOrConnectWithoutRoleInput[]
    upsert?: usersUpsertWithWhereUniqueWithoutRoleInput | usersUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: usersCreateManyRoleInputEnvelope
    set?: usersWhereUniqueInput | usersWhereUniqueInput[]
    disconnect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    delete?: usersWhereUniqueInput | usersWhereUniqueInput[]
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    update?: usersUpdateWithWhereUniqueWithoutRoleInput | usersUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: usersUpdateManyWithWhereWithoutRoleInput | usersUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: usersScalarWhereInput | usersScalarWhereInput[]
  }

  export type usersUncheckedUpdateManyWithoutRoleNestedInput = {
    create?: XOR<usersCreateWithoutRoleInput, usersUncheckedCreateWithoutRoleInput> | usersCreateWithoutRoleInput[] | usersUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: usersCreateOrConnectWithoutRoleInput | usersCreateOrConnectWithoutRoleInput[]
    upsert?: usersUpsertWithWhereUniqueWithoutRoleInput | usersUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: usersCreateManyRoleInputEnvelope
    set?: usersWhereUniqueInput | usersWhereUniqueInput[]
    disconnect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    delete?: usersWhereUniqueInput | usersWhereUniqueInput[]
    connect?: usersWhereUniqueInput | usersWhereUniqueInput[]
    update?: usersUpdateWithWhereUniqueWithoutRoleInput | usersUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: usersUpdateManyWithWhereWithoutRoleInput | usersUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: usersScalarWhereInput | usersScalarWhereInput[]
  }

  export type intentsCreateNestedOneWithoutRole_intentsInput = {
    create?: XOR<intentsCreateWithoutRole_intentsInput, intentsUncheckedCreateWithoutRole_intentsInput>
    connectOrCreate?: intentsCreateOrConnectWithoutRole_intentsInput
    connect?: intentsWhereUniqueInput
  }

  export type intentsUpdateOneRequiredWithoutRole_intentsNestedInput = {
    create?: XOR<intentsCreateWithoutRole_intentsInput, intentsUncheckedCreateWithoutRole_intentsInput>
    connectOrCreate?: intentsCreateOrConnectWithoutRole_intentsInput
    upsert?: intentsUpsertWithoutRole_intentsInput
    connect?: intentsWhereUniqueInput
    update?: XOR<XOR<intentsUpdateToOneWithWhereWithoutRole_intentsInput, intentsUpdateWithoutRole_intentsInput>, intentsUncheckedUpdateWithoutRole_intentsInput>
  }

  export type role_intentsCreateNestedManyWithoutIntentInput = {
    create?: XOR<role_intentsCreateWithoutIntentInput, role_intentsUncheckedCreateWithoutIntentInput> | role_intentsCreateWithoutIntentInput[] | role_intentsUncheckedCreateWithoutIntentInput[]
    connectOrCreate?: role_intentsCreateOrConnectWithoutIntentInput | role_intentsCreateOrConnectWithoutIntentInput[]
    createMany?: role_intentsCreateManyIntentInputEnvelope
    connect?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
  }

  export type notificationsCreateNestedManyWithoutIntentInput = {
    create?: XOR<notificationsCreateWithoutIntentInput, notificationsUncheckedCreateWithoutIntentInput> | notificationsCreateWithoutIntentInput[] | notificationsUncheckedCreateWithoutIntentInput[]
    connectOrCreate?: notificationsCreateOrConnectWithoutIntentInput | notificationsCreateOrConnectWithoutIntentInput[]
    createMany?: notificationsCreateManyIntentInputEnvelope
    connect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
  }

  export type role_intentsUncheckedCreateNestedManyWithoutIntentInput = {
    create?: XOR<role_intentsCreateWithoutIntentInput, role_intentsUncheckedCreateWithoutIntentInput> | role_intentsCreateWithoutIntentInput[] | role_intentsUncheckedCreateWithoutIntentInput[]
    connectOrCreate?: role_intentsCreateOrConnectWithoutIntentInput | role_intentsCreateOrConnectWithoutIntentInput[]
    createMany?: role_intentsCreateManyIntentInputEnvelope
    connect?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
  }

  export type notificationsUncheckedCreateNestedManyWithoutIntentInput = {
    create?: XOR<notificationsCreateWithoutIntentInput, notificationsUncheckedCreateWithoutIntentInput> | notificationsCreateWithoutIntentInput[] | notificationsUncheckedCreateWithoutIntentInput[]
    connectOrCreate?: notificationsCreateOrConnectWithoutIntentInput | notificationsCreateOrConnectWithoutIntentInput[]
    createMany?: notificationsCreateManyIntentInputEnvelope
    connect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
  }

  export type role_intentsUpdateManyWithoutIntentNestedInput = {
    create?: XOR<role_intentsCreateWithoutIntentInput, role_intentsUncheckedCreateWithoutIntentInput> | role_intentsCreateWithoutIntentInput[] | role_intentsUncheckedCreateWithoutIntentInput[]
    connectOrCreate?: role_intentsCreateOrConnectWithoutIntentInput | role_intentsCreateOrConnectWithoutIntentInput[]
    upsert?: role_intentsUpsertWithWhereUniqueWithoutIntentInput | role_intentsUpsertWithWhereUniqueWithoutIntentInput[]
    createMany?: role_intentsCreateManyIntentInputEnvelope
    set?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
    disconnect?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
    delete?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
    connect?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
    update?: role_intentsUpdateWithWhereUniqueWithoutIntentInput | role_intentsUpdateWithWhereUniqueWithoutIntentInput[]
    updateMany?: role_intentsUpdateManyWithWhereWithoutIntentInput | role_intentsUpdateManyWithWhereWithoutIntentInput[]
    deleteMany?: role_intentsScalarWhereInput | role_intentsScalarWhereInput[]
  }

  export type notificationsUpdateManyWithoutIntentNestedInput = {
    create?: XOR<notificationsCreateWithoutIntentInput, notificationsUncheckedCreateWithoutIntentInput> | notificationsCreateWithoutIntentInput[] | notificationsUncheckedCreateWithoutIntentInput[]
    connectOrCreate?: notificationsCreateOrConnectWithoutIntentInput | notificationsCreateOrConnectWithoutIntentInput[]
    upsert?: notificationsUpsertWithWhereUniqueWithoutIntentInput | notificationsUpsertWithWhereUniqueWithoutIntentInput[]
    createMany?: notificationsCreateManyIntentInputEnvelope
    set?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    disconnect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    delete?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    connect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    update?: notificationsUpdateWithWhereUniqueWithoutIntentInput | notificationsUpdateWithWhereUniqueWithoutIntentInput[]
    updateMany?: notificationsUpdateManyWithWhereWithoutIntentInput | notificationsUpdateManyWithWhereWithoutIntentInput[]
    deleteMany?: notificationsScalarWhereInput | notificationsScalarWhereInput[]
  }

  export type role_intentsUncheckedUpdateManyWithoutIntentNestedInput = {
    create?: XOR<role_intentsCreateWithoutIntentInput, role_intentsUncheckedCreateWithoutIntentInput> | role_intentsCreateWithoutIntentInput[] | role_intentsUncheckedCreateWithoutIntentInput[]
    connectOrCreate?: role_intentsCreateOrConnectWithoutIntentInput | role_intentsCreateOrConnectWithoutIntentInput[]
    upsert?: role_intentsUpsertWithWhereUniqueWithoutIntentInput | role_intentsUpsertWithWhereUniqueWithoutIntentInput[]
    createMany?: role_intentsCreateManyIntentInputEnvelope
    set?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
    disconnect?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
    delete?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
    connect?: role_intentsWhereUniqueInput | role_intentsWhereUniqueInput[]
    update?: role_intentsUpdateWithWhereUniqueWithoutIntentInput | role_intentsUpdateWithWhereUniqueWithoutIntentInput[]
    updateMany?: role_intentsUpdateManyWithWhereWithoutIntentInput | role_intentsUpdateManyWithWhereWithoutIntentInput[]
    deleteMany?: role_intentsScalarWhereInput | role_intentsScalarWhereInput[]
  }

  export type notificationsUncheckedUpdateManyWithoutIntentNestedInput = {
    create?: XOR<notificationsCreateWithoutIntentInput, notificationsUncheckedCreateWithoutIntentInput> | notificationsCreateWithoutIntentInput[] | notificationsUncheckedCreateWithoutIntentInput[]
    connectOrCreate?: notificationsCreateOrConnectWithoutIntentInput | notificationsCreateOrConnectWithoutIntentInput[]
    upsert?: notificationsUpsertWithWhereUniqueWithoutIntentInput | notificationsUpsertWithWhereUniqueWithoutIntentInput[]
    createMany?: notificationsCreateManyIntentInputEnvelope
    set?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    disconnect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    delete?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    connect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    update?: notificationsUpdateWithWhereUniqueWithoutIntentInput | notificationsUpdateWithWhereUniqueWithoutIntentInput[]
    updateMany?: notificationsUpdateManyWithWhereWithoutIntentInput | notificationsUpdateManyWithWhereWithoutIntentInput[]
    deleteMany?: notificationsScalarWhereInput | notificationsScalarWhereInput[]
  }

  export type usersCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<usersCreateWithoutNotificationsInput, usersUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: usersCreateOrConnectWithoutNotificationsInput
    connect?: usersWhereUniqueInput
  }

  export type intentsCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<intentsCreateWithoutNotificationsInput, intentsUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: intentsCreateOrConnectWithoutNotificationsInput
    connect?: intentsWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type usersUpdateOneRequiredWithoutNotificationsNestedInput = {
    create?: XOR<usersCreateWithoutNotificationsInput, usersUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: usersCreateOrConnectWithoutNotificationsInput
    upsert?: usersUpsertWithoutNotificationsInput
    connect?: usersWhereUniqueInput
    update?: XOR<XOR<usersUpdateToOneWithWhereWithoutNotificationsInput, usersUpdateWithoutNotificationsInput>, usersUncheckedUpdateWithoutNotificationsInput>
  }

  export type intentsUpdateOneRequiredWithoutNotificationsNestedInput = {
    create?: XOR<intentsCreateWithoutNotificationsInput, intentsUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: intentsCreateOrConnectWithoutNotificationsInput
    upsert?: intentsUpsertWithoutNotificationsInput
    connect?: intentsWhereUniqueInput
    update?: XOR<XOR<intentsUpdateToOneWithWhereWithoutNotificationsInput, intentsUpdateWithoutNotificationsInput>, intentsUncheckedUpdateWithoutNotificationsInput>
  }

  export type businessesCreateNestedOneWithoutUsersInput = {
    create?: XOR<businessesCreateWithoutUsersInput, businessesUncheckedCreateWithoutUsersInput>
    connectOrCreate?: businessesCreateOrConnectWithoutUsersInput
    connect?: businessesWhereUniqueInput
  }

  export type rolesCreateNestedOneWithoutUsersInput = {
    create?: XOR<rolesCreateWithoutUsersInput, rolesUncheckedCreateWithoutUsersInput>
    connectOrCreate?: rolesCreateOrConnectWithoutUsersInput
    connect?: rolesWhereUniqueInput
  }

  export type notificationsCreateNestedManyWithoutUserInput = {
    create?: XOR<notificationsCreateWithoutUserInput, notificationsUncheckedCreateWithoutUserInput> | notificationsCreateWithoutUserInput[] | notificationsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: notificationsCreateOrConnectWithoutUserInput | notificationsCreateOrConnectWithoutUserInput[]
    createMany?: notificationsCreateManyUserInputEnvelope
    connect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
  }

  export type notificationsUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<notificationsCreateWithoutUserInput, notificationsUncheckedCreateWithoutUserInput> | notificationsCreateWithoutUserInput[] | notificationsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: notificationsCreateOrConnectWithoutUserInput | notificationsCreateOrConnectWithoutUserInput[]
    createMany?: notificationsCreateManyUserInputEnvelope
    connect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
  }

  export type businessesUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<businessesCreateWithoutUsersInput, businessesUncheckedCreateWithoutUsersInput>
    connectOrCreate?: businessesCreateOrConnectWithoutUsersInput
    upsert?: businessesUpsertWithoutUsersInput
    connect?: businessesWhereUniqueInput
    update?: XOR<XOR<businessesUpdateToOneWithWhereWithoutUsersInput, businessesUpdateWithoutUsersInput>, businessesUncheckedUpdateWithoutUsersInput>
  }

  export type rolesUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<rolesCreateWithoutUsersInput, rolesUncheckedCreateWithoutUsersInput>
    connectOrCreate?: rolesCreateOrConnectWithoutUsersInput
    upsert?: rolesUpsertWithoutUsersInput
    connect?: rolesWhereUniqueInput
    update?: XOR<XOR<rolesUpdateToOneWithWhereWithoutUsersInput, rolesUpdateWithoutUsersInput>, rolesUncheckedUpdateWithoutUsersInput>
  }

  export type notificationsUpdateManyWithoutUserNestedInput = {
    create?: XOR<notificationsCreateWithoutUserInput, notificationsUncheckedCreateWithoutUserInput> | notificationsCreateWithoutUserInput[] | notificationsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: notificationsCreateOrConnectWithoutUserInput | notificationsCreateOrConnectWithoutUserInput[]
    upsert?: notificationsUpsertWithWhereUniqueWithoutUserInput | notificationsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: notificationsCreateManyUserInputEnvelope
    set?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    disconnect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    delete?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    connect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    update?: notificationsUpdateWithWhereUniqueWithoutUserInput | notificationsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: notificationsUpdateManyWithWhereWithoutUserInput | notificationsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: notificationsScalarWhereInput | notificationsScalarWhereInput[]
  }

  export type notificationsUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<notificationsCreateWithoutUserInput, notificationsUncheckedCreateWithoutUserInput> | notificationsCreateWithoutUserInput[] | notificationsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: notificationsCreateOrConnectWithoutUserInput | notificationsCreateOrConnectWithoutUserInput[]
    upsert?: notificationsUpsertWithWhereUniqueWithoutUserInput | notificationsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: notificationsCreateManyUserInputEnvelope
    set?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    disconnect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    delete?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    connect?: notificationsWhereUniqueInput | notificationsWhereUniqueInput[]
    update?: notificationsUpdateWithWhereUniqueWithoutUserInput | notificationsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: notificationsUpdateManyWithWhereWithoutUserInput | notificationsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: notificationsScalarWhereInput | notificationsScalarWhereInput[]
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
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

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type subscription_plansCreateWithoutBusinessesInput = {
    subscription_plan_id?: string
    plan_name: string
    price?: Decimal | DecimalJsLike | number | string | null
    duration_in_days?: number | null
    created_at?: Date | string | null
  }

  export type subscription_plansUncheckedCreateWithoutBusinessesInput = {
    subscription_plan_id?: string
    plan_name: string
    price?: Decimal | DecimalJsLike | number | string | null
    duration_in_days?: number | null
    created_at?: Date | string | null
  }

  export type subscription_plansCreateOrConnectWithoutBusinessesInput = {
    where: subscription_plansWhereUniqueInput
    create: XOR<subscription_plansCreateWithoutBusinessesInput, subscription_plansUncheckedCreateWithoutBusinessesInput>
  }

  export type tenantsCreateWithoutBusinessesInput = {
    tenant_id?: string
    tenant_name: string
    email: string
    phone_number?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    address?: string | null
    gst_number?: string | null
    pan_number?: string | null
    registration_no?: string | null
  }

  export type tenantsUncheckedCreateWithoutBusinessesInput = {
    tenant_id?: string
    tenant_name: string
    email: string
    phone_number?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    address?: string | null
    gst_number?: string | null
    pan_number?: string | null
    registration_no?: string | null
  }

  export type tenantsCreateOrConnectWithoutBusinessesInput = {
    where: tenantsWhereUniqueInput
    create: XOR<tenantsCreateWithoutBusinessesInput, tenantsUncheckedCreateWithoutBusinessesInput>
  }

  export type social_accountsCreateWithoutBusinessesInput = {
    account_id?: string
    platform: string
    platform_user_id: string
    page_id?: string | null
    access_token: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: Date | string | null
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type social_accountsUncheckedCreateWithoutBusinessesInput = {
    account_id?: string
    platform: string
    platform_user_id: string
    page_id?: string | null
    access_token: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: Date | string | null
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type social_accountsCreateOrConnectWithoutBusinessesInput = {
    where: social_accountsWhereUniqueInput
    create: XOR<social_accountsCreateWithoutBusinessesInput, social_accountsUncheckedCreateWithoutBusinessesInput>
  }

  export type social_accountsCreateManyBusinessesInputEnvelope = {
    data: social_accountsCreateManyBusinessesInput | social_accountsCreateManyBusinessesInput[]
    skipDuplicates?: boolean
  }

  export type usersCreateWithoutBusinessesInput = {
    user_id?: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
    role: rolesCreateNestedOneWithoutUsersInput
    notifications?: notificationsCreateNestedManyWithoutUserInput
  }

  export type usersUncheckedCreateWithoutBusinessesInput = {
    user_id?: string
    role_id: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
    notifications?: notificationsUncheckedCreateNestedManyWithoutUserInput
  }

  export type usersCreateOrConnectWithoutBusinessesInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutBusinessesInput, usersUncheckedCreateWithoutBusinessesInput>
  }

  export type usersCreateManyBusinessesInputEnvelope = {
    data: usersCreateManyBusinessesInput | usersCreateManyBusinessesInput[]
    skipDuplicates?: boolean
  }

  export type subscription_plansUpsertWithoutBusinessesInput = {
    update: XOR<subscription_plansUpdateWithoutBusinessesInput, subscription_plansUncheckedUpdateWithoutBusinessesInput>
    create: XOR<subscription_plansCreateWithoutBusinessesInput, subscription_plansUncheckedCreateWithoutBusinessesInput>
    where?: subscription_plansWhereInput
  }

  export type subscription_plansUpdateToOneWithWhereWithoutBusinessesInput = {
    where?: subscription_plansWhereInput
    data: XOR<subscription_plansUpdateWithoutBusinessesInput, subscription_plansUncheckedUpdateWithoutBusinessesInput>
  }

  export type subscription_plansUpdateWithoutBusinessesInput = {
    subscription_plan_id?: StringFieldUpdateOperationsInput | string
    plan_name?: StringFieldUpdateOperationsInput | string
    price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type subscription_plansUncheckedUpdateWithoutBusinessesInput = {
    subscription_plan_id?: StringFieldUpdateOperationsInput | string
    plan_name?: StringFieldUpdateOperationsInput | string
    price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    duration_in_days?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tenantsUpsertWithoutBusinessesInput = {
    update: XOR<tenantsUpdateWithoutBusinessesInput, tenantsUncheckedUpdateWithoutBusinessesInput>
    create: XOR<tenantsCreateWithoutBusinessesInput, tenantsUncheckedCreateWithoutBusinessesInput>
    where?: tenantsWhereInput
  }

  export type tenantsUpdateToOneWithWhereWithoutBusinessesInput = {
    where?: tenantsWhereInput
    data: XOR<tenantsUpdateWithoutBusinessesInput, tenantsUncheckedUpdateWithoutBusinessesInput>
  }

  export type tenantsUpdateWithoutBusinessesInput = {
    tenant_id?: StringFieldUpdateOperationsInput | string
    tenant_name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gst_number?: NullableStringFieldUpdateOperationsInput | string | null
    pan_number?: NullableStringFieldUpdateOperationsInput | string | null
    registration_no?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tenantsUncheckedUpdateWithoutBusinessesInput = {
    tenant_id?: StringFieldUpdateOperationsInput | string
    tenant_name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone_number?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    gst_number?: NullableStringFieldUpdateOperationsInput | string | null
    pan_number?: NullableStringFieldUpdateOperationsInput | string | null
    registration_no?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type social_accountsUpsertWithWhereUniqueWithoutBusinessesInput = {
    where: social_accountsWhereUniqueInput
    update: XOR<social_accountsUpdateWithoutBusinessesInput, social_accountsUncheckedUpdateWithoutBusinessesInput>
    create: XOR<social_accountsCreateWithoutBusinessesInput, social_accountsUncheckedCreateWithoutBusinessesInput>
  }

  export type social_accountsUpdateWithWhereUniqueWithoutBusinessesInput = {
    where: social_accountsWhereUniqueInput
    data: XOR<social_accountsUpdateWithoutBusinessesInput, social_accountsUncheckedUpdateWithoutBusinessesInput>
  }

  export type social_accountsUpdateManyWithWhereWithoutBusinessesInput = {
    where: social_accountsScalarWhereInput
    data: XOR<social_accountsUpdateManyMutationInput, social_accountsUncheckedUpdateManyWithoutBusinessesInput>
  }

  export type social_accountsScalarWhereInput = {
    AND?: social_accountsScalarWhereInput | social_accountsScalarWhereInput[]
    OR?: social_accountsScalarWhereInput[]
    NOT?: social_accountsScalarWhereInput | social_accountsScalarWhereInput[]
    account_id?: UuidFilter<"social_accounts"> | string
    business_id?: UuidFilter<"social_accounts"> | string
    platform?: StringFilter<"social_accounts"> | string
    platform_user_id?: StringFilter<"social_accounts"> | string
    page_id?: StringNullableFilter<"social_accounts"> | string | null
    access_token?: StringFilter<"social_accounts"> | string
    permissions?: JsonNullableFilter<"social_accounts">
    token_expiry?: DateTimeNullableFilter<"social_accounts"> | Date | string | null
    is_active?: BoolNullableFilter<"social_accounts"> | boolean | null
    created_at?: DateTimeNullableFilter<"social_accounts"> | Date | string | null
  }

  export type usersUpsertWithWhereUniqueWithoutBusinessesInput = {
    where: usersWhereUniqueInput
    update: XOR<usersUpdateWithoutBusinessesInput, usersUncheckedUpdateWithoutBusinessesInput>
    create: XOR<usersCreateWithoutBusinessesInput, usersUncheckedCreateWithoutBusinessesInput>
  }

  export type usersUpdateWithWhereUniqueWithoutBusinessesInput = {
    where: usersWhereUniqueInput
    data: XOR<usersUpdateWithoutBusinessesInput, usersUncheckedUpdateWithoutBusinessesInput>
  }

  export type usersUpdateManyWithWhereWithoutBusinessesInput = {
    where: usersScalarWhereInput
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyWithoutBusinessesInput>
  }

  export type usersScalarWhereInput = {
    AND?: usersScalarWhereInput | usersScalarWhereInput[]
    OR?: usersScalarWhereInput[]
    NOT?: usersScalarWhereInput | usersScalarWhereInput[]
    user_id?: UuidFilter<"users"> | string
    business_id?: UuidFilter<"users"> | string
    role_id?: UuidFilter<"users"> | string
    email?: StringFilter<"users"> | string
    name?: StringFilter<"users"> | string
    is_active?: BoolNullableFilter<"users"> | boolean | null
    created_at?: DateTimeNullableFilter<"users"> | Date | string | null
  }

  export type businessesCreateWithoutSocial_accountsInput = {
    business_id?: string
    business_name: string
    business_type?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    subscription_plans?: subscription_plansCreateNestedOneWithoutBusinessesInput
    tenants: tenantsCreateNestedOneWithoutBusinessesInput
    users?: usersCreateNestedManyWithoutBusinessesInput
  }

  export type businessesUncheckedCreateWithoutSocial_accountsInput = {
    business_id?: string
    tenant_id: string
    business_name: string
    business_type?: string | null
    subscription_plan_id?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    users?: usersUncheckedCreateNestedManyWithoutBusinessesInput
  }

  export type businessesCreateOrConnectWithoutSocial_accountsInput = {
    where: businessesWhereUniqueInput
    create: XOR<businessesCreateWithoutSocial_accountsInput, businessesUncheckedCreateWithoutSocial_accountsInput>
  }

  export type businessesUpsertWithoutSocial_accountsInput = {
    update: XOR<businessesUpdateWithoutSocial_accountsInput, businessesUncheckedUpdateWithoutSocial_accountsInput>
    create: XOR<businessesCreateWithoutSocial_accountsInput, businessesUncheckedCreateWithoutSocial_accountsInput>
    where?: businessesWhereInput
  }

  export type businessesUpdateToOneWithWhereWithoutSocial_accountsInput = {
    where?: businessesWhereInput
    data: XOR<businessesUpdateWithoutSocial_accountsInput, businessesUncheckedUpdateWithoutSocial_accountsInput>
  }

  export type businessesUpdateWithoutSocial_accountsInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscription_plans?: subscription_plansUpdateOneWithoutBusinessesNestedInput
    tenants?: tenantsUpdateOneRequiredWithoutBusinessesNestedInput
    users?: usersUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesUncheckedUpdateWithoutSocial_accountsInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_plan_id?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    users?: usersUncheckedUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesCreateWithoutSubscription_plansInput = {
    business_id?: string
    business_name: string
    business_type?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    tenants: tenantsCreateNestedOneWithoutBusinessesInput
    social_accounts?: social_accountsCreateNestedManyWithoutBusinessesInput
    users?: usersCreateNestedManyWithoutBusinessesInput
  }

  export type businessesUncheckedCreateWithoutSubscription_plansInput = {
    business_id?: string
    tenant_id: string
    business_name: string
    business_type?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    social_accounts?: social_accountsUncheckedCreateNestedManyWithoutBusinessesInput
    users?: usersUncheckedCreateNestedManyWithoutBusinessesInput
  }

  export type businessesCreateOrConnectWithoutSubscription_plansInput = {
    where: businessesWhereUniqueInput
    create: XOR<businessesCreateWithoutSubscription_plansInput, businessesUncheckedCreateWithoutSubscription_plansInput>
  }

  export type businessesCreateManySubscription_plansInputEnvelope = {
    data: businessesCreateManySubscription_plansInput | businessesCreateManySubscription_plansInput[]
    skipDuplicates?: boolean
  }

  export type businessesUpsertWithWhereUniqueWithoutSubscription_plansInput = {
    where: businessesWhereUniqueInput
    update: XOR<businessesUpdateWithoutSubscription_plansInput, businessesUncheckedUpdateWithoutSubscription_plansInput>
    create: XOR<businessesCreateWithoutSubscription_plansInput, businessesUncheckedCreateWithoutSubscription_plansInput>
  }

  export type businessesUpdateWithWhereUniqueWithoutSubscription_plansInput = {
    where: businessesWhereUniqueInput
    data: XOR<businessesUpdateWithoutSubscription_plansInput, businessesUncheckedUpdateWithoutSubscription_plansInput>
  }

  export type businessesUpdateManyWithWhereWithoutSubscription_plansInput = {
    where: businessesScalarWhereInput
    data: XOR<businessesUpdateManyMutationInput, businessesUncheckedUpdateManyWithoutSubscription_plansInput>
  }

  export type businessesScalarWhereInput = {
    AND?: businessesScalarWhereInput | businessesScalarWhereInput[]
    OR?: businessesScalarWhereInput[]
    NOT?: businessesScalarWhereInput | businessesScalarWhereInput[]
    business_id?: UuidFilter<"businesses"> | string
    tenant_id?: UuidFilter<"businesses"> | string
    business_name?: StringFilter<"businesses"> | string
    business_type?: StringNullableFilter<"businesses"> | string | null
    subscription_plan_id?: UuidNullableFilter<"businesses"> | string | null
    whatsapp_number?: StringNullableFilter<"businesses"> | string | null
    brand_colors?: JsonNullableFilter<"businesses">
    logo_url?: StringNullableFilter<"businesses"> | string | null
    working_hours?: JsonNullableFilter<"businesses">
    created_at?: DateTimeNullableFilter<"businesses"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"businesses"> | Date | string | null
  }

  export type businessesCreateWithoutTenantsInput = {
    business_id?: string
    business_name: string
    business_type?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    subscription_plans?: subscription_plansCreateNestedOneWithoutBusinessesInput
    social_accounts?: social_accountsCreateNestedManyWithoutBusinessesInput
    users?: usersCreateNestedManyWithoutBusinessesInput
  }

  export type businessesUncheckedCreateWithoutTenantsInput = {
    business_id?: string
    business_name: string
    business_type?: string | null
    subscription_plan_id?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    social_accounts?: social_accountsUncheckedCreateNestedManyWithoutBusinessesInput
    users?: usersUncheckedCreateNestedManyWithoutBusinessesInput
  }

  export type businessesCreateOrConnectWithoutTenantsInput = {
    where: businessesWhereUniqueInput
    create: XOR<businessesCreateWithoutTenantsInput, businessesUncheckedCreateWithoutTenantsInput>
  }

  export type businessesCreateManyTenantsInputEnvelope = {
    data: businessesCreateManyTenantsInput | businessesCreateManyTenantsInput[]
    skipDuplicates?: boolean
  }

  export type businessesUpsertWithWhereUniqueWithoutTenantsInput = {
    where: businessesWhereUniqueInput
    update: XOR<businessesUpdateWithoutTenantsInput, businessesUncheckedUpdateWithoutTenantsInput>
    create: XOR<businessesCreateWithoutTenantsInput, businessesUncheckedCreateWithoutTenantsInput>
  }

  export type businessesUpdateWithWhereUniqueWithoutTenantsInput = {
    where: businessesWhereUniqueInput
    data: XOR<businessesUpdateWithoutTenantsInput, businessesUncheckedUpdateWithoutTenantsInput>
  }

  export type businessesUpdateManyWithWhereWithoutTenantsInput = {
    where: businessesScalarWhereInput
    data: XOR<businessesUpdateManyMutationInput, businessesUncheckedUpdateManyWithoutTenantsInput>
  }

  export type usersCreateWithoutRoleInput = {
    user_id?: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
    businesses: businessesCreateNestedOneWithoutUsersInput
    notifications?: notificationsCreateNestedManyWithoutUserInput
  }

  export type usersUncheckedCreateWithoutRoleInput = {
    user_id?: string
    business_id: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
    notifications?: notificationsUncheckedCreateNestedManyWithoutUserInput
  }

  export type usersCreateOrConnectWithoutRoleInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutRoleInput, usersUncheckedCreateWithoutRoleInput>
  }

  export type usersCreateManyRoleInputEnvelope = {
    data: usersCreateManyRoleInput | usersCreateManyRoleInput[]
    skipDuplicates?: boolean
  }

  export type usersUpsertWithWhereUniqueWithoutRoleInput = {
    where: usersWhereUniqueInput
    update: XOR<usersUpdateWithoutRoleInput, usersUncheckedUpdateWithoutRoleInput>
    create: XOR<usersCreateWithoutRoleInput, usersUncheckedCreateWithoutRoleInput>
  }

  export type usersUpdateWithWhereUniqueWithoutRoleInput = {
    where: usersWhereUniqueInput
    data: XOR<usersUpdateWithoutRoleInput, usersUncheckedUpdateWithoutRoleInput>
  }

  export type usersUpdateManyWithWhereWithoutRoleInput = {
    where: usersScalarWhereInput
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyWithoutRoleInput>
  }

  export type intentsCreateWithoutRole_intentsInput = {
    intent_id?: string
    intent_name: string
    created_at?: Date | string | null
    notifications?: notificationsCreateNestedManyWithoutIntentInput
  }

  export type intentsUncheckedCreateWithoutRole_intentsInput = {
    intent_id?: string
    intent_name: string
    created_at?: Date | string | null
    notifications?: notificationsUncheckedCreateNestedManyWithoutIntentInput
  }

  export type intentsCreateOrConnectWithoutRole_intentsInput = {
    where: intentsWhereUniqueInput
    create: XOR<intentsCreateWithoutRole_intentsInput, intentsUncheckedCreateWithoutRole_intentsInput>
  }

  export type intentsUpsertWithoutRole_intentsInput = {
    update: XOR<intentsUpdateWithoutRole_intentsInput, intentsUncheckedUpdateWithoutRole_intentsInput>
    create: XOR<intentsCreateWithoutRole_intentsInput, intentsUncheckedCreateWithoutRole_intentsInput>
    where?: intentsWhereInput
  }

  export type intentsUpdateToOneWithWhereWithoutRole_intentsInput = {
    where?: intentsWhereInput
    data: XOR<intentsUpdateWithoutRole_intentsInput, intentsUncheckedUpdateWithoutRole_intentsInput>
  }

  export type intentsUpdateWithoutRole_intentsInput = {
    intent_id?: StringFieldUpdateOperationsInput | string
    intent_name?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notifications?: notificationsUpdateManyWithoutIntentNestedInput
  }

  export type intentsUncheckedUpdateWithoutRole_intentsInput = {
    intent_id?: StringFieldUpdateOperationsInput | string
    intent_name?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notifications?: notificationsUncheckedUpdateManyWithoutIntentNestedInput
  }

  export type role_intentsCreateWithoutIntentInput = {
    role_id: string
    created_at?: Date | string | null
  }

  export type role_intentsUncheckedCreateWithoutIntentInput = {
    role_id: string
    created_at?: Date | string | null
  }

  export type role_intentsCreateOrConnectWithoutIntentInput = {
    where: role_intentsWhereUniqueInput
    create: XOR<role_intentsCreateWithoutIntentInput, role_intentsUncheckedCreateWithoutIntentInput>
  }

  export type role_intentsCreateManyIntentInputEnvelope = {
    data: role_intentsCreateManyIntentInput | role_intentsCreateManyIntentInput[]
    skipDuplicates?: boolean
  }

  export type notificationsCreateWithoutIntentInput = {
    notification_id?: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
    user: usersCreateNestedOneWithoutNotificationsInput
  }

  export type notificationsUncheckedCreateWithoutIntentInput = {
    notification_id?: string
    user_id: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
  }

  export type notificationsCreateOrConnectWithoutIntentInput = {
    where: notificationsWhereUniqueInput
    create: XOR<notificationsCreateWithoutIntentInput, notificationsUncheckedCreateWithoutIntentInput>
  }

  export type notificationsCreateManyIntentInputEnvelope = {
    data: notificationsCreateManyIntentInput | notificationsCreateManyIntentInput[]
    skipDuplicates?: boolean
  }

  export type role_intentsUpsertWithWhereUniqueWithoutIntentInput = {
    where: role_intentsWhereUniqueInput
    update: XOR<role_intentsUpdateWithoutIntentInput, role_intentsUncheckedUpdateWithoutIntentInput>
    create: XOR<role_intentsCreateWithoutIntentInput, role_intentsUncheckedCreateWithoutIntentInput>
  }

  export type role_intentsUpdateWithWhereUniqueWithoutIntentInput = {
    where: role_intentsWhereUniqueInput
    data: XOR<role_intentsUpdateWithoutIntentInput, role_intentsUncheckedUpdateWithoutIntentInput>
  }

  export type role_intentsUpdateManyWithWhereWithoutIntentInput = {
    where: role_intentsScalarWhereInput
    data: XOR<role_intentsUpdateManyMutationInput, role_intentsUncheckedUpdateManyWithoutIntentInput>
  }

  export type role_intentsScalarWhereInput = {
    AND?: role_intentsScalarWhereInput | role_intentsScalarWhereInput[]
    OR?: role_intentsScalarWhereInput[]
    NOT?: role_intentsScalarWhereInput | role_intentsScalarWhereInput[]
    role_id?: UuidFilter<"role_intents"> | string
    intent_id?: UuidFilter<"role_intents"> | string
    created_at?: DateTimeNullableFilter<"role_intents"> | Date | string | null
  }

  export type notificationsUpsertWithWhereUniqueWithoutIntentInput = {
    where: notificationsWhereUniqueInput
    update: XOR<notificationsUpdateWithoutIntentInput, notificationsUncheckedUpdateWithoutIntentInput>
    create: XOR<notificationsCreateWithoutIntentInput, notificationsUncheckedCreateWithoutIntentInput>
  }

  export type notificationsUpdateWithWhereUniqueWithoutIntentInput = {
    where: notificationsWhereUniqueInput
    data: XOR<notificationsUpdateWithoutIntentInput, notificationsUncheckedUpdateWithoutIntentInput>
  }

  export type notificationsUpdateManyWithWhereWithoutIntentInput = {
    where: notificationsScalarWhereInput
    data: XOR<notificationsUpdateManyMutationInput, notificationsUncheckedUpdateManyWithoutIntentInput>
  }

  export type notificationsScalarWhereInput = {
    AND?: notificationsScalarWhereInput | notificationsScalarWhereInput[]
    OR?: notificationsScalarWhereInput[]
    NOT?: notificationsScalarWhereInput | notificationsScalarWhereInput[]
    notification_id?: UuidFilter<"notifications"> | string
    user_id?: UuidFilter<"notifications"> | string
    intent_id?: UuidFilter<"notifications"> | string
    message?: StringFilter<"notifications"> | string
    read_status?: BoolFilter<"notifications"> | boolean
    created_at?: DateTimeNullableFilter<"notifications"> | Date | string | null
  }

  export type usersCreateWithoutNotificationsInput = {
    user_id?: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
    businesses: businessesCreateNestedOneWithoutUsersInput
    role: rolesCreateNestedOneWithoutUsersInput
  }

  export type usersUncheckedCreateWithoutNotificationsInput = {
    user_id?: string
    business_id: string
    role_id: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type usersCreateOrConnectWithoutNotificationsInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutNotificationsInput, usersUncheckedCreateWithoutNotificationsInput>
  }

  export type intentsCreateWithoutNotificationsInput = {
    intent_id?: string
    intent_name: string
    created_at?: Date | string | null
    role_intents?: role_intentsCreateNestedManyWithoutIntentInput
  }

  export type intentsUncheckedCreateWithoutNotificationsInput = {
    intent_id?: string
    intent_name: string
    created_at?: Date | string | null
    role_intents?: role_intentsUncheckedCreateNestedManyWithoutIntentInput
  }

  export type intentsCreateOrConnectWithoutNotificationsInput = {
    where: intentsWhereUniqueInput
    create: XOR<intentsCreateWithoutNotificationsInput, intentsUncheckedCreateWithoutNotificationsInput>
  }

  export type usersUpsertWithoutNotificationsInput = {
    update: XOR<usersUpdateWithoutNotificationsInput, usersUncheckedUpdateWithoutNotificationsInput>
    create: XOR<usersCreateWithoutNotificationsInput, usersUncheckedCreateWithoutNotificationsInput>
    where?: usersWhereInput
  }

  export type usersUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: usersWhereInput
    data: XOR<usersUpdateWithoutNotificationsInput, usersUncheckedUpdateWithoutNotificationsInput>
  }

  export type usersUpdateWithoutNotificationsInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    businesses?: businessesUpdateOneRequiredWithoutUsersNestedInput
    role?: rolesUpdateOneRequiredWithoutUsersNestedInput
  }

  export type usersUncheckedUpdateWithoutNotificationsInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    business_id?: StringFieldUpdateOperationsInput | string
    role_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type intentsUpsertWithoutNotificationsInput = {
    update: XOR<intentsUpdateWithoutNotificationsInput, intentsUncheckedUpdateWithoutNotificationsInput>
    create: XOR<intentsCreateWithoutNotificationsInput, intentsUncheckedCreateWithoutNotificationsInput>
    where?: intentsWhereInput
  }

  export type intentsUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: intentsWhereInput
    data: XOR<intentsUpdateWithoutNotificationsInput, intentsUncheckedUpdateWithoutNotificationsInput>
  }

  export type intentsUpdateWithoutNotificationsInput = {
    intent_id?: StringFieldUpdateOperationsInput | string
    intent_name?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role_intents?: role_intentsUpdateManyWithoutIntentNestedInput
  }

  export type intentsUncheckedUpdateWithoutNotificationsInput = {
    intent_id?: StringFieldUpdateOperationsInput | string
    intent_name?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role_intents?: role_intentsUncheckedUpdateManyWithoutIntentNestedInput
  }

  export type businessesCreateWithoutUsersInput = {
    business_id?: string
    business_name: string
    business_type?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    subscription_plans?: subscription_plansCreateNestedOneWithoutBusinessesInput
    tenants: tenantsCreateNestedOneWithoutBusinessesInput
    social_accounts?: social_accountsCreateNestedManyWithoutBusinessesInput
  }

  export type businessesUncheckedCreateWithoutUsersInput = {
    business_id?: string
    tenant_id: string
    business_name: string
    business_type?: string | null
    subscription_plan_id?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    social_accounts?: social_accountsUncheckedCreateNestedManyWithoutBusinessesInput
  }

  export type businessesCreateOrConnectWithoutUsersInput = {
    where: businessesWhereUniqueInput
    create: XOR<businessesCreateWithoutUsersInput, businessesUncheckedCreateWithoutUsersInput>
  }

  export type rolesCreateWithoutUsersInput = {
    role_id?: string
    role_name: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type rolesUncheckedCreateWithoutUsersInput = {
    role_id?: string
    role_name: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type rolesCreateOrConnectWithoutUsersInput = {
    where: rolesWhereUniqueInput
    create: XOR<rolesCreateWithoutUsersInput, rolesUncheckedCreateWithoutUsersInput>
  }

  export type notificationsCreateWithoutUserInput = {
    notification_id?: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
    intent: intentsCreateNestedOneWithoutNotificationsInput
  }

  export type notificationsUncheckedCreateWithoutUserInput = {
    notification_id?: string
    intent_id: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
  }

  export type notificationsCreateOrConnectWithoutUserInput = {
    where: notificationsWhereUniqueInput
    create: XOR<notificationsCreateWithoutUserInput, notificationsUncheckedCreateWithoutUserInput>
  }

  export type notificationsCreateManyUserInputEnvelope = {
    data: notificationsCreateManyUserInput | notificationsCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type businessesUpsertWithoutUsersInput = {
    update: XOR<businessesUpdateWithoutUsersInput, businessesUncheckedUpdateWithoutUsersInput>
    create: XOR<businessesCreateWithoutUsersInput, businessesUncheckedCreateWithoutUsersInput>
    where?: businessesWhereInput
  }

  export type businessesUpdateToOneWithWhereWithoutUsersInput = {
    where?: businessesWhereInput
    data: XOR<businessesUpdateWithoutUsersInput, businessesUncheckedUpdateWithoutUsersInput>
  }

  export type businessesUpdateWithoutUsersInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscription_plans?: subscription_plansUpdateOneWithoutBusinessesNestedInput
    tenants?: tenantsUpdateOneRequiredWithoutBusinessesNestedInput
    social_accounts?: social_accountsUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesUncheckedUpdateWithoutUsersInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_plan_id?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    social_accounts?: social_accountsUncheckedUpdateManyWithoutBusinessesNestedInput
  }

  export type rolesUpsertWithoutUsersInput = {
    update: XOR<rolesUpdateWithoutUsersInput, rolesUncheckedUpdateWithoutUsersInput>
    create: XOR<rolesCreateWithoutUsersInput, rolesUncheckedCreateWithoutUsersInput>
    where?: rolesWhereInput
  }

  export type rolesUpdateToOneWithWhereWithoutUsersInput = {
    where?: rolesWhereInput
    data: XOR<rolesUpdateWithoutUsersInput, rolesUncheckedUpdateWithoutUsersInput>
  }

  export type rolesUpdateWithoutUsersInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type rolesUncheckedUpdateWithoutUsersInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    role_name?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type notificationsUpsertWithWhereUniqueWithoutUserInput = {
    where: notificationsWhereUniqueInput
    update: XOR<notificationsUpdateWithoutUserInput, notificationsUncheckedUpdateWithoutUserInput>
    create: XOR<notificationsCreateWithoutUserInput, notificationsUncheckedCreateWithoutUserInput>
  }

  export type notificationsUpdateWithWhereUniqueWithoutUserInput = {
    where: notificationsWhereUniqueInput
    data: XOR<notificationsUpdateWithoutUserInput, notificationsUncheckedUpdateWithoutUserInput>
  }

  export type notificationsUpdateManyWithWhereWithoutUserInput = {
    where: notificationsScalarWhereInput
    data: XOR<notificationsUpdateManyMutationInput, notificationsUncheckedUpdateManyWithoutUserInput>
  }

  export type social_accountsCreateManyBusinessesInput = {
    account_id?: string
    platform: string
    platform_user_id: string
    page_id?: string | null
    access_token: string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: Date | string | null
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type usersCreateManyBusinessesInput = {
    user_id?: string
    role_id: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type social_accountsUpdateWithoutBusinessesInput = {
    account_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platform_user_id?: StringFieldUpdateOperationsInput | string
    page_id?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type social_accountsUncheckedUpdateWithoutBusinessesInput = {
    account_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platform_user_id?: StringFieldUpdateOperationsInput | string
    page_id?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type social_accountsUncheckedUpdateManyWithoutBusinessesInput = {
    account_id?: StringFieldUpdateOperationsInput | string
    platform?: StringFieldUpdateOperationsInput | string
    platform_user_id?: StringFieldUpdateOperationsInput | string
    page_id?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: StringFieldUpdateOperationsInput | string
    permissions?: NullableJsonNullValueInput | InputJsonValue
    token_expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type usersUpdateWithoutBusinessesInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: rolesUpdateOneRequiredWithoutUsersNestedInput
    notifications?: notificationsUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateWithoutBusinessesInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    role_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notifications?: notificationsUncheckedUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateManyWithoutBusinessesInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    role_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type businessesCreateManySubscription_plansInput = {
    business_id?: string
    tenant_id: string
    business_name: string
    business_type?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type businessesUpdateWithoutSubscription_plansInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tenants?: tenantsUpdateOneRequiredWithoutBusinessesNestedInput
    social_accounts?: social_accountsUpdateManyWithoutBusinessesNestedInput
    users?: usersUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesUncheckedUpdateWithoutSubscription_plansInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    social_accounts?: social_accountsUncheckedUpdateManyWithoutBusinessesNestedInput
    users?: usersUncheckedUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesUncheckedUpdateManyWithoutSubscription_plansInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type businessesCreateManyTenantsInput = {
    business_id?: string
    business_name: string
    business_type?: string | null
    subscription_plan_id?: string | null
    whatsapp_number?: string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type businessesUpdateWithoutTenantsInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscription_plans?: subscription_plansUpdateOneWithoutBusinessesNestedInput
    social_accounts?: social_accountsUpdateManyWithoutBusinessesNestedInput
    users?: usersUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesUncheckedUpdateWithoutTenantsInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_plan_id?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    social_accounts?: social_accountsUncheckedUpdateManyWithoutBusinessesNestedInput
    users?: usersUncheckedUpdateManyWithoutBusinessesNestedInput
  }

  export type businessesUncheckedUpdateManyWithoutTenantsInput = {
    business_id?: StringFieldUpdateOperationsInput | string
    business_name?: StringFieldUpdateOperationsInput | string
    business_type?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_plan_id?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    brand_colors?: NullableJsonNullValueInput | InputJsonValue
    logo_url?: NullableStringFieldUpdateOperationsInput | string | null
    working_hours?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type usersCreateManyRoleInput = {
    user_id?: string
    business_id: string
    email: string
    name: string
    is_active?: boolean | null
    created_at?: Date | string | null
  }

  export type usersUpdateWithoutRoleInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    businesses?: businessesUpdateOneRequiredWithoutUsersNestedInput
    notifications?: notificationsUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateWithoutRoleInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    business_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notifications?: notificationsUncheckedUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateManyWithoutRoleInput = {
    user_id?: StringFieldUpdateOperationsInput | string
    business_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type role_intentsCreateManyIntentInput = {
    role_id: string
    created_at?: Date | string | null
  }

  export type notificationsCreateManyIntentInput = {
    notification_id?: string
    user_id: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
  }

  export type role_intentsUpdateWithoutIntentInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type role_intentsUncheckedUpdateWithoutIntentInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type role_intentsUncheckedUpdateManyWithoutIntentInput = {
    role_id?: StringFieldUpdateOperationsInput | string
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type notificationsUpdateWithoutIntentInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: usersUpdateOneRequiredWithoutNotificationsNestedInput
  }

  export type notificationsUncheckedUpdateWithoutIntentInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type notificationsUncheckedUpdateManyWithoutIntentInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type notificationsCreateManyUserInput = {
    notification_id?: string
    intent_id: string
    message: string
    read_status?: boolean
    created_at?: Date | string | null
  }

  export type notificationsUpdateWithoutUserInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    intent?: intentsUpdateOneRequiredWithoutNotificationsNestedInput
  }

  export type notificationsUncheckedUpdateWithoutUserInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    intent_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type notificationsUncheckedUpdateManyWithoutUserInput = {
    notification_id?: StringFieldUpdateOperationsInput | string
    intent_id?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    read_status?: BoolFieldUpdateOperationsInput | boolean
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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