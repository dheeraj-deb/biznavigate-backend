
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
 * Model OnboardingSession
 * 
 */
export type OnboardingSession = $Result.DefaultSelection<Prisma.$OnboardingSessionPayload>
/**
 * Model business_user
 * The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.
 */
export type business_user = $Result.DefaultSelection<Prisma.$business_userPayload>
/**
 * Model integrations
 * 
 */
export type integrations = $Result.DefaultSelection<Prisma.$integrationsPayload>
/**
 * Model zoho_user_credential
 * The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.
 */
export type zoho_user_credential = $Result.DefaultSelection<Prisma.$zoho_user_credentialPayload>
/**
 * Model ConversationMessage
 * 
 */
export type ConversationMessage = $Result.DefaultSelection<Prisma.$ConversationMessagePayload>
/**
 * Model ConversationSession
 * 
 */
export type ConversationSession = $Result.DefaultSelection<Prisma.$ConversationSessionPayload>
/**
 * Model ConversationEvent
 * 
 */
export type ConversationEvent = $Result.DefaultSelection<Prisma.$ConversationEventPayload>
/**
 * Model inventory_current
 * 
 */
export type inventory_current = $Result.DefaultSelection<Prisma.$inventory_currentPayload>
/**
 * Model organizations
 * 
 */
export type organizations = $Result.DefaultSelection<Prisma.$organizationsPayload>
/**
 * Model product_categories
 * 
 */
export type product_categories = $Result.DefaultSelection<Prisma.$product_categoriesPayload>
/**
 * Model products
 * 
 */
export type products = $Result.DefaultSelection<Prisma.$productsPayload>
/**
 * Model inventory_movements
 * 
 */
export type inventory_movements = $Result.DefaultSelection<Prisma.$inventory_movementsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const product_source_type: {
  zoho: 'zoho',
  tally: 'tally',
  custom: 'custom'
};

export type product_source_type = (typeof product_source_type)[keyof typeof product_source_type]

}

export type product_source_type = $Enums.product_source_type

export const product_source_type: typeof $Enums.product_source_type

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
   * `prisma.onboardingSession`: Exposes CRUD operations for the **OnboardingSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingSessions
    * const onboardingSessions = await prisma.onboardingSession.findMany()
    * ```
    */
  get onboardingSession(): Prisma.OnboardingSessionDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.integrations`: Exposes CRUD operations for the **integrations** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Integrations
    * const integrations = await prisma.integrations.findMany()
    * ```
    */
  get integrations(): Prisma.integrationsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.zoho_user_credential`: Exposes CRUD operations for the **zoho_user_credential** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Zoho_user_credentials
    * const zoho_user_credentials = await prisma.zoho_user_credential.findMany()
    * ```
    */
  get zoho_user_credential(): Prisma.zoho_user_credentialDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.conversationMessage`: Exposes CRUD operations for the **ConversationMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConversationMessages
    * const conversationMessages = await prisma.conversationMessage.findMany()
    * ```
    */
  get conversationMessage(): Prisma.ConversationMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.conversationSession`: Exposes CRUD operations for the **ConversationSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConversationSessions
    * const conversationSessions = await prisma.conversationSession.findMany()
    * ```
    */
  get conversationSession(): Prisma.ConversationSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.conversationEvent`: Exposes CRUD operations for the **ConversationEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConversationEvents
    * const conversationEvents = await prisma.conversationEvent.findMany()
    * ```
    */
  get conversationEvent(): Prisma.ConversationEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inventory_current`: Exposes CRUD operations for the **inventory_current** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inventory_currents
    * const inventory_currents = await prisma.inventory_current.findMany()
    * ```
    */
  get inventory_current(): Prisma.inventory_currentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organizations`: Exposes CRUD operations for the **organizations** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organizations.findMany()
    * ```
    */
  get organizations(): Prisma.organizationsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product_categories`: Exposes CRUD operations for the **product_categories** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Product_categories
    * const product_categories = await prisma.product_categories.findMany()
    * ```
    */
  get product_categories(): Prisma.product_categoriesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.products`: Exposes CRUD operations for the **products** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.products.findMany()
    * ```
    */
  get products(): Prisma.productsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inventory_movements`: Exposes CRUD operations for the **inventory_movements** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inventory_movements
    * const inventory_movements = await prisma.inventory_movements.findMany()
    * ```
    */
  get inventory_movements(): Prisma.inventory_movementsDelegate<ExtArgs, ClientOptions>;
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
    OnboardingSession: 'OnboardingSession',
    business_user: 'business_user',
    integrations: 'integrations',
    zoho_user_credential: 'zoho_user_credential',
    ConversationMessage: 'ConversationMessage',
    ConversationSession: 'ConversationSession',
    ConversationEvent: 'ConversationEvent',
    inventory_current: 'inventory_current',
    organizations: 'organizations',
    product_categories: 'product_categories',
    products: 'products',
    inventory_movements: 'inventory_movements'
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
      modelProps: "shops" | "whatsapp_templates" | "onboardingSession" | "business_user" | "integrations" | "zoho_user_credential" | "conversationMessage" | "conversationSession" | "conversationEvent" | "inventory_current" | "organizations" | "product_categories" | "products" | "inventory_movements"
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
      integrations: {
        payload: Prisma.$integrationsPayload<ExtArgs>
        fields: Prisma.integrationsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.integrationsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.integrationsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>
          }
          findFirst: {
            args: Prisma.integrationsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.integrationsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>
          }
          findMany: {
            args: Prisma.integrationsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>[]
          }
          create: {
            args: Prisma.integrationsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>
          }
          createMany: {
            args: Prisma.integrationsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.integrationsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>[]
          }
          delete: {
            args: Prisma.integrationsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>
          }
          update: {
            args: Prisma.integrationsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>
          }
          deleteMany: {
            args: Prisma.integrationsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.integrationsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.integrationsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>[]
          }
          upsert: {
            args: Prisma.integrationsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$integrationsPayload>
          }
          aggregate: {
            args: Prisma.IntegrationsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIntegrations>
          }
          groupBy: {
            args: Prisma.integrationsGroupByArgs<ExtArgs>
            result: $Utils.Optional<IntegrationsGroupByOutputType>[]
          }
          count: {
            args: Prisma.integrationsCountArgs<ExtArgs>
            result: $Utils.Optional<IntegrationsCountAggregateOutputType> | number
          }
        }
      }
      zoho_user_credential: {
        payload: Prisma.$zoho_user_credentialPayload<ExtArgs>
        fields: Prisma.zoho_user_credentialFieldRefs
        operations: {
          findUnique: {
            args: Prisma.zoho_user_credentialFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.zoho_user_credentialFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>
          }
          findFirst: {
            args: Prisma.zoho_user_credentialFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.zoho_user_credentialFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>
          }
          findMany: {
            args: Prisma.zoho_user_credentialFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>[]
          }
          create: {
            args: Prisma.zoho_user_credentialCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>
          }
          createMany: {
            args: Prisma.zoho_user_credentialCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.zoho_user_credentialCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>[]
          }
          delete: {
            args: Prisma.zoho_user_credentialDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>
          }
          update: {
            args: Prisma.zoho_user_credentialUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>
          }
          deleteMany: {
            args: Prisma.zoho_user_credentialDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.zoho_user_credentialUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.zoho_user_credentialUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>[]
          }
          upsert: {
            args: Prisma.zoho_user_credentialUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$zoho_user_credentialPayload>
          }
          aggregate: {
            args: Prisma.Zoho_user_credentialAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateZoho_user_credential>
          }
          groupBy: {
            args: Prisma.zoho_user_credentialGroupByArgs<ExtArgs>
            result: $Utils.Optional<Zoho_user_credentialGroupByOutputType>[]
          }
          count: {
            args: Prisma.zoho_user_credentialCountArgs<ExtArgs>
            result: $Utils.Optional<Zoho_user_credentialCountAggregateOutputType> | number
          }
        }
      }
      ConversationMessage: {
        payload: Prisma.$ConversationMessagePayload<ExtArgs>
        fields: Prisma.ConversationMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConversationMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConversationMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          findFirst: {
            args: Prisma.ConversationMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConversationMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          findMany: {
            args: Prisma.ConversationMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>[]
          }
          create: {
            args: Prisma.ConversationMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          createMany: {
            args: Prisma.ConversationMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConversationMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>[]
          }
          delete: {
            args: Prisma.ConversationMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          update: {
            args: Prisma.ConversationMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          deleteMany: {
            args: Prisma.ConversationMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConversationMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConversationMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>[]
          }
          upsert: {
            args: Prisma.ConversationMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          aggregate: {
            args: Prisma.ConversationMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConversationMessage>
          }
          groupBy: {
            args: Prisma.ConversationMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConversationMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConversationMessageCountArgs<ExtArgs>
            result: $Utils.Optional<ConversationMessageCountAggregateOutputType> | number
          }
        }
      }
      ConversationSession: {
        payload: Prisma.$ConversationSessionPayload<ExtArgs>
        fields: Prisma.ConversationSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConversationSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConversationSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>
          }
          findFirst: {
            args: Prisma.ConversationSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConversationSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>
          }
          findMany: {
            args: Prisma.ConversationSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>[]
          }
          create: {
            args: Prisma.ConversationSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>
          }
          createMany: {
            args: Prisma.ConversationSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConversationSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>[]
          }
          delete: {
            args: Prisma.ConversationSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>
          }
          update: {
            args: Prisma.ConversationSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>
          }
          deleteMany: {
            args: Prisma.ConversationSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConversationSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConversationSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>[]
          }
          upsert: {
            args: Prisma.ConversationSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationSessionPayload>
          }
          aggregate: {
            args: Prisma.ConversationSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConversationSession>
          }
          groupBy: {
            args: Prisma.ConversationSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConversationSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConversationSessionCountArgs<ExtArgs>
            result: $Utils.Optional<ConversationSessionCountAggregateOutputType> | number
          }
        }
      }
      ConversationEvent: {
        payload: Prisma.$ConversationEventPayload<ExtArgs>
        fields: Prisma.ConversationEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConversationEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConversationEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>
          }
          findFirst: {
            args: Prisma.ConversationEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConversationEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>
          }
          findMany: {
            args: Prisma.ConversationEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>[]
          }
          create: {
            args: Prisma.ConversationEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>
          }
          createMany: {
            args: Prisma.ConversationEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConversationEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>[]
          }
          delete: {
            args: Prisma.ConversationEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>
          }
          update: {
            args: Prisma.ConversationEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>
          }
          deleteMany: {
            args: Prisma.ConversationEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConversationEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConversationEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>[]
          }
          upsert: {
            args: Prisma.ConversationEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationEventPayload>
          }
          aggregate: {
            args: Prisma.ConversationEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConversationEvent>
          }
          groupBy: {
            args: Prisma.ConversationEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConversationEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConversationEventCountArgs<ExtArgs>
            result: $Utils.Optional<ConversationEventCountAggregateOutputType> | number
          }
        }
      }
      inventory_current: {
        payload: Prisma.$inventory_currentPayload<ExtArgs>
        fields: Prisma.inventory_currentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.inventory_currentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.inventory_currentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>
          }
          findFirst: {
            args: Prisma.inventory_currentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.inventory_currentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>
          }
          findMany: {
            args: Prisma.inventory_currentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>[]
          }
          create: {
            args: Prisma.inventory_currentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>
          }
          createMany: {
            args: Prisma.inventory_currentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.inventory_currentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>[]
          }
          delete: {
            args: Prisma.inventory_currentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>
          }
          update: {
            args: Prisma.inventory_currentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>
          }
          deleteMany: {
            args: Prisma.inventory_currentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.inventory_currentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.inventory_currentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>[]
          }
          upsert: {
            args: Prisma.inventory_currentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_currentPayload>
          }
          aggregate: {
            args: Prisma.Inventory_currentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventory_current>
          }
          groupBy: {
            args: Prisma.inventory_currentGroupByArgs<ExtArgs>
            result: $Utils.Optional<Inventory_currentGroupByOutputType>[]
          }
          count: {
            args: Prisma.inventory_currentCountArgs<ExtArgs>
            result: $Utils.Optional<Inventory_currentCountAggregateOutputType> | number
          }
        }
      }
      organizations: {
        payload: Prisma.$organizationsPayload<ExtArgs>
        fields: Prisma.organizationsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.organizationsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.organizationsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>
          }
          findFirst: {
            args: Prisma.organizationsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.organizationsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>
          }
          findMany: {
            args: Prisma.organizationsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>[]
          }
          create: {
            args: Prisma.organizationsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>
          }
          createMany: {
            args: Prisma.organizationsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.organizationsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>[]
          }
          delete: {
            args: Prisma.organizationsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>
          }
          update: {
            args: Prisma.organizationsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>
          }
          deleteMany: {
            args: Prisma.organizationsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.organizationsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.organizationsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>[]
          }
          upsert: {
            args: Prisma.organizationsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$organizationsPayload>
          }
          aggregate: {
            args: Prisma.OrganizationsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganizations>
          }
          groupBy: {
            args: Prisma.organizationsGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationsGroupByOutputType>[]
          }
          count: {
            args: Prisma.organizationsCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationsCountAggregateOutputType> | number
          }
        }
      }
      product_categories: {
        payload: Prisma.$product_categoriesPayload<ExtArgs>
        fields: Prisma.product_categoriesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.product_categoriesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.product_categoriesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>
          }
          findFirst: {
            args: Prisma.product_categoriesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.product_categoriesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>
          }
          findMany: {
            args: Prisma.product_categoriesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>[]
          }
          create: {
            args: Prisma.product_categoriesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>
          }
          createMany: {
            args: Prisma.product_categoriesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.product_categoriesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>[]
          }
          delete: {
            args: Prisma.product_categoriesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>
          }
          update: {
            args: Prisma.product_categoriesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>
          }
          deleteMany: {
            args: Prisma.product_categoriesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.product_categoriesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.product_categoriesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>[]
          }
          upsert: {
            args: Prisma.product_categoriesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_categoriesPayload>
          }
          aggregate: {
            args: Prisma.Product_categoriesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct_categories>
          }
          groupBy: {
            args: Prisma.product_categoriesGroupByArgs<ExtArgs>
            result: $Utils.Optional<Product_categoriesGroupByOutputType>[]
          }
          count: {
            args: Prisma.product_categoriesCountArgs<ExtArgs>
            result: $Utils.Optional<Product_categoriesCountAggregateOutputType> | number
          }
        }
      }
      products: {
        payload: Prisma.$productsPayload<ExtArgs>
        fields: Prisma.productsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.productsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.productsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          findFirst: {
            args: Prisma.productsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.productsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          findMany: {
            args: Prisma.productsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>[]
          }
          create: {
            args: Prisma.productsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          createMany: {
            args: Prisma.productsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.productsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>[]
          }
          delete: {
            args: Prisma.productsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          update: {
            args: Prisma.productsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          deleteMany: {
            args: Prisma.productsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.productsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.productsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>[]
          }
          upsert: {
            args: Prisma.productsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productsPayload>
          }
          aggregate: {
            args: Prisma.ProductsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProducts>
          }
          groupBy: {
            args: Prisma.productsGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductsGroupByOutputType>[]
          }
          count: {
            args: Prisma.productsCountArgs<ExtArgs>
            result: $Utils.Optional<ProductsCountAggregateOutputType> | number
          }
        }
      }
      inventory_movements: {
        payload: Prisma.$inventory_movementsPayload<ExtArgs>
        fields: Prisma.inventory_movementsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.inventory_movementsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.inventory_movementsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>
          }
          findFirst: {
            args: Prisma.inventory_movementsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.inventory_movementsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>
          }
          findMany: {
            args: Prisma.inventory_movementsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>[]
          }
          create: {
            args: Prisma.inventory_movementsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>
          }
          createMany: {
            args: Prisma.inventory_movementsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.inventory_movementsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>[]
          }
          delete: {
            args: Prisma.inventory_movementsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>
          }
          update: {
            args: Prisma.inventory_movementsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>
          }
          deleteMany: {
            args: Prisma.inventory_movementsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.inventory_movementsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.inventory_movementsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>[]
          }
          upsert: {
            args: Prisma.inventory_movementsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inventory_movementsPayload>
          }
          aggregate: {
            args: Prisma.Inventory_movementsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventory_movements>
          }
          groupBy: {
            args: Prisma.inventory_movementsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Inventory_movementsGroupByOutputType>[]
          }
          count: {
            args: Prisma.inventory_movementsCountArgs<ExtArgs>
            result: $Utils.Optional<Inventory_movementsCountAggregateOutputType> | number
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
    onboardingSession?: OnboardingSessionOmit
    business_user?: business_userOmit
    integrations?: integrationsOmit
    zoho_user_credential?: zoho_user_credentialOmit
    conversationMessage?: ConversationMessageOmit
    conversationSession?: ConversationSessionOmit
    conversationEvent?: ConversationEventOmit
    inventory_current?: inventory_currentOmit
    organizations?: organizationsOmit
    product_categories?: product_categoriesOmit
    products?: productsOmit
    inventory_movements?: inventory_movementsOmit
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
   * Count Type ConversationSessionCountOutputType
   */

  export type ConversationSessionCountOutputType = {
    events: number
  }

  export type ConversationSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    events?: boolean | ConversationSessionCountOutputTypeCountEventsArgs
  }

  // Custom InputTypes
  /**
   * ConversationSessionCountOutputType without action
   */
  export type ConversationSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSessionCountOutputType
     */
    select?: ConversationSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ConversationSessionCountOutputType without action
   */
  export type ConversationSessionCountOutputTypeCountEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationEventWhereInput
  }


  /**
   * Count Type Product_categoriesCountOutputType
   */

  export type Product_categoriesCountOutputType = {
    other_product_categories: number
    products: number
  }

  export type Product_categoriesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    other_product_categories?: boolean | Product_categoriesCountOutputTypeCountOther_product_categoriesArgs
    products?: boolean | Product_categoriesCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * Product_categoriesCountOutputType without action
   */
  export type Product_categoriesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product_categoriesCountOutputType
     */
    select?: Product_categoriesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Product_categoriesCountOutputType without action
   */
  export type Product_categoriesCountOutputTypeCountOther_product_categoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: product_categoriesWhereInput
  }

  /**
   * Product_categoriesCountOutputType without action
   */
  export type Product_categoriesCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productsWhereInput
  }


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
    platformId: Decimal | null
  }

  export type Business_userSumAggregateOutputType = {
    id: number | null
    platformId: Decimal | null
  }

  export type Business_userMinAggregateOutputType = {
    businessName: string | null
    gstin: string | null
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    notificationPreference: string | null
    customerId: string | null
    id: number | null
    platformId: Decimal | null
  }

  export type Business_userMaxAggregateOutputType = {
    businessName: string | null
    gstin: string | null
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    notificationPreference: string | null
    customerId: string | null
    id: number | null
    platformId: Decimal | null
  }

  export type Business_userCountAggregateOutputType = {
    businessName: number
    gstin: number
    contactEmail: number
    contactPhone: number
    address: number
    notificationPreference: number
    customerId: number
    id: number
    platformId: number
    _all: number
  }


  export type Business_userAvgAggregateInputType = {
    id?: true
    platformId?: true
  }

  export type Business_userSumAggregateInputType = {
    id?: true
    platformId?: true
  }

  export type Business_userMinAggregateInputType = {
    businessName?: true
    gstin?: true
    contactEmail?: true
    contactPhone?: true
    address?: true
    notificationPreference?: true
    customerId?: true
    id?: true
    platformId?: true
  }

  export type Business_userMaxAggregateInputType = {
    businessName?: true
    gstin?: true
    contactEmail?: true
    contactPhone?: true
    address?: true
    notificationPreference?: true
    customerId?: true
    id?: true
    platformId?: true
  }

  export type Business_userCountAggregateInputType = {
    businessName?: true
    gstin?: true
    contactEmail?: true
    contactPhone?: true
    address?: true
    notificationPreference?: true
    customerId?: true
    id?: true
    platformId?: true
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
    businessName: string
    gstin: string
    contactEmail: string
    contactPhone: string
    address: string
    notificationPreference: string
    customerId: string
    id: number
    platformId: Decimal | null
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
    businessName?: boolean
    gstin?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    address?: boolean
    notificationPreference?: boolean
    customerId?: boolean
    id?: boolean
    platformId?: boolean
  }, ExtArgs["result"]["business_user"]>

  export type business_userSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    businessName?: boolean
    gstin?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    address?: boolean
    notificationPreference?: boolean
    customerId?: boolean
    id?: boolean
    platformId?: boolean
  }, ExtArgs["result"]["business_user"]>

  export type business_userSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    businessName?: boolean
    gstin?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    address?: boolean
    notificationPreference?: boolean
    customerId?: boolean
    id?: boolean
    platformId?: boolean
  }, ExtArgs["result"]["business_user"]>

  export type business_userSelectScalar = {
    businessName?: boolean
    gstin?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    address?: boolean
    notificationPreference?: boolean
    customerId?: boolean
    id?: boolean
    platformId?: boolean
  }

  export type business_userOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"businessName" | "gstin" | "contactEmail" | "contactPhone" | "address" | "notificationPreference" | "customerId" | "id" | "platformId", ExtArgs["result"]["business_user"]>

  export type $business_userPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "business_user"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      businessName: string
      gstin: string
      contactEmail: string
      contactPhone: string
      address: string
      notificationPreference: string
      customerId: string
      id: number
      platformId: Prisma.Decimal | null
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
     * // Only select the `businessName`
     * const business_userWithBusinessNameOnly = await prisma.business_user.findMany({ select: { businessName: true } })
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
     * // Create many Business_users and only return the `businessName`
     * const business_userWithBusinessNameOnly = await prisma.business_user.createManyAndReturn({
     *   select: { businessName: true },
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
     * // Update zero or more Business_users and only return the `businessName`
     * const business_userWithBusinessNameOnly = await prisma.business_user.updateManyAndReturn({
     *   select: { businessName: true },
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
    readonly businessName: FieldRef<"business_user", 'String'>
    readonly gstin: FieldRef<"business_user", 'String'>
    readonly contactEmail: FieldRef<"business_user", 'String'>
    readonly contactPhone: FieldRef<"business_user", 'String'>
    readonly address: FieldRef<"business_user", 'String'>
    readonly notificationPreference: FieldRef<"business_user", 'String'>
    readonly customerId: FieldRef<"business_user", 'String'>
    readonly id: FieldRef<"business_user", 'Int'>
    readonly platformId: FieldRef<"business_user", 'Decimal'>
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
   * Model integrations
   */

  export type AggregateIntegrations = {
    _count: IntegrationsCountAggregateOutputType | null
    _avg: IntegrationsAvgAggregateOutputType | null
    _sum: IntegrationsSumAggregateOutputType | null
    _min: IntegrationsMinAggregateOutputType | null
    _max: IntegrationsMaxAggregateOutputType | null
  }

  export type IntegrationsAvgAggregateOutputType = {
    id: number | null
  }

  export type IntegrationsSumAggregateOutputType = {
    id: number | null
  }

  export type IntegrationsMinAggregateOutputType = {
    name: string | null
    id: number | null
  }

  export type IntegrationsMaxAggregateOutputType = {
    name: string | null
    id: number | null
  }

  export type IntegrationsCountAggregateOutputType = {
    name: number
    id: number
    _all: number
  }


  export type IntegrationsAvgAggregateInputType = {
    id?: true
  }

  export type IntegrationsSumAggregateInputType = {
    id?: true
  }

  export type IntegrationsMinAggregateInputType = {
    name?: true
    id?: true
  }

  export type IntegrationsMaxAggregateInputType = {
    name?: true
    id?: true
  }

  export type IntegrationsCountAggregateInputType = {
    name?: true
    id?: true
    _all?: true
  }

  export type IntegrationsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which integrations to aggregate.
     */
    where?: integrationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of integrations to fetch.
     */
    orderBy?: integrationsOrderByWithRelationInput | integrationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: integrationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` integrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` integrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned integrations
    **/
    _count?: true | IntegrationsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IntegrationsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IntegrationsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IntegrationsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IntegrationsMaxAggregateInputType
  }

  export type GetIntegrationsAggregateType<T extends IntegrationsAggregateArgs> = {
        [P in keyof T & keyof AggregateIntegrations]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIntegrations[P]>
      : GetScalarType<T[P], AggregateIntegrations[P]>
  }




  export type integrationsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: integrationsWhereInput
    orderBy?: integrationsOrderByWithAggregationInput | integrationsOrderByWithAggregationInput[]
    by: IntegrationsScalarFieldEnum[] | IntegrationsScalarFieldEnum
    having?: integrationsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IntegrationsCountAggregateInputType | true
    _avg?: IntegrationsAvgAggregateInputType
    _sum?: IntegrationsSumAggregateInputType
    _min?: IntegrationsMinAggregateInputType
    _max?: IntegrationsMaxAggregateInputType
  }

  export type IntegrationsGroupByOutputType = {
    name: string
    id: number
    _count: IntegrationsCountAggregateOutputType | null
    _avg: IntegrationsAvgAggregateOutputType | null
    _sum: IntegrationsSumAggregateOutputType | null
    _min: IntegrationsMinAggregateOutputType | null
    _max: IntegrationsMaxAggregateOutputType | null
  }

  type GetIntegrationsGroupByPayload<T extends integrationsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IntegrationsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IntegrationsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IntegrationsGroupByOutputType[P]>
            : GetScalarType<T[P], IntegrationsGroupByOutputType[P]>
        }
      >
    >


  export type integrationsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    name?: boolean
    id?: boolean
  }, ExtArgs["result"]["integrations"]>

  export type integrationsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    name?: boolean
    id?: boolean
  }, ExtArgs["result"]["integrations"]>

  export type integrationsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    name?: boolean
    id?: boolean
  }, ExtArgs["result"]["integrations"]>

  export type integrationsSelectScalar = {
    name?: boolean
    id?: boolean
  }

  export type integrationsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"name" | "id", ExtArgs["result"]["integrations"]>

  export type $integrationsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "integrations"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      name: string
      id: number
    }, ExtArgs["result"]["integrations"]>
    composites: {}
  }

  type integrationsGetPayload<S extends boolean | null | undefined | integrationsDefaultArgs> = $Result.GetResult<Prisma.$integrationsPayload, S>

  type integrationsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<integrationsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IntegrationsCountAggregateInputType | true
    }

  export interface integrationsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['integrations'], meta: { name: 'integrations' } }
    /**
     * Find zero or one Integrations that matches the filter.
     * @param {integrationsFindUniqueArgs} args - Arguments to find a Integrations
     * @example
     * // Get one Integrations
     * const integrations = await prisma.integrations.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends integrationsFindUniqueArgs>(args: SelectSubset<T, integrationsFindUniqueArgs<ExtArgs>>): Prisma__integrationsClient<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Integrations that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {integrationsFindUniqueOrThrowArgs} args - Arguments to find a Integrations
     * @example
     * // Get one Integrations
     * const integrations = await prisma.integrations.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends integrationsFindUniqueOrThrowArgs>(args: SelectSubset<T, integrationsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__integrationsClient<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Integrations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {integrationsFindFirstArgs} args - Arguments to find a Integrations
     * @example
     * // Get one Integrations
     * const integrations = await prisma.integrations.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends integrationsFindFirstArgs>(args?: SelectSubset<T, integrationsFindFirstArgs<ExtArgs>>): Prisma__integrationsClient<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Integrations that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {integrationsFindFirstOrThrowArgs} args - Arguments to find a Integrations
     * @example
     * // Get one Integrations
     * const integrations = await prisma.integrations.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends integrationsFindFirstOrThrowArgs>(args?: SelectSubset<T, integrationsFindFirstOrThrowArgs<ExtArgs>>): Prisma__integrationsClient<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Integrations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {integrationsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Integrations
     * const integrations = await prisma.integrations.findMany()
     * 
     * // Get first 10 Integrations
     * const integrations = await prisma.integrations.findMany({ take: 10 })
     * 
     * // Only select the `name`
     * const integrationsWithNameOnly = await prisma.integrations.findMany({ select: { name: true } })
     * 
     */
    findMany<T extends integrationsFindManyArgs>(args?: SelectSubset<T, integrationsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Integrations.
     * @param {integrationsCreateArgs} args - Arguments to create a Integrations.
     * @example
     * // Create one Integrations
     * const Integrations = await prisma.integrations.create({
     *   data: {
     *     // ... data to create a Integrations
     *   }
     * })
     * 
     */
    create<T extends integrationsCreateArgs>(args: SelectSubset<T, integrationsCreateArgs<ExtArgs>>): Prisma__integrationsClient<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Integrations.
     * @param {integrationsCreateManyArgs} args - Arguments to create many Integrations.
     * @example
     * // Create many Integrations
     * const integrations = await prisma.integrations.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends integrationsCreateManyArgs>(args?: SelectSubset<T, integrationsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Integrations and returns the data saved in the database.
     * @param {integrationsCreateManyAndReturnArgs} args - Arguments to create many Integrations.
     * @example
     * // Create many Integrations
     * const integrations = await prisma.integrations.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Integrations and only return the `name`
     * const integrationsWithNameOnly = await prisma.integrations.createManyAndReturn({
     *   select: { name: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends integrationsCreateManyAndReturnArgs>(args?: SelectSubset<T, integrationsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Integrations.
     * @param {integrationsDeleteArgs} args - Arguments to delete one Integrations.
     * @example
     * // Delete one Integrations
     * const Integrations = await prisma.integrations.delete({
     *   where: {
     *     // ... filter to delete one Integrations
     *   }
     * })
     * 
     */
    delete<T extends integrationsDeleteArgs>(args: SelectSubset<T, integrationsDeleteArgs<ExtArgs>>): Prisma__integrationsClient<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Integrations.
     * @param {integrationsUpdateArgs} args - Arguments to update one Integrations.
     * @example
     * // Update one Integrations
     * const integrations = await prisma.integrations.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends integrationsUpdateArgs>(args: SelectSubset<T, integrationsUpdateArgs<ExtArgs>>): Prisma__integrationsClient<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Integrations.
     * @param {integrationsDeleteManyArgs} args - Arguments to filter Integrations to delete.
     * @example
     * // Delete a few Integrations
     * const { count } = await prisma.integrations.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends integrationsDeleteManyArgs>(args?: SelectSubset<T, integrationsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Integrations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {integrationsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Integrations
     * const integrations = await prisma.integrations.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends integrationsUpdateManyArgs>(args: SelectSubset<T, integrationsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Integrations and returns the data updated in the database.
     * @param {integrationsUpdateManyAndReturnArgs} args - Arguments to update many Integrations.
     * @example
     * // Update many Integrations
     * const integrations = await prisma.integrations.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Integrations and only return the `name`
     * const integrationsWithNameOnly = await prisma.integrations.updateManyAndReturn({
     *   select: { name: true },
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
    updateManyAndReturn<T extends integrationsUpdateManyAndReturnArgs>(args: SelectSubset<T, integrationsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Integrations.
     * @param {integrationsUpsertArgs} args - Arguments to update or create a Integrations.
     * @example
     * // Update or create a Integrations
     * const integrations = await prisma.integrations.upsert({
     *   create: {
     *     // ... data to create a Integrations
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Integrations we want to update
     *   }
     * })
     */
    upsert<T extends integrationsUpsertArgs>(args: SelectSubset<T, integrationsUpsertArgs<ExtArgs>>): Prisma__integrationsClient<$Result.GetResult<Prisma.$integrationsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Integrations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {integrationsCountArgs} args - Arguments to filter Integrations to count.
     * @example
     * // Count the number of Integrations
     * const count = await prisma.integrations.count({
     *   where: {
     *     // ... the filter for the Integrations we want to count
     *   }
     * })
    **/
    count<T extends integrationsCountArgs>(
      args?: Subset<T, integrationsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IntegrationsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Integrations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IntegrationsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IntegrationsAggregateArgs>(args: Subset<T, IntegrationsAggregateArgs>): Prisma.PrismaPromise<GetIntegrationsAggregateType<T>>

    /**
     * Group by Integrations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {integrationsGroupByArgs} args - Group by arguments.
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
      T extends integrationsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: integrationsGroupByArgs['orderBy'] }
        : { orderBy?: integrationsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, integrationsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIntegrationsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the integrations model
   */
  readonly fields: integrationsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for integrations.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__integrationsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the integrations model
   */
  interface integrationsFieldRefs {
    readonly name: FieldRef<"integrations", 'String'>
    readonly id: FieldRef<"integrations", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * integrations findUnique
   */
  export type integrationsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * Filter, which integrations to fetch.
     */
    where: integrationsWhereUniqueInput
  }

  /**
   * integrations findUniqueOrThrow
   */
  export type integrationsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * Filter, which integrations to fetch.
     */
    where: integrationsWhereUniqueInput
  }

  /**
   * integrations findFirst
   */
  export type integrationsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * Filter, which integrations to fetch.
     */
    where?: integrationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of integrations to fetch.
     */
    orderBy?: integrationsOrderByWithRelationInput | integrationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for integrations.
     */
    cursor?: integrationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` integrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` integrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of integrations.
     */
    distinct?: IntegrationsScalarFieldEnum | IntegrationsScalarFieldEnum[]
  }

  /**
   * integrations findFirstOrThrow
   */
  export type integrationsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * Filter, which integrations to fetch.
     */
    where?: integrationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of integrations to fetch.
     */
    orderBy?: integrationsOrderByWithRelationInput | integrationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for integrations.
     */
    cursor?: integrationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` integrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` integrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of integrations.
     */
    distinct?: IntegrationsScalarFieldEnum | IntegrationsScalarFieldEnum[]
  }

  /**
   * integrations findMany
   */
  export type integrationsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * Filter, which integrations to fetch.
     */
    where?: integrationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of integrations to fetch.
     */
    orderBy?: integrationsOrderByWithRelationInput | integrationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing integrations.
     */
    cursor?: integrationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` integrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` integrations.
     */
    skip?: number
    distinct?: IntegrationsScalarFieldEnum | IntegrationsScalarFieldEnum[]
  }

  /**
   * integrations create
   */
  export type integrationsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * The data needed to create a integrations.
     */
    data: XOR<integrationsCreateInput, integrationsUncheckedCreateInput>
  }

  /**
   * integrations createMany
   */
  export type integrationsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many integrations.
     */
    data: integrationsCreateManyInput | integrationsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * integrations createManyAndReturn
   */
  export type integrationsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * The data used to create many integrations.
     */
    data: integrationsCreateManyInput | integrationsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * integrations update
   */
  export type integrationsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * The data needed to update a integrations.
     */
    data: XOR<integrationsUpdateInput, integrationsUncheckedUpdateInput>
    /**
     * Choose, which integrations to update.
     */
    where: integrationsWhereUniqueInput
  }

  /**
   * integrations updateMany
   */
  export type integrationsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update integrations.
     */
    data: XOR<integrationsUpdateManyMutationInput, integrationsUncheckedUpdateManyInput>
    /**
     * Filter which integrations to update
     */
    where?: integrationsWhereInput
    /**
     * Limit how many integrations to update.
     */
    limit?: number
  }

  /**
   * integrations updateManyAndReturn
   */
  export type integrationsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * The data used to update integrations.
     */
    data: XOR<integrationsUpdateManyMutationInput, integrationsUncheckedUpdateManyInput>
    /**
     * Filter which integrations to update
     */
    where?: integrationsWhereInput
    /**
     * Limit how many integrations to update.
     */
    limit?: number
  }

  /**
   * integrations upsert
   */
  export type integrationsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * The filter to search for the integrations to update in case it exists.
     */
    where: integrationsWhereUniqueInput
    /**
     * In case the integrations found by the `where` argument doesn't exist, create a new integrations with this data.
     */
    create: XOR<integrationsCreateInput, integrationsUncheckedCreateInput>
    /**
     * In case the integrations was found with the provided `where` argument, update it with this data.
     */
    update: XOR<integrationsUpdateInput, integrationsUncheckedUpdateInput>
  }

  /**
   * integrations delete
   */
  export type integrationsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
    /**
     * Filter which integrations to delete.
     */
    where: integrationsWhereUniqueInput
  }

  /**
   * integrations deleteMany
   */
  export type integrationsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which integrations to delete
     */
    where?: integrationsWhereInput
    /**
     * Limit how many integrations to delete.
     */
    limit?: number
  }

  /**
   * integrations without action
   */
  export type integrationsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the integrations
     */
    select?: integrationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the integrations
     */
    omit?: integrationsOmit<ExtArgs> | null
  }


  /**
   * Model zoho_user_credential
   */

  export type AggregateZoho_user_credential = {
    _count: Zoho_user_credentialCountAggregateOutputType | null
    _avg: Zoho_user_credentialAvgAggregateOutputType | null
    _sum: Zoho_user_credentialSumAggregateOutputType | null
    _min: Zoho_user_credentialMinAggregateOutputType | null
    _max: Zoho_user_credentialMaxAggregateOutputType | null
  }

  export type Zoho_user_credentialAvgAggregateOutputType = {
    business_user_id: number | null
    id: number | null
    expires_in: number | null
  }

  export type Zoho_user_credentialSumAggregateOutputType = {
    business_user_id: number | null
    id: number | null
    expires_in: number | null
  }

  export type Zoho_user_credentialMinAggregateOutputType = {
    access_token: string | null
    refresh_token: string | null
    organization_id: string | null
    business_user_id: number | null
    id: number | null
    client_id: string | null
    client_secret: string | null
    expires_in: number | null
    token_acquired_at: string | null
    whatsapp_number: string | null
    code: string | null
  }

  export type Zoho_user_credentialMaxAggregateOutputType = {
    access_token: string | null
    refresh_token: string | null
    organization_id: string | null
    business_user_id: number | null
    id: number | null
    client_id: string | null
    client_secret: string | null
    expires_in: number | null
    token_acquired_at: string | null
    whatsapp_number: string | null
    code: string | null
  }

  export type Zoho_user_credentialCountAggregateOutputType = {
    access_token: number
    refresh_token: number
    organization_id: number
    business_user_id: number
    id: number
    client_id: number
    client_secret: number
    expires_in: number
    token_acquired_at: number
    whatsapp_number: number
    code: number
    _all: number
  }


  export type Zoho_user_credentialAvgAggregateInputType = {
    business_user_id?: true
    id?: true
    expires_in?: true
  }

  export type Zoho_user_credentialSumAggregateInputType = {
    business_user_id?: true
    id?: true
    expires_in?: true
  }

  export type Zoho_user_credentialMinAggregateInputType = {
    access_token?: true
    refresh_token?: true
    organization_id?: true
    business_user_id?: true
    id?: true
    client_id?: true
    client_secret?: true
    expires_in?: true
    token_acquired_at?: true
    whatsapp_number?: true
    code?: true
  }

  export type Zoho_user_credentialMaxAggregateInputType = {
    access_token?: true
    refresh_token?: true
    organization_id?: true
    business_user_id?: true
    id?: true
    client_id?: true
    client_secret?: true
    expires_in?: true
    token_acquired_at?: true
    whatsapp_number?: true
    code?: true
  }

  export type Zoho_user_credentialCountAggregateInputType = {
    access_token?: true
    refresh_token?: true
    organization_id?: true
    business_user_id?: true
    id?: true
    client_id?: true
    client_secret?: true
    expires_in?: true
    token_acquired_at?: true
    whatsapp_number?: true
    code?: true
    _all?: true
  }

  export type Zoho_user_credentialAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which zoho_user_credential to aggregate.
     */
    where?: zoho_user_credentialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of zoho_user_credentials to fetch.
     */
    orderBy?: zoho_user_credentialOrderByWithRelationInput | zoho_user_credentialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: zoho_user_credentialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` zoho_user_credentials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` zoho_user_credentials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned zoho_user_credentials
    **/
    _count?: true | Zoho_user_credentialCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Zoho_user_credentialAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Zoho_user_credentialSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Zoho_user_credentialMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Zoho_user_credentialMaxAggregateInputType
  }

  export type GetZoho_user_credentialAggregateType<T extends Zoho_user_credentialAggregateArgs> = {
        [P in keyof T & keyof AggregateZoho_user_credential]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateZoho_user_credential[P]>
      : GetScalarType<T[P], AggregateZoho_user_credential[P]>
  }




  export type zoho_user_credentialGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: zoho_user_credentialWhereInput
    orderBy?: zoho_user_credentialOrderByWithAggregationInput | zoho_user_credentialOrderByWithAggregationInput[]
    by: Zoho_user_credentialScalarFieldEnum[] | Zoho_user_credentialScalarFieldEnum
    having?: zoho_user_credentialScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Zoho_user_credentialCountAggregateInputType | true
    _avg?: Zoho_user_credentialAvgAggregateInputType
    _sum?: Zoho_user_credentialSumAggregateInputType
    _min?: Zoho_user_credentialMinAggregateInputType
    _max?: Zoho_user_credentialMaxAggregateInputType
  }

  export type Zoho_user_credentialGroupByOutputType = {
    access_token: string | null
    refresh_token: string | null
    organization_id: string
    business_user_id: number
    id: number
    client_id: string | null
    client_secret: string | null
    expires_in: number | null
    token_acquired_at: string | null
    whatsapp_number: string | null
    code: string | null
    _count: Zoho_user_credentialCountAggregateOutputType | null
    _avg: Zoho_user_credentialAvgAggregateOutputType | null
    _sum: Zoho_user_credentialSumAggregateOutputType | null
    _min: Zoho_user_credentialMinAggregateOutputType | null
    _max: Zoho_user_credentialMaxAggregateOutputType | null
  }

  type GetZoho_user_credentialGroupByPayload<T extends zoho_user_credentialGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Zoho_user_credentialGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Zoho_user_credentialGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Zoho_user_credentialGroupByOutputType[P]>
            : GetScalarType<T[P], Zoho_user_credentialGroupByOutputType[P]>
        }
      >
    >


  export type zoho_user_credentialSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    access_token?: boolean
    refresh_token?: boolean
    organization_id?: boolean
    business_user_id?: boolean
    id?: boolean
    client_id?: boolean
    client_secret?: boolean
    expires_in?: boolean
    token_acquired_at?: boolean
    whatsapp_number?: boolean
    code?: boolean
  }, ExtArgs["result"]["zoho_user_credential"]>

  export type zoho_user_credentialSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    access_token?: boolean
    refresh_token?: boolean
    organization_id?: boolean
    business_user_id?: boolean
    id?: boolean
    client_id?: boolean
    client_secret?: boolean
    expires_in?: boolean
    token_acquired_at?: boolean
    whatsapp_number?: boolean
    code?: boolean
  }, ExtArgs["result"]["zoho_user_credential"]>

  export type zoho_user_credentialSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    access_token?: boolean
    refresh_token?: boolean
    organization_id?: boolean
    business_user_id?: boolean
    id?: boolean
    client_id?: boolean
    client_secret?: boolean
    expires_in?: boolean
    token_acquired_at?: boolean
    whatsapp_number?: boolean
    code?: boolean
  }, ExtArgs["result"]["zoho_user_credential"]>

  export type zoho_user_credentialSelectScalar = {
    access_token?: boolean
    refresh_token?: boolean
    organization_id?: boolean
    business_user_id?: boolean
    id?: boolean
    client_id?: boolean
    client_secret?: boolean
    expires_in?: boolean
    token_acquired_at?: boolean
    whatsapp_number?: boolean
    code?: boolean
  }

  export type zoho_user_credentialOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"access_token" | "refresh_token" | "organization_id" | "business_user_id" | "id" | "client_id" | "client_secret" | "expires_in" | "token_acquired_at" | "whatsapp_number" | "code", ExtArgs["result"]["zoho_user_credential"]>

  export type $zoho_user_credentialPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "zoho_user_credential"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      access_token: string | null
      refresh_token: string | null
      organization_id: string
      business_user_id: number
      id: number
      client_id: string | null
      client_secret: string | null
      expires_in: number | null
      token_acquired_at: string | null
      whatsapp_number: string | null
      code: string | null
    }, ExtArgs["result"]["zoho_user_credential"]>
    composites: {}
  }

  type zoho_user_credentialGetPayload<S extends boolean | null | undefined | zoho_user_credentialDefaultArgs> = $Result.GetResult<Prisma.$zoho_user_credentialPayload, S>

  type zoho_user_credentialCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<zoho_user_credentialFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Zoho_user_credentialCountAggregateInputType | true
    }

  export interface zoho_user_credentialDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['zoho_user_credential'], meta: { name: 'zoho_user_credential' } }
    /**
     * Find zero or one Zoho_user_credential that matches the filter.
     * @param {zoho_user_credentialFindUniqueArgs} args - Arguments to find a Zoho_user_credential
     * @example
     * // Get one Zoho_user_credential
     * const zoho_user_credential = await prisma.zoho_user_credential.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends zoho_user_credentialFindUniqueArgs>(args: SelectSubset<T, zoho_user_credentialFindUniqueArgs<ExtArgs>>): Prisma__zoho_user_credentialClient<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Zoho_user_credential that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {zoho_user_credentialFindUniqueOrThrowArgs} args - Arguments to find a Zoho_user_credential
     * @example
     * // Get one Zoho_user_credential
     * const zoho_user_credential = await prisma.zoho_user_credential.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends zoho_user_credentialFindUniqueOrThrowArgs>(args: SelectSubset<T, zoho_user_credentialFindUniqueOrThrowArgs<ExtArgs>>): Prisma__zoho_user_credentialClient<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Zoho_user_credential that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {zoho_user_credentialFindFirstArgs} args - Arguments to find a Zoho_user_credential
     * @example
     * // Get one Zoho_user_credential
     * const zoho_user_credential = await prisma.zoho_user_credential.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends zoho_user_credentialFindFirstArgs>(args?: SelectSubset<T, zoho_user_credentialFindFirstArgs<ExtArgs>>): Prisma__zoho_user_credentialClient<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Zoho_user_credential that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {zoho_user_credentialFindFirstOrThrowArgs} args - Arguments to find a Zoho_user_credential
     * @example
     * // Get one Zoho_user_credential
     * const zoho_user_credential = await prisma.zoho_user_credential.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends zoho_user_credentialFindFirstOrThrowArgs>(args?: SelectSubset<T, zoho_user_credentialFindFirstOrThrowArgs<ExtArgs>>): Prisma__zoho_user_credentialClient<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Zoho_user_credentials that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {zoho_user_credentialFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Zoho_user_credentials
     * const zoho_user_credentials = await prisma.zoho_user_credential.findMany()
     * 
     * // Get first 10 Zoho_user_credentials
     * const zoho_user_credentials = await prisma.zoho_user_credential.findMany({ take: 10 })
     * 
     * // Only select the `access_token`
     * const zoho_user_credentialWithAccess_tokenOnly = await prisma.zoho_user_credential.findMany({ select: { access_token: true } })
     * 
     */
    findMany<T extends zoho_user_credentialFindManyArgs>(args?: SelectSubset<T, zoho_user_credentialFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Zoho_user_credential.
     * @param {zoho_user_credentialCreateArgs} args - Arguments to create a Zoho_user_credential.
     * @example
     * // Create one Zoho_user_credential
     * const Zoho_user_credential = await prisma.zoho_user_credential.create({
     *   data: {
     *     // ... data to create a Zoho_user_credential
     *   }
     * })
     * 
     */
    create<T extends zoho_user_credentialCreateArgs>(args: SelectSubset<T, zoho_user_credentialCreateArgs<ExtArgs>>): Prisma__zoho_user_credentialClient<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Zoho_user_credentials.
     * @param {zoho_user_credentialCreateManyArgs} args - Arguments to create many Zoho_user_credentials.
     * @example
     * // Create many Zoho_user_credentials
     * const zoho_user_credential = await prisma.zoho_user_credential.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends zoho_user_credentialCreateManyArgs>(args?: SelectSubset<T, zoho_user_credentialCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Zoho_user_credentials and returns the data saved in the database.
     * @param {zoho_user_credentialCreateManyAndReturnArgs} args - Arguments to create many Zoho_user_credentials.
     * @example
     * // Create many Zoho_user_credentials
     * const zoho_user_credential = await prisma.zoho_user_credential.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Zoho_user_credentials and only return the `access_token`
     * const zoho_user_credentialWithAccess_tokenOnly = await prisma.zoho_user_credential.createManyAndReturn({
     *   select: { access_token: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends zoho_user_credentialCreateManyAndReturnArgs>(args?: SelectSubset<T, zoho_user_credentialCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Zoho_user_credential.
     * @param {zoho_user_credentialDeleteArgs} args - Arguments to delete one Zoho_user_credential.
     * @example
     * // Delete one Zoho_user_credential
     * const Zoho_user_credential = await prisma.zoho_user_credential.delete({
     *   where: {
     *     // ... filter to delete one Zoho_user_credential
     *   }
     * })
     * 
     */
    delete<T extends zoho_user_credentialDeleteArgs>(args: SelectSubset<T, zoho_user_credentialDeleteArgs<ExtArgs>>): Prisma__zoho_user_credentialClient<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Zoho_user_credential.
     * @param {zoho_user_credentialUpdateArgs} args - Arguments to update one Zoho_user_credential.
     * @example
     * // Update one Zoho_user_credential
     * const zoho_user_credential = await prisma.zoho_user_credential.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends zoho_user_credentialUpdateArgs>(args: SelectSubset<T, zoho_user_credentialUpdateArgs<ExtArgs>>): Prisma__zoho_user_credentialClient<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Zoho_user_credentials.
     * @param {zoho_user_credentialDeleteManyArgs} args - Arguments to filter Zoho_user_credentials to delete.
     * @example
     * // Delete a few Zoho_user_credentials
     * const { count } = await prisma.zoho_user_credential.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends zoho_user_credentialDeleteManyArgs>(args?: SelectSubset<T, zoho_user_credentialDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Zoho_user_credentials.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {zoho_user_credentialUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Zoho_user_credentials
     * const zoho_user_credential = await prisma.zoho_user_credential.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends zoho_user_credentialUpdateManyArgs>(args: SelectSubset<T, zoho_user_credentialUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Zoho_user_credentials and returns the data updated in the database.
     * @param {zoho_user_credentialUpdateManyAndReturnArgs} args - Arguments to update many Zoho_user_credentials.
     * @example
     * // Update many Zoho_user_credentials
     * const zoho_user_credential = await prisma.zoho_user_credential.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Zoho_user_credentials and only return the `access_token`
     * const zoho_user_credentialWithAccess_tokenOnly = await prisma.zoho_user_credential.updateManyAndReturn({
     *   select: { access_token: true },
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
    updateManyAndReturn<T extends zoho_user_credentialUpdateManyAndReturnArgs>(args: SelectSubset<T, zoho_user_credentialUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Zoho_user_credential.
     * @param {zoho_user_credentialUpsertArgs} args - Arguments to update or create a Zoho_user_credential.
     * @example
     * // Update or create a Zoho_user_credential
     * const zoho_user_credential = await prisma.zoho_user_credential.upsert({
     *   create: {
     *     // ... data to create a Zoho_user_credential
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Zoho_user_credential we want to update
     *   }
     * })
     */
    upsert<T extends zoho_user_credentialUpsertArgs>(args: SelectSubset<T, zoho_user_credentialUpsertArgs<ExtArgs>>): Prisma__zoho_user_credentialClient<$Result.GetResult<Prisma.$zoho_user_credentialPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Zoho_user_credentials.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {zoho_user_credentialCountArgs} args - Arguments to filter Zoho_user_credentials to count.
     * @example
     * // Count the number of Zoho_user_credentials
     * const count = await prisma.zoho_user_credential.count({
     *   where: {
     *     // ... the filter for the Zoho_user_credentials we want to count
     *   }
     * })
    **/
    count<T extends zoho_user_credentialCountArgs>(
      args?: Subset<T, zoho_user_credentialCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Zoho_user_credentialCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Zoho_user_credential.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Zoho_user_credentialAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Zoho_user_credentialAggregateArgs>(args: Subset<T, Zoho_user_credentialAggregateArgs>): Prisma.PrismaPromise<GetZoho_user_credentialAggregateType<T>>

    /**
     * Group by Zoho_user_credential.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {zoho_user_credentialGroupByArgs} args - Group by arguments.
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
      T extends zoho_user_credentialGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: zoho_user_credentialGroupByArgs['orderBy'] }
        : { orderBy?: zoho_user_credentialGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, zoho_user_credentialGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetZoho_user_credentialGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the zoho_user_credential model
   */
  readonly fields: zoho_user_credentialFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for zoho_user_credential.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__zoho_user_credentialClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the zoho_user_credential model
   */
  interface zoho_user_credentialFieldRefs {
    readonly access_token: FieldRef<"zoho_user_credential", 'String'>
    readonly refresh_token: FieldRef<"zoho_user_credential", 'String'>
    readonly organization_id: FieldRef<"zoho_user_credential", 'String'>
    readonly business_user_id: FieldRef<"zoho_user_credential", 'Int'>
    readonly id: FieldRef<"zoho_user_credential", 'Int'>
    readonly client_id: FieldRef<"zoho_user_credential", 'String'>
    readonly client_secret: FieldRef<"zoho_user_credential", 'String'>
    readonly expires_in: FieldRef<"zoho_user_credential", 'Int'>
    readonly token_acquired_at: FieldRef<"zoho_user_credential", 'String'>
    readonly whatsapp_number: FieldRef<"zoho_user_credential", 'String'>
    readonly code: FieldRef<"zoho_user_credential", 'String'>
  }
    

  // Custom InputTypes
  /**
   * zoho_user_credential findUnique
   */
  export type zoho_user_credentialFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * Filter, which zoho_user_credential to fetch.
     */
    where: zoho_user_credentialWhereUniqueInput
  }

  /**
   * zoho_user_credential findUniqueOrThrow
   */
  export type zoho_user_credentialFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * Filter, which zoho_user_credential to fetch.
     */
    where: zoho_user_credentialWhereUniqueInput
  }

  /**
   * zoho_user_credential findFirst
   */
  export type zoho_user_credentialFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * Filter, which zoho_user_credential to fetch.
     */
    where?: zoho_user_credentialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of zoho_user_credentials to fetch.
     */
    orderBy?: zoho_user_credentialOrderByWithRelationInput | zoho_user_credentialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for zoho_user_credentials.
     */
    cursor?: zoho_user_credentialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` zoho_user_credentials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` zoho_user_credentials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of zoho_user_credentials.
     */
    distinct?: Zoho_user_credentialScalarFieldEnum | Zoho_user_credentialScalarFieldEnum[]
  }

  /**
   * zoho_user_credential findFirstOrThrow
   */
  export type zoho_user_credentialFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * Filter, which zoho_user_credential to fetch.
     */
    where?: zoho_user_credentialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of zoho_user_credentials to fetch.
     */
    orderBy?: zoho_user_credentialOrderByWithRelationInput | zoho_user_credentialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for zoho_user_credentials.
     */
    cursor?: zoho_user_credentialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` zoho_user_credentials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` zoho_user_credentials.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of zoho_user_credentials.
     */
    distinct?: Zoho_user_credentialScalarFieldEnum | Zoho_user_credentialScalarFieldEnum[]
  }

  /**
   * zoho_user_credential findMany
   */
  export type zoho_user_credentialFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * Filter, which zoho_user_credentials to fetch.
     */
    where?: zoho_user_credentialWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of zoho_user_credentials to fetch.
     */
    orderBy?: zoho_user_credentialOrderByWithRelationInput | zoho_user_credentialOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing zoho_user_credentials.
     */
    cursor?: zoho_user_credentialWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` zoho_user_credentials from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` zoho_user_credentials.
     */
    skip?: number
    distinct?: Zoho_user_credentialScalarFieldEnum | Zoho_user_credentialScalarFieldEnum[]
  }

  /**
   * zoho_user_credential create
   */
  export type zoho_user_credentialCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * The data needed to create a zoho_user_credential.
     */
    data: XOR<zoho_user_credentialCreateInput, zoho_user_credentialUncheckedCreateInput>
  }

  /**
   * zoho_user_credential createMany
   */
  export type zoho_user_credentialCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many zoho_user_credentials.
     */
    data: zoho_user_credentialCreateManyInput | zoho_user_credentialCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * zoho_user_credential createManyAndReturn
   */
  export type zoho_user_credentialCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * The data used to create many zoho_user_credentials.
     */
    data: zoho_user_credentialCreateManyInput | zoho_user_credentialCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * zoho_user_credential update
   */
  export type zoho_user_credentialUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * The data needed to update a zoho_user_credential.
     */
    data: XOR<zoho_user_credentialUpdateInput, zoho_user_credentialUncheckedUpdateInput>
    /**
     * Choose, which zoho_user_credential to update.
     */
    where: zoho_user_credentialWhereUniqueInput
  }

  /**
   * zoho_user_credential updateMany
   */
  export type zoho_user_credentialUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update zoho_user_credentials.
     */
    data: XOR<zoho_user_credentialUpdateManyMutationInput, zoho_user_credentialUncheckedUpdateManyInput>
    /**
     * Filter which zoho_user_credentials to update
     */
    where?: zoho_user_credentialWhereInput
    /**
     * Limit how many zoho_user_credentials to update.
     */
    limit?: number
  }

  /**
   * zoho_user_credential updateManyAndReturn
   */
  export type zoho_user_credentialUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * The data used to update zoho_user_credentials.
     */
    data: XOR<zoho_user_credentialUpdateManyMutationInput, zoho_user_credentialUncheckedUpdateManyInput>
    /**
     * Filter which zoho_user_credentials to update
     */
    where?: zoho_user_credentialWhereInput
    /**
     * Limit how many zoho_user_credentials to update.
     */
    limit?: number
  }

  /**
   * zoho_user_credential upsert
   */
  export type zoho_user_credentialUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * The filter to search for the zoho_user_credential to update in case it exists.
     */
    where: zoho_user_credentialWhereUniqueInput
    /**
     * In case the zoho_user_credential found by the `where` argument doesn't exist, create a new zoho_user_credential with this data.
     */
    create: XOR<zoho_user_credentialCreateInput, zoho_user_credentialUncheckedCreateInput>
    /**
     * In case the zoho_user_credential was found with the provided `where` argument, update it with this data.
     */
    update: XOR<zoho_user_credentialUpdateInput, zoho_user_credentialUncheckedUpdateInput>
  }

  /**
   * zoho_user_credential delete
   */
  export type zoho_user_credentialDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
    /**
     * Filter which zoho_user_credential to delete.
     */
    where: zoho_user_credentialWhereUniqueInput
  }

  /**
   * zoho_user_credential deleteMany
   */
  export type zoho_user_credentialDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which zoho_user_credentials to delete
     */
    where?: zoho_user_credentialWhereInput
    /**
     * Limit how many zoho_user_credentials to delete.
     */
    limit?: number
  }

  /**
   * zoho_user_credential without action
   */
  export type zoho_user_credentialDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the zoho_user_credential
     */
    select?: zoho_user_credentialSelect<ExtArgs> | null
    /**
     * Omit specific fields from the zoho_user_credential
     */
    omit?: zoho_user_credentialOmit<ExtArgs> | null
  }


  /**
   * Model ConversationMessage
   */

  export type AggregateConversationMessage = {
    _count: ConversationMessageCountAggregateOutputType | null
    _min: ConversationMessageMinAggregateOutputType | null
    _max: ConversationMessageMaxAggregateOutputType | null
  }

  export type ConversationMessageMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    message: string | null
    fromUser: boolean | null
    createdAt: Date | null
  }

  export type ConversationMessageMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    message: string | null
    fromUser: boolean | null
    createdAt: Date | null
  }

  export type ConversationMessageCountAggregateOutputType = {
    id: number
    sessionId: number
    message: number
    fromUser: number
    createdAt: number
    _all: number
  }


  export type ConversationMessageMinAggregateInputType = {
    id?: true
    sessionId?: true
    message?: true
    fromUser?: true
    createdAt?: true
  }

  export type ConversationMessageMaxAggregateInputType = {
    id?: true
    sessionId?: true
    message?: true
    fromUser?: true
    createdAt?: true
  }

  export type ConversationMessageCountAggregateInputType = {
    id?: true
    sessionId?: true
    message?: true
    fromUser?: true
    createdAt?: true
    _all?: true
  }

  export type ConversationMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConversationMessage to aggregate.
     */
    where?: ConversationMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationMessages to fetch.
     */
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConversationMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConversationMessages
    **/
    _count?: true | ConversationMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConversationMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConversationMessageMaxAggregateInputType
  }

  export type GetConversationMessageAggregateType<T extends ConversationMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateConversationMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConversationMessage[P]>
      : GetScalarType<T[P], AggregateConversationMessage[P]>
  }




  export type ConversationMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationMessageWhereInput
    orderBy?: ConversationMessageOrderByWithAggregationInput | ConversationMessageOrderByWithAggregationInput[]
    by: ConversationMessageScalarFieldEnum[] | ConversationMessageScalarFieldEnum
    having?: ConversationMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConversationMessageCountAggregateInputType | true
    _min?: ConversationMessageMinAggregateInputType
    _max?: ConversationMessageMaxAggregateInputType
  }

  export type ConversationMessageGroupByOutputType = {
    id: string
    sessionId: string
    message: string
    fromUser: boolean
    createdAt: Date
    _count: ConversationMessageCountAggregateOutputType | null
    _min: ConversationMessageMinAggregateOutputType | null
    _max: ConversationMessageMaxAggregateOutputType | null
  }

  type GetConversationMessageGroupByPayload<T extends ConversationMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConversationMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConversationMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConversationMessageGroupByOutputType[P]>
            : GetScalarType<T[P], ConversationMessageGroupByOutputType[P]>
        }
      >
    >


  export type ConversationMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    message?: boolean
    fromUser?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["conversationMessage"]>

  export type ConversationMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    message?: boolean
    fromUser?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["conversationMessage"]>

  export type ConversationMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    message?: boolean
    fromUser?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["conversationMessage"]>

  export type ConversationMessageSelectScalar = {
    id?: boolean
    sessionId?: boolean
    message?: boolean
    fromUser?: boolean
    createdAt?: boolean
  }

  export type ConversationMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "message" | "fromUser" | "createdAt", ExtArgs["result"]["conversationMessage"]>

  export type $ConversationMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConversationMessage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      message: string
      fromUser: boolean
      createdAt: Date
    }, ExtArgs["result"]["conversationMessage"]>
    composites: {}
  }

  type ConversationMessageGetPayload<S extends boolean | null | undefined | ConversationMessageDefaultArgs> = $Result.GetResult<Prisma.$ConversationMessagePayload, S>

  type ConversationMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConversationMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConversationMessageCountAggregateInputType | true
    }

  export interface ConversationMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConversationMessage'], meta: { name: 'ConversationMessage' } }
    /**
     * Find zero or one ConversationMessage that matches the filter.
     * @param {ConversationMessageFindUniqueArgs} args - Arguments to find a ConversationMessage
     * @example
     * // Get one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConversationMessageFindUniqueArgs>(args: SelectSubset<T, ConversationMessageFindUniqueArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConversationMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConversationMessageFindUniqueOrThrowArgs} args - Arguments to find a ConversationMessage
     * @example
     * // Get one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConversationMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, ConversationMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConversationMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageFindFirstArgs} args - Arguments to find a ConversationMessage
     * @example
     * // Get one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConversationMessageFindFirstArgs>(args?: SelectSubset<T, ConversationMessageFindFirstArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConversationMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageFindFirstOrThrowArgs} args - Arguments to find a ConversationMessage
     * @example
     * // Get one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConversationMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, ConversationMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConversationMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConversationMessages
     * const conversationMessages = await prisma.conversationMessage.findMany()
     * 
     * // Get first 10 ConversationMessages
     * const conversationMessages = await prisma.conversationMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conversationMessageWithIdOnly = await prisma.conversationMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConversationMessageFindManyArgs>(args?: SelectSubset<T, ConversationMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConversationMessage.
     * @param {ConversationMessageCreateArgs} args - Arguments to create a ConversationMessage.
     * @example
     * // Create one ConversationMessage
     * const ConversationMessage = await prisma.conversationMessage.create({
     *   data: {
     *     // ... data to create a ConversationMessage
     *   }
     * })
     * 
     */
    create<T extends ConversationMessageCreateArgs>(args: SelectSubset<T, ConversationMessageCreateArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConversationMessages.
     * @param {ConversationMessageCreateManyArgs} args - Arguments to create many ConversationMessages.
     * @example
     * // Create many ConversationMessages
     * const conversationMessage = await prisma.conversationMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConversationMessageCreateManyArgs>(args?: SelectSubset<T, ConversationMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConversationMessages and returns the data saved in the database.
     * @param {ConversationMessageCreateManyAndReturnArgs} args - Arguments to create many ConversationMessages.
     * @example
     * // Create many ConversationMessages
     * const conversationMessage = await prisma.conversationMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConversationMessages and only return the `id`
     * const conversationMessageWithIdOnly = await prisma.conversationMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConversationMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, ConversationMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConversationMessage.
     * @param {ConversationMessageDeleteArgs} args - Arguments to delete one ConversationMessage.
     * @example
     * // Delete one ConversationMessage
     * const ConversationMessage = await prisma.conversationMessage.delete({
     *   where: {
     *     // ... filter to delete one ConversationMessage
     *   }
     * })
     * 
     */
    delete<T extends ConversationMessageDeleteArgs>(args: SelectSubset<T, ConversationMessageDeleteArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConversationMessage.
     * @param {ConversationMessageUpdateArgs} args - Arguments to update one ConversationMessage.
     * @example
     * // Update one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConversationMessageUpdateArgs>(args: SelectSubset<T, ConversationMessageUpdateArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConversationMessages.
     * @param {ConversationMessageDeleteManyArgs} args - Arguments to filter ConversationMessages to delete.
     * @example
     * // Delete a few ConversationMessages
     * const { count } = await prisma.conversationMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConversationMessageDeleteManyArgs>(args?: SelectSubset<T, ConversationMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConversationMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConversationMessages
     * const conversationMessage = await prisma.conversationMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConversationMessageUpdateManyArgs>(args: SelectSubset<T, ConversationMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConversationMessages and returns the data updated in the database.
     * @param {ConversationMessageUpdateManyAndReturnArgs} args - Arguments to update many ConversationMessages.
     * @example
     * // Update many ConversationMessages
     * const conversationMessage = await prisma.conversationMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConversationMessages and only return the `id`
     * const conversationMessageWithIdOnly = await prisma.conversationMessage.updateManyAndReturn({
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
    updateManyAndReturn<T extends ConversationMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, ConversationMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConversationMessage.
     * @param {ConversationMessageUpsertArgs} args - Arguments to update or create a ConversationMessage.
     * @example
     * // Update or create a ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.upsert({
     *   create: {
     *     // ... data to create a ConversationMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConversationMessage we want to update
     *   }
     * })
     */
    upsert<T extends ConversationMessageUpsertArgs>(args: SelectSubset<T, ConversationMessageUpsertArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConversationMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageCountArgs} args - Arguments to filter ConversationMessages to count.
     * @example
     * // Count the number of ConversationMessages
     * const count = await prisma.conversationMessage.count({
     *   where: {
     *     // ... the filter for the ConversationMessages we want to count
     *   }
     * })
    **/
    count<T extends ConversationMessageCountArgs>(
      args?: Subset<T, ConversationMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConversationMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConversationMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConversationMessageAggregateArgs>(args: Subset<T, ConversationMessageAggregateArgs>): Prisma.PrismaPromise<GetConversationMessageAggregateType<T>>

    /**
     * Group by ConversationMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageGroupByArgs} args - Group by arguments.
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
      T extends ConversationMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConversationMessageGroupByArgs['orderBy'] }
        : { orderBy?: ConversationMessageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConversationMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConversationMessage model
   */
  readonly fields: ConversationMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConversationMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConversationMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ConversationMessage model
   */
  interface ConversationMessageFieldRefs {
    readonly id: FieldRef<"ConversationMessage", 'String'>
    readonly sessionId: FieldRef<"ConversationMessage", 'String'>
    readonly message: FieldRef<"ConversationMessage", 'String'>
    readonly fromUser: FieldRef<"ConversationMessage", 'Boolean'>
    readonly createdAt: FieldRef<"ConversationMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConversationMessage findUnique
   */
  export type ConversationMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Filter, which ConversationMessage to fetch.
     */
    where: ConversationMessageWhereUniqueInput
  }

  /**
   * ConversationMessage findUniqueOrThrow
   */
  export type ConversationMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Filter, which ConversationMessage to fetch.
     */
    where: ConversationMessageWhereUniqueInput
  }

  /**
   * ConversationMessage findFirst
   */
  export type ConversationMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Filter, which ConversationMessage to fetch.
     */
    where?: ConversationMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationMessages to fetch.
     */
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConversationMessages.
     */
    cursor?: ConversationMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConversationMessages.
     */
    distinct?: ConversationMessageScalarFieldEnum | ConversationMessageScalarFieldEnum[]
  }

  /**
   * ConversationMessage findFirstOrThrow
   */
  export type ConversationMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Filter, which ConversationMessage to fetch.
     */
    where?: ConversationMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationMessages to fetch.
     */
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConversationMessages.
     */
    cursor?: ConversationMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConversationMessages.
     */
    distinct?: ConversationMessageScalarFieldEnum | ConversationMessageScalarFieldEnum[]
  }

  /**
   * ConversationMessage findMany
   */
  export type ConversationMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Filter, which ConversationMessages to fetch.
     */
    where?: ConversationMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationMessages to fetch.
     */
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConversationMessages.
     */
    cursor?: ConversationMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationMessages.
     */
    skip?: number
    distinct?: ConversationMessageScalarFieldEnum | ConversationMessageScalarFieldEnum[]
  }

  /**
   * ConversationMessage create
   */
  export type ConversationMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * The data needed to create a ConversationMessage.
     */
    data: XOR<ConversationMessageCreateInput, ConversationMessageUncheckedCreateInput>
  }

  /**
   * ConversationMessage createMany
   */
  export type ConversationMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConversationMessages.
     */
    data: ConversationMessageCreateManyInput | ConversationMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConversationMessage createManyAndReturn
   */
  export type ConversationMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * The data used to create many ConversationMessages.
     */
    data: ConversationMessageCreateManyInput | ConversationMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConversationMessage update
   */
  export type ConversationMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * The data needed to update a ConversationMessage.
     */
    data: XOR<ConversationMessageUpdateInput, ConversationMessageUncheckedUpdateInput>
    /**
     * Choose, which ConversationMessage to update.
     */
    where: ConversationMessageWhereUniqueInput
  }

  /**
   * ConversationMessage updateMany
   */
  export type ConversationMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConversationMessages.
     */
    data: XOR<ConversationMessageUpdateManyMutationInput, ConversationMessageUncheckedUpdateManyInput>
    /**
     * Filter which ConversationMessages to update
     */
    where?: ConversationMessageWhereInput
    /**
     * Limit how many ConversationMessages to update.
     */
    limit?: number
  }

  /**
   * ConversationMessage updateManyAndReturn
   */
  export type ConversationMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * The data used to update ConversationMessages.
     */
    data: XOR<ConversationMessageUpdateManyMutationInput, ConversationMessageUncheckedUpdateManyInput>
    /**
     * Filter which ConversationMessages to update
     */
    where?: ConversationMessageWhereInput
    /**
     * Limit how many ConversationMessages to update.
     */
    limit?: number
  }

  /**
   * ConversationMessage upsert
   */
  export type ConversationMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * The filter to search for the ConversationMessage to update in case it exists.
     */
    where: ConversationMessageWhereUniqueInput
    /**
     * In case the ConversationMessage found by the `where` argument doesn't exist, create a new ConversationMessage with this data.
     */
    create: XOR<ConversationMessageCreateInput, ConversationMessageUncheckedCreateInput>
    /**
     * In case the ConversationMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConversationMessageUpdateInput, ConversationMessageUncheckedUpdateInput>
  }

  /**
   * ConversationMessage delete
   */
  export type ConversationMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Filter which ConversationMessage to delete.
     */
    where: ConversationMessageWhereUniqueInput
  }

  /**
   * ConversationMessage deleteMany
   */
  export type ConversationMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConversationMessages to delete
     */
    where?: ConversationMessageWhereInput
    /**
     * Limit how many ConversationMessages to delete.
     */
    limit?: number
  }

  /**
   * ConversationMessage without action
   */
  export type ConversationMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
  }


  /**
   * Model ConversationSession
   */

  export type AggregateConversationSession = {
    _count: ConversationSessionCountAggregateOutputType | null
    _min: ConversationSessionMinAggregateOutputType | null
    _max: ConversationSessionMaxAggregateOutputType | null
  }

  export type ConversationSessionMinAggregateOutputType = {
    id: string | null
    userId: string | null
    phoneNumber: string | null
    currentStep: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastEvent: string | null
  }

  export type ConversationSessionMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    phoneNumber: string | null
    currentStep: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastEvent: string | null
  }

  export type ConversationSessionCountAggregateOutputType = {
    id: number
    userId: number
    phoneNumber: number
    context: number
    currentStep: number
    createdAt: number
    updatedAt: number
    lastEvent: number
    _all: number
  }


  export type ConversationSessionMinAggregateInputType = {
    id?: true
    userId?: true
    phoneNumber?: true
    currentStep?: true
    createdAt?: true
    updatedAt?: true
    lastEvent?: true
  }

  export type ConversationSessionMaxAggregateInputType = {
    id?: true
    userId?: true
    phoneNumber?: true
    currentStep?: true
    createdAt?: true
    updatedAt?: true
    lastEvent?: true
  }

  export type ConversationSessionCountAggregateInputType = {
    id?: true
    userId?: true
    phoneNumber?: true
    context?: true
    currentStep?: true
    createdAt?: true
    updatedAt?: true
    lastEvent?: true
    _all?: true
  }

  export type ConversationSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConversationSession to aggregate.
     */
    where?: ConversationSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationSessions to fetch.
     */
    orderBy?: ConversationSessionOrderByWithRelationInput | ConversationSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConversationSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConversationSessions
    **/
    _count?: true | ConversationSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConversationSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConversationSessionMaxAggregateInputType
  }

  export type GetConversationSessionAggregateType<T extends ConversationSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateConversationSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConversationSession[P]>
      : GetScalarType<T[P], AggregateConversationSession[P]>
  }




  export type ConversationSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationSessionWhereInput
    orderBy?: ConversationSessionOrderByWithAggregationInput | ConversationSessionOrderByWithAggregationInput[]
    by: ConversationSessionScalarFieldEnum[] | ConversationSessionScalarFieldEnum
    having?: ConversationSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConversationSessionCountAggregateInputType | true
    _min?: ConversationSessionMinAggregateInputType
    _max?: ConversationSessionMaxAggregateInputType
  }

  export type ConversationSessionGroupByOutputType = {
    id: string
    userId: string
    phoneNumber: string
    context: JsonValue
    currentStep: string
    createdAt: Date
    updatedAt: Date
    lastEvent: string | null
    _count: ConversationSessionCountAggregateOutputType | null
    _min: ConversationSessionMinAggregateOutputType | null
    _max: ConversationSessionMaxAggregateOutputType | null
  }

  type GetConversationSessionGroupByPayload<T extends ConversationSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConversationSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConversationSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConversationSessionGroupByOutputType[P]>
            : GetScalarType<T[P], ConversationSessionGroupByOutputType[P]>
        }
      >
    >


  export type ConversationSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    phoneNumber?: boolean
    context?: boolean
    currentStep?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastEvent?: boolean
    events?: boolean | ConversationSession$eventsArgs<ExtArgs>
    _count?: boolean | ConversationSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversationSession"]>

  export type ConversationSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    phoneNumber?: boolean
    context?: boolean
    currentStep?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastEvent?: boolean
  }, ExtArgs["result"]["conversationSession"]>

  export type ConversationSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    phoneNumber?: boolean
    context?: boolean
    currentStep?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastEvent?: boolean
  }, ExtArgs["result"]["conversationSession"]>

  export type ConversationSessionSelectScalar = {
    id?: boolean
    userId?: boolean
    phoneNumber?: boolean
    context?: boolean
    currentStep?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastEvent?: boolean
  }

  export type ConversationSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "phoneNumber" | "context" | "currentStep" | "createdAt" | "updatedAt" | "lastEvent", ExtArgs["result"]["conversationSession"]>
  export type ConversationSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    events?: boolean | ConversationSession$eventsArgs<ExtArgs>
    _count?: boolean | ConversationSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ConversationSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ConversationSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ConversationSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConversationSession"
    objects: {
      events: Prisma.$ConversationEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      phoneNumber: string
      context: Prisma.JsonValue
      currentStep: string
      createdAt: Date
      updatedAt: Date
      lastEvent: string | null
    }, ExtArgs["result"]["conversationSession"]>
    composites: {}
  }

  type ConversationSessionGetPayload<S extends boolean | null | undefined | ConversationSessionDefaultArgs> = $Result.GetResult<Prisma.$ConversationSessionPayload, S>

  type ConversationSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConversationSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConversationSessionCountAggregateInputType | true
    }

  export interface ConversationSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConversationSession'], meta: { name: 'ConversationSession' } }
    /**
     * Find zero or one ConversationSession that matches the filter.
     * @param {ConversationSessionFindUniqueArgs} args - Arguments to find a ConversationSession
     * @example
     * // Get one ConversationSession
     * const conversationSession = await prisma.conversationSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConversationSessionFindUniqueArgs>(args: SelectSubset<T, ConversationSessionFindUniqueArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConversationSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConversationSessionFindUniqueOrThrowArgs} args - Arguments to find a ConversationSession
     * @example
     * // Get one ConversationSession
     * const conversationSession = await prisma.conversationSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConversationSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, ConversationSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConversationSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationSessionFindFirstArgs} args - Arguments to find a ConversationSession
     * @example
     * // Get one ConversationSession
     * const conversationSession = await prisma.conversationSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConversationSessionFindFirstArgs>(args?: SelectSubset<T, ConversationSessionFindFirstArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConversationSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationSessionFindFirstOrThrowArgs} args - Arguments to find a ConversationSession
     * @example
     * // Get one ConversationSession
     * const conversationSession = await prisma.conversationSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConversationSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, ConversationSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConversationSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConversationSessions
     * const conversationSessions = await prisma.conversationSession.findMany()
     * 
     * // Get first 10 ConversationSessions
     * const conversationSessions = await prisma.conversationSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conversationSessionWithIdOnly = await prisma.conversationSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConversationSessionFindManyArgs>(args?: SelectSubset<T, ConversationSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConversationSession.
     * @param {ConversationSessionCreateArgs} args - Arguments to create a ConversationSession.
     * @example
     * // Create one ConversationSession
     * const ConversationSession = await prisma.conversationSession.create({
     *   data: {
     *     // ... data to create a ConversationSession
     *   }
     * })
     * 
     */
    create<T extends ConversationSessionCreateArgs>(args: SelectSubset<T, ConversationSessionCreateArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConversationSessions.
     * @param {ConversationSessionCreateManyArgs} args - Arguments to create many ConversationSessions.
     * @example
     * // Create many ConversationSessions
     * const conversationSession = await prisma.conversationSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConversationSessionCreateManyArgs>(args?: SelectSubset<T, ConversationSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConversationSessions and returns the data saved in the database.
     * @param {ConversationSessionCreateManyAndReturnArgs} args - Arguments to create many ConversationSessions.
     * @example
     * // Create many ConversationSessions
     * const conversationSession = await prisma.conversationSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConversationSessions and only return the `id`
     * const conversationSessionWithIdOnly = await prisma.conversationSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConversationSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, ConversationSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConversationSession.
     * @param {ConversationSessionDeleteArgs} args - Arguments to delete one ConversationSession.
     * @example
     * // Delete one ConversationSession
     * const ConversationSession = await prisma.conversationSession.delete({
     *   where: {
     *     // ... filter to delete one ConversationSession
     *   }
     * })
     * 
     */
    delete<T extends ConversationSessionDeleteArgs>(args: SelectSubset<T, ConversationSessionDeleteArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConversationSession.
     * @param {ConversationSessionUpdateArgs} args - Arguments to update one ConversationSession.
     * @example
     * // Update one ConversationSession
     * const conversationSession = await prisma.conversationSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConversationSessionUpdateArgs>(args: SelectSubset<T, ConversationSessionUpdateArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConversationSessions.
     * @param {ConversationSessionDeleteManyArgs} args - Arguments to filter ConversationSessions to delete.
     * @example
     * // Delete a few ConversationSessions
     * const { count } = await prisma.conversationSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConversationSessionDeleteManyArgs>(args?: SelectSubset<T, ConversationSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConversationSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConversationSessions
     * const conversationSession = await prisma.conversationSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConversationSessionUpdateManyArgs>(args: SelectSubset<T, ConversationSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConversationSessions and returns the data updated in the database.
     * @param {ConversationSessionUpdateManyAndReturnArgs} args - Arguments to update many ConversationSessions.
     * @example
     * // Update many ConversationSessions
     * const conversationSession = await prisma.conversationSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConversationSessions and only return the `id`
     * const conversationSessionWithIdOnly = await prisma.conversationSession.updateManyAndReturn({
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
    updateManyAndReturn<T extends ConversationSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, ConversationSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConversationSession.
     * @param {ConversationSessionUpsertArgs} args - Arguments to update or create a ConversationSession.
     * @example
     * // Update or create a ConversationSession
     * const conversationSession = await prisma.conversationSession.upsert({
     *   create: {
     *     // ... data to create a ConversationSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConversationSession we want to update
     *   }
     * })
     */
    upsert<T extends ConversationSessionUpsertArgs>(args: SelectSubset<T, ConversationSessionUpsertArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConversationSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationSessionCountArgs} args - Arguments to filter ConversationSessions to count.
     * @example
     * // Count the number of ConversationSessions
     * const count = await prisma.conversationSession.count({
     *   where: {
     *     // ... the filter for the ConversationSessions we want to count
     *   }
     * })
    **/
    count<T extends ConversationSessionCountArgs>(
      args?: Subset<T, ConversationSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConversationSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConversationSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConversationSessionAggregateArgs>(args: Subset<T, ConversationSessionAggregateArgs>): Prisma.PrismaPromise<GetConversationSessionAggregateType<T>>

    /**
     * Group by ConversationSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationSessionGroupByArgs} args - Group by arguments.
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
      T extends ConversationSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConversationSessionGroupByArgs['orderBy'] }
        : { orderBy?: ConversationSessionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConversationSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConversationSession model
   */
  readonly fields: ConversationSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConversationSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConversationSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    events<T extends ConversationSession$eventsArgs<ExtArgs> = {}>(args?: Subset<T, ConversationSession$eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the ConversationSession model
   */
  interface ConversationSessionFieldRefs {
    readonly id: FieldRef<"ConversationSession", 'String'>
    readonly userId: FieldRef<"ConversationSession", 'String'>
    readonly phoneNumber: FieldRef<"ConversationSession", 'String'>
    readonly context: FieldRef<"ConversationSession", 'Json'>
    readonly currentStep: FieldRef<"ConversationSession", 'String'>
    readonly createdAt: FieldRef<"ConversationSession", 'DateTime'>
    readonly updatedAt: FieldRef<"ConversationSession", 'DateTime'>
    readonly lastEvent: FieldRef<"ConversationSession", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ConversationSession findUnique
   */
  export type ConversationSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * Filter, which ConversationSession to fetch.
     */
    where: ConversationSessionWhereUniqueInput
  }

  /**
   * ConversationSession findUniqueOrThrow
   */
  export type ConversationSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * Filter, which ConversationSession to fetch.
     */
    where: ConversationSessionWhereUniqueInput
  }

  /**
   * ConversationSession findFirst
   */
  export type ConversationSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * Filter, which ConversationSession to fetch.
     */
    where?: ConversationSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationSessions to fetch.
     */
    orderBy?: ConversationSessionOrderByWithRelationInput | ConversationSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConversationSessions.
     */
    cursor?: ConversationSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConversationSessions.
     */
    distinct?: ConversationSessionScalarFieldEnum | ConversationSessionScalarFieldEnum[]
  }

  /**
   * ConversationSession findFirstOrThrow
   */
  export type ConversationSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * Filter, which ConversationSession to fetch.
     */
    where?: ConversationSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationSessions to fetch.
     */
    orderBy?: ConversationSessionOrderByWithRelationInput | ConversationSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConversationSessions.
     */
    cursor?: ConversationSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConversationSessions.
     */
    distinct?: ConversationSessionScalarFieldEnum | ConversationSessionScalarFieldEnum[]
  }

  /**
   * ConversationSession findMany
   */
  export type ConversationSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * Filter, which ConversationSessions to fetch.
     */
    where?: ConversationSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationSessions to fetch.
     */
    orderBy?: ConversationSessionOrderByWithRelationInput | ConversationSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConversationSessions.
     */
    cursor?: ConversationSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationSessions.
     */
    skip?: number
    distinct?: ConversationSessionScalarFieldEnum | ConversationSessionScalarFieldEnum[]
  }

  /**
   * ConversationSession create
   */
  export type ConversationSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a ConversationSession.
     */
    data: XOR<ConversationSessionCreateInput, ConversationSessionUncheckedCreateInput>
  }

  /**
   * ConversationSession createMany
   */
  export type ConversationSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConversationSessions.
     */
    data: ConversationSessionCreateManyInput | ConversationSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConversationSession createManyAndReturn
   */
  export type ConversationSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * The data used to create many ConversationSessions.
     */
    data: ConversationSessionCreateManyInput | ConversationSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConversationSession update
   */
  export type ConversationSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a ConversationSession.
     */
    data: XOR<ConversationSessionUpdateInput, ConversationSessionUncheckedUpdateInput>
    /**
     * Choose, which ConversationSession to update.
     */
    where: ConversationSessionWhereUniqueInput
  }

  /**
   * ConversationSession updateMany
   */
  export type ConversationSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConversationSessions.
     */
    data: XOR<ConversationSessionUpdateManyMutationInput, ConversationSessionUncheckedUpdateManyInput>
    /**
     * Filter which ConversationSessions to update
     */
    where?: ConversationSessionWhereInput
    /**
     * Limit how many ConversationSessions to update.
     */
    limit?: number
  }

  /**
   * ConversationSession updateManyAndReturn
   */
  export type ConversationSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * The data used to update ConversationSessions.
     */
    data: XOR<ConversationSessionUpdateManyMutationInput, ConversationSessionUncheckedUpdateManyInput>
    /**
     * Filter which ConversationSessions to update
     */
    where?: ConversationSessionWhereInput
    /**
     * Limit how many ConversationSessions to update.
     */
    limit?: number
  }

  /**
   * ConversationSession upsert
   */
  export type ConversationSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the ConversationSession to update in case it exists.
     */
    where: ConversationSessionWhereUniqueInput
    /**
     * In case the ConversationSession found by the `where` argument doesn't exist, create a new ConversationSession with this data.
     */
    create: XOR<ConversationSessionCreateInput, ConversationSessionUncheckedCreateInput>
    /**
     * In case the ConversationSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConversationSessionUpdateInput, ConversationSessionUncheckedUpdateInput>
  }

  /**
   * ConversationSession delete
   */
  export type ConversationSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
    /**
     * Filter which ConversationSession to delete.
     */
    where: ConversationSessionWhereUniqueInput
  }

  /**
   * ConversationSession deleteMany
   */
  export type ConversationSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConversationSessions to delete
     */
    where?: ConversationSessionWhereInput
    /**
     * Limit how many ConversationSessions to delete.
     */
    limit?: number
  }

  /**
   * ConversationSession.events
   */
  export type ConversationSession$eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    where?: ConversationEventWhereInput
    orderBy?: ConversationEventOrderByWithRelationInput | ConversationEventOrderByWithRelationInput[]
    cursor?: ConversationEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConversationEventScalarFieldEnum | ConversationEventScalarFieldEnum[]
  }

  /**
   * ConversationSession without action
   */
  export type ConversationSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationSession
     */
    select?: ConversationSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationSession
     */
    omit?: ConversationSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationSessionInclude<ExtArgs> | null
  }


  /**
   * Model ConversationEvent
   */

  export type AggregateConversationEvent = {
    _count: ConversationEventCountAggregateOutputType | null
    _min: ConversationEventMinAggregateOutputType | null
    _max: ConversationEventMaxAggregateOutputType | null
  }

  export type ConversationEventMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    eventType: string | null
    stepFrom: string | null
    stepTo: string | null
    createdAt: Date | null
  }

  export type ConversationEventMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    eventType: string | null
    stepFrom: string | null
    stepTo: string | null
    createdAt: Date | null
  }

  export type ConversationEventCountAggregateOutputType = {
    id: number
    sessionId: number
    eventType: number
    stepFrom: number
    stepTo: number
    payload: number
    createdAt: number
    _all: number
  }


  export type ConversationEventMinAggregateInputType = {
    id?: true
    sessionId?: true
    eventType?: true
    stepFrom?: true
    stepTo?: true
    createdAt?: true
  }

  export type ConversationEventMaxAggregateInputType = {
    id?: true
    sessionId?: true
    eventType?: true
    stepFrom?: true
    stepTo?: true
    createdAt?: true
  }

  export type ConversationEventCountAggregateInputType = {
    id?: true
    sessionId?: true
    eventType?: true
    stepFrom?: true
    stepTo?: true
    payload?: true
    createdAt?: true
    _all?: true
  }

  export type ConversationEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConversationEvent to aggregate.
     */
    where?: ConversationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationEvents to fetch.
     */
    orderBy?: ConversationEventOrderByWithRelationInput | ConversationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConversationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConversationEvents
    **/
    _count?: true | ConversationEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConversationEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConversationEventMaxAggregateInputType
  }

  export type GetConversationEventAggregateType<T extends ConversationEventAggregateArgs> = {
        [P in keyof T & keyof AggregateConversationEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConversationEvent[P]>
      : GetScalarType<T[P], AggregateConversationEvent[P]>
  }




  export type ConversationEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationEventWhereInput
    orderBy?: ConversationEventOrderByWithAggregationInput | ConversationEventOrderByWithAggregationInput[]
    by: ConversationEventScalarFieldEnum[] | ConversationEventScalarFieldEnum
    having?: ConversationEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConversationEventCountAggregateInputType | true
    _min?: ConversationEventMinAggregateInputType
    _max?: ConversationEventMaxAggregateInputType
  }

  export type ConversationEventGroupByOutputType = {
    id: string
    sessionId: string
    eventType: string
    stepFrom: string | null
    stepTo: string | null
    payload: JsonValue | null
    createdAt: Date
    _count: ConversationEventCountAggregateOutputType | null
    _min: ConversationEventMinAggregateOutputType | null
    _max: ConversationEventMaxAggregateOutputType | null
  }

  type GetConversationEventGroupByPayload<T extends ConversationEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConversationEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConversationEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConversationEventGroupByOutputType[P]>
            : GetScalarType<T[P], ConversationEventGroupByOutputType[P]>
        }
      >
    >


  export type ConversationEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    eventType?: boolean
    stepFrom?: boolean
    stepTo?: boolean
    payload?: boolean
    createdAt?: boolean
    session?: boolean | ConversationSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversationEvent"]>

  export type ConversationEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    eventType?: boolean
    stepFrom?: boolean
    stepTo?: boolean
    payload?: boolean
    createdAt?: boolean
    session?: boolean | ConversationSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversationEvent"]>

  export type ConversationEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    eventType?: boolean
    stepFrom?: boolean
    stepTo?: boolean
    payload?: boolean
    createdAt?: boolean
    session?: boolean | ConversationSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversationEvent"]>

  export type ConversationEventSelectScalar = {
    id?: boolean
    sessionId?: boolean
    eventType?: boolean
    stepFrom?: boolean
    stepTo?: boolean
    payload?: boolean
    createdAt?: boolean
  }

  export type ConversationEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "eventType" | "stepFrom" | "stepTo" | "payload" | "createdAt", ExtArgs["result"]["conversationEvent"]>
  export type ConversationEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | ConversationSessionDefaultArgs<ExtArgs>
  }
  export type ConversationEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | ConversationSessionDefaultArgs<ExtArgs>
  }
  export type ConversationEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | ConversationSessionDefaultArgs<ExtArgs>
  }

  export type $ConversationEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConversationEvent"
    objects: {
      session: Prisma.$ConversationSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      eventType: string
      stepFrom: string | null
      stepTo: string | null
      payload: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["conversationEvent"]>
    composites: {}
  }

  type ConversationEventGetPayload<S extends boolean | null | undefined | ConversationEventDefaultArgs> = $Result.GetResult<Prisma.$ConversationEventPayload, S>

  type ConversationEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConversationEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConversationEventCountAggregateInputType | true
    }

  export interface ConversationEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConversationEvent'], meta: { name: 'ConversationEvent' } }
    /**
     * Find zero or one ConversationEvent that matches the filter.
     * @param {ConversationEventFindUniqueArgs} args - Arguments to find a ConversationEvent
     * @example
     * // Get one ConversationEvent
     * const conversationEvent = await prisma.conversationEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConversationEventFindUniqueArgs>(args: SelectSubset<T, ConversationEventFindUniqueArgs<ExtArgs>>): Prisma__ConversationEventClient<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConversationEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConversationEventFindUniqueOrThrowArgs} args - Arguments to find a ConversationEvent
     * @example
     * // Get one ConversationEvent
     * const conversationEvent = await prisma.conversationEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConversationEventFindUniqueOrThrowArgs>(args: SelectSubset<T, ConversationEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConversationEventClient<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConversationEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationEventFindFirstArgs} args - Arguments to find a ConversationEvent
     * @example
     * // Get one ConversationEvent
     * const conversationEvent = await prisma.conversationEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConversationEventFindFirstArgs>(args?: SelectSubset<T, ConversationEventFindFirstArgs<ExtArgs>>): Prisma__ConversationEventClient<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConversationEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationEventFindFirstOrThrowArgs} args - Arguments to find a ConversationEvent
     * @example
     * // Get one ConversationEvent
     * const conversationEvent = await prisma.conversationEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConversationEventFindFirstOrThrowArgs>(args?: SelectSubset<T, ConversationEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConversationEventClient<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConversationEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConversationEvents
     * const conversationEvents = await prisma.conversationEvent.findMany()
     * 
     * // Get first 10 ConversationEvents
     * const conversationEvents = await prisma.conversationEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conversationEventWithIdOnly = await prisma.conversationEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConversationEventFindManyArgs>(args?: SelectSubset<T, ConversationEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConversationEvent.
     * @param {ConversationEventCreateArgs} args - Arguments to create a ConversationEvent.
     * @example
     * // Create one ConversationEvent
     * const ConversationEvent = await prisma.conversationEvent.create({
     *   data: {
     *     // ... data to create a ConversationEvent
     *   }
     * })
     * 
     */
    create<T extends ConversationEventCreateArgs>(args: SelectSubset<T, ConversationEventCreateArgs<ExtArgs>>): Prisma__ConversationEventClient<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConversationEvents.
     * @param {ConversationEventCreateManyArgs} args - Arguments to create many ConversationEvents.
     * @example
     * // Create many ConversationEvents
     * const conversationEvent = await prisma.conversationEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConversationEventCreateManyArgs>(args?: SelectSubset<T, ConversationEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConversationEvents and returns the data saved in the database.
     * @param {ConversationEventCreateManyAndReturnArgs} args - Arguments to create many ConversationEvents.
     * @example
     * // Create many ConversationEvents
     * const conversationEvent = await prisma.conversationEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConversationEvents and only return the `id`
     * const conversationEventWithIdOnly = await prisma.conversationEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConversationEventCreateManyAndReturnArgs>(args?: SelectSubset<T, ConversationEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConversationEvent.
     * @param {ConversationEventDeleteArgs} args - Arguments to delete one ConversationEvent.
     * @example
     * // Delete one ConversationEvent
     * const ConversationEvent = await prisma.conversationEvent.delete({
     *   where: {
     *     // ... filter to delete one ConversationEvent
     *   }
     * })
     * 
     */
    delete<T extends ConversationEventDeleteArgs>(args: SelectSubset<T, ConversationEventDeleteArgs<ExtArgs>>): Prisma__ConversationEventClient<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConversationEvent.
     * @param {ConversationEventUpdateArgs} args - Arguments to update one ConversationEvent.
     * @example
     * // Update one ConversationEvent
     * const conversationEvent = await prisma.conversationEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConversationEventUpdateArgs>(args: SelectSubset<T, ConversationEventUpdateArgs<ExtArgs>>): Prisma__ConversationEventClient<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConversationEvents.
     * @param {ConversationEventDeleteManyArgs} args - Arguments to filter ConversationEvents to delete.
     * @example
     * // Delete a few ConversationEvents
     * const { count } = await prisma.conversationEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConversationEventDeleteManyArgs>(args?: SelectSubset<T, ConversationEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConversationEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConversationEvents
     * const conversationEvent = await prisma.conversationEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConversationEventUpdateManyArgs>(args: SelectSubset<T, ConversationEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConversationEvents and returns the data updated in the database.
     * @param {ConversationEventUpdateManyAndReturnArgs} args - Arguments to update many ConversationEvents.
     * @example
     * // Update many ConversationEvents
     * const conversationEvent = await prisma.conversationEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConversationEvents and only return the `id`
     * const conversationEventWithIdOnly = await prisma.conversationEvent.updateManyAndReturn({
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
    updateManyAndReturn<T extends ConversationEventUpdateManyAndReturnArgs>(args: SelectSubset<T, ConversationEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConversationEvent.
     * @param {ConversationEventUpsertArgs} args - Arguments to update or create a ConversationEvent.
     * @example
     * // Update or create a ConversationEvent
     * const conversationEvent = await prisma.conversationEvent.upsert({
     *   create: {
     *     // ... data to create a ConversationEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConversationEvent we want to update
     *   }
     * })
     */
    upsert<T extends ConversationEventUpsertArgs>(args: SelectSubset<T, ConversationEventUpsertArgs<ExtArgs>>): Prisma__ConversationEventClient<$Result.GetResult<Prisma.$ConversationEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConversationEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationEventCountArgs} args - Arguments to filter ConversationEvents to count.
     * @example
     * // Count the number of ConversationEvents
     * const count = await prisma.conversationEvent.count({
     *   where: {
     *     // ... the filter for the ConversationEvents we want to count
     *   }
     * })
    **/
    count<T extends ConversationEventCountArgs>(
      args?: Subset<T, ConversationEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConversationEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConversationEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConversationEventAggregateArgs>(args: Subset<T, ConversationEventAggregateArgs>): Prisma.PrismaPromise<GetConversationEventAggregateType<T>>

    /**
     * Group by ConversationEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationEventGroupByArgs} args - Group by arguments.
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
      T extends ConversationEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConversationEventGroupByArgs['orderBy'] }
        : { orderBy?: ConversationEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConversationEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConversationEvent model
   */
  readonly fields: ConversationEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConversationEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConversationEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends ConversationSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ConversationSessionDefaultArgs<ExtArgs>>): Prisma__ConversationSessionClient<$Result.GetResult<Prisma.$ConversationSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ConversationEvent model
   */
  interface ConversationEventFieldRefs {
    readonly id: FieldRef<"ConversationEvent", 'String'>
    readonly sessionId: FieldRef<"ConversationEvent", 'String'>
    readonly eventType: FieldRef<"ConversationEvent", 'String'>
    readonly stepFrom: FieldRef<"ConversationEvent", 'String'>
    readonly stepTo: FieldRef<"ConversationEvent", 'String'>
    readonly payload: FieldRef<"ConversationEvent", 'Json'>
    readonly createdAt: FieldRef<"ConversationEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConversationEvent findUnique
   */
  export type ConversationEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * Filter, which ConversationEvent to fetch.
     */
    where: ConversationEventWhereUniqueInput
  }

  /**
   * ConversationEvent findUniqueOrThrow
   */
  export type ConversationEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * Filter, which ConversationEvent to fetch.
     */
    where: ConversationEventWhereUniqueInput
  }

  /**
   * ConversationEvent findFirst
   */
  export type ConversationEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * Filter, which ConversationEvent to fetch.
     */
    where?: ConversationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationEvents to fetch.
     */
    orderBy?: ConversationEventOrderByWithRelationInput | ConversationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConversationEvents.
     */
    cursor?: ConversationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConversationEvents.
     */
    distinct?: ConversationEventScalarFieldEnum | ConversationEventScalarFieldEnum[]
  }

  /**
   * ConversationEvent findFirstOrThrow
   */
  export type ConversationEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * Filter, which ConversationEvent to fetch.
     */
    where?: ConversationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationEvents to fetch.
     */
    orderBy?: ConversationEventOrderByWithRelationInput | ConversationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConversationEvents.
     */
    cursor?: ConversationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConversationEvents.
     */
    distinct?: ConversationEventScalarFieldEnum | ConversationEventScalarFieldEnum[]
  }

  /**
   * ConversationEvent findMany
   */
  export type ConversationEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * Filter, which ConversationEvents to fetch.
     */
    where?: ConversationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationEvents to fetch.
     */
    orderBy?: ConversationEventOrderByWithRelationInput | ConversationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConversationEvents.
     */
    cursor?: ConversationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationEvents.
     */
    skip?: number
    distinct?: ConversationEventScalarFieldEnum | ConversationEventScalarFieldEnum[]
  }

  /**
   * ConversationEvent create
   */
  export type ConversationEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * The data needed to create a ConversationEvent.
     */
    data: XOR<ConversationEventCreateInput, ConversationEventUncheckedCreateInput>
  }

  /**
   * ConversationEvent createMany
   */
  export type ConversationEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConversationEvents.
     */
    data: ConversationEventCreateManyInput | ConversationEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConversationEvent createManyAndReturn
   */
  export type ConversationEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * The data used to create many ConversationEvents.
     */
    data: ConversationEventCreateManyInput | ConversationEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConversationEvent update
   */
  export type ConversationEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * The data needed to update a ConversationEvent.
     */
    data: XOR<ConversationEventUpdateInput, ConversationEventUncheckedUpdateInput>
    /**
     * Choose, which ConversationEvent to update.
     */
    where: ConversationEventWhereUniqueInput
  }

  /**
   * ConversationEvent updateMany
   */
  export type ConversationEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConversationEvents.
     */
    data: XOR<ConversationEventUpdateManyMutationInput, ConversationEventUncheckedUpdateManyInput>
    /**
     * Filter which ConversationEvents to update
     */
    where?: ConversationEventWhereInput
    /**
     * Limit how many ConversationEvents to update.
     */
    limit?: number
  }

  /**
   * ConversationEvent updateManyAndReturn
   */
  export type ConversationEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * The data used to update ConversationEvents.
     */
    data: XOR<ConversationEventUpdateManyMutationInput, ConversationEventUncheckedUpdateManyInput>
    /**
     * Filter which ConversationEvents to update
     */
    where?: ConversationEventWhereInput
    /**
     * Limit how many ConversationEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConversationEvent upsert
   */
  export type ConversationEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * The filter to search for the ConversationEvent to update in case it exists.
     */
    where: ConversationEventWhereUniqueInput
    /**
     * In case the ConversationEvent found by the `where` argument doesn't exist, create a new ConversationEvent with this data.
     */
    create: XOR<ConversationEventCreateInput, ConversationEventUncheckedCreateInput>
    /**
     * In case the ConversationEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConversationEventUpdateInput, ConversationEventUncheckedUpdateInput>
  }

  /**
   * ConversationEvent delete
   */
  export type ConversationEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
    /**
     * Filter which ConversationEvent to delete.
     */
    where: ConversationEventWhereUniqueInput
  }

  /**
   * ConversationEvent deleteMany
   */
  export type ConversationEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConversationEvents to delete
     */
    where?: ConversationEventWhereInput
    /**
     * Limit how many ConversationEvents to delete.
     */
    limit?: number
  }

  /**
   * ConversationEvent without action
   */
  export type ConversationEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationEvent
     */
    select?: ConversationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationEvent
     */
    omit?: ConversationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationEventInclude<ExtArgs> | null
  }


  /**
   * Model inventory_current
   */

  export type AggregateInventory_current = {
    _count: Inventory_currentCountAggregateOutputType | null
    _avg: Inventory_currentAvgAggregateOutputType | null
    _sum: Inventory_currentSumAggregateOutputType | null
    _min: Inventory_currentMinAggregateOutputType | null
    _max: Inventory_currentMaxAggregateOutputType | null
  }

  export type Inventory_currentAvgAggregateOutputType = {
    quantity_on_hand: Decimal | null
    available_stock: Decimal | null
    reserved_stock: Decimal | null
    on_order_stock: Decimal | null
    minimum_stock: Decimal | null
    maximum_stock: Decimal | null
    reorder_point: Decimal | null
    average_cost: Decimal | null
    last_purchase_cost: Decimal | null
    standard_cost: Decimal | null
    total_value: Decimal | null
    version_number: number | null
  }

  export type Inventory_currentSumAggregateOutputType = {
    quantity_on_hand: Decimal | null
    available_stock: Decimal | null
    reserved_stock: Decimal | null
    on_order_stock: Decimal | null
    minimum_stock: Decimal | null
    maximum_stock: Decimal | null
    reorder_point: Decimal | null
    average_cost: Decimal | null
    last_purchase_cost: Decimal | null
    standard_cost: Decimal | null
    total_value: Decimal | null
    version_number: bigint | null
  }

  export type Inventory_currentMinAggregateOutputType = {
    id: string | null
    organization_id: string | null
    product_id: string | null
    location_code: string | null
    location_name: string | null
    quantity_on_hand: Decimal | null
    available_stock: Decimal | null
    reserved_stock: Decimal | null
    on_order_stock: Decimal | null
    minimum_stock: Decimal | null
    maximum_stock: Decimal | null
    reorder_point: Decimal | null
    average_cost: Decimal | null
    last_purchase_cost: Decimal | null
    standard_cost: Decimal | null
    total_value: Decimal | null
    is_low_stock: boolean | null
    is_out_of_stock: boolean | null
    needs_reorder: boolean | null
    last_synced_zoho: Date | null
    last_synced_tally: Date | null
    last_synced_custom: Date | null
    last_movement_date: Date | null
    last_stock_count_date: Date | null
    version_number: bigint | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Inventory_currentMaxAggregateOutputType = {
    id: string | null
    organization_id: string | null
    product_id: string | null
    location_code: string | null
    location_name: string | null
    quantity_on_hand: Decimal | null
    available_stock: Decimal | null
    reserved_stock: Decimal | null
    on_order_stock: Decimal | null
    minimum_stock: Decimal | null
    maximum_stock: Decimal | null
    reorder_point: Decimal | null
    average_cost: Decimal | null
    last_purchase_cost: Decimal | null
    standard_cost: Decimal | null
    total_value: Decimal | null
    is_low_stock: boolean | null
    is_out_of_stock: boolean | null
    needs_reorder: boolean | null
    last_synced_zoho: Date | null
    last_synced_tally: Date | null
    last_synced_custom: Date | null
    last_movement_date: Date | null
    last_stock_count_date: Date | null
    version_number: bigint | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Inventory_currentCountAggregateOutputType = {
    id: number
    organization_id: number
    product_id: number
    location_code: number
    location_name: number
    quantity_on_hand: number
    available_stock: number
    reserved_stock: number
    on_order_stock: number
    minimum_stock: number
    maximum_stock: number
    reorder_point: number
    average_cost: number
    last_purchase_cost: number
    standard_cost: number
    total_value: number
    is_low_stock: number
    is_out_of_stock: number
    needs_reorder: number
    last_synced_zoho: number
    last_synced_tally: number
    last_synced_custom: number
    last_movement_date: number
    last_stock_count_date: number
    version_number: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Inventory_currentAvgAggregateInputType = {
    quantity_on_hand?: true
    available_stock?: true
    reserved_stock?: true
    on_order_stock?: true
    minimum_stock?: true
    maximum_stock?: true
    reorder_point?: true
    average_cost?: true
    last_purchase_cost?: true
    standard_cost?: true
    total_value?: true
    version_number?: true
  }

  export type Inventory_currentSumAggregateInputType = {
    quantity_on_hand?: true
    available_stock?: true
    reserved_stock?: true
    on_order_stock?: true
    minimum_stock?: true
    maximum_stock?: true
    reorder_point?: true
    average_cost?: true
    last_purchase_cost?: true
    standard_cost?: true
    total_value?: true
    version_number?: true
  }

  export type Inventory_currentMinAggregateInputType = {
    id?: true
    organization_id?: true
    product_id?: true
    location_code?: true
    location_name?: true
    quantity_on_hand?: true
    available_stock?: true
    reserved_stock?: true
    on_order_stock?: true
    minimum_stock?: true
    maximum_stock?: true
    reorder_point?: true
    average_cost?: true
    last_purchase_cost?: true
    standard_cost?: true
    total_value?: true
    is_low_stock?: true
    is_out_of_stock?: true
    needs_reorder?: true
    last_synced_zoho?: true
    last_synced_tally?: true
    last_synced_custom?: true
    last_movement_date?: true
    last_stock_count_date?: true
    version_number?: true
    created_at?: true
    updated_at?: true
  }

  export type Inventory_currentMaxAggregateInputType = {
    id?: true
    organization_id?: true
    product_id?: true
    location_code?: true
    location_name?: true
    quantity_on_hand?: true
    available_stock?: true
    reserved_stock?: true
    on_order_stock?: true
    minimum_stock?: true
    maximum_stock?: true
    reorder_point?: true
    average_cost?: true
    last_purchase_cost?: true
    standard_cost?: true
    total_value?: true
    is_low_stock?: true
    is_out_of_stock?: true
    needs_reorder?: true
    last_synced_zoho?: true
    last_synced_tally?: true
    last_synced_custom?: true
    last_movement_date?: true
    last_stock_count_date?: true
    version_number?: true
    created_at?: true
    updated_at?: true
  }

  export type Inventory_currentCountAggregateInputType = {
    id?: true
    organization_id?: true
    product_id?: true
    location_code?: true
    location_name?: true
    quantity_on_hand?: true
    available_stock?: true
    reserved_stock?: true
    on_order_stock?: true
    minimum_stock?: true
    maximum_stock?: true
    reorder_point?: true
    average_cost?: true
    last_purchase_cost?: true
    standard_cost?: true
    total_value?: true
    is_low_stock?: true
    is_out_of_stock?: true
    needs_reorder?: true
    last_synced_zoho?: true
    last_synced_tally?: true
    last_synced_custom?: true
    last_movement_date?: true
    last_stock_count_date?: true
    version_number?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Inventory_currentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which inventory_current to aggregate.
     */
    where?: inventory_currentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inventory_currents to fetch.
     */
    orderBy?: inventory_currentOrderByWithRelationInput | inventory_currentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: inventory_currentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inventory_currents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inventory_currents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned inventory_currents
    **/
    _count?: true | Inventory_currentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Inventory_currentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Inventory_currentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Inventory_currentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Inventory_currentMaxAggregateInputType
  }

  export type GetInventory_currentAggregateType<T extends Inventory_currentAggregateArgs> = {
        [P in keyof T & keyof AggregateInventory_current]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventory_current[P]>
      : GetScalarType<T[P], AggregateInventory_current[P]>
  }




  export type inventory_currentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: inventory_currentWhereInput
    orderBy?: inventory_currentOrderByWithAggregationInput | inventory_currentOrderByWithAggregationInput[]
    by: Inventory_currentScalarFieldEnum[] | Inventory_currentScalarFieldEnum
    having?: inventory_currentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Inventory_currentCountAggregateInputType | true
    _avg?: Inventory_currentAvgAggregateInputType
    _sum?: Inventory_currentSumAggregateInputType
    _min?: Inventory_currentMinAggregateInputType
    _max?: Inventory_currentMaxAggregateInputType
  }

  export type Inventory_currentGroupByOutputType = {
    id: string
    organization_id: string | null
    product_id: string
    location_code: string | null
    location_name: string | null
    quantity_on_hand: Decimal
    available_stock: Decimal
    reserved_stock: Decimal
    on_order_stock: Decimal
    minimum_stock: Decimal
    maximum_stock: Decimal | null
    reorder_point: Decimal | null
    average_cost: Decimal
    last_purchase_cost: Decimal
    standard_cost: Decimal
    total_value: Decimal | null
    is_low_stock: boolean
    is_out_of_stock: boolean
    needs_reorder: boolean
    last_synced_zoho: Date | null
    last_synced_tally: Date | null
    last_synced_custom: Date | null
    last_movement_date: Date | null
    last_stock_count_date: Date | null
    version_number: bigint
    created_at: Date | null
    updated_at: Date | null
    _count: Inventory_currentCountAggregateOutputType | null
    _avg: Inventory_currentAvgAggregateOutputType | null
    _sum: Inventory_currentSumAggregateOutputType | null
    _min: Inventory_currentMinAggregateOutputType | null
    _max: Inventory_currentMaxAggregateOutputType | null
  }

  type GetInventory_currentGroupByPayload<T extends inventory_currentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Inventory_currentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Inventory_currentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Inventory_currentGroupByOutputType[P]>
            : GetScalarType<T[P], Inventory_currentGroupByOutputType[P]>
        }
      >
    >


  export type inventory_currentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    product_id?: boolean
    location_code?: boolean
    location_name?: boolean
    quantity_on_hand?: boolean
    available_stock?: boolean
    reserved_stock?: boolean
    on_order_stock?: boolean
    minimum_stock?: boolean
    maximum_stock?: boolean
    reorder_point?: boolean
    average_cost?: boolean
    last_purchase_cost?: boolean
    standard_cost?: boolean
    total_value?: boolean
    is_low_stock?: boolean
    is_out_of_stock?: boolean
    needs_reorder?: boolean
    last_synced_zoho?: boolean
    last_synced_tally?: boolean
    last_synced_custom?: boolean
    last_movement_date?: boolean
    last_stock_count_date?: boolean
    version_number?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["inventory_current"]>

  export type inventory_currentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    product_id?: boolean
    location_code?: boolean
    location_name?: boolean
    quantity_on_hand?: boolean
    available_stock?: boolean
    reserved_stock?: boolean
    on_order_stock?: boolean
    minimum_stock?: boolean
    maximum_stock?: boolean
    reorder_point?: boolean
    average_cost?: boolean
    last_purchase_cost?: boolean
    standard_cost?: boolean
    total_value?: boolean
    is_low_stock?: boolean
    is_out_of_stock?: boolean
    needs_reorder?: boolean
    last_synced_zoho?: boolean
    last_synced_tally?: boolean
    last_synced_custom?: boolean
    last_movement_date?: boolean
    last_stock_count_date?: boolean
    version_number?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["inventory_current"]>

  export type inventory_currentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    product_id?: boolean
    location_code?: boolean
    location_name?: boolean
    quantity_on_hand?: boolean
    available_stock?: boolean
    reserved_stock?: boolean
    on_order_stock?: boolean
    minimum_stock?: boolean
    maximum_stock?: boolean
    reorder_point?: boolean
    average_cost?: boolean
    last_purchase_cost?: boolean
    standard_cost?: boolean
    total_value?: boolean
    is_low_stock?: boolean
    is_out_of_stock?: boolean
    needs_reorder?: boolean
    last_synced_zoho?: boolean
    last_synced_tally?: boolean
    last_synced_custom?: boolean
    last_movement_date?: boolean
    last_stock_count_date?: boolean
    version_number?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["inventory_current"]>

  export type inventory_currentSelectScalar = {
    id?: boolean
    organization_id?: boolean
    product_id?: boolean
    location_code?: boolean
    location_name?: boolean
    quantity_on_hand?: boolean
    available_stock?: boolean
    reserved_stock?: boolean
    on_order_stock?: boolean
    minimum_stock?: boolean
    maximum_stock?: boolean
    reorder_point?: boolean
    average_cost?: boolean
    last_purchase_cost?: boolean
    standard_cost?: boolean
    total_value?: boolean
    is_low_stock?: boolean
    is_out_of_stock?: boolean
    needs_reorder?: boolean
    last_synced_zoho?: boolean
    last_synced_tally?: boolean
    last_synced_custom?: boolean
    last_movement_date?: boolean
    last_stock_count_date?: boolean
    version_number?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type inventory_currentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organization_id" | "product_id" | "location_code" | "location_name" | "quantity_on_hand" | "available_stock" | "reserved_stock" | "on_order_stock" | "minimum_stock" | "maximum_stock" | "reorder_point" | "average_cost" | "last_purchase_cost" | "standard_cost" | "total_value" | "is_low_stock" | "is_out_of_stock" | "needs_reorder" | "last_synced_zoho" | "last_synced_tally" | "last_synced_custom" | "last_movement_date" | "last_stock_count_date" | "version_number" | "created_at" | "updated_at", ExtArgs["result"]["inventory_current"]>

  export type $inventory_currentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "inventory_current"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organization_id: string | null
      product_id: string
      location_code: string | null
      location_name: string | null
      quantity_on_hand: Prisma.Decimal
      available_stock: Prisma.Decimal
      reserved_stock: Prisma.Decimal
      on_order_stock: Prisma.Decimal
      minimum_stock: Prisma.Decimal
      maximum_stock: Prisma.Decimal | null
      reorder_point: Prisma.Decimal | null
      average_cost: Prisma.Decimal
      last_purchase_cost: Prisma.Decimal
      standard_cost: Prisma.Decimal
      total_value: Prisma.Decimal | null
      is_low_stock: boolean
      is_out_of_stock: boolean
      needs_reorder: boolean
      last_synced_zoho: Date | null
      last_synced_tally: Date | null
      last_synced_custom: Date | null
      last_movement_date: Date | null
      last_stock_count_date: Date | null
      version_number: bigint
      created_at: Date | null
      updated_at: Date | null
    }, ExtArgs["result"]["inventory_current"]>
    composites: {}
  }

  type inventory_currentGetPayload<S extends boolean | null | undefined | inventory_currentDefaultArgs> = $Result.GetResult<Prisma.$inventory_currentPayload, S>

  type inventory_currentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<inventory_currentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Inventory_currentCountAggregateInputType | true
    }

  export interface inventory_currentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['inventory_current'], meta: { name: 'inventory_current' } }
    /**
     * Find zero or one Inventory_current that matches the filter.
     * @param {inventory_currentFindUniqueArgs} args - Arguments to find a Inventory_current
     * @example
     * // Get one Inventory_current
     * const inventory_current = await prisma.inventory_current.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends inventory_currentFindUniqueArgs>(args: SelectSubset<T, inventory_currentFindUniqueArgs<ExtArgs>>): Prisma__inventory_currentClient<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Inventory_current that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {inventory_currentFindUniqueOrThrowArgs} args - Arguments to find a Inventory_current
     * @example
     * // Get one Inventory_current
     * const inventory_current = await prisma.inventory_current.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends inventory_currentFindUniqueOrThrowArgs>(args: SelectSubset<T, inventory_currentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__inventory_currentClient<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inventory_current that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_currentFindFirstArgs} args - Arguments to find a Inventory_current
     * @example
     * // Get one Inventory_current
     * const inventory_current = await prisma.inventory_current.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends inventory_currentFindFirstArgs>(args?: SelectSubset<T, inventory_currentFindFirstArgs<ExtArgs>>): Prisma__inventory_currentClient<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inventory_current that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_currentFindFirstOrThrowArgs} args - Arguments to find a Inventory_current
     * @example
     * // Get one Inventory_current
     * const inventory_current = await prisma.inventory_current.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends inventory_currentFindFirstOrThrowArgs>(args?: SelectSubset<T, inventory_currentFindFirstOrThrowArgs<ExtArgs>>): Prisma__inventory_currentClient<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Inventory_currents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_currentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inventory_currents
     * const inventory_currents = await prisma.inventory_current.findMany()
     * 
     * // Get first 10 Inventory_currents
     * const inventory_currents = await prisma.inventory_current.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventory_currentWithIdOnly = await prisma.inventory_current.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends inventory_currentFindManyArgs>(args?: SelectSubset<T, inventory_currentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Inventory_current.
     * @param {inventory_currentCreateArgs} args - Arguments to create a Inventory_current.
     * @example
     * // Create one Inventory_current
     * const Inventory_current = await prisma.inventory_current.create({
     *   data: {
     *     // ... data to create a Inventory_current
     *   }
     * })
     * 
     */
    create<T extends inventory_currentCreateArgs>(args: SelectSubset<T, inventory_currentCreateArgs<ExtArgs>>): Prisma__inventory_currentClient<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Inventory_currents.
     * @param {inventory_currentCreateManyArgs} args - Arguments to create many Inventory_currents.
     * @example
     * // Create many Inventory_currents
     * const inventory_current = await prisma.inventory_current.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends inventory_currentCreateManyArgs>(args?: SelectSubset<T, inventory_currentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inventory_currents and returns the data saved in the database.
     * @param {inventory_currentCreateManyAndReturnArgs} args - Arguments to create many Inventory_currents.
     * @example
     * // Create many Inventory_currents
     * const inventory_current = await prisma.inventory_current.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inventory_currents and only return the `id`
     * const inventory_currentWithIdOnly = await prisma.inventory_current.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends inventory_currentCreateManyAndReturnArgs>(args?: SelectSubset<T, inventory_currentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Inventory_current.
     * @param {inventory_currentDeleteArgs} args - Arguments to delete one Inventory_current.
     * @example
     * // Delete one Inventory_current
     * const Inventory_current = await prisma.inventory_current.delete({
     *   where: {
     *     // ... filter to delete one Inventory_current
     *   }
     * })
     * 
     */
    delete<T extends inventory_currentDeleteArgs>(args: SelectSubset<T, inventory_currentDeleteArgs<ExtArgs>>): Prisma__inventory_currentClient<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Inventory_current.
     * @param {inventory_currentUpdateArgs} args - Arguments to update one Inventory_current.
     * @example
     * // Update one Inventory_current
     * const inventory_current = await prisma.inventory_current.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends inventory_currentUpdateArgs>(args: SelectSubset<T, inventory_currentUpdateArgs<ExtArgs>>): Prisma__inventory_currentClient<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Inventory_currents.
     * @param {inventory_currentDeleteManyArgs} args - Arguments to filter Inventory_currents to delete.
     * @example
     * // Delete a few Inventory_currents
     * const { count } = await prisma.inventory_current.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends inventory_currentDeleteManyArgs>(args?: SelectSubset<T, inventory_currentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inventory_currents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_currentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inventory_currents
     * const inventory_current = await prisma.inventory_current.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends inventory_currentUpdateManyArgs>(args: SelectSubset<T, inventory_currentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inventory_currents and returns the data updated in the database.
     * @param {inventory_currentUpdateManyAndReturnArgs} args - Arguments to update many Inventory_currents.
     * @example
     * // Update many Inventory_currents
     * const inventory_current = await prisma.inventory_current.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Inventory_currents and only return the `id`
     * const inventory_currentWithIdOnly = await prisma.inventory_current.updateManyAndReturn({
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
    updateManyAndReturn<T extends inventory_currentUpdateManyAndReturnArgs>(args: SelectSubset<T, inventory_currentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Inventory_current.
     * @param {inventory_currentUpsertArgs} args - Arguments to update or create a Inventory_current.
     * @example
     * // Update or create a Inventory_current
     * const inventory_current = await prisma.inventory_current.upsert({
     *   create: {
     *     // ... data to create a Inventory_current
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inventory_current we want to update
     *   }
     * })
     */
    upsert<T extends inventory_currentUpsertArgs>(args: SelectSubset<T, inventory_currentUpsertArgs<ExtArgs>>): Prisma__inventory_currentClient<$Result.GetResult<Prisma.$inventory_currentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Inventory_currents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_currentCountArgs} args - Arguments to filter Inventory_currents to count.
     * @example
     * // Count the number of Inventory_currents
     * const count = await prisma.inventory_current.count({
     *   where: {
     *     // ... the filter for the Inventory_currents we want to count
     *   }
     * })
    **/
    count<T extends inventory_currentCountArgs>(
      args?: Subset<T, inventory_currentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Inventory_currentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inventory_current.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Inventory_currentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Inventory_currentAggregateArgs>(args: Subset<T, Inventory_currentAggregateArgs>): Prisma.PrismaPromise<GetInventory_currentAggregateType<T>>

    /**
     * Group by Inventory_current.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_currentGroupByArgs} args - Group by arguments.
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
      T extends inventory_currentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: inventory_currentGroupByArgs['orderBy'] }
        : { orderBy?: inventory_currentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, inventory_currentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventory_currentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the inventory_current model
   */
  readonly fields: inventory_currentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for inventory_current.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__inventory_currentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the inventory_current model
   */
  interface inventory_currentFieldRefs {
    readonly id: FieldRef<"inventory_current", 'String'>
    readonly organization_id: FieldRef<"inventory_current", 'String'>
    readonly product_id: FieldRef<"inventory_current", 'String'>
    readonly location_code: FieldRef<"inventory_current", 'String'>
    readonly location_name: FieldRef<"inventory_current", 'String'>
    readonly quantity_on_hand: FieldRef<"inventory_current", 'Decimal'>
    readonly available_stock: FieldRef<"inventory_current", 'Decimal'>
    readonly reserved_stock: FieldRef<"inventory_current", 'Decimal'>
    readonly on_order_stock: FieldRef<"inventory_current", 'Decimal'>
    readonly minimum_stock: FieldRef<"inventory_current", 'Decimal'>
    readonly maximum_stock: FieldRef<"inventory_current", 'Decimal'>
    readonly reorder_point: FieldRef<"inventory_current", 'Decimal'>
    readonly average_cost: FieldRef<"inventory_current", 'Decimal'>
    readonly last_purchase_cost: FieldRef<"inventory_current", 'Decimal'>
    readonly standard_cost: FieldRef<"inventory_current", 'Decimal'>
    readonly total_value: FieldRef<"inventory_current", 'Decimal'>
    readonly is_low_stock: FieldRef<"inventory_current", 'Boolean'>
    readonly is_out_of_stock: FieldRef<"inventory_current", 'Boolean'>
    readonly needs_reorder: FieldRef<"inventory_current", 'Boolean'>
    readonly last_synced_zoho: FieldRef<"inventory_current", 'DateTime'>
    readonly last_synced_tally: FieldRef<"inventory_current", 'DateTime'>
    readonly last_synced_custom: FieldRef<"inventory_current", 'DateTime'>
    readonly last_movement_date: FieldRef<"inventory_current", 'DateTime'>
    readonly last_stock_count_date: FieldRef<"inventory_current", 'DateTime'>
    readonly version_number: FieldRef<"inventory_current", 'BigInt'>
    readonly created_at: FieldRef<"inventory_current", 'DateTime'>
    readonly updated_at: FieldRef<"inventory_current", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * inventory_current findUnique
   */
  export type inventory_currentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * Filter, which inventory_current to fetch.
     */
    where: inventory_currentWhereUniqueInput
  }

  /**
   * inventory_current findUniqueOrThrow
   */
  export type inventory_currentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * Filter, which inventory_current to fetch.
     */
    where: inventory_currentWhereUniqueInput
  }

  /**
   * inventory_current findFirst
   */
  export type inventory_currentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * Filter, which inventory_current to fetch.
     */
    where?: inventory_currentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inventory_currents to fetch.
     */
    orderBy?: inventory_currentOrderByWithRelationInput | inventory_currentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for inventory_currents.
     */
    cursor?: inventory_currentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inventory_currents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inventory_currents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of inventory_currents.
     */
    distinct?: Inventory_currentScalarFieldEnum | Inventory_currentScalarFieldEnum[]
  }

  /**
   * inventory_current findFirstOrThrow
   */
  export type inventory_currentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * Filter, which inventory_current to fetch.
     */
    where?: inventory_currentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inventory_currents to fetch.
     */
    orderBy?: inventory_currentOrderByWithRelationInput | inventory_currentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for inventory_currents.
     */
    cursor?: inventory_currentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inventory_currents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inventory_currents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of inventory_currents.
     */
    distinct?: Inventory_currentScalarFieldEnum | Inventory_currentScalarFieldEnum[]
  }

  /**
   * inventory_current findMany
   */
  export type inventory_currentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * Filter, which inventory_currents to fetch.
     */
    where?: inventory_currentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inventory_currents to fetch.
     */
    orderBy?: inventory_currentOrderByWithRelationInput | inventory_currentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing inventory_currents.
     */
    cursor?: inventory_currentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inventory_currents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inventory_currents.
     */
    skip?: number
    distinct?: Inventory_currentScalarFieldEnum | Inventory_currentScalarFieldEnum[]
  }

  /**
   * inventory_current create
   */
  export type inventory_currentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * The data needed to create a inventory_current.
     */
    data: XOR<inventory_currentCreateInput, inventory_currentUncheckedCreateInput>
  }

  /**
   * inventory_current createMany
   */
  export type inventory_currentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many inventory_currents.
     */
    data: inventory_currentCreateManyInput | inventory_currentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * inventory_current createManyAndReturn
   */
  export type inventory_currentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * The data used to create many inventory_currents.
     */
    data: inventory_currentCreateManyInput | inventory_currentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * inventory_current update
   */
  export type inventory_currentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * The data needed to update a inventory_current.
     */
    data: XOR<inventory_currentUpdateInput, inventory_currentUncheckedUpdateInput>
    /**
     * Choose, which inventory_current to update.
     */
    where: inventory_currentWhereUniqueInput
  }

  /**
   * inventory_current updateMany
   */
  export type inventory_currentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update inventory_currents.
     */
    data: XOR<inventory_currentUpdateManyMutationInput, inventory_currentUncheckedUpdateManyInput>
    /**
     * Filter which inventory_currents to update
     */
    where?: inventory_currentWhereInput
    /**
     * Limit how many inventory_currents to update.
     */
    limit?: number
  }

  /**
   * inventory_current updateManyAndReturn
   */
  export type inventory_currentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * The data used to update inventory_currents.
     */
    data: XOR<inventory_currentUpdateManyMutationInput, inventory_currentUncheckedUpdateManyInput>
    /**
     * Filter which inventory_currents to update
     */
    where?: inventory_currentWhereInput
    /**
     * Limit how many inventory_currents to update.
     */
    limit?: number
  }

  /**
   * inventory_current upsert
   */
  export type inventory_currentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * The filter to search for the inventory_current to update in case it exists.
     */
    where: inventory_currentWhereUniqueInput
    /**
     * In case the inventory_current found by the `where` argument doesn't exist, create a new inventory_current with this data.
     */
    create: XOR<inventory_currentCreateInput, inventory_currentUncheckedCreateInput>
    /**
     * In case the inventory_current was found with the provided `where` argument, update it with this data.
     */
    update: XOR<inventory_currentUpdateInput, inventory_currentUncheckedUpdateInput>
  }

  /**
   * inventory_current delete
   */
  export type inventory_currentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
    /**
     * Filter which inventory_current to delete.
     */
    where: inventory_currentWhereUniqueInput
  }

  /**
   * inventory_current deleteMany
   */
  export type inventory_currentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which inventory_currents to delete
     */
    where?: inventory_currentWhereInput
    /**
     * Limit how many inventory_currents to delete.
     */
    limit?: number
  }

  /**
   * inventory_current without action
   */
  export type inventory_currentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_current
     */
    select?: inventory_currentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_current
     */
    omit?: inventory_currentOmit<ExtArgs> | null
  }


  /**
   * Model organizations
   */

  export type AggregateOrganizations = {
    _count: OrganizationsCountAggregateOutputType | null
    _min: OrganizationsMinAggregateOutputType | null
    _max: OrganizationsMaxAggregateOutputType | null
  }

  export type OrganizationsMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    tax_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OrganizationsMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    tax_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OrganizationsCountAggregateOutputType = {
    id: number
    name: number
    code: number
    tax_id: number
    address: number
    contact_info: number
    settings: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type OrganizationsMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    tax_id?: true
    created_at?: true
    updated_at?: true
  }

  export type OrganizationsMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    tax_id?: true
    created_at?: true
    updated_at?: true
  }

  export type OrganizationsCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    tax_id?: true
    address?: true
    contact_info?: true
    settings?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type OrganizationsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which organizations to aggregate.
     */
    where?: organizationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of organizations to fetch.
     */
    orderBy?: organizationsOrderByWithRelationInput | organizationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: organizationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned organizations
    **/
    _count?: true | OrganizationsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationsMaxAggregateInputType
  }

  export type GetOrganizationsAggregateType<T extends OrganizationsAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganizations]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganizations[P]>
      : GetScalarType<T[P], AggregateOrganizations[P]>
  }




  export type organizationsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: organizationsWhereInput
    orderBy?: organizationsOrderByWithAggregationInput | organizationsOrderByWithAggregationInput[]
    by: OrganizationsScalarFieldEnum[] | OrganizationsScalarFieldEnum
    having?: organizationsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationsCountAggregateInputType | true
    _min?: OrganizationsMinAggregateInputType
    _max?: OrganizationsMaxAggregateInputType
  }

  export type OrganizationsGroupByOutputType = {
    id: string
    name: string
    code: string | null
    tax_id: string | null
    address: JsonValue | null
    contact_info: JsonValue | null
    settings: JsonValue | null
    created_at: Date | null
    updated_at: Date | null
    _count: OrganizationsCountAggregateOutputType | null
    _min: OrganizationsMinAggregateOutputType | null
    _max: OrganizationsMaxAggregateOutputType | null
  }

  type GetOrganizationsGroupByPayload<T extends organizationsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationsGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationsGroupByOutputType[P]>
        }
      >
    >


  export type organizationsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    tax_id?: boolean
    address?: boolean
    contact_info?: boolean
    settings?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["organizations"]>

  export type organizationsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    tax_id?: boolean
    address?: boolean
    contact_info?: boolean
    settings?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["organizations"]>

  export type organizationsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    tax_id?: boolean
    address?: boolean
    contact_info?: boolean
    settings?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["organizations"]>

  export type organizationsSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    tax_id?: boolean
    address?: boolean
    contact_info?: boolean
    settings?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type organizationsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "code" | "tax_id" | "address" | "contact_info" | "settings" | "created_at" | "updated_at", ExtArgs["result"]["organizations"]>

  export type $organizationsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "organizations"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string | null
      tax_id: string | null
      address: Prisma.JsonValue | null
      contact_info: Prisma.JsonValue | null
      settings: Prisma.JsonValue | null
      created_at: Date | null
      updated_at: Date | null
    }, ExtArgs["result"]["organizations"]>
    composites: {}
  }

  type organizationsGetPayload<S extends boolean | null | undefined | organizationsDefaultArgs> = $Result.GetResult<Prisma.$organizationsPayload, S>

  type organizationsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<organizationsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationsCountAggregateInputType | true
    }

  export interface organizationsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['organizations'], meta: { name: 'organizations' } }
    /**
     * Find zero or one Organizations that matches the filter.
     * @param {organizationsFindUniqueArgs} args - Arguments to find a Organizations
     * @example
     * // Get one Organizations
     * const organizations = await prisma.organizations.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends organizationsFindUniqueArgs>(args: SelectSubset<T, organizationsFindUniqueArgs<ExtArgs>>): Prisma__organizationsClient<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organizations that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {organizationsFindUniqueOrThrowArgs} args - Arguments to find a Organizations
     * @example
     * // Get one Organizations
     * const organizations = await prisma.organizations.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends organizationsFindUniqueOrThrowArgs>(args: SelectSubset<T, organizationsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__organizationsClient<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {organizationsFindFirstArgs} args - Arguments to find a Organizations
     * @example
     * // Get one Organizations
     * const organizations = await prisma.organizations.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends organizationsFindFirstArgs>(args?: SelectSubset<T, organizationsFindFirstArgs<ExtArgs>>): Prisma__organizationsClient<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organizations that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {organizationsFindFirstOrThrowArgs} args - Arguments to find a Organizations
     * @example
     * // Get one Organizations
     * const organizations = await prisma.organizations.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends organizationsFindFirstOrThrowArgs>(args?: SelectSubset<T, organizationsFindFirstOrThrowArgs<ExtArgs>>): Prisma__organizationsClient<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {organizationsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organizations.findMany()
     * 
     * // Get first 10 Organizations
     * const organizations = await prisma.organizations.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationsWithIdOnly = await prisma.organizations.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends organizationsFindManyArgs>(args?: SelectSubset<T, organizationsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organizations.
     * @param {organizationsCreateArgs} args - Arguments to create a Organizations.
     * @example
     * // Create one Organizations
     * const Organizations = await prisma.organizations.create({
     *   data: {
     *     // ... data to create a Organizations
     *   }
     * })
     * 
     */
    create<T extends organizationsCreateArgs>(args: SelectSubset<T, organizationsCreateArgs<ExtArgs>>): Prisma__organizationsClient<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {organizationsCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organizations = await prisma.organizations.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends organizationsCreateManyArgs>(args?: SelectSubset<T, organizationsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organizations and returns the data saved in the database.
     * @param {organizationsCreateManyAndReturnArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organizations = await prisma.organizations.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Organizations and only return the `id`
     * const organizationsWithIdOnly = await prisma.organizations.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends organizationsCreateManyAndReturnArgs>(args?: SelectSubset<T, organizationsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organizations.
     * @param {organizationsDeleteArgs} args - Arguments to delete one Organizations.
     * @example
     * // Delete one Organizations
     * const Organizations = await prisma.organizations.delete({
     *   where: {
     *     // ... filter to delete one Organizations
     *   }
     * })
     * 
     */
    delete<T extends organizationsDeleteArgs>(args: SelectSubset<T, organizationsDeleteArgs<ExtArgs>>): Prisma__organizationsClient<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organizations.
     * @param {organizationsUpdateArgs} args - Arguments to update one Organizations.
     * @example
     * // Update one Organizations
     * const organizations = await prisma.organizations.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends organizationsUpdateArgs>(args: SelectSubset<T, organizationsUpdateArgs<ExtArgs>>): Prisma__organizationsClient<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {organizationsDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organizations.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends organizationsDeleteManyArgs>(args?: SelectSubset<T, organizationsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {organizationsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organizations = await prisma.organizations.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends organizationsUpdateManyArgs>(args: SelectSubset<T, organizationsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations and returns the data updated in the database.
     * @param {organizationsUpdateManyAndReturnArgs} args - Arguments to update many Organizations.
     * @example
     * // Update many Organizations
     * const organizations = await prisma.organizations.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Organizations and only return the `id`
     * const organizationsWithIdOnly = await prisma.organizations.updateManyAndReturn({
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
    updateManyAndReturn<T extends organizationsUpdateManyAndReturnArgs>(args: SelectSubset<T, organizationsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organizations.
     * @param {organizationsUpsertArgs} args - Arguments to update or create a Organizations.
     * @example
     * // Update or create a Organizations
     * const organizations = await prisma.organizations.upsert({
     *   create: {
     *     // ... data to create a Organizations
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organizations we want to update
     *   }
     * })
     */
    upsert<T extends organizationsUpsertArgs>(args: SelectSubset<T, organizationsUpsertArgs<ExtArgs>>): Prisma__organizationsClient<$Result.GetResult<Prisma.$organizationsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {organizationsCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organizations.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends organizationsCountArgs>(
      args?: Subset<T, organizationsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrganizationsAggregateArgs>(args: Subset<T, OrganizationsAggregateArgs>): Prisma.PrismaPromise<GetOrganizationsAggregateType<T>>

    /**
     * Group by Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {organizationsGroupByArgs} args - Group by arguments.
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
      T extends organizationsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: organizationsGroupByArgs['orderBy'] }
        : { orderBy?: organizationsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, organizationsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the organizations model
   */
  readonly fields: organizationsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for organizations.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__organizationsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the organizations model
   */
  interface organizationsFieldRefs {
    readonly id: FieldRef<"organizations", 'String'>
    readonly name: FieldRef<"organizations", 'String'>
    readonly code: FieldRef<"organizations", 'String'>
    readonly tax_id: FieldRef<"organizations", 'String'>
    readonly address: FieldRef<"organizations", 'Json'>
    readonly contact_info: FieldRef<"organizations", 'Json'>
    readonly settings: FieldRef<"organizations", 'Json'>
    readonly created_at: FieldRef<"organizations", 'DateTime'>
    readonly updated_at: FieldRef<"organizations", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * organizations findUnique
   */
  export type organizationsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * Filter, which organizations to fetch.
     */
    where: organizationsWhereUniqueInput
  }

  /**
   * organizations findUniqueOrThrow
   */
  export type organizationsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * Filter, which organizations to fetch.
     */
    where: organizationsWhereUniqueInput
  }

  /**
   * organizations findFirst
   */
  export type organizationsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * Filter, which organizations to fetch.
     */
    where?: organizationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of organizations to fetch.
     */
    orderBy?: organizationsOrderByWithRelationInput | organizationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for organizations.
     */
    cursor?: organizationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of organizations.
     */
    distinct?: OrganizationsScalarFieldEnum | OrganizationsScalarFieldEnum[]
  }

  /**
   * organizations findFirstOrThrow
   */
  export type organizationsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * Filter, which organizations to fetch.
     */
    where?: organizationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of organizations to fetch.
     */
    orderBy?: organizationsOrderByWithRelationInput | organizationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for organizations.
     */
    cursor?: organizationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of organizations.
     */
    distinct?: OrganizationsScalarFieldEnum | OrganizationsScalarFieldEnum[]
  }

  /**
   * organizations findMany
   */
  export type organizationsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * Filter, which organizations to fetch.
     */
    where?: organizationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of organizations to fetch.
     */
    orderBy?: organizationsOrderByWithRelationInput | organizationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing organizations.
     */
    cursor?: organizationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` organizations.
     */
    skip?: number
    distinct?: OrganizationsScalarFieldEnum | OrganizationsScalarFieldEnum[]
  }

  /**
   * organizations create
   */
  export type organizationsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * The data needed to create a organizations.
     */
    data: XOR<organizationsCreateInput, organizationsUncheckedCreateInput>
  }

  /**
   * organizations createMany
   */
  export type organizationsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many organizations.
     */
    data: organizationsCreateManyInput | organizationsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * organizations createManyAndReturn
   */
  export type organizationsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * The data used to create many organizations.
     */
    data: organizationsCreateManyInput | organizationsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * organizations update
   */
  export type organizationsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * The data needed to update a organizations.
     */
    data: XOR<organizationsUpdateInput, organizationsUncheckedUpdateInput>
    /**
     * Choose, which organizations to update.
     */
    where: organizationsWhereUniqueInput
  }

  /**
   * organizations updateMany
   */
  export type organizationsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update organizations.
     */
    data: XOR<organizationsUpdateManyMutationInput, organizationsUncheckedUpdateManyInput>
    /**
     * Filter which organizations to update
     */
    where?: organizationsWhereInput
    /**
     * Limit how many organizations to update.
     */
    limit?: number
  }

  /**
   * organizations updateManyAndReturn
   */
  export type organizationsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * The data used to update organizations.
     */
    data: XOR<organizationsUpdateManyMutationInput, organizationsUncheckedUpdateManyInput>
    /**
     * Filter which organizations to update
     */
    where?: organizationsWhereInput
    /**
     * Limit how many organizations to update.
     */
    limit?: number
  }

  /**
   * organizations upsert
   */
  export type organizationsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * The filter to search for the organizations to update in case it exists.
     */
    where: organizationsWhereUniqueInput
    /**
     * In case the organizations found by the `where` argument doesn't exist, create a new organizations with this data.
     */
    create: XOR<organizationsCreateInput, organizationsUncheckedCreateInput>
    /**
     * In case the organizations was found with the provided `where` argument, update it with this data.
     */
    update: XOR<organizationsUpdateInput, organizationsUncheckedUpdateInput>
  }

  /**
   * organizations delete
   */
  export type organizationsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
    /**
     * Filter which organizations to delete.
     */
    where: organizationsWhereUniqueInput
  }

  /**
   * organizations deleteMany
   */
  export type organizationsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which organizations to delete
     */
    where?: organizationsWhereInput
    /**
     * Limit how many organizations to delete.
     */
    limit?: number
  }

  /**
   * organizations without action
   */
  export type organizationsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the organizations
     */
    select?: organizationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the organizations
     */
    omit?: organizationsOmit<ExtArgs> | null
  }


  /**
   * Model product_categories
   */

  export type AggregateProduct_categories = {
    _count: Product_categoriesCountAggregateOutputType | null
    _avg: Product_categoriesAvgAggregateOutputType | null
    _sum: Product_categoriesSumAggregateOutputType | null
    _min: Product_categoriesMinAggregateOutputType | null
    _max: Product_categoriesMaxAggregateOutputType | null
  }

  export type Product_categoriesAvgAggregateOutputType = {
    level: number | null
    sort_order: number | null
  }

  export type Product_categoriesSumAggregateOutputType = {
    level: number | null
    sort_order: number | null
  }

  export type Product_categoriesMinAggregateOutputType = {
    id: string | null
    organization_id: string | null
    name: string | null
    code: string | null
    description: string | null
    parent_id: string | null
    level: number | null
    sort_order: number | null
    is_active: boolean | null
    zoho_group_id: string | null
    tally_category: string | null
    custom_category_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Product_categoriesMaxAggregateOutputType = {
    id: string | null
    organization_id: string | null
    name: string | null
    code: string | null
    description: string | null
    parent_id: string | null
    level: number | null
    sort_order: number | null
    is_active: boolean | null
    zoho_group_id: string | null
    tally_category: string | null
    custom_category_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Product_categoriesCountAggregateOutputType = {
    id: number
    organization_id: number
    name: number
    code: number
    description: number
    parent_id: number
    level: number
    sort_order: number
    is_active: number
    zoho_group_id: number
    tally_category: number
    custom_category_id: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Product_categoriesAvgAggregateInputType = {
    level?: true
    sort_order?: true
  }

  export type Product_categoriesSumAggregateInputType = {
    level?: true
    sort_order?: true
  }

  export type Product_categoriesMinAggregateInputType = {
    id?: true
    organization_id?: true
    name?: true
    code?: true
    description?: true
    parent_id?: true
    level?: true
    sort_order?: true
    is_active?: true
    zoho_group_id?: true
    tally_category?: true
    custom_category_id?: true
    created_at?: true
    updated_at?: true
  }

  export type Product_categoriesMaxAggregateInputType = {
    id?: true
    organization_id?: true
    name?: true
    code?: true
    description?: true
    parent_id?: true
    level?: true
    sort_order?: true
    is_active?: true
    zoho_group_id?: true
    tally_category?: true
    custom_category_id?: true
    created_at?: true
    updated_at?: true
  }

  export type Product_categoriesCountAggregateInputType = {
    id?: true
    organization_id?: true
    name?: true
    code?: true
    description?: true
    parent_id?: true
    level?: true
    sort_order?: true
    is_active?: true
    zoho_group_id?: true
    tally_category?: true
    custom_category_id?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Product_categoriesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which product_categories to aggregate.
     */
    where?: product_categoriesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_categories to fetch.
     */
    orderBy?: product_categoriesOrderByWithRelationInput | product_categoriesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: product_categoriesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned product_categories
    **/
    _count?: true | Product_categoriesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Product_categoriesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Product_categoriesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Product_categoriesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Product_categoriesMaxAggregateInputType
  }

  export type GetProduct_categoriesAggregateType<T extends Product_categoriesAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct_categories]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct_categories[P]>
      : GetScalarType<T[P], AggregateProduct_categories[P]>
  }




  export type product_categoriesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: product_categoriesWhereInput
    orderBy?: product_categoriesOrderByWithAggregationInput | product_categoriesOrderByWithAggregationInput[]
    by: Product_categoriesScalarFieldEnum[] | Product_categoriesScalarFieldEnum
    having?: product_categoriesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Product_categoriesCountAggregateInputType | true
    _avg?: Product_categoriesAvgAggregateInputType
    _sum?: Product_categoriesSumAggregateInputType
    _min?: Product_categoriesMinAggregateInputType
    _max?: Product_categoriesMaxAggregateInputType
  }

  export type Product_categoriesGroupByOutputType = {
    id: string
    organization_id: string
    name: string
    code: string | null
    description: string | null
    parent_id: string | null
    level: number | null
    sort_order: number | null
    is_active: boolean | null
    zoho_group_id: string | null
    tally_category: string | null
    custom_category_id: string | null
    created_at: Date | null
    updated_at: Date | null
    _count: Product_categoriesCountAggregateOutputType | null
    _avg: Product_categoriesAvgAggregateOutputType | null
    _sum: Product_categoriesSumAggregateOutputType | null
    _min: Product_categoriesMinAggregateOutputType | null
    _max: Product_categoriesMaxAggregateOutputType | null
  }

  type GetProduct_categoriesGroupByPayload<T extends product_categoriesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Product_categoriesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Product_categoriesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Product_categoriesGroupByOutputType[P]>
            : GetScalarType<T[P], Product_categoriesGroupByOutputType[P]>
        }
      >
    >


  export type product_categoriesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    parent_id?: boolean
    level?: boolean
    sort_order?: boolean
    is_active?: boolean
    zoho_group_id?: boolean
    tally_category?: boolean
    custom_category_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    product_categories?: boolean | product_categories$product_categoriesArgs<ExtArgs>
    other_product_categories?: boolean | product_categories$other_product_categoriesArgs<ExtArgs>
    products?: boolean | product_categories$productsArgs<ExtArgs>
    _count?: boolean | Product_categoriesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product_categories"]>

  export type product_categoriesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    parent_id?: boolean
    level?: boolean
    sort_order?: boolean
    is_active?: boolean
    zoho_group_id?: boolean
    tally_category?: boolean
    custom_category_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    product_categories?: boolean | product_categories$product_categoriesArgs<ExtArgs>
  }, ExtArgs["result"]["product_categories"]>

  export type product_categoriesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    parent_id?: boolean
    level?: boolean
    sort_order?: boolean
    is_active?: boolean
    zoho_group_id?: boolean
    tally_category?: boolean
    custom_category_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    product_categories?: boolean | product_categories$product_categoriesArgs<ExtArgs>
  }, ExtArgs["result"]["product_categories"]>

  export type product_categoriesSelectScalar = {
    id?: boolean
    organization_id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    parent_id?: boolean
    level?: boolean
    sort_order?: boolean
    is_active?: boolean
    zoho_group_id?: boolean
    tally_category?: boolean
    custom_category_id?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type product_categoriesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organization_id" | "name" | "code" | "description" | "parent_id" | "level" | "sort_order" | "is_active" | "zoho_group_id" | "tally_category" | "custom_category_id" | "created_at" | "updated_at", ExtArgs["result"]["product_categories"]>
  export type product_categoriesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product_categories?: boolean | product_categories$product_categoriesArgs<ExtArgs>
    other_product_categories?: boolean | product_categories$other_product_categoriesArgs<ExtArgs>
    products?: boolean | product_categories$productsArgs<ExtArgs>
    _count?: boolean | Product_categoriesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type product_categoriesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product_categories?: boolean | product_categories$product_categoriesArgs<ExtArgs>
  }
  export type product_categoriesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product_categories?: boolean | product_categories$product_categoriesArgs<ExtArgs>
  }

  export type $product_categoriesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "product_categories"
    objects: {
      product_categories: Prisma.$product_categoriesPayload<ExtArgs> | null
      other_product_categories: Prisma.$product_categoriesPayload<ExtArgs>[]
      products: Prisma.$productsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organization_id: string
      name: string
      code: string | null
      description: string | null
      parent_id: string | null
      level: number | null
      sort_order: number | null
      is_active: boolean | null
      zoho_group_id: string | null
      tally_category: string | null
      custom_category_id: string | null
      created_at: Date | null
      updated_at: Date | null
    }, ExtArgs["result"]["product_categories"]>
    composites: {}
  }

  type product_categoriesGetPayload<S extends boolean | null | undefined | product_categoriesDefaultArgs> = $Result.GetResult<Prisma.$product_categoriesPayload, S>

  type product_categoriesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<product_categoriesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Product_categoriesCountAggregateInputType | true
    }

  export interface product_categoriesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['product_categories'], meta: { name: 'product_categories' } }
    /**
     * Find zero or one Product_categories that matches the filter.
     * @param {product_categoriesFindUniqueArgs} args - Arguments to find a Product_categories
     * @example
     * // Get one Product_categories
     * const product_categories = await prisma.product_categories.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends product_categoriesFindUniqueArgs>(args: SelectSubset<T, product_categoriesFindUniqueArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product_categories that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {product_categoriesFindUniqueOrThrowArgs} args - Arguments to find a Product_categories
     * @example
     * // Get one Product_categories
     * const product_categories = await prisma.product_categories.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends product_categoriesFindUniqueOrThrowArgs>(args: SelectSubset<T, product_categoriesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product_categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_categoriesFindFirstArgs} args - Arguments to find a Product_categories
     * @example
     * // Get one Product_categories
     * const product_categories = await prisma.product_categories.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends product_categoriesFindFirstArgs>(args?: SelectSubset<T, product_categoriesFindFirstArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product_categories that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_categoriesFindFirstOrThrowArgs} args - Arguments to find a Product_categories
     * @example
     * // Get one Product_categories
     * const product_categories = await prisma.product_categories.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends product_categoriesFindFirstOrThrowArgs>(args?: SelectSubset<T, product_categoriesFindFirstOrThrowArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Product_categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_categoriesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Product_categories
     * const product_categories = await prisma.product_categories.findMany()
     * 
     * // Get first 10 Product_categories
     * const product_categories = await prisma.product_categories.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const product_categoriesWithIdOnly = await prisma.product_categories.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends product_categoriesFindManyArgs>(args?: SelectSubset<T, product_categoriesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product_categories.
     * @param {product_categoriesCreateArgs} args - Arguments to create a Product_categories.
     * @example
     * // Create one Product_categories
     * const Product_categories = await prisma.product_categories.create({
     *   data: {
     *     // ... data to create a Product_categories
     *   }
     * })
     * 
     */
    create<T extends product_categoriesCreateArgs>(args: SelectSubset<T, product_categoriesCreateArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Product_categories.
     * @param {product_categoriesCreateManyArgs} args - Arguments to create many Product_categories.
     * @example
     * // Create many Product_categories
     * const product_categories = await prisma.product_categories.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends product_categoriesCreateManyArgs>(args?: SelectSubset<T, product_categoriesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Product_categories and returns the data saved in the database.
     * @param {product_categoriesCreateManyAndReturnArgs} args - Arguments to create many Product_categories.
     * @example
     * // Create many Product_categories
     * const product_categories = await prisma.product_categories.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Product_categories and only return the `id`
     * const product_categoriesWithIdOnly = await prisma.product_categories.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends product_categoriesCreateManyAndReturnArgs>(args?: SelectSubset<T, product_categoriesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product_categories.
     * @param {product_categoriesDeleteArgs} args - Arguments to delete one Product_categories.
     * @example
     * // Delete one Product_categories
     * const Product_categories = await prisma.product_categories.delete({
     *   where: {
     *     // ... filter to delete one Product_categories
     *   }
     * })
     * 
     */
    delete<T extends product_categoriesDeleteArgs>(args: SelectSubset<T, product_categoriesDeleteArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product_categories.
     * @param {product_categoriesUpdateArgs} args - Arguments to update one Product_categories.
     * @example
     * // Update one Product_categories
     * const product_categories = await prisma.product_categories.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends product_categoriesUpdateArgs>(args: SelectSubset<T, product_categoriesUpdateArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Product_categories.
     * @param {product_categoriesDeleteManyArgs} args - Arguments to filter Product_categories to delete.
     * @example
     * // Delete a few Product_categories
     * const { count } = await prisma.product_categories.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends product_categoriesDeleteManyArgs>(args?: SelectSubset<T, product_categoriesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Product_categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_categoriesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Product_categories
     * const product_categories = await prisma.product_categories.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends product_categoriesUpdateManyArgs>(args: SelectSubset<T, product_categoriesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Product_categories and returns the data updated in the database.
     * @param {product_categoriesUpdateManyAndReturnArgs} args - Arguments to update many Product_categories.
     * @example
     * // Update many Product_categories
     * const product_categories = await prisma.product_categories.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Product_categories and only return the `id`
     * const product_categoriesWithIdOnly = await prisma.product_categories.updateManyAndReturn({
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
    updateManyAndReturn<T extends product_categoriesUpdateManyAndReturnArgs>(args: SelectSubset<T, product_categoriesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product_categories.
     * @param {product_categoriesUpsertArgs} args - Arguments to update or create a Product_categories.
     * @example
     * // Update or create a Product_categories
     * const product_categories = await prisma.product_categories.upsert({
     *   create: {
     *     // ... data to create a Product_categories
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product_categories we want to update
     *   }
     * })
     */
    upsert<T extends product_categoriesUpsertArgs>(args: SelectSubset<T, product_categoriesUpsertArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Product_categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_categoriesCountArgs} args - Arguments to filter Product_categories to count.
     * @example
     * // Count the number of Product_categories
     * const count = await prisma.product_categories.count({
     *   where: {
     *     // ... the filter for the Product_categories we want to count
     *   }
     * })
    **/
    count<T extends product_categoriesCountArgs>(
      args?: Subset<T, product_categoriesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Product_categoriesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product_categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Product_categoriesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Product_categoriesAggregateArgs>(args: Subset<T, Product_categoriesAggregateArgs>): Prisma.PrismaPromise<GetProduct_categoriesAggregateType<T>>

    /**
     * Group by Product_categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_categoriesGroupByArgs} args - Group by arguments.
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
      T extends product_categoriesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: product_categoriesGroupByArgs['orderBy'] }
        : { orderBy?: product_categoriesGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, product_categoriesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProduct_categoriesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the product_categories model
   */
  readonly fields: product_categoriesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for product_categories.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__product_categoriesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product_categories<T extends product_categories$product_categoriesArgs<ExtArgs> = {}>(args?: Subset<T, product_categories$product_categoriesArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    other_product_categories<T extends product_categories$other_product_categoriesArgs<ExtArgs> = {}>(args?: Subset<T, product_categories$other_product_categoriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    products<T extends product_categories$productsArgs<ExtArgs> = {}>(args?: Subset<T, product_categories$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the product_categories model
   */
  interface product_categoriesFieldRefs {
    readonly id: FieldRef<"product_categories", 'String'>
    readonly organization_id: FieldRef<"product_categories", 'String'>
    readonly name: FieldRef<"product_categories", 'String'>
    readonly code: FieldRef<"product_categories", 'String'>
    readonly description: FieldRef<"product_categories", 'String'>
    readonly parent_id: FieldRef<"product_categories", 'String'>
    readonly level: FieldRef<"product_categories", 'Int'>
    readonly sort_order: FieldRef<"product_categories", 'Int'>
    readonly is_active: FieldRef<"product_categories", 'Boolean'>
    readonly zoho_group_id: FieldRef<"product_categories", 'String'>
    readonly tally_category: FieldRef<"product_categories", 'String'>
    readonly custom_category_id: FieldRef<"product_categories", 'String'>
    readonly created_at: FieldRef<"product_categories", 'DateTime'>
    readonly updated_at: FieldRef<"product_categories", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * product_categories findUnique
   */
  export type product_categoriesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * Filter, which product_categories to fetch.
     */
    where: product_categoriesWhereUniqueInput
  }

  /**
   * product_categories findUniqueOrThrow
   */
  export type product_categoriesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * Filter, which product_categories to fetch.
     */
    where: product_categoriesWhereUniqueInput
  }

  /**
   * product_categories findFirst
   */
  export type product_categoriesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * Filter, which product_categories to fetch.
     */
    where?: product_categoriesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_categories to fetch.
     */
    orderBy?: product_categoriesOrderByWithRelationInput | product_categoriesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for product_categories.
     */
    cursor?: product_categoriesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of product_categories.
     */
    distinct?: Product_categoriesScalarFieldEnum | Product_categoriesScalarFieldEnum[]
  }

  /**
   * product_categories findFirstOrThrow
   */
  export type product_categoriesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * Filter, which product_categories to fetch.
     */
    where?: product_categoriesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_categories to fetch.
     */
    orderBy?: product_categoriesOrderByWithRelationInput | product_categoriesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for product_categories.
     */
    cursor?: product_categoriesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of product_categories.
     */
    distinct?: Product_categoriesScalarFieldEnum | Product_categoriesScalarFieldEnum[]
  }

  /**
   * product_categories findMany
   */
  export type product_categoriesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * Filter, which product_categories to fetch.
     */
    where?: product_categoriesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_categories to fetch.
     */
    orderBy?: product_categoriesOrderByWithRelationInput | product_categoriesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing product_categories.
     */
    cursor?: product_categoriesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_categories.
     */
    skip?: number
    distinct?: Product_categoriesScalarFieldEnum | Product_categoriesScalarFieldEnum[]
  }

  /**
   * product_categories create
   */
  export type product_categoriesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * The data needed to create a product_categories.
     */
    data: XOR<product_categoriesCreateInput, product_categoriesUncheckedCreateInput>
  }

  /**
   * product_categories createMany
   */
  export type product_categoriesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many product_categories.
     */
    data: product_categoriesCreateManyInput | product_categoriesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * product_categories createManyAndReturn
   */
  export type product_categoriesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * The data used to create many product_categories.
     */
    data: product_categoriesCreateManyInput | product_categoriesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * product_categories update
   */
  export type product_categoriesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * The data needed to update a product_categories.
     */
    data: XOR<product_categoriesUpdateInput, product_categoriesUncheckedUpdateInput>
    /**
     * Choose, which product_categories to update.
     */
    where: product_categoriesWhereUniqueInput
  }

  /**
   * product_categories updateMany
   */
  export type product_categoriesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update product_categories.
     */
    data: XOR<product_categoriesUpdateManyMutationInput, product_categoriesUncheckedUpdateManyInput>
    /**
     * Filter which product_categories to update
     */
    where?: product_categoriesWhereInput
    /**
     * Limit how many product_categories to update.
     */
    limit?: number
  }

  /**
   * product_categories updateManyAndReturn
   */
  export type product_categoriesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * The data used to update product_categories.
     */
    data: XOR<product_categoriesUpdateManyMutationInput, product_categoriesUncheckedUpdateManyInput>
    /**
     * Filter which product_categories to update
     */
    where?: product_categoriesWhereInput
    /**
     * Limit how many product_categories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * product_categories upsert
   */
  export type product_categoriesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * The filter to search for the product_categories to update in case it exists.
     */
    where: product_categoriesWhereUniqueInput
    /**
     * In case the product_categories found by the `where` argument doesn't exist, create a new product_categories with this data.
     */
    create: XOR<product_categoriesCreateInput, product_categoriesUncheckedCreateInput>
    /**
     * In case the product_categories was found with the provided `where` argument, update it with this data.
     */
    update: XOR<product_categoriesUpdateInput, product_categoriesUncheckedUpdateInput>
  }

  /**
   * product_categories delete
   */
  export type product_categoriesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    /**
     * Filter which product_categories to delete.
     */
    where: product_categoriesWhereUniqueInput
  }

  /**
   * product_categories deleteMany
   */
  export type product_categoriesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which product_categories to delete
     */
    where?: product_categoriesWhereInput
    /**
     * Limit how many product_categories to delete.
     */
    limit?: number
  }

  /**
   * product_categories.product_categories
   */
  export type product_categories$product_categoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    where?: product_categoriesWhereInput
  }

  /**
   * product_categories.other_product_categories
   */
  export type product_categories$other_product_categoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    where?: product_categoriesWhereInput
    orderBy?: product_categoriesOrderByWithRelationInput | product_categoriesOrderByWithRelationInput[]
    cursor?: product_categoriesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Product_categoriesScalarFieldEnum | Product_categoriesScalarFieldEnum[]
  }

  /**
   * product_categories.products
   */
  export type product_categories$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    where?: productsWhereInput
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    cursor?: productsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * product_categories without action
   */
  export type product_categoriesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
  }


  /**
   * Model products
   */

  export type AggregateProducts = {
    _count: ProductsCountAggregateOutputType | null
    _avg: ProductsAvgAggregateOutputType | null
    _sum: ProductsSumAggregateOutputType | null
    _min: ProductsMinAggregateOutputType | null
    _max: ProductsMaxAggregateOutputType | null
  }

  export type ProductsAvgAggregateOutputType = {
    selling_price: Decimal | null
    purchase_price: Decimal | null
    mrp: Decimal | null
    tax_rate: Decimal | null
    reorder_level: Decimal | null
    maximum_stock: Decimal | null
  }

  export type ProductsSumAggregateOutputType = {
    selling_price: Decimal | null
    purchase_price: Decimal | null
    mrp: Decimal | null
    tax_rate: Decimal | null
    reorder_level: Decimal | null
    maximum_stock: Decimal | null
  }

  export type ProductsMinAggregateOutputType = {
    id: string | null
    organization_id: string | null
    category_id: string | null
    name: string | null
    description: string | null
    status: string | null
    product_type: string | null
    sku: string | null
    part_number: string | null
    hsn_code: string | null
    selling_price: Decimal | null
    purchase_price: Decimal | null
    mrp: Decimal | null
    is_taxable: boolean | null
    tax_rate: Decimal | null
    tax_name: string | null
    reorder_level: Decimal | null
    maximum_stock: Decimal | null
    zoho_item_id: string | null
    tally_item_name: string | null
    custom_item_id: string | null
    last_synced_zoho: Date | null
    last_synced_tally: Date | null
    last_synced_custom: Date | null
    created_at: Date | null
    updated_at: Date | null
    created_by: string | null
    source_type: $Enums.product_source_type | null
  }

  export type ProductsMaxAggregateOutputType = {
    id: string | null
    organization_id: string | null
    category_id: string | null
    name: string | null
    description: string | null
    status: string | null
    product_type: string | null
    sku: string | null
    part_number: string | null
    hsn_code: string | null
    selling_price: Decimal | null
    purchase_price: Decimal | null
    mrp: Decimal | null
    is_taxable: boolean | null
    tax_rate: Decimal | null
    tax_name: string | null
    reorder_level: Decimal | null
    maximum_stock: Decimal | null
    zoho_item_id: string | null
    tally_item_name: string | null
    custom_item_id: string | null
    last_synced_zoho: Date | null
    last_synced_tally: Date | null
    last_synced_custom: Date | null
    created_at: Date | null
    updated_at: Date | null
    created_by: string | null
    source_type: $Enums.product_source_type | null
  }

  export type ProductsCountAggregateOutputType = {
    id: number
    organization_id: number
    category_id: number
    name: number
    description: number
    status: number
    product_type: number
    sku: number
    part_number: number
    hsn_code: number
    selling_price: number
    purchase_price: number
    mrp: number
    is_taxable: number
    tax_rate: number
    tax_name: number
    reorder_level: number
    maximum_stock: number
    attributes: number
    images: number
    zoho_item_id: number
    tally_item_name: number
    custom_item_id: number
    last_synced_zoho: number
    last_synced_tally: number
    last_synced_custom: number
    sync_errors: number
    created_at: number
    updated_at: number
    created_by: number
    source_type: number
    _all: number
  }


  export type ProductsAvgAggregateInputType = {
    selling_price?: true
    purchase_price?: true
    mrp?: true
    tax_rate?: true
    reorder_level?: true
    maximum_stock?: true
  }

  export type ProductsSumAggregateInputType = {
    selling_price?: true
    purchase_price?: true
    mrp?: true
    tax_rate?: true
    reorder_level?: true
    maximum_stock?: true
  }

  export type ProductsMinAggregateInputType = {
    id?: true
    organization_id?: true
    category_id?: true
    name?: true
    description?: true
    status?: true
    product_type?: true
    sku?: true
    part_number?: true
    hsn_code?: true
    selling_price?: true
    purchase_price?: true
    mrp?: true
    is_taxable?: true
    tax_rate?: true
    tax_name?: true
    reorder_level?: true
    maximum_stock?: true
    zoho_item_id?: true
    tally_item_name?: true
    custom_item_id?: true
    last_synced_zoho?: true
    last_synced_tally?: true
    last_synced_custom?: true
    created_at?: true
    updated_at?: true
    created_by?: true
    source_type?: true
  }

  export type ProductsMaxAggregateInputType = {
    id?: true
    organization_id?: true
    category_id?: true
    name?: true
    description?: true
    status?: true
    product_type?: true
    sku?: true
    part_number?: true
    hsn_code?: true
    selling_price?: true
    purchase_price?: true
    mrp?: true
    is_taxable?: true
    tax_rate?: true
    tax_name?: true
    reorder_level?: true
    maximum_stock?: true
    zoho_item_id?: true
    tally_item_name?: true
    custom_item_id?: true
    last_synced_zoho?: true
    last_synced_tally?: true
    last_synced_custom?: true
    created_at?: true
    updated_at?: true
    created_by?: true
    source_type?: true
  }

  export type ProductsCountAggregateInputType = {
    id?: true
    organization_id?: true
    category_id?: true
    name?: true
    description?: true
    status?: true
    product_type?: true
    sku?: true
    part_number?: true
    hsn_code?: true
    selling_price?: true
    purchase_price?: true
    mrp?: true
    is_taxable?: true
    tax_rate?: true
    tax_name?: true
    reorder_level?: true
    maximum_stock?: true
    attributes?: true
    images?: true
    zoho_item_id?: true
    tally_item_name?: true
    custom_item_id?: true
    last_synced_zoho?: true
    last_synced_tally?: true
    last_synced_custom?: true
    sync_errors?: true
    created_at?: true
    updated_at?: true
    created_by?: true
    source_type?: true
    _all?: true
  }

  export type ProductsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which products to aggregate.
     */
    where?: productsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: productsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned products
    **/
    _count?: true | ProductsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductsMaxAggregateInputType
  }

  export type GetProductsAggregateType<T extends ProductsAggregateArgs> = {
        [P in keyof T & keyof AggregateProducts]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProducts[P]>
      : GetScalarType<T[P], AggregateProducts[P]>
  }




  export type productsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productsWhereInput
    orderBy?: productsOrderByWithAggregationInput | productsOrderByWithAggregationInput[]
    by: ProductsScalarFieldEnum[] | ProductsScalarFieldEnum
    having?: productsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductsCountAggregateInputType | true
    _avg?: ProductsAvgAggregateInputType
    _sum?: ProductsSumAggregateInputType
    _min?: ProductsMinAggregateInputType
    _max?: ProductsMaxAggregateInputType
  }

  export type ProductsGroupByOutputType = {
    id: string
    organization_id: string
    category_id: string | null
    name: string
    description: string | null
    status: string | null
    product_type: string | null
    sku: string | null
    part_number: string | null
    hsn_code: string | null
    selling_price: Decimal | null
    purchase_price: Decimal | null
    mrp: Decimal | null
    is_taxable: boolean | null
    tax_rate: Decimal | null
    tax_name: string | null
    reorder_level: Decimal | null
    maximum_stock: Decimal | null
    attributes: JsonValue | null
    images: JsonValue | null
    zoho_item_id: string | null
    tally_item_name: string | null
    custom_item_id: string | null
    last_synced_zoho: Date | null
    last_synced_tally: Date | null
    last_synced_custom: Date | null
    sync_errors: JsonValue | null
    created_at: Date | null
    updated_at: Date | null
    created_by: string | null
    source_type: $Enums.product_source_type | null
    _count: ProductsCountAggregateOutputType | null
    _avg: ProductsAvgAggregateOutputType | null
    _sum: ProductsSumAggregateOutputType | null
    _min: ProductsMinAggregateOutputType | null
    _max: ProductsMaxAggregateOutputType | null
  }

  type GetProductsGroupByPayload<T extends productsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductsGroupByOutputType[P]>
            : GetScalarType<T[P], ProductsGroupByOutputType[P]>
        }
      >
    >


  export type productsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    category_id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    product_type?: boolean
    sku?: boolean
    part_number?: boolean
    hsn_code?: boolean
    selling_price?: boolean
    purchase_price?: boolean
    mrp?: boolean
    is_taxable?: boolean
    tax_rate?: boolean
    tax_name?: boolean
    reorder_level?: boolean
    maximum_stock?: boolean
    attributes?: boolean
    images?: boolean
    zoho_item_id?: boolean
    tally_item_name?: boolean
    custom_item_id?: boolean
    last_synced_zoho?: boolean
    last_synced_tally?: boolean
    last_synced_custom?: boolean
    sync_errors?: boolean
    created_at?: boolean
    updated_at?: boolean
    created_by?: boolean
    source_type?: boolean
    product_categories?: boolean | products$product_categoriesArgs<ExtArgs>
  }, ExtArgs["result"]["products"]>

  export type productsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    category_id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    product_type?: boolean
    sku?: boolean
    part_number?: boolean
    hsn_code?: boolean
    selling_price?: boolean
    purchase_price?: boolean
    mrp?: boolean
    is_taxable?: boolean
    tax_rate?: boolean
    tax_name?: boolean
    reorder_level?: boolean
    maximum_stock?: boolean
    attributes?: boolean
    images?: boolean
    zoho_item_id?: boolean
    tally_item_name?: boolean
    custom_item_id?: boolean
    last_synced_zoho?: boolean
    last_synced_tally?: boolean
    last_synced_custom?: boolean
    sync_errors?: boolean
    created_at?: boolean
    updated_at?: boolean
    created_by?: boolean
    source_type?: boolean
    product_categories?: boolean | products$product_categoriesArgs<ExtArgs>
  }, ExtArgs["result"]["products"]>

  export type productsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    category_id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    product_type?: boolean
    sku?: boolean
    part_number?: boolean
    hsn_code?: boolean
    selling_price?: boolean
    purchase_price?: boolean
    mrp?: boolean
    is_taxable?: boolean
    tax_rate?: boolean
    tax_name?: boolean
    reorder_level?: boolean
    maximum_stock?: boolean
    attributes?: boolean
    images?: boolean
    zoho_item_id?: boolean
    tally_item_name?: boolean
    custom_item_id?: boolean
    last_synced_zoho?: boolean
    last_synced_tally?: boolean
    last_synced_custom?: boolean
    sync_errors?: boolean
    created_at?: boolean
    updated_at?: boolean
    created_by?: boolean
    source_type?: boolean
    product_categories?: boolean | products$product_categoriesArgs<ExtArgs>
  }, ExtArgs["result"]["products"]>

  export type productsSelectScalar = {
    id?: boolean
    organization_id?: boolean
    category_id?: boolean
    name?: boolean
    description?: boolean
    status?: boolean
    product_type?: boolean
    sku?: boolean
    part_number?: boolean
    hsn_code?: boolean
    selling_price?: boolean
    purchase_price?: boolean
    mrp?: boolean
    is_taxable?: boolean
    tax_rate?: boolean
    tax_name?: boolean
    reorder_level?: boolean
    maximum_stock?: boolean
    attributes?: boolean
    images?: boolean
    zoho_item_id?: boolean
    tally_item_name?: boolean
    custom_item_id?: boolean
    last_synced_zoho?: boolean
    last_synced_tally?: boolean
    last_synced_custom?: boolean
    sync_errors?: boolean
    created_at?: boolean
    updated_at?: boolean
    created_by?: boolean
    source_type?: boolean
  }

  export type productsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organization_id" | "category_id" | "name" | "description" | "status" | "product_type" | "sku" | "part_number" | "hsn_code" | "selling_price" | "purchase_price" | "mrp" | "is_taxable" | "tax_rate" | "tax_name" | "reorder_level" | "maximum_stock" | "attributes" | "images" | "zoho_item_id" | "tally_item_name" | "custom_item_id" | "last_synced_zoho" | "last_synced_tally" | "last_synced_custom" | "sync_errors" | "created_at" | "updated_at" | "created_by" | "source_type", ExtArgs["result"]["products"]>
  export type productsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product_categories?: boolean | products$product_categoriesArgs<ExtArgs>
  }
  export type productsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product_categories?: boolean | products$product_categoriesArgs<ExtArgs>
  }
  export type productsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product_categories?: boolean | products$product_categoriesArgs<ExtArgs>
  }

  export type $productsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "products"
    objects: {
      product_categories: Prisma.$product_categoriesPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organization_id: string
      category_id: string | null
      name: string
      description: string | null
      status: string | null
      product_type: string | null
      sku: string | null
      part_number: string | null
      hsn_code: string | null
      selling_price: Prisma.Decimal | null
      purchase_price: Prisma.Decimal | null
      mrp: Prisma.Decimal | null
      is_taxable: boolean | null
      tax_rate: Prisma.Decimal | null
      tax_name: string | null
      reorder_level: Prisma.Decimal | null
      maximum_stock: Prisma.Decimal | null
      attributes: Prisma.JsonValue | null
      images: Prisma.JsonValue | null
      zoho_item_id: string | null
      tally_item_name: string | null
      custom_item_id: string | null
      last_synced_zoho: Date | null
      last_synced_tally: Date | null
      last_synced_custom: Date | null
      sync_errors: Prisma.JsonValue | null
      created_at: Date | null
      updated_at: Date | null
      created_by: string | null
      source_type: $Enums.product_source_type | null
    }, ExtArgs["result"]["products"]>
    composites: {}
  }

  type productsGetPayload<S extends boolean | null | undefined | productsDefaultArgs> = $Result.GetResult<Prisma.$productsPayload, S>

  type productsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<productsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductsCountAggregateInputType | true
    }

  export interface productsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['products'], meta: { name: 'products' } }
    /**
     * Find zero or one Products that matches the filter.
     * @param {productsFindUniqueArgs} args - Arguments to find a Products
     * @example
     * // Get one Products
     * const products = await prisma.products.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends productsFindUniqueArgs>(args: SelectSubset<T, productsFindUniqueArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Products that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {productsFindUniqueOrThrowArgs} args - Arguments to find a Products
     * @example
     * // Get one Products
     * const products = await prisma.products.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends productsFindUniqueOrThrowArgs>(args: SelectSubset<T, productsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsFindFirstArgs} args - Arguments to find a Products
     * @example
     * // Get one Products
     * const products = await prisma.products.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends productsFindFirstArgs>(args?: SelectSubset<T, productsFindFirstArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Products that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsFindFirstOrThrowArgs} args - Arguments to find a Products
     * @example
     * // Get one Products
     * const products = await prisma.products.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends productsFindFirstOrThrowArgs>(args?: SelectSubset<T, productsFindFirstOrThrowArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.products.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.products.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productsWithIdOnly = await prisma.products.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends productsFindManyArgs>(args?: SelectSubset<T, productsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Products.
     * @param {productsCreateArgs} args - Arguments to create a Products.
     * @example
     * // Create one Products
     * const Products = await prisma.products.create({
     *   data: {
     *     // ... data to create a Products
     *   }
     * })
     * 
     */
    create<T extends productsCreateArgs>(args: SelectSubset<T, productsCreateArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {productsCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const products = await prisma.products.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends productsCreateManyArgs>(args?: SelectSubset<T, productsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {productsCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const products = await prisma.products.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productsWithIdOnly = await prisma.products.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends productsCreateManyAndReturnArgs>(args?: SelectSubset<T, productsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Products.
     * @param {productsDeleteArgs} args - Arguments to delete one Products.
     * @example
     * // Delete one Products
     * const Products = await prisma.products.delete({
     *   where: {
     *     // ... filter to delete one Products
     *   }
     * })
     * 
     */
    delete<T extends productsDeleteArgs>(args: SelectSubset<T, productsDeleteArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Products.
     * @param {productsUpdateArgs} args - Arguments to update one Products.
     * @example
     * // Update one Products
     * const products = await prisma.products.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends productsUpdateArgs>(args: SelectSubset<T, productsUpdateArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {productsDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.products.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends productsDeleteManyArgs>(args?: SelectSubset<T, productsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const products = await prisma.products.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends productsUpdateManyArgs>(args: SelectSubset<T, productsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {productsUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const products = await prisma.products.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productsWithIdOnly = await prisma.products.updateManyAndReturn({
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
    updateManyAndReturn<T extends productsUpdateManyAndReturnArgs>(args: SelectSubset<T, productsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Products.
     * @param {productsUpsertArgs} args - Arguments to update or create a Products.
     * @example
     * // Update or create a Products
     * const products = await prisma.products.upsert({
     *   create: {
     *     // ... data to create a Products
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Products we want to update
     *   }
     * })
     */
    upsert<T extends productsUpsertArgs>(args: SelectSubset<T, productsUpsertArgs<ExtArgs>>): Prisma__productsClient<$Result.GetResult<Prisma.$productsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.products.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends productsCountArgs>(
      args?: Subset<T, productsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductsAggregateArgs>(args: Subset<T, ProductsAggregateArgs>): Prisma.PrismaPromise<GetProductsAggregateType<T>>

    /**
     * Group by Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productsGroupByArgs} args - Group by arguments.
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
      T extends productsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: productsGroupByArgs['orderBy'] }
        : { orderBy?: productsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, productsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the products model
   */
  readonly fields: productsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for products.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__productsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product_categories<T extends products$product_categoriesArgs<ExtArgs> = {}>(args?: Subset<T, products$product_categoriesArgs<ExtArgs>>): Prisma__product_categoriesClient<$Result.GetResult<Prisma.$product_categoriesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the products model
   */
  interface productsFieldRefs {
    readonly id: FieldRef<"products", 'String'>
    readonly organization_id: FieldRef<"products", 'String'>
    readonly category_id: FieldRef<"products", 'String'>
    readonly name: FieldRef<"products", 'String'>
    readonly description: FieldRef<"products", 'String'>
    readonly status: FieldRef<"products", 'String'>
    readonly product_type: FieldRef<"products", 'String'>
    readonly sku: FieldRef<"products", 'String'>
    readonly part_number: FieldRef<"products", 'String'>
    readonly hsn_code: FieldRef<"products", 'String'>
    readonly selling_price: FieldRef<"products", 'Decimal'>
    readonly purchase_price: FieldRef<"products", 'Decimal'>
    readonly mrp: FieldRef<"products", 'Decimal'>
    readonly is_taxable: FieldRef<"products", 'Boolean'>
    readonly tax_rate: FieldRef<"products", 'Decimal'>
    readonly tax_name: FieldRef<"products", 'String'>
    readonly reorder_level: FieldRef<"products", 'Decimal'>
    readonly maximum_stock: FieldRef<"products", 'Decimal'>
    readonly attributes: FieldRef<"products", 'Json'>
    readonly images: FieldRef<"products", 'Json'>
    readonly zoho_item_id: FieldRef<"products", 'String'>
    readonly tally_item_name: FieldRef<"products", 'String'>
    readonly custom_item_id: FieldRef<"products", 'String'>
    readonly last_synced_zoho: FieldRef<"products", 'DateTime'>
    readonly last_synced_tally: FieldRef<"products", 'DateTime'>
    readonly last_synced_custom: FieldRef<"products", 'DateTime'>
    readonly sync_errors: FieldRef<"products", 'Json'>
    readonly created_at: FieldRef<"products", 'DateTime'>
    readonly updated_at: FieldRef<"products", 'DateTime'>
    readonly created_by: FieldRef<"products", 'String'>
    readonly source_type: FieldRef<"products", 'product_source_type'>
  }
    

  // Custom InputTypes
  /**
   * products findUnique
   */
  export type productsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where: productsWhereUniqueInput
  }

  /**
   * products findUniqueOrThrow
   */
  export type productsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where: productsWhereUniqueInput
  }

  /**
   * products findFirst
   */
  export type productsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where?: productsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for products.
     */
    cursor?: productsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of products.
     */
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * products findFirstOrThrow
   */
  export type productsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where?: productsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for products.
     */
    cursor?: productsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of products.
     */
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * products findMany
   */
  export type productsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where?: productsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productsOrderByWithRelationInput | productsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing products.
     */
    cursor?: productsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    distinct?: ProductsScalarFieldEnum | ProductsScalarFieldEnum[]
  }

  /**
   * products create
   */
  export type productsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * The data needed to create a products.
     */
    data: XOR<productsCreateInput, productsUncheckedCreateInput>
  }

  /**
   * products createMany
   */
  export type productsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many products.
     */
    data: productsCreateManyInput | productsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * products createManyAndReturn
   */
  export type productsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * The data used to create many products.
     */
    data: productsCreateManyInput | productsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * products update
   */
  export type productsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * The data needed to update a products.
     */
    data: XOR<productsUpdateInput, productsUncheckedUpdateInput>
    /**
     * Choose, which products to update.
     */
    where: productsWhereUniqueInput
  }

  /**
   * products updateMany
   */
  export type productsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update products.
     */
    data: XOR<productsUpdateManyMutationInput, productsUncheckedUpdateManyInput>
    /**
     * Filter which products to update
     */
    where?: productsWhereInput
    /**
     * Limit how many products to update.
     */
    limit?: number
  }

  /**
   * products updateManyAndReturn
   */
  export type productsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * The data used to update products.
     */
    data: XOR<productsUpdateManyMutationInput, productsUncheckedUpdateManyInput>
    /**
     * Filter which products to update
     */
    where?: productsWhereInput
    /**
     * Limit how many products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * products upsert
   */
  export type productsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * The filter to search for the products to update in case it exists.
     */
    where: productsWhereUniqueInput
    /**
     * In case the products found by the `where` argument doesn't exist, create a new products with this data.
     */
    create: XOR<productsCreateInput, productsUncheckedCreateInput>
    /**
     * In case the products was found with the provided `where` argument, update it with this data.
     */
    update: XOR<productsUpdateInput, productsUncheckedUpdateInput>
  }

  /**
   * products delete
   */
  export type productsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
    /**
     * Filter which products to delete.
     */
    where: productsWhereUniqueInput
  }

  /**
   * products deleteMany
   */
  export type productsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which products to delete
     */
    where?: productsWhereInput
    /**
     * Limit how many products to delete.
     */
    limit?: number
  }

  /**
   * products.product_categories
   */
  export type products$product_categoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_categories
     */
    select?: product_categoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_categories
     */
    omit?: product_categoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: product_categoriesInclude<ExtArgs> | null
    where?: product_categoriesWhereInput
  }

  /**
   * products without action
   */
  export type productsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the products
     */
    select?: productsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the products
     */
    omit?: productsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: productsInclude<ExtArgs> | null
  }


  /**
   * Model inventory_movements
   */

  export type AggregateInventory_movements = {
    _count: Inventory_movementsCountAggregateOutputType | null
    _avg: Inventory_movementsAvgAggregateOutputType | null
    _sum: Inventory_movementsSumAggregateOutputType | null
    _min: Inventory_movementsMinAggregateOutputType | null
    _max: Inventory_movementsMaxAggregateOutputType | null
  }

  export type Inventory_movementsAvgAggregateOutputType = {
    quantity_before: Decimal | null
    quantity_change: Decimal | null
    quantity_after: Decimal | null
    unit_cost: Decimal | null
    total_cost: Decimal | null
  }

  export type Inventory_movementsSumAggregateOutputType = {
    quantity_before: Decimal | null
    quantity_change: Decimal | null
    quantity_after: Decimal | null
    unit_cost: Decimal | null
    total_cost: Decimal | null
  }

  export type Inventory_movementsMinAggregateOutputType = {
    id: string | null
    organization_id: string | null
    product_id: string | null
    location_code: string | null
    movement_type: string | null
    transaction_type: string | null
    quantity_before: Decimal | null
    quantity_change: Decimal | null
    quantity_after: Decimal | null
    unit_cost: Decimal | null
    total_cost: Decimal | null
    reference_type: string | null
    reference_id: string | null
    reference_number: string | null
    source_system: string | null
    external_transaction_id: string | null
    movement_date: Date | null
    posting_date: Date | null
    created_by: string | null
    notes: string | null
    created_at: Date | null
  }

  export type Inventory_movementsMaxAggregateOutputType = {
    id: string | null
    organization_id: string | null
    product_id: string | null
    location_code: string | null
    movement_type: string | null
    transaction_type: string | null
    quantity_before: Decimal | null
    quantity_change: Decimal | null
    quantity_after: Decimal | null
    unit_cost: Decimal | null
    total_cost: Decimal | null
    reference_type: string | null
    reference_id: string | null
    reference_number: string | null
    source_system: string | null
    external_transaction_id: string | null
    movement_date: Date | null
    posting_date: Date | null
    created_by: string | null
    notes: string | null
    created_at: Date | null
  }

  export type Inventory_movementsCountAggregateOutputType = {
    id: number
    organization_id: number
    product_id: number
    location_code: number
    movement_type: number
    transaction_type: number
    quantity_before: number
    quantity_change: number
    quantity_after: number
    unit_cost: number
    total_cost: number
    reference_type: number
    reference_id: number
    reference_number: number
    source_system: number
    external_transaction_id: number
    external_data: number
    movement_date: number
    posting_date: number
    created_by: number
    notes: number
    created_at: number
    _all: number
  }


  export type Inventory_movementsAvgAggregateInputType = {
    quantity_before?: true
    quantity_change?: true
    quantity_after?: true
    unit_cost?: true
    total_cost?: true
  }

  export type Inventory_movementsSumAggregateInputType = {
    quantity_before?: true
    quantity_change?: true
    quantity_after?: true
    unit_cost?: true
    total_cost?: true
  }

  export type Inventory_movementsMinAggregateInputType = {
    id?: true
    organization_id?: true
    product_id?: true
    location_code?: true
    movement_type?: true
    transaction_type?: true
    quantity_before?: true
    quantity_change?: true
    quantity_after?: true
    unit_cost?: true
    total_cost?: true
    reference_type?: true
    reference_id?: true
    reference_number?: true
    source_system?: true
    external_transaction_id?: true
    movement_date?: true
    posting_date?: true
    created_by?: true
    notes?: true
    created_at?: true
  }

  export type Inventory_movementsMaxAggregateInputType = {
    id?: true
    organization_id?: true
    product_id?: true
    location_code?: true
    movement_type?: true
    transaction_type?: true
    quantity_before?: true
    quantity_change?: true
    quantity_after?: true
    unit_cost?: true
    total_cost?: true
    reference_type?: true
    reference_id?: true
    reference_number?: true
    source_system?: true
    external_transaction_id?: true
    movement_date?: true
    posting_date?: true
    created_by?: true
    notes?: true
    created_at?: true
  }

  export type Inventory_movementsCountAggregateInputType = {
    id?: true
    organization_id?: true
    product_id?: true
    location_code?: true
    movement_type?: true
    transaction_type?: true
    quantity_before?: true
    quantity_change?: true
    quantity_after?: true
    unit_cost?: true
    total_cost?: true
    reference_type?: true
    reference_id?: true
    reference_number?: true
    source_system?: true
    external_transaction_id?: true
    external_data?: true
    movement_date?: true
    posting_date?: true
    created_by?: true
    notes?: true
    created_at?: true
    _all?: true
  }

  export type Inventory_movementsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which inventory_movements to aggregate.
     */
    where?: inventory_movementsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inventory_movements to fetch.
     */
    orderBy?: inventory_movementsOrderByWithRelationInput | inventory_movementsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: inventory_movementsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inventory_movements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inventory_movements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned inventory_movements
    **/
    _count?: true | Inventory_movementsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Inventory_movementsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Inventory_movementsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Inventory_movementsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Inventory_movementsMaxAggregateInputType
  }

  export type GetInventory_movementsAggregateType<T extends Inventory_movementsAggregateArgs> = {
        [P in keyof T & keyof AggregateInventory_movements]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventory_movements[P]>
      : GetScalarType<T[P], AggregateInventory_movements[P]>
  }




  export type inventory_movementsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: inventory_movementsWhereInput
    orderBy?: inventory_movementsOrderByWithAggregationInput | inventory_movementsOrderByWithAggregationInput[]
    by: Inventory_movementsScalarFieldEnum[] | Inventory_movementsScalarFieldEnum
    having?: inventory_movementsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Inventory_movementsCountAggregateInputType | true
    _avg?: Inventory_movementsAvgAggregateInputType
    _sum?: Inventory_movementsSumAggregateInputType
    _min?: Inventory_movementsMinAggregateInputType
    _max?: Inventory_movementsMaxAggregateInputType
  }

  export type Inventory_movementsGroupByOutputType = {
    id: string
    organization_id: string
    product_id: string
    location_code: string | null
    movement_type: string
    transaction_type: string
    quantity_before: Decimal
    quantity_change: Decimal
    quantity_after: Decimal
    unit_cost: Decimal | null
    total_cost: Decimal | null
    reference_type: string | null
    reference_id: string | null
    reference_number: string | null
    source_system: string | null
    external_transaction_id: string | null
    external_data: JsonValue | null
    movement_date: Date | null
    posting_date: Date | null
    created_by: string | null
    notes: string | null
    created_at: Date | null
    _count: Inventory_movementsCountAggregateOutputType | null
    _avg: Inventory_movementsAvgAggregateOutputType | null
    _sum: Inventory_movementsSumAggregateOutputType | null
    _min: Inventory_movementsMinAggregateOutputType | null
    _max: Inventory_movementsMaxAggregateOutputType | null
  }

  type GetInventory_movementsGroupByPayload<T extends inventory_movementsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Inventory_movementsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Inventory_movementsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Inventory_movementsGroupByOutputType[P]>
            : GetScalarType<T[P], Inventory_movementsGroupByOutputType[P]>
        }
      >
    >


  export type inventory_movementsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    product_id?: boolean
    location_code?: boolean
    movement_type?: boolean
    transaction_type?: boolean
    quantity_before?: boolean
    quantity_change?: boolean
    quantity_after?: boolean
    unit_cost?: boolean
    total_cost?: boolean
    reference_type?: boolean
    reference_id?: boolean
    reference_number?: boolean
    source_system?: boolean
    external_transaction_id?: boolean
    external_data?: boolean
    movement_date?: boolean
    posting_date?: boolean
    created_by?: boolean
    notes?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["inventory_movements"]>

  export type inventory_movementsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    product_id?: boolean
    location_code?: boolean
    movement_type?: boolean
    transaction_type?: boolean
    quantity_before?: boolean
    quantity_change?: boolean
    quantity_after?: boolean
    unit_cost?: boolean
    total_cost?: boolean
    reference_type?: boolean
    reference_id?: boolean
    reference_number?: boolean
    source_system?: boolean
    external_transaction_id?: boolean
    external_data?: boolean
    movement_date?: boolean
    posting_date?: boolean
    created_by?: boolean
    notes?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["inventory_movements"]>

  export type inventory_movementsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organization_id?: boolean
    product_id?: boolean
    location_code?: boolean
    movement_type?: boolean
    transaction_type?: boolean
    quantity_before?: boolean
    quantity_change?: boolean
    quantity_after?: boolean
    unit_cost?: boolean
    total_cost?: boolean
    reference_type?: boolean
    reference_id?: boolean
    reference_number?: boolean
    source_system?: boolean
    external_transaction_id?: boolean
    external_data?: boolean
    movement_date?: boolean
    posting_date?: boolean
    created_by?: boolean
    notes?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["inventory_movements"]>

  export type inventory_movementsSelectScalar = {
    id?: boolean
    organization_id?: boolean
    product_id?: boolean
    location_code?: boolean
    movement_type?: boolean
    transaction_type?: boolean
    quantity_before?: boolean
    quantity_change?: boolean
    quantity_after?: boolean
    unit_cost?: boolean
    total_cost?: boolean
    reference_type?: boolean
    reference_id?: boolean
    reference_number?: boolean
    source_system?: boolean
    external_transaction_id?: boolean
    external_data?: boolean
    movement_date?: boolean
    posting_date?: boolean
    created_by?: boolean
    notes?: boolean
    created_at?: boolean
  }

  export type inventory_movementsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organization_id" | "product_id" | "location_code" | "movement_type" | "transaction_type" | "quantity_before" | "quantity_change" | "quantity_after" | "unit_cost" | "total_cost" | "reference_type" | "reference_id" | "reference_number" | "source_system" | "external_transaction_id" | "external_data" | "movement_date" | "posting_date" | "created_by" | "notes" | "created_at", ExtArgs["result"]["inventory_movements"]>

  export type $inventory_movementsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "inventory_movements"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organization_id: string
      product_id: string
      location_code: string | null
      movement_type: string
      transaction_type: string
      quantity_before: Prisma.Decimal
      quantity_change: Prisma.Decimal
      quantity_after: Prisma.Decimal
      unit_cost: Prisma.Decimal | null
      total_cost: Prisma.Decimal | null
      reference_type: string | null
      reference_id: string | null
      reference_number: string | null
      source_system: string | null
      external_transaction_id: string | null
      external_data: Prisma.JsonValue | null
      movement_date: Date | null
      posting_date: Date | null
      created_by: string | null
      notes: string | null
      created_at: Date | null
    }, ExtArgs["result"]["inventory_movements"]>
    composites: {}
  }

  type inventory_movementsGetPayload<S extends boolean | null | undefined | inventory_movementsDefaultArgs> = $Result.GetResult<Prisma.$inventory_movementsPayload, S>

  type inventory_movementsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<inventory_movementsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Inventory_movementsCountAggregateInputType | true
    }

  export interface inventory_movementsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['inventory_movements'], meta: { name: 'inventory_movements' } }
    /**
     * Find zero or one Inventory_movements that matches the filter.
     * @param {inventory_movementsFindUniqueArgs} args - Arguments to find a Inventory_movements
     * @example
     * // Get one Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends inventory_movementsFindUniqueArgs>(args: SelectSubset<T, inventory_movementsFindUniqueArgs<ExtArgs>>): Prisma__inventory_movementsClient<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Inventory_movements that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {inventory_movementsFindUniqueOrThrowArgs} args - Arguments to find a Inventory_movements
     * @example
     * // Get one Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends inventory_movementsFindUniqueOrThrowArgs>(args: SelectSubset<T, inventory_movementsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__inventory_movementsClient<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inventory_movements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_movementsFindFirstArgs} args - Arguments to find a Inventory_movements
     * @example
     * // Get one Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends inventory_movementsFindFirstArgs>(args?: SelectSubset<T, inventory_movementsFindFirstArgs<ExtArgs>>): Prisma__inventory_movementsClient<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inventory_movements that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_movementsFindFirstOrThrowArgs} args - Arguments to find a Inventory_movements
     * @example
     * // Get one Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends inventory_movementsFindFirstOrThrowArgs>(args?: SelectSubset<T, inventory_movementsFindFirstOrThrowArgs<ExtArgs>>): Prisma__inventory_movementsClient<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Inventory_movements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_movementsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.findMany()
     * 
     * // Get first 10 Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventory_movementsWithIdOnly = await prisma.inventory_movements.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends inventory_movementsFindManyArgs>(args?: SelectSubset<T, inventory_movementsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Inventory_movements.
     * @param {inventory_movementsCreateArgs} args - Arguments to create a Inventory_movements.
     * @example
     * // Create one Inventory_movements
     * const Inventory_movements = await prisma.inventory_movements.create({
     *   data: {
     *     // ... data to create a Inventory_movements
     *   }
     * })
     * 
     */
    create<T extends inventory_movementsCreateArgs>(args: SelectSubset<T, inventory_movementsCreateArgs<ExtArgs>>): Prisma__inventory_movementsClient<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Inventory_movements.
     * @param {inventory_movementsCreateManyArgs} args - Arguments to create many Inventory_movements.
     * @example
     * // Create many Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends inventory_movementsCreateManyArgs>(args?: SelectSubset<T, inventory_movementsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inventory_movements and returns the data saved in the database.
     * @param {inventory_movementsCreateManyAndReturnArgs} args - Arguments to create many Inventory_movements.
     * @example
     * // Create many Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inventory_movements and only return the `id`
     * const inventory_movementsWithIdOnly = await prisma.inventory_movements.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends inventory_movementsCreateManyAndReturnArgs>(args?: SelectSubset<T, inventory_movementsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Inventory_movements.
     * @param {inventory_movementsDeleteArgs} args - Arguments to delete one Inventory_movements.
     * @example
     * // Delete one Inventory_movements
     * const Inventory_movements = await prisma.inventory_movements.delete({
     *   where: {
     *     // ... filter to delete one Inventory_movements
     *   }
     * })
     * 
     */
    delete<T extends inventory_movementsDeleteArgs>(args: SelectSubset<T, inventory_movementsDeleteArgs<ExtArgs>>): Prisma__inventory_movementsClient<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Inventory_movements.
     * @param {inventory_movementsUpdateArgs} args - Arguments to update one Inventory_movements.
     * @example
     * // Update one Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends inventory_movementsUpdateArgs>(args: SelectSubset<T, inventory_movementsUpdateArgs<ExtArgs>>): Prisma__inventory_movementsClient<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Inventory_movements.
     * @param {inventory_movementsDeleteManyArgs} args - Arguments to filter Inventory_movements to delete.
     * @example
     * // Delete a few Inventory_movements
     * const { count } = await prisma.inventory_movements.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends inventory_movementsDeleteManyArgs>(args?: SelectSubset<T, inventory_movementsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inventory_movements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_movementsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends inventory_movementsUpdateManyArgs>(args: SelectSubset<T, inventory_movementsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inventory_movements and returns the data updated in the database.
     * @param {inventory_movementsUpdateManyAndReturnArgs} args - Arguments to update many Inventory_movements.
     * @example
     * // Update many Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Inventory_movements and only return the `id`
     * const inventory_movementsWithIdOnly = await prisma.inventory_movements.updateManyAndReturn({
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
    updateManyAndReturn<T extends inventory_movementsUpdateManyAndReturnArgs>(args: SelectSubset<T, inventory_movementsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Inventory_movements.
     * @param {inventory_movementsUpsertArgs} args - Arguments to update or create a Inventory_movements.
     * @example
     * // Update or create a Inventory_movements
     * const inventory_movements = await prisma.inventory_movements.upsert({
     *   create: {
     *     // ... data to create a Inventory_movements
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inventory_movements we want to update
     *   }
     * })
     */
    upsert<T extends inventory_movementsUpsertArgs>(args: SelectSubset<T, inventory_movementsUpsertArgs<ExtArgs>>): Prisma__inventory_movementsClient<$Result.GetResult<Prisma.$inventory_movementsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Inventory_movements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_movementsCountArgs} args - Arguments to filter Inventory_movements to count.
     * @example
     * // Count the number of Inventory_movements
     * const count = await prisma.inventory_movements.count({
     *   where: {
     *     // ... the filter for the Inventory_movements we want to count
     *   }
     * })
    **/
    count<T extends inventory_movementsCountArgs>(
      args?: Subset<T, inventory_movementsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Inventory_movementsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inventory_movements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Inventory_movementsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Inventory_movementsAggregateArgs>(args: Subset<T, Inventory_movementsAggregateArgs>): Prisma.PrismaPromise<GetInventory_movementsAggregateType<T>>

    /**
     * Group by Inventory_movements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inventory_movementsGroupByArgs} args - Group by arguments.
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
      T extends inventory_movementsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: inventory_movementsGroupByArgs['orderBy'] }
        : { orderBy?: inventory_movementsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, inventory_movementsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventory_movementsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the inventory_movements model
   */
  readonly fields: inventory_movementsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for inventory_movements.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__inventory_movementsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the inventory_movements model
   */
  interface inventory_movementsFieldRefs {
    readonly id: FieldRef<"inventory_movements", 'String'>
    readonly organization_id: FieldRef<"inventory_movements", 'String'>
    readonly product_id: FieldRef<"inventory_movements", 'String'>
    readonly location_code: FieldRef<"inventory_movements", 'String'>
    readonly movement_type: FieldRef<"inventory_movements", 'String'>
    readonly transaction_type: FieldRef<"inventory_movements", 'String'>
    readonly quantity_before: FieldRef<"inventory_movements", 'Decimal'>
    readonly quantity_change: FieldRef<"inventory_movements", 'Decimal'>
    readonly quantity_after: FieldRef<"inventory_movements", 'Decimal'>
    readonly unit_cost: FieldRef<"inventory_movements", 'Decimal'>
    readonly total_cost: FieldRef<"inventory_movements", 'Decimal'>
    readonly reference_type: FieldRef<"inventory_movements", 'String'>
    readonly reference_id: FieldRef<"inventory_movements", 'String'>
    readonly reference_number: FieldRef<"inventory_movements", 'String'>
    readonly source_system: FieldRef<"inventory_movements", 'String'>
    readonly external_transaction_id: FieldRef<"inventory_movements", 'String'>
    readonly external_data: FieldRef<"inventory_movements", 'Json'>
    readonly movement_date: FieldRef<"inventory_movements", 'DateTime'>
    readonly posting_date: FieldRef<"inventory_movements", 'DateTime'>
    readonly created_by: FieldRef<"inventory_movements", 'String'>
    readonly notes: FieldRef<"inventory_movements", 'String'>
    readonly created_at: FieldRef<"inventory_movements", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * inventory_movements findUnique
   */
  export type inventory_movementsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * Filter, which inventory_movements to fetch.
     */
    where: inventory_movementsWhereUniqueInput
  }

  /**
   * inventory_movements findUniqueOrThrow
   */
  export type inventory_movementsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * Filter, which inventory_movements to fetch.
     */
    where: inventory_movementsWhereUniqueInput
  }

  /**
   * inventory_movements findFirst
   */
  export type inventory_movementsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * Filter, which inventory_movements to fetch.
     */
    where?: inventory_movementsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inventory_movements to fetch.
     */
    orderBy?: inventory_movementsOrderByWithRelationInput | inventory_movementsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for inventory_movements.
     */
    cursor?: inventory_movementsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inventory_movements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inventory_movements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of inventory_movements.
     */
    distinct?: Inventory_movementsScalarFieldEnum | Inventory_movementsScalarFieldEnum[]
  }

  /**
   * inventory_movements findFirstOrThrow
   */
  export type inventory_movementsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * Filter, which inventory_movements to fetch.
     */
    where?: inventory_movementsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inventory_movements to fetch.
     */
    orderBy?: inventory_movementsOrderByWithRelationInput | inventory_movementsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for inventory_movements.
     */
    cursor?: inventory_movementsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inventory_movements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inventory_movements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of inventory_movements.
     */
    distinct?: Inventory_movementsScalarFieldEnum | Inventory_movementsScalarFieldEnum[]
  }

  /**
   * inventory_movements findMany
   */
  export type inventory_movementsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * Filter, which inventory_movements to fetch.
     */
    where?: inventory_movementsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inventory_movements to fetch.
     */
    orderBy?: inventory_movementsOrderByWithRelationInput | inventory_movementsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing inventory_movements.
     */
    cursor?: inventory_movementsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inventory_movements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inventory_movements.
     */
    skip?: number
    distinct?: Inventory_movementsScalarFieldEnum | Inventory_movementsScalarFieldEnum[]
  }

  /**
   * inventory_movements create
   */
  export type inventory_movementsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * The data needed to create a inventory_movements.
     */
    data: XOR<inventory_movementsCreateInput, inventory_movementsUncheckedCreateInput>
  }

  /**
   * inventory_movements createMany
   */
  export type inventory_movementsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many inventory_movements.
     */
    data: inventory_movementsCreateManyInput | inventory_movementsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * inventory_movements createManyAndReturn
   */
  export type inventory_movementsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * The data used to create many inventory_movements.
     */
    data: inventory_movementsCreateManyInput | inventory_movementsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * inventory_movements update
   */
  export type inventory_movementsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * The data needed to update a inventory_movements.
     */
    data: XOR<inventory_movementsUpdateInput, inventory_movementsUncheckedUpdateInput>
    /**
     * Choose, which inventory_movements to update.
     */
    where: inventory_movementsWhereUniqueInput
  }

  /**
   * inventory_movements updateMany
   */
  export type inventory_movementsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update inventory_movements.
     */
    data: XOR<inventory_movementsUpdateManyMutationInput, inventory_movementsUncheckedUpdateManyInput>
    /**
     * Filter which inventory_movements to update
     */
    where?: inventory_movementsWhereInput
    /**
     * Limit how many inventory_movements to update.
     */
    limit?: number
  }

  /**
   * inventory_movements updateManyAndReturn
   */
  export type inventory_movementsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * The data used to update inventory_movements.
     */
    data: XOR<inventory_movementsUpdateManyMutationInput, inventory_movementsUncheckedUpdateManyInput>
    /**
     * Filter which inventory_movements to update
     */
    where?: inventory_movementsWhereInput
    /**
     * Limit how many inventory_movements to update.
     */
    limit?: number
  }

  /**
   * inventory_movements upsert
   */
  export type inventory_movementsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * The filter to search for the inventory_movements to update in case it exists.
     */
    where: inventory_movementsWhereUniqueInput
    /**
     * In case the inventory_movements found by the `where` argument doesn't exist, create a new inventory_movements with this data.
     */
    create: XOR<inventory_movementsCreateInput, inventory_movementsUncheckedCreateInput>
    /**
     * In case the inventory_movements was found with the provided `where` argument, update it with this data.
     */
    update: XOR<inventory_movementsUpdateInput, inventory_movementsUncheckedUpdateInput>
  }

  /**
   * inventory_movements delete
   */
  export type inventory_movementsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
    /**
     * Filter which inventory_movements to delete.
     */
    where: inventory_movementsWhereUniqueInput
  }

  /**
   * inventory_movements deleteMany
   */
  export type inventory_movementsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which inventory_movements to delete
     */
    where?: inventory_movementsWhereInput
    /**
     * Limit how many inventory_movements to delete.
     */
    limit?: number
  }

  /**
   * inventory_movements without action
   */
  export type inventory_movementsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inventory_movements
     */
    select?: inventory_movementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inventory_movements
     */
    omit?: inventory_movementsOmit<ExtArgs> | null
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


  export const Business_userScalarFieldEnum: {
    businessName: 'businessName',
    gstin: 'gstin',
    contactEmail: 'contactEmail',
    contactPhone: 'contactPhone',
    address: 'address',
    notificationPreference: 'notificationPreference',
    customerId: 'customerId',
    id: 'id',
    platformId: 'platformId'
  };

  export type Business_userScalarFieldEnum = (typeof Business_userScalarFieldEnum)[keyof typeof Business_userScalarFieldEnum]


  export const IntegrationsScalarFieldEnum: {
    name: 'name',
    id: 'id'
  };

  export type IntegrationsScalarFieldEnum = (typeof IntegrationsScalarFieldEnum)[keyof typeof IntegrationsScalarFieldEnum]


  export const Zoho_user_credentialScalarFieldEnum: {
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    organization_id: 'organization_id',
    business_user_id: 'business_user_id',
    id: 'id',
    client_id: 'client_id',
    client_secret: 'client_secret',
    expires_in: 'expires_in',
    token_acquired_at: 'token_acquired_at',
    whatsapp_number: 'whatsapp_number',
    code: 'code'
  };

  export type Zoho_user_credentialScalarFieldEnum = (typeof Zoho_user_credentialScalarFieldEnum)[keyof typeof Zoho_user_credentialScalarFieldEnum]


  export const ConversationMessageScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    message: 'message',
    fromUser: 'fromUser',
    createdAt: 'createdAt'
  };

  export type ConversationMessageScalarFieldEnum = (typeof ConversationMessageScalarFieldEnum)[keyof typeof ConversationMessageScalarFieldEnum]


  export const ConversationSessionScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    phoneNumber: 'phoneNumber',
    context: 'context',
    currentStep: 'currentStep',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastEvent: 'lastEvent'
  };

  export type ConversationSessionScalarFieldEnum = (typeof ConversationSessionScalarFieldEnum)[keyof typeof ConversationSessionScalarFieldEnum]


  export const ConversationEventScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    eventType: 'eventType',
    stepFrom: 'stepFrom',
    stepTo: 'stepTo',
    payload: 'payload',
    createdAt: 'createdAt'
  };

  export type ConversationEventScalarFieldEnum = (typeof ConversationEventScalarFieldEnum)[keyof typeof ConversationEventScalarFieldEnum]


  export const Inventory_currentScalarFieldEnum: {
    id: 'id',
    organization_id: 'organization_id',
    product_id: 'product_id',
    location_code: 'location_code',
    location_name: 'location_name',
    quantity_on_hand: 'quantity_on_hand',
    available_stock: 'available_stock',
    reserved_stock: 'reserved_stock',
    on_order_stock: 'on_order_stock',
    minimum_stock: 'minimum_stock',
    maximum_stock: 'maximum_stock',
    reorder_point: 'reorder_point',
    average_cost: 'average_cost',
    last_purchase_cost: 'last_purchase_cost',
    standard_cost: 'standard_cost',
    total_value: 'total_value',
    is_low_stock: 'is_low_stock',
    is_out_of_stock: 'is_out_of_stock',
    needs_reorder: 'needs_reorder',
    last_synced_zoho: 'last_synced_zoho',
    last_synced_tally: 'last_synced_tally',
    last_synced_custom: 'last_synced_custom',
    last_movement_date: 'last_movement_date',
    last_stock_count_date: 'last_stock_count_date',
    version_number: 'version_number',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Inventory_currentScalarFieldEnum = (typeof Inventory_currentScalarFieldEnum)[keyof typeof Inventory_currentScalarFieldEnum]


  export const OrganizationsScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    tax_id: 'tax_id',
    address: 'address',
    contact_info: 'contact_info',
    settings: 'settings',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type OrganizationsScalarFieldEnum = (typeof OrganizationsScalarFieldEnum)[keyof typeof OrganizationsScalarFieldEnum]


  export const Product_categoriesScalarFieldEnum: {
    id: 'id',
    organization_id: 'organization_id',
    name: 'name',
    code: 'code',
    description: 'description',
    parent_id: 'parent_id',
    level: 'level',
    sort_order: 'sort_order',
    is_active: 'is_active',
    zoho_group_id: 'zoho_group_id',
    tally_category: 'tally_category',
    custom_category_id: 'custom_category_id',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Product_categoriesScalarFieldEnum = (typeof Product_categoriesScalarFieldEnum)[keyof typeof Product_categoriesScalarFieldEnum]


  export const ProductsScalarFieldEnum: {
    id: 'id',
    organization_id: 'organization_id',
    category_id: 'category_id',
    name: 'name',
    description: 'description',
    status: 'status',
    product_type: 'product_type',
    sku: 'sku',
    part_number: 'part_number',
    hsn_code: 'hsn_code',
    selling_price: 'selling_price',
    purchase_price: 'purchase_price',
    mrp: 'mrp',
    is_taxable: 'is_taxable',
    tax_rate: 'tax_rate',
    tax_name: 'tax_name',
    reorder_level: 'reorder_level',
    maximum_stock: 'maximum_stock',
    attributes: 'attributes',
    images: 'images',
    zoho_item_id: 'zoho_item_id',
    tally_item_name: 'tally_item_name',
    custom_item_id: 'custom_item_id',
    last_synced_zoho: 'last_synced_zoho',
    last_synced_tally: 'last_synced_tally',
    last_synced_custom: 'last_synced_custom',
    sync_errors: 'sync_errors',
    created_at: 'created_at',
    updated_at: 'updated_at',
    created_by: 'created_by',
    source_type: 'source_type'
  };

  export type ProductsScalarFieldEnum = (typeof ProductsScalarFieldEnum)[keyof typeof ProductsScalarFieldEnum]


  export const Inventory_movementsScalarFieldEnum: {
    id: 'id',
    organization_id: 'organization_id',
    product_id: 'product_id',
    location_code: 'location_code',
    movement_type: 'movement_type',
    transaction_type: 'transaction_type',
    quantity_before: 'quantity_before',
    quantity_change: 'quantity_change',
    quantity_after: 'quantity_after',
    unit_cost: 'unit_cost',
    total_cost: 'total_cost',
    reference_type: 'reference_type',
    reference_id: 'reference_id',
    reference_number: 'reference_number',
    source_system: 'source_system',
    external_transaction_id: 'external_transaction_id',
    external_data: 'external_data',
    movement_date: 'movement_date',
    posting_date: 'posting_date',
    created_by: 'created_by',
    notes: 'notes',
    created_at: 'created_at'
  };

  export type Inventory_movementsScalarFieldEnum = (typeof Inventory_movementsScalarFieldEnum)[keyof typeof Inventory_movementsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


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
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'product_source_type'
   */
  export type Enumproduct_source_typeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'product_source_type'>
    


  /**
   * Reference to a field of type 'product_source_type[]'
   */
  export type ListEnumproduct_source_typeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'product_source_type[]'>
    


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

  export type business_userWhereInput = {
    AND?: business_userWhereInput | business_userWhereInput[]
    OR?: business_userWhereInput[]
    NOT?: business_userWhereInput | business_userWhereInput[]
    businessName?: StringFilter<"business_user"> | string
    gstin?: StringFilter<"business_user"> | string
    contactEmail?: StringFilter<"business_user"> | string
    contactPhone?: StringFilter<"business_user"> | string
    address?: StringFilter<"business_user"> | string
    notificationPreference?: StringFilter<"business_user"> | string
    customerId?: StringFilter<"business_user"> | string
    id?: IntFilter<"business_user"> | number
    platformId?: DecimalNullableFilter<"business_user"> | Decimal | DecimalJsLike | number | string | null
  }

  export type business_userOrderByWithRelationInput = {
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    customerId?: SortOrder
    id?: SortOrder
    platformId?: SortOrderInput | SortOrder
  }

  export type business_userWhereUniqueInput = Prisma.AtLeast<{
    customerId?: string
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
    platformId?: DecimalNullableFilter<"business_user"> | Decimal | DecimalJsLike | number | string | null
  }, "id" | "customerId">

  export type business_userOrderByWithAggregationInput = {
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    customerId?: SortOrder
    id?: SortOrder
    platformId?: SortOrderInput | SortOrder
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
    businessName?: StringWithAggregatesFilter<"business_user"> | string
    gstin?: StringWithAggregatesFilter<"business_user"> | string
    contactEmail?: StringWithAggregatesFilter<"business_user"> | string
    contactPhone?: StringWithAggregatesFilter<"business_user"> | string
    address?: StringWithAggregatesFilter<"business_user"> | string
    notificationPreference?: StringWithAggregatesFilter<"business_user"> | string
    customerId?: StringWithAggregatesFilter<"business_user"> | string
    id?: IntWithAggregatesFilter<"business_user"> | number
    platformId?: DecimalNullableWithAggregatesFilter<"business_user"> | Decimal | DecimalJsLike | number | string | null
  }

  export type integrationsWhereInput = {
    AND?: integrationsWhereInput | integrationsWhereInput[]
    OR?: integrationsWhereInput[]
    NOT?: integrationsWhereInput | integrationsWhereInput[]
    name?: StringFilter<"integrations"> | string
    id?: IntFilter<"integrations"> | number
  }

  export type integrationsOrderByWithRelationInput = {
    name?: SortOrder
    id?: SortOrder
  }

  export type integrationsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: integrationsWhereInput | integrationsWhereInput[]
    OR?: integrationsWhereInput[]
    NOT?: integrationsWhereInput | integrationsWhereInput[]
    name?: StringFilter<"integrations"> | string
  }, "id">

  export type integrationsOrderByWithAggregationInput = {
    name?: SortOrder
    id?: SortOrder
    _count?: integrationsCountOrderByAggregateInput
    _avg?: integrationsAvgOrderByAggregateInput
    _max?: integrationsMaxOrderByAggregateInput
    _min?: integrationsMinOrderByAggregateInput
    _sum?: integrationsSumOrderByAggregateInput
  }

  export type integrationsScalarWhereWithAggregatesInput = {
    AND?: integrationsScalarWhereWithAggregatesInput | integrationsScalarWhereWithAggregatesInput[]
    OR?: integrationsScalarWhereWithAggregatesInput[]
    NOT?: integrationsScalarWhereWithAggregatesInput | integrationsScalarWhereWithAggregatesInput[]
    name?: StringWithAggregatesFilter<"integrations"> | string
    id?: IntWithAggregatesFilter<"integrations"> | number
  }

  export type zoho_user_credentialWhereInput = {
    AND?: zoho_user_credentialWhereInput | zoho_user_credentialWhereInput[]
    OR?: zoho_user_credentialWhereInput[]
    NOT?: zoho_user_credentialWhereInput | zoho_user_credentialWhereInput[]
    access_token?: StringNullableFilter<"zoho_user_credential"> | string | null
    refresh_token?: StringNullableFilter<"zoho_user_credential"> | string | null
    organization_id?: StringFilter<"zoho_user_credential"> | string
    business_user_id?: IntFilter<"zoho_user_credential"> | number
    id?: IntFilter<"zoho_user_credential"> | number
    client_id?: StringNullableFilter<"zoho_user_credential"> | string | null
    client_secret?: StringNullableFilter<"zoho_user_credential"> | string | null
    expires_in?: IntNullableFilter<"zoho_user_credential"> | number | null
    token_acquired_at?: StringNullableFilter<"zoho_user_credential"> | string | null
    whatsapp_number?: StringNullableFilter<"zoho_user_credential"> | string | null
    code?: StringNullableFilter<"zoho_user_credential"> | string | null
  }

  export type zoho_user_credentialOrderByWithRelationInput = {
    access_token?: SortOrderInput | SortOrder
    refresh_token?: SortOrderInput | SortOrder
    organization_id?: SortOrder
    business_user_id?: SortOrder
    id?: SortOrder
    client_id?: SortOrderInput | SortOrder
    client_secret?: SortOrderInput | SortOrder
    expires_in?: SortOrderInput | SortOrder
    token_acquired_at?: SortOrderInput | SortOrder
    whatsapp_number?: SortOrderInput | SortOrder
    code?: SortOrderInput | SortOrder
  }

  export type zoho_user_credentialWhereUniqueInput = Prisma.AtLeast<{
    business_user_id?: number
    id?: number
    client_id?: string
    whatsapp_number?: string
    AND?: zoho_user_credentialWhereInput | zoho_user_credentialWhereInput[]
    OR?: zoho_user_credentialWhereInput[]
    NOT?: zoho_user_credentialWhereInput | zoho_user_credentialWhereInput[]
    access_token?: StringNullableFilter<"zoho_user_credential"> | string | null
    refresh_token?: StringNullableFilter<"zoho_user_credential"> | string | null
    organization_id?: StringFilter<"zoho_user_credential"> | string
    client_secret?: StringNullableFilter<"zoho_user_credential"> | string | null
    expires_in?: IntNullableFilter<"zoho_user_credential"> | number | null
    token_acquired_at?: StringNullableFilter<"zoho_user_credential"> | string | null
    code?: StringNullableFilter<"zoho_user_credential"> | string | null
  }, "id" | "business_user_id" | "client_id" | "whatsapp_number">

  export type zoho_user_credentialOrderByWithAggregationInput = {
    access_token?: SortOrderInput | SortOrder
    refresh_token?: SortOrderInput | SortOrder
    organization_id?: SortOrder
    business_user_id?: SortOrder
    id?: SortOrder
    client_id?: SortOrderInput | SortOrder
    client_secret?: SortOrderInput | SortOrder
    expires_in?: SortOrderInput | SortOrder
    token_acquired_at?: SortOrderInput | SortOrder
    whatsapp_number?: SortOrderInput | SortOrder
    code?: SortOrderInput | SortOrder
    _count?: zoho_user_credentialCountOrderByAggregateInput
    _avg?: zoho_user_credentialAvgOrderByAggregateInput
    _max?: zoho_user_credentialMaxOrderByAggregateInput
    _min?: zoho_user_credentialMinOrderByAggregateInput
    _sum?: zoho_user_credentialSumOrderByAggregateInput
  }

  export type zoho_user_credentialScalarWhereWithAggregatesInput = {
    AND?: zoho_user_credentialScalarWhereWithAggregatesInput | zoho_user_credentialScalarWhereWithAggregatesInput[]
    OR?: zoho_user_credentialScalarWhereWithAggregatesInput[]
    NOT?: zoho_user_credentialScalarWhereWithAggregatesInput | zoho_user_credentialScalarWhereWithAggregatesInput[]
    access_token?: StringNullableWithAggregatesFilter<"zoho_user_credential"> | string | null
    refresh_token?: StringNullableWithAggregatesFilter<"zoho_user_credential"> | string | null
    organization_id?: StringWithAggregatesFilter<"zoho_user_credential"> | string
    business_user_id?: IntWithAggregatesFilter<"zoho_user_credential"> | number
    id?: IntWithAggregatesFilter<"zoho_user_credential"> | number
    client_id?: StringNullableWithAggregatesFilter<"zoho_user_credential"> | string | null
    client_secret?: StringNullableWithAggregatesFilter<"zoho_user_credential"> | string | null
    expires_in?: IntNullableWithAggregatesFilter<"zoho_user_credential"> | number | null
    token_acquired_at?: StringNullableWithAggregatesFilter<"zoho_user_credential"> | string | null
    whatsapp_number?: StringNullableWithAggregatesFilter<"zoho_user_credential"> | string | null
    code?: StringNullableWithAggregatesFilter<"zoho_user_credential"> | string | null
  }

  export type ConversationMessageWhereInput = {
    AND?: ConversationMessageWhereInput | ConversationMessageWhereInput[]
    OR?: ConversationMessageWhereInput[]
    NOT?: ConversationMessageWhereInput | ConversationMessageWhereInput[]
    id?: StringFilter<"ConversationMessage"> | string
    sessionId?: StringFilter<"ConversationMessage"> | string
    message?: StringFilter<"ConversationMessage"> | string
    fromUser?: BoolFilter<"ConversationMessage"> | boolean
    createdAt?: DateTimeFilter<"ConversationMessage"> | Date | string
  }

  export type ConversationMessageOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    message?: SortOrder
    fromUser?: SortOrder
    createdAt?: SortOrder
  }

  export type ConversationMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConversationMessageWhereInput | ConversationMessageWhereInput[]
    OR?: ConversationMessageWhereInput[]
    NOT?: ConversationMessageWhereInput | ConversationMessageWhereInput[]
    sessionId?: StringFilter<"ConversationMessage"> | string
    message?: StringFilter<"ConversationMessage"> | string
    fromUser?: BoolFilter<"ConversationMessage"> | boolean
    createdAt?: DateTimeFilter<"ConversationMessage"> | Date | string
  }, "id">

  export type ConversationMessageOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    message?: SortOrder
    fromUser?: SortOrder
    createdAt?: SortOrder
    _count?: ConversationMessageCountOrderByAggregateInput
    _max?: ConversationMessageMaxOrderByAggregateInput
    _min?: ConversationMessageMinOrderByAggregateInput
  }

  export type ConversationMessageScalarWhereWithAggregatesInput = {
    AND?: ConversationMessageScalarWhereWithAggregatesInput | ConversationMessageScalarWhereWithAggregatesInput[]
    OR?: ConversationMessageScalarWhereWithAggregatesInput[]
    NOT?: ConversationMessageScalarWhereWithAggregatesInput | ConversationMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConversationMessage"> | string
    sessionId?: StringWithAggregatesFilter<"ConversationMessage"> | string
    message?: StringWithAggregatesFilter<"ConversationMessage"> | string
    fromUser?: BoolWithAggregatesFilter<"ConversationMessage"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ConversationMessage"> | Date | string
  }

  export type ConversationSessionWhereInput = {
    AND?: ConversationSessionWhereInput | ConversationSessionWhereInput[]
    OR?: ConversationSessionWhereInput[]
    NOT?: ConversationSessionWhereInput | ConversationSessionWhereInput[]
    id?: StringFilter<"ConversationSession"> | string
    userId?: StringFilter<"ConversationSession"> | string
    phoneNumber?: StringFilter<"ConversationSession"> | string
    context?: JsonFilter<"ConversationSession">
    currentStep?: StringFilter<"ConversationSession"> | string
    createdAt?: DateTimeFilter<"ConversationSession"> | Date | string
    updatedAt?: DateTimeFilter<"ConversationSession"> | Date | string
    lastEvent?: StringNullableFilter<"ConversationSession"> | string | null
    events?: ConversationEventListRelationFilter
  }

  export type ConversationSessionOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    phoneNumber?: SortOrder
    context?: SortOrder
    currentStep?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastEvent?: SortOrderInput | SortOrder
    events?: ConversationEventOrderByRelationAggregateInput
  }

  export type ConversationSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConversationSessionWhereInput | ConversationSessionWhereInput[]
    OR?: ConversationSessionWhereInput[]
    NOT?: ConversationSessionWhereInput | ConversationSessionWhereInput[]
    userId?: StringFilter<"ConversationSession"> | string
    phoneNumber?: StringFilter<"ConversationSession"> | string
    context?: JsonFilter<"ConversationSession">
    currentStep?: StringFilter<"ConversationSession"> | string
    createdAt?: DateTimeFilter<"ConversationSession"> | Date | string
    updatedAt?: DateTimeFilter<"ConversationSession"> | Date | string
    lastEvent?: StringNullableFilter<"ConversationSession"> | string | null
    events?: ConversationEventListRelationFilter
  }, "id">

  export type ConversationSessionOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    phoneNumber?: SortOrder
    context?: SortOrder
    currentStep?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastEvent?: SortOrderInput | SortOrder
    _count?: ConversationSessionCountOrderByAggregateInput
    _max?: ConversationSessionMaxOrderByAggregateInput
    _min?: ConversationSessionMinOrderByAggregateInput
  }

  export type ConversationSessionScalarWhereWithAggregatesInput = {
    AND?: ConversationSessionScalarWhereWithAggregatesInput | ConversationSessionScalarWhereWithAggregatesInput[]
    OR?: ConversationSessionScalarWhereWithAggregatesInput[]
    NOT?: ConversationSessionScalarWhereWithAggregatesInput | ConversationSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConversationSession"> | string
    userId?: StringWithAggregatesFilter<"ConversationSession"> | string
    phoneNumber?: StringWithAggregatesFilter<"ConversationSession"> | string
    context?: JsonWithAggregatesFilter<"ConversationSession">
    currentStep?: StringWithAggregatesFilter<"ConversationSession"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ConversationSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ConversationSession"> | Date | string
    lastEvent?: StringNullableWithAggregatesFilter<"ConversationSession"> | string | null
  }

  export type ConversationEventWhereInput = {
    AND?: ConversationEventWhereInput | ConversationEventWhereInput[]
    OR?: ConversationEventWhereInput[]
    NOT?: ConversationEventWhereInput | ConversationEventWhereInput[]
    id?: StringFilter<"ConversationEvent"> | string
    sessionId?: StringFilter<"ConversationEvent"> | string
    eventType?: StringFilter<"ConversationEvent"> | string
    stepFrom?: StringNullableFilter<"ConversationEvent"> | string | null
    stepTo?: StringNullableFilter<"ConversationEvent"> | string | null
    payload?: JsonNullableFilter<"ConversationEvent">
    createdAt?: DateTimeFilter<"ConversationEvent"> | Date | string
    session?: XOR<ConversationSessionScalarRelationFilter, ConversationSessionWhereInput>
  }

  export type ConversationEventOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    eventType?: SortOrder
    stepFrom?: SortOrderInput | SortOrder
    stepTo?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    session?: ConversationSessionOrderByWithRelationInput
  }

  export type ConversationEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConversationEventWhereInput | ConversationEventWhereInput[]
    OR?: ConversationEventWhereInput[]
    NOT?: ConversationEventWhereInput | ConversationEventWhereInput[]
    sessionId?: StringFilter<"ConversationEvent"> | string
    eventType?: StringFilter<"ConversationEvent"> | string
    stepFrom?: StringNullableFilter<"ConversationEvent"> | string | null
    stepTo?: StringNullableFilter<"ConversationEvent"> | string | null
    payload?: JsonNullableFilter<"ConversationEvent">
    createdAt?: DateTimeFilter<"ConversationEvent"> | Date | string
    session?: XOR<ConversationSessionScalarRelationFilter, ConversationSessionWhereInput>
  }, "id">

  export type ConversationEventOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    eventType?: SortOrder
    stepFrom?: SortOrderInput | SortOrder
    stepTo?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ConversationEventCountOrderByAggregateInput
    _max?: ConversationEventMaxOrderByAggregateInput
    _min?: ConversationEventMinOrderByAggregateInput
  }

  export type ConversationEventScalarWhereWithAggregatesInput = {
    AND?: ConversationEventScalarWhereWithAggregatesInput | ConversationEventScalarWhereWithAggregatesInput[]
    OR?: ConversationEventScalarWhereWithAggregatesInput[]
    NOT?: ConversationEventScalarWhereWithAggregatesInput | ConversationEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConversationEvent"> | string
    sessionId?: StringWithAggregatesFilter<"ConversationEvent"> | string
    eventType?: StringWithAggregatesFilter<"ConversationEvent"> | string
    stepFrom?: StringNullableWithAggregatesFilter<"ConversationEvent"> | string | null
    stepTo?: StringNullableWithAggregatesFilter<"ConversationEvent"> | string | null
    payload?: JsonNullableWithAggregatesFilter<"ConversationEvent">
    createdAt?: DateTimeWithAggregatesFilter<"ConversationEvent"> | Date | string
  }

  export type inventory_currentWhereInput = {
    AND?: inventory_currentWhereInput | inventory_currentWhereInput[]
    OR?: inventory_currentWhereInput[]
    NOT?: inventory_currentWhereInput | inventory_currentWhereInput[]
    id?: UuidFilter<"inventory_current"> | string
    organization_id?: UuidNullableFilter<"inventory_current"> | string | null
    product_id?: StringFilter<"inventory_current"> | string
    location_code?: StringNullableFilter<"inventory_current"> | string | null
    location_name?: StringNullableFilter<"inventory_current"> | string | null
    quantity_on_hand?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    available_stock?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    reserved_stock?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    on_order_stock?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    minimum_stock?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    maximum_stock?: DecimalNullableFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    reorder_point?: DecimalNullableFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    average_cost?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    last_purchase_cost?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    standard_cost?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    total_value?: DecimalNullableFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    is_low_stock?: BoolFilter<"inventory_current"> | boolean
    is_out_of_stock?: BoolFilter<"inventory_current"> | boolean
    needs_reorder?: BoolFilter<"inventory_current"> | boolean
    last_synced_zoho?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    last_synced_tally?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    last_synced_custom?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    last_movement_date?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    last_stock_count_date?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    version_number?: BigIntFilter<"inventory_current"> | bigint | number
    created_at?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
  }

  export type inventory_currentOrderByWithRelationInput = {
    id?: SortOrder
    organization_id?: SortOrderInput | SortOrder
    product_id?: SortOrder
    location_code?: SortOrderInput | SortOrder
    location_name?: SortOrderInput | SortOrder
    quantity_on_hand?: SortOrder
    available_stock?: SortOrder
    reserved_stock?: SortOrder
    on_order_stock?: SortOrder
    minimum_stock?: SortOrder
    maximum_stock?: SortOrderInput | SortOrder
    reorder_point?: SortOrderInput | SortOrder
    average_cost?: SortOrder
    last_purchase_cost?: SortOrder
    standard_cost?: SortOrder
    total_value?: SortOrderInput | SortOrder
    is_low_stock?: SortOrder
    is_out_of_stock?: SortOrder
    needs_reorder?: SortOrder
    last_synced_zoho?: SortOrderInput | SortOrder
    last_synced_tally?: SortOrderInput | SortOrder
    last_synced_custom?: SortOrderInput | SortOrder
    last_movement_date?: SortOrderInput | SortOrder
    last_stock_count_date?: SortOrderInput | SortOrder
    version_number?: SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
  }

  export type inventory_currentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organization_id_product_id_location_code?: inventory_currentOrganization_idProduct_idLocation_codeCompoundUniqueInput
    AND?: inventory_currentWhereInput | inventory_currentWhereInput[]
    OR?: inventory_currentWhereInput[]
    NOT?: inventory_currentWhereInput | inventory_currentWhereInput[]
    organization_id?: UuidNullableFilter<"inventory_current"> | string | null
    product_id?: StringFilter<"inventory_current"> | string
    location_code?: StringNullableFilter<"inventory_current"> | string | null
    location_name?: StringNullableFilter<"inventory_current"> | string | null
    quantity_on_hand?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    available_stock?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    reserved_stock?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    on_order_stock?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    minimum_stock?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    maximum_stock?: DecimalNullableFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    reorder_point?: DecimalNullableFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    average_cost?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    last_purchase_cost?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    standard_cost?: DecimalFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    total_value?: DecimalNullableFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    is_low_stock?: BoolFilter<"inventory_current"> | boolean
    is_out_of_stock?: BoolFilter<"inventory_current"> | boolean
    needs_reorder?: BoolFilter<"inventory_current"> | boolean
    last_synced_zoho?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    last_synced_tally?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    last_synced_custom?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    last_movement_date?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    last_stock_count_date?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    version_number?: BigIntFilter<"inventory_current"> | bigint | number
    created_at?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"inventory_current"> | Date | string | null
  }, "id" | "organization_id_product_id_location_code">

  export type inventory_currentOrderByWithAggregationInput = {
    id?: SortOrder
    organization_id?: SortOrderInput | SortOrder
    product_id?: SortOrder
    location_code?: SortOrderInput | SortOrder
    location_name?: SortOrderInput | SortOrder
    quantity_on_hand?: SortOrder
    available_stock?: SortOrder
    reserved_stock?: SortOrder
    on_order_stock?: SortOrder
    minimum_stock?: SortOrder
    maximum_stock?: SortOrderInput | SortOrder
    reorder_point?: SortOrderInput | SortOrder
    average_cost?: SortOrder
    last_purchase_cost?: SortOrder
    standard_cost?: SortOrder
    total_value?: SortOrderInput | SortOrder
    is_low_stock?: SortOrder
    is_out_of_stock?: SortOrder
    needs_reorder?: SortOrder
    last_synced_zoho?: SortOrderInput | SortOrder
    last_synced_tally?: SortOrderInput | SortOrder
    last_synced_custom?: SortOrderInput | SortOrder
    last_movement_date?: SortOrderInput | SortOrder
    last_stock_count_date?: SortOrderInput | SortOrder
    version_number?: SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    _count?: inventory_currentCountOrderByAggregateInput
    _avg?: inventory_currentAvgOrderByAggregateInput
    _max?: inventory_currentMaxOrderByAggregateInput
    _min?: inventory_currentMinOrderByAggregateInput
    _sum?: inventory_currentSumOrderByAggregateInput
  }

  export type inventory_currentScalarWhereWithAggregatesInput = {
    AND?: inventory_currentScalarWhereWithAggregatesInput | inventory_currentScalarWhereWithAggregatesInput[]
    OR?: inventory_currentScalarWhereWithAggregatesInput[]
    NOT?: inventory_currentScalarWhereWithAggregatesInput | inventory_currentScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"inventory_current"> | string
    organization_id?: UuidNullableWithAggregatesFilter<"inventory_current"> | string | null
    product_id?: StringWithAggregatesFilter<"inventory_current"> | string
    location_code?: StringNullableWithAggregatesFilter<"inventory_current"> | string | null
    location_name?: StringNullableWithAggregatesFilter<"inventory_current"> | string | null
    quantity_on_hand?: DecimalWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    available_stock?: DecimalWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    reserved_stock?: DecimalWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    on_order_stock?: DecimalWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    minimum_stock?: DecimalWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    maximum_stock?: DecimalNullableWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    reorder_point?: DecimalNullableWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    average_cost?: DecimalWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    last_purchase_cost?: DecimalWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    standard_cost?: DecimalWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string
    total_value?: DecimalNullableWithAggregatesFilter<"inventory_current"> | Decimal | DecimalJsLike | number | string | null
    is_low_stock?: BoolWithAggregatesFilter<"inventory_current"> | boolean
    is_out_of_stock?: BoolWithAggregatesFilter<"inventory_current"> | boolean
    needs_reorder?: BoolWithAggregatesFilter<"inventory_current"> | boolean
    last_synced_zoho?: DateTimeNullableWithAggregatesFilter<"inventory_current"> | Date | string | null
    last_synced_tally?: DateTimeNullableWithAggregatesFilter<"inventory_current"> | Date | string | null
    last_synced_custom?: DateTimeNullableWithAggregatesFilter<"inventory_current"> | Date | string | null
    last_movement_date?: DateTimeNullableWithAggregatesFilter<"inventory_current"> | Date | string | null
    last_stock_count_date?: DateTimeNullableWithAggregatesFilter<"inventory_current"> | Date | string | null
    version_number?: BigIntWithAggregatesFilter<"inventory_current"> | bigint | number
    created_at?: DateTimeNullableWithAggregatesFilter<"inventory_current"> | Date | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"inventory_current"> | Date | string | null
  }

  export type organizationsWhereInput = {
    AND?: organizationsWhereInput | organizationsWhereInput[]
    OR?: organizationsWhereInput[]
    NOT?: organizationsWhereInput | organizationsWhereInput[]
    id?: UuidFilter<"organizations"> | string
    name?: StringFilter<"organizations"> | string
    code?: StringNullableFilter<"organizations"> | string | null
    tax_id?: StringNullableFilter<"organizations"> | string | null
    address?: JsonNullableFilter<"organizations">
    contact_info?: JsonNullableFilter<"organizations">
    settings?: JsonNullableFilter<"organizations">
    created_at?: DateTimeNullableFilter<"organizations"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"organizations"> | Date | string | null
  }

  export type organizationsOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrderInput | SortOrder
    tax_id?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    contact_info?: SortOrderInput | SortOrder
    settings?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
  }

  export type organizationsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: organizationsWhereInput | organizationsWhereInput[]
    OR?: organizationsWhereInput[]
    NOT?: organizationsWhereInput | organizationsWhereInput[]
    name?: StringFilter<"organizations"> | string
    tax_id?: StringNullableFilter<"organizations"> | string | null
    address?: JsonNullableFilter<"organizations">
    contact_info?: JsonNullableFilter<"organizations">
    settings?: JsonNullableFilter<"organizations">
    created_at?: DateTimeNullableFilter<"organizations"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"organizations"> | Date | string | null
  }, "id" | "code">

  export type organizationsOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrderInput | SortOrder
    tax_id?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    contact_info?: SortOrderInput | SortOrder
    settings?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    _count?: organizationsCountOrderByAggregateInput
    _max?: organizationsMaxOrderByAggregateInput
    _min?: organizationsMinOrderByAggregateInput
  }

  export type organizationsScalarWhereWithAggregatesInput = {
    AND?: organizationsScalarWhereWithAggregatesInput | organizationsScalarWhereWithAggregatesInput[]
    OR?: organizationsScalarWhereWithAggregatesInput[]
    NOT?: organizationsScalarWhereWithAggregatesInput | organizationsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"organizations"> | string
    name?: StringWithAggregatesFilter<"organizations"> | string
    code?: StringNullableWithAggregatesFilter<"organizations"> | string | null
    tax_id?: StringNullableWithAggregatesFilter<"organizations"> | string | null
    address?: JsonNullableWithAggregatesFilter<"organizations">
    contact_info?: JsonNullableWithAggregatesFilter<"organizations">
    settings?: JsonNullableWithAggregatesFilter<"organizations">
    created_at?: DateTimeNullableWithAggregatesFilter<"organizations"> | Date | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"organizations"> | Date | string | null
  }

  export type product_categoriesWhereInput = {
    AND?: product_categoriesWhereInput | product_categoriesWhereInput[]
    OR?: product_categoriesWhereInput[]
    NOT?: product_categoriesWhereInput | product_categoriesWhereInput[]
    id?: UuidFilter<"product_categories"> | string
    organization_id?: UuidFilter<"product_categories"> | string
    name?: StringFilter<"product_categories"> | string
    code?: StringNullableFilter<"product_categories"> | string | null
    description?: StringNullableFilter<"product_categories"> | string | null
    parent_id?: UuidNullableFilter<"product_categories"> | string | null
    level?: IntNullableFilter<"product_categories"> | number | null
    sort_order?: IntNullableFilter<"product_categories"> | number | null
    is_active?: BoolNullableFilter<"product_categories"> | boolean | null
    zoho_group_id?: StringNullableFilter<"product_categories"> | string | null
    tally_category?: StringNullableFilter<"product_categories"> | string | null
    custom_category_id?: StringNullableFilter<"product_categories"> | string | null
    created_at?: DateTimeNullableFilter<"product_categories"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"product_categories"> | Date | string | null
    product_categories?: XOR<Product_categoriesNullableScalarRelationFilter, product_categoriesWhereInput> | null
    other_product_categories?: Product_categoriesListRelationFilter
    products?: ProductsListRelationFilter
  }

  export type product_categoriesOrderByWithRelationInput = {
    id?: SortOrder
    organization_id?: SortOrder
    name?: SortOrder
    code?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    parent_id?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    sort_order?: SortOrderInput | SortOrder
    is_active?: SortOrderInput | SortOrder
    zoho_group_id?: SortOrderInput | SortOrder
    tally_category?: SortOrderInput | SortOrder
    custom_category_id?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    product_categories?: product_categoriesOrderByWithRelationInput
    other_product_categories?: product_categoriesOrderByRelationAggregateInput
    products?: productsOrderByRelationAggregateInput
  }

  export type product_categoriesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organization_id_name?: product_categoriesOrganization_idNameCompoundUniqueInput
    AND?: product_categoriesWhereInput | product_categoriesWhereInput[]
    OR?: product_categoriesWhereInput[]
    NOT?: product_categoriesWhereInput | product_categoriesWhereInput[]
    organization_id?: UuidFilter<"product_categories"> | string
    name?: StringFilter<"product_categories"> | string
    code?: StringNullableFilter<"product_categories"> | string | null
    description?: StringNullableFilter<"product_categories"> | string | null
    parent_id?: UuidNullableFilter<"product_categories"> | string | null
    level?: IntNullableFilter<"product_categories"> | number | null
    sort_order?: IntNullableFilter<"product_categories"> | number | null
    is_active?: BoolNullableFilter<"product_categories"> | boolean | null
    zoho_group_id?: StringNullableFilter<"product_categories"> | string | null
    tally_category?: StringNullableFilter<"product_categories"> | string | null
    custom_category_id?: StringNullableFilter<"product_categories"> | string | null
    created_at?: DateTimeNullableFilter<"product_categories"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"product_categories"> | Date | string | null
    product_categories?: XOR<Product_categoriesNullableScalarRelationFilter, product_categoriesWhereInput> | null
    other_product_categories?: Product_categoriesListRelationFilter
    products?: ProductsListRelationFilter
  }, "id" | "organization_id_name">

  export type product_categoriesOrderByWithAggregationInput = {
    id?: SortOrder
    organization_id?: SortOrder
    name?: SortOrder
    code?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    parent_id?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    sort_order?: SortOrderInput | SortOrder
    is_active?: SortOrderInput | SortOrder
    zoho_group_id?: SortOrderInput | SortOrder
    tally_category?: SortOrderInput | SortOrder
    custom_category_id?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    _count?: product_categoriesCountOrderByAggregateInput
    _avg?: product_categoriesAvgOrderByAggregateInput
    _max?: product_categoriesMaxOrderByAggregateInput
    _min?: product_categoriesMinOrderByAggregateInput
    _sum?: product_categoriesSumOrderByAggregateInput
  }

  export type product_categoriesScalarWhereWithAggregatesInput = {
    AND?: product_categoriesScalarWhereWithAggregatesInput | product_categoriesScalarWhereWithAggregatesInput[]
    OR?: product_categoriesScalarWhereWithAggregatesInput[]
    NOT?: product_categoriesScalarWhereWithAggregatesInput | product_categoriesScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"product_categories"> | string
    organization_id?: UuidWithAggregatesFilter<"product_categories"> | string
    name?: StringWithAggregatesFilter<"product_categories"> | string
    code?: StringNullableWithAggregatesFilter<"product_categories"> | string | null
    description?: StringNullableWithAggregatesFilter<"product_categories"> | string | null
    parent_id?: UuidNullableWithAggregatesFilter<"product_categories"> | string | null
    level?: IntNullableWithAggregatesFilter<"product_categories"> | number | null
    sort_order?: IntNullableWithAggregatesFilter<"product_categories"> | number | null
    is_active?: BoolNullableWithAggregatesFilter<"product_categories"> | boolean | null
    zoho_group_id?: StringNullableWithAggregatesFilter<"product_categories"> | string | null
    tally_category?: StringNullableWithAggregatesFilter<"product_categories"> | string | null
    custom_category_id?: StringNullableWithAggregatesFilter<"product_categories"> | string | null
    created_at?: DateTimeNullableWithAggregatesFilter<"product_categories"> | Date | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"product_categories"> | Date | string | null
  }

  export type productsWhereInput = {
    AND?: productsWhereInput | productsWhereInput[]
    OR?: productsWhereInput[]
    NOT?: productsWhereInput | productsWhereInput[]
    id?: UuidFilter<"products"> | string
    organization_id?: StringFilter<"products"> | string
    category_id?: UuidNullableFilter<"products"> | string | null
    name?: StringFilter<"products"> | string
    description?: StringNullableFilter<"products"> | string | null
    status?: StringNullableFilter<"products"> | string | null
    product_type?: StringNullableFilter<"products"> | string | null
    sku?: StringNullableFilter<"products"> | string | null
    part_number?: StringNullableFilter<"products"> | string | null
    hsn_code?: StringNullableFilter<"products"> | string | null
    selling_price?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    purchase_price?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    mrp?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    is_taxable?: BoolNullableFilter<"products"> | boolean | null
    tax_rate?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    tax_name?: StringNullableFilter<"products"> | string | null
    reorder_level?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    attributes?: JsonNullableFilter<"products">
    images?: JsonNullableFilter<"products">
    zoho_item_id?: StringNullableFilter<"products"> | string | null
    tally_item_name?: StringNullableFilter<"products"> | string | null
    custom_item_id?: StringNullableFilter<"products"> | string | null
    last_synced_zoho?: DateTimeNullableFilter<"products"> | Date | string | null
    last_synced_tally?: DateTimeNullableFilter<"products"> | Date | string | null
    last_synced_custom?: DateTimeNullableFilter<"products"> | Date | string | null
    sync_errors?: JsonNullableFilter<"products">
    created_at?: DateTimeNullableFilter<"products"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"products"> | Date | string | null
    created_by?: StringNullableFilter<"products"> | string | null
    source_type?: Enumproduct_source_typeNullableFilter<"products"> | $Enums.product_source_type | null
    product_categories?: XOR<Product_categoriesNullableScalarRelationFilter, product_categoriesWhereInput> | null
  }

  export type productsOrderByWithRelationInput = {
    id?: SortOrder
    organization_id?: SortOrder
    category_id?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    product_type?: SortOrderInput | SortOrder
    sku?: SortOrderInput | SortOrder
    part_number?: SortOrderInput | SortOrder
    hsn_code?: SortOrderInput | SortOrder
    selling_price?: SortOrderInput | SortOrder
    purchase_price?: SortOrderInput | SortOrder
    mrp?: SortOrderInput | SortOrder
    is_taxable?: SortOrderInput | SortOrder
    tax_rate?: SortOrderInput | SortOrder
    tax_name?: SortOrderInput | SortOrder
    reorder_level?: SortOrderInput | SortOrder
    maximum_stock?: SortOrderInput | SortOrder
    attributes?: SortOrderInput | SortOrder
    images?: SortOrderInput | SortOrder
    zoho_item_id?: SortOrderInput | SortOrder
    tally_item_name?: SortOrderInput | SortOrder
    custom_item_id?: SortOrderInput | SortOrder
    last_synced_zoho?: SortOrderInput | SortOrder
    last_synced_tally?: SortOrderInput | SortOrder
    last_synced_custom?: SortOrderInput | SortOrder
    sync_errors?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    created_by?: SortOrderInput | SortOrder
    source_type?: SortOrderInput | SortOrder
    product_categories?: product_categoriesOrderByWithRelationInput
  }

  export type productsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: productsWhereInput | productsWhereInput[]
    OR?: productsWhereInput[]
    NOT?: productsWhereInput | productsWhereInput[]
    organization_id?: StringFilter<"products"> | string
    category_id?: UuidNullableFilter<"products"> | string | null
    name?: StringFilter<"products"> | string
    description?: StringNullableFilter<"products"> | string | null
    status?: StringNullableFilter<"products"> | string | null
    product_type?: StringNullableFilter<"products"> | string | null
    sku?: StringNullableFilter<"products"> | string | null
    part_number?: StringNullableFilter<"products"> | string | null
    hsn_code?: StringNullableFilter<"products"> | string | null
    selling_price?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    purchase_price?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    mrp?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    is_taxable?: BoolNullableFilter<"products"> | boolean | null
    tax_rate?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    tax_name?: StringNullableFilter<"products"> | string | null
    reorder_level?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    attributes?: JsonNullableFilter<"products">
    images?: JsonNullableFilter<"products">
    zoho_item_id?: StringNullableFilter<"products"> | string | null
    tally_item_name?: StringNullableFilter<"products"> | string | null
    custom_item_id?: StringNullableFilter<"products"> | string | null
    last_synced_zoho?: DateTimeNullableFilter<"products"> | Date | string | null
    last_synced_tally?: DateTimeNullableFilter<"products"> | Date | string | null
    last_synced_custom?: DateTimeNullableFilter<"products"> | Date | string | null
    sync_errors?: JsonNullableFilter<"products">
    created_at?: DateTimeNullableFilter<"products"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"products"> | Date | string | null
    created_by?: StringNullableFilter<"products"> | string | null
    source_type?: Enumproduct_source_typeNullableFilter<"products"> | $Enums.product_source_type | null
    product_categories?: XOR<Product_categoriesNullableScalarRelationFilter, product_categoriesWhereInput> | null
  }, "id">

  export type productsOrderByWithAggregationInput = {
    id?: SortOrder
    organization_id?: SortOrder
    category_id?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    product_type?: SortOrderInput | SortOrder
    sku?: SortOrderInput | SortOrder
    part_number?: SortOrderInput | SortOrder
    hsn_code?: SortOrderInput | SortOrder
    selling_price?: SortOrderInput | SortOrder
    purchase_price?: SortOrderInput | SortOrder
    mrp?: SortOrderInput | SortOrder
    is_taxable?: SortOrderInput | SortOrder
    tax_rate?: SortOrderInput | SortOrder
    tax_name?: SortOrderInput | SortOrder
    reorder_level?: SortOrderInput | SortOrder
    maximum_stock?: SortOrderInput | SortOrder
    attributes?: SortOrderInput | SortOrder
    images?: SortOrderInput | SortOrder
    zoho_item_id?: SortOrderInput | SortOrder
    tally_item_name?: SortOrderInput | SortOrder
    custom_item_id?: SortOrderInput | SortOrder
    last_synced_zoho?: SortOrderInput | SortOrder
    last_synced_tally?: SortOrderInput | SortOrder
    last_synced_custom?: SortOrderInput | SortOrder
    sync_errors?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    created_by?: SortOrderInput | SortOrder
    source_type?: SortOrderInput | SortOrder
    _count?: productsCountOrderByAggregateInput
    _avg?: productsAvgOrderByAggregateInput
    _max?: productsMaxOrderByAggregateInput
    _min?: productsMinOrderByAggregateInput
    _sum?: productsSumOrderByAggregateInput
  }

  export type productsScalarWhereWithAggregatesInput = {
    AND?: productsScalarWhereWithAggregatesInput | productsScalarWhereWithAggregatesInput[]
    OR?: productsScalarWhereWithAggregatesInput[]
    NOT?: productsScalarWhereWithAggregatesInput | productsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"products"> | string
    organization_id?: StringWithAggregatesFilter<"products"> | string
    category_id?: UuidNullableWithAggregatesFilter<"products"> | string | null
    name?: StringWithAggregatesFilter<"products"> | string
    description?: StringNullableWithAggregatesFilter<"products"> | string | null
    status?: StringNullableWithAggregatesFilter<"products"> | string | null
    product_type?: StringNullableWithAggregatesFilter<"products"> | string | null
    sku?: StringNullableWithAggregatesFilter<"products"> | string | null
    part_number?: StringNullableWithAggregatesFilter<"products"> | string | null
    hsn_code?: StringNullableWithAggregatesFilter<"products"> | string | null
    selling_price?: DecimalNullableWithAggregatesFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    purchase_price?: DecimalNullableWithAggregatesFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    mrp?: DecimalNullableWithAggregatesFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    is_taxable?: BoolNullableWithAggregatesFilter<"products"> | boolean | null
    tax_rate?: DecimalNullableWithAggregatesFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    tax_name?: StringNullableWithAggregatesFilter<"products"> | string | null
    reorder_level?: DecimalNullableWithAggregatesFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: DecimalNullableWithAggregatesFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    attributes?: JsonNullableWithAggregatesFilter<"products">
    images?: JsonNullableWithAggregatesFilter<"products">
    zoho_item_id?: StringNullableWithAggregatesFilter<"products"> | string | null
    tally_item_name?: StringNullableWithAggregatesFilter<"products"> | string | null
    custom_item_id?: StringNullableWithAggregatesFilter<"products"> | string | null
    last_synced_zoho?: DateTimeNullableWithAggregatesFilter<"products"> | Date | string | null
    last_synced_tally?: DateTimeNullableWithAggregatesFilter<"products"> | Date | string | null
    last_synced_custom?: DateTimeNullableWithAggregatesFilter<"products"> | Date | string | null
    sync_errors?: JsonNullableWithAggregatesFilter<"products">
    created_at?: DateTimeNullableWithAggregatesFilter<"products"> | Date | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"products"> | Date | string | null
    created_by?: StringNullableWithAggregatesFilter<"products"> | string | null
    source_type?: Enumproduct_source_typeNullableWithAggregatesFilter<"products"> | $Enums.product_source_type | null
  }

  export type inventory_movementsWhereInput = {
    AND?: inventory_movementsWhereInput | inventory_movementsWhereInput[]
    OR?: inventory_movementsWhereInput[]
    NOT?: inventory_movementsWhereInput | inventory_movementsWhereInput[]
    id?: UuidFilter<"inventory_movements"> | string
    organization_id?: UuidFilter<"inventory_movements"> | string
    product_id?: UuidFilter<"inventory_movements"> | string
    location_code?: StringNullableFilter<"inventory_movements"> | string | null
    movement_type?: StringFilter<"inventory_movements"> | string
    transaction_type?: StringFilter<"inventory_movements"> | string
    quantity_before?: DecimalFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    quantity_change?: DecimalFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    quantity_after?: DecimalFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    unit_cost?: DecimalNullableFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string | null
    total_cost?: DecimalNullableFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string | null
    reference_type?: StringNullableFilter<"inventory_movements"> | string | null
    reference_id?: StringNullableFilter<"inventory_movements"> | string | null
    reference_number?: StringNullableFilter<"inventory_movements"> | string | null
    source_system?: StringNullableFilter<"inventory_movements"> | string | null
    external_transaction_id?: StringNullableFilter<"inventory_movements"> | string | null
    external_data?: JsonNullableFilter<"inventory_movements">
    movement_date?: DateTimeNullableFilter<"inventory_movements"> | Date | string | null
    posting_date?: DateTimeNullableFilter<"inventory_movements"> | Date | string | null
    created_by?: StringNullableFilter<"inventory_movements"> | string | null
    notes?: StringNullableFilter<"inventory_movements"> | string | null
    created_at?: DateTimeNullableFilter<"inventory_movements"> | Date | string | null
  }

  export type inventory_movementsOrderByWithRelationInput = {
    id?: SortOrder
    organization_id?: SortOrder
    product_id?: SortOrder
    location_code?: SortOrderInput | SortOrder
    movement_type?: SortOrder
    transaction_type?: SortOrder
    quantity_before?: SortOrder
    quantity_change?: SortOrder
    quantity_after?: SortOrder
    unit_cost?: SortOrderInput | SortOrder
    total_cost?: SortOrderInput | SortOrder
    reference_type?: SortOrderInput | SortOrder
    reference_id?: SortOrderInput | SortOrder
    reference_number?: SortOrderInput | SortOrder
    source_system?: SortOrderInput | SortOrder
    external_transaction_id?: SortOrderInput | SortOrder
    external_data?: SortOrderInput | SortOrder
    movement_date?: SortOrderInput | SortOrder
    posting_date?: SortOrderInput | SortOrder
    created_by?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
  }

  export type inventory_movementsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: inventory_movementsWhereInput | inventory_movementsWhereInput[]
    OR?: inventory_movementsWhereInput[]
    NOT?: inventory_movementsWhereInput | inventory_movementsWhereInput[]
    organization_id?: UuidFilter<"inventory_movements"> | string
    product_id?: UuidFilter<"inventory_movements"> | string
    location_code?: StringNullableFilter<"inventory_movements"> | string | null
    movement_type?: StringFilter<"inventory_movements"> | string
    transaction_type?: StringFilter<"inventory_movements"> | string
    quantity_before?: DecimalFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    quantity_change?: DecimalFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    quantity_after?: DecimalFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    unit_cost?: DecimalNullableFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string | null
    total_cost?: DecimalNullableFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string | null
    reference_type?: StringNullableFilter<"inventory_movements"> | string | null
    reference_id?: StringNullableFilter<"inventory_movements"> | string | null
    reference_number?: StringNullableFilter<"inventory_movements"> | string | null
    source_system?: StringNullableFilter<"inventory_movements"> | string | null
    external_transaction_id?: StringNullableFilter<"inventory_movements"> | string | null
    external_data?: JsonNullableFilter<"inventory_movements">
    movement_date?: DateTimeNullableFilter<"inventory_movements"> | Date | string | null
    posting_date?: DateTimeNullableFilter<"inventory_movements"> | Date | string | null
    created_by?: StringNullableFilter<"inventory_movements"> | string | null
    notes?: StringNullableFilter<"inventory_movements"> | string | null
    created_at?: DateTimeNullableFilter<"inventory_movements"> | Date | string | null
  }, "id">

  export type inventory_movementsOrderByWithAggregationInput = {
    id?: SortOrder
    organization_id?: SortOrder
    product_id?: SortOrder
    location_code?: SortOrderInput | SortOrder
    movement_type?: SortOrder
    transaction_type?: SortOrder
    quantity_before?: SortOrder
    quantity_change?: SortOrder
    quantity_after?: SortOrder
    unit_cost?: SortOrderInput | SortOrder
    total_cost?: SortOrderInput | SortOrder
    reference_type?: SortOrderInput | SortOrder
    reference_id?: SortOrderInput | SortOrder
    reference_number?: SortOrderInput | SortOrder
    source_system?: SortOrderInput | SortOrder
    external_transaction_id?: SortOrderInput | SortOrder
    external_data?: SortOrderInput | SortOrder
    movement_date?: SortOrderInput | SortOrder
    posting_date?: SortOrderInput | SortOrder
    created_by?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    created_at?: SortOrderInput | SortOrder
    _count?: inventory_movementsCountOrderByAggregateInput
    _avg?: inventory_movementsAvgOrderByAggregateInput
    _max?: inventory_movementsMaxOrderByAggregateInput
    _min?: inventory_movementsMinOrderByAggregateInput
    _sum?: inventory_movementsSumOrderByAggregateInput
  }

  export type inventory_movementsScalarWhereWithAggregatesInput = {
    AND?: inventory_movementsScalarWhereWithAggregatesInput | inventory_movementsScalarWhereWithAggregatesInput[]
    OR?: inventory_movementsScalarWhereWithAggregatesInput[]
    NOT?: inventory_movementsScalarWhereWithAggregatesInput | inventory_movementsScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"inventory_movements"> | string
    organization_id?: UuidWithAggregatesFilter<"inventory_movements"> | string
    product_id?: UuidWithAggregatesFilter<"inventory_movements"> | string
    location_code?: StringNullableWithAggregatesFilter<"inventory_movements"> | string | null
    movement_type?: StringWithAggregatesFilter<"inventory_movements"> | string
    transaction_type?: StringWithAggregatesFilter<"inventory_movements"> | string
    quantity_before?: DecimalWithAggregatesFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    quantity_change?: DecimalWithAggregatesFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    quantity_after?: DecimalWithAggregatesFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string
    unit_cost?: DecimalNullableWithAggregatesFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string | null
    total_cost?: DecimalNullableWithAggregatesFilter<"inventory_movements"> | Decimal | DecimalJsLike | number | string | null
    reference_type?: StringNullableWithAggregatesFilter<"inventory_movements"> | string | null
    reference_id?: StringNullableWithAggregatesFilter<"inventory_movements"> | string | null
    reference_number?: StringNullableWithAggregatesFilter<"inventory_movements"> | string | null
    source_system?: StringNullableWithAggregatesFilter<"inventory_movements"> | string | null
    external_transaction_id?: StringNullableWithAggregatesFilter<"inventory_movements"> | string | null
    external_data?: JsonNullableWithAggregatesFilter<"inventory_movements">
    movement_date?: DateTimeNullableWithAggregatesFilter<"inventory_movements"> | Date | string | null
    posting_date?: DateTimeNullableWithAggregatesFilter<"inventory_movements"> | Date | string | null
    created_by?: StringNullableWithAggregatesFilter<"inventory_movements"> | string | null
    notes?: StringNullableWithAggregatesFilter<"inventory_movements"> | string | null
    created_at?: DateTimeNullableWithAggregatesFilter<"inventory_movements"> | Date | string | null
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

  export type OnboardingSessionCreateInput = {
    phone_number: string
    step_index: number
    session_id: string
    created_at?: Date | string
    updated_at: Date | string
    status: string
  }

  export type OnboardingSessionUncheckedCreateInput = {
    id?: number
    phone_number: string
    step_index: number
    session_id: string
    created_at?: Date | string
    updated_at: Date | string
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
    updated_at: Date | string
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

  export type business_userCreateInput = {
    businessName: string
    gstin: string
    contactEmail: string
    contactPhone: string
    address: string
    notificationPreference: string
    customerId: string
    platformId?: Decimal | DecimalJsLike | number | string | null
  }

  export type business_userUncheckedCreateInput = {
    businessName: string
    gstin: string
    contactEmail: string
    contactPhone: string
    address: string
    notificationPreference: string
    customerId: string
    id?: number
    platformId?: Decimal | DecimalJsLike | number | string | null
  }

  export type business_userUpdateInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    gstin?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    notificationPreference?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    platformId?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type business_userUncheckedUpdateInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    gstin?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    notificationPreference?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    id?: IntFieldUpdateOperationsInput | number
    platformId?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type business_userCreateManyInput = {
    businessName: string
    gstin: string
    contactEmail: string
    contactPhone: string
    address: string
    notificationPreference: string
    customerId: string
    id?: number
    platformId?: Decimal | DecimalJsLike | number | string | null
  }

  export type business_userUpdateManyMutationInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    gstin?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    notificationPreference?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    platformId?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type business_userUncheckedUpdateManyInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    gstin?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    contactPhone?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    notificationPreference?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    id?: IntFieldUpdateOperationsInput | number
    platformId?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type integrationsCreateInput = {
    name: string
  }

  export type integrationsUncheckedCreateInput = {
    name: string
    id?: number
  }

  export type integrationsUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type integrationsUncheckedUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    id?: IntFieldUpdateOperationsInput | number
  }

  export type integrationsCreateManyInput = {
    name: string
    id?: number
  }

  export type integrationsUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type integrationsUncheckedUpdateManyInput = {
    name?: StringFieldUpdateOperationsInput | string
    id?: IntFieldUpdateOperationsInput | number
  }

  export type zoho_user_credentialCreateInput = {
    access_token?: string | null
    refresh_token?: string | null
    organization_id: string
    business_user_id: number
    client_id?: string | null
    client_secret?: string | null
    expires_in?: number | null
    token_acquired_at?: string | null
    whatsapp_number?: string | null
    code?: string | null
  }

  export type zoho_user_credentialUncheckedCreateInput = {
    access_token?: string | null
    refresh_token?: string | null
    organization_id: string
    business_user_id: number
    id?: number
    client_id?: string | null
    client_secret?: string | null
    expires_in?: number | null
    token_acquired_at?: string | null
    whatsapp_number?: string | null
    code?: string | null
  }

  export type zoho_user_credentialUpdateInput = {
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    organization_id?: StringFieldUpdateOperationsInput | string
    business_user_id?: IntFieldUpdateOperationsInput | number
    client_id?: NullableStringFieldUpdateOperationsInput | string | null
    client_secret?: NullableStringFieldUpdateOperationsInput | string | null
    expires_in?: NullableIntFieldUpdateOperationsInput | number | null
    token_acquired_at?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type zoho_user_credentialUncheckedUpdateInput = {
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    organization_id?: StringFieldUpdateOperationsInput | string
    business_user_id?: IntFieldUpdateOperationsInput | number
    id?: IntFieldUpdateOperationsInput | number
    client_id?: NullableStringFieldUpdateOperationsInput | string | null
    client_secret?: NullableStringFieldUpdateOperationsInput | string | null
    expires_in?: NullableIntFieldUpdateOperationsInput | number | null
    token_acquired_at?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type zoho_user_credentialCreateManyInput = {
    access_token?: string | null
    refresh_token?: string | null
    organization_id: string
    business_user_id: number
    id?: number
    client_id?: string | null
    client_secret?: string | null
    expires_in?: number | null
    token_acquired_at?: string | null
    whatsapp_number?: string | null
    code?: string | null
  }

  export type zoho_user_credentialUpdateManyMutationInput = {
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    organization_id?: StringFieldUpdateOperationsInput | string
    business_user_id?: IntFieldUpdateOperationsInput | number
    client_id?: NullableStringFieldUpdateOperationsInput | string | null
    client_secret?: NullableStringFieldUpdateOperationsInput | string | null
    expires_in?: NullableIntFieldUpdateOperationsInput | number | null
    token_acquired_at?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type zoho_user_credentialUncheckedUpdateManyInput = {
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    organization_id?: StringFieldUpdateOperationsInput | string
    business_user_id?: IntFieldUpdateOperationsInput | number
    id?: IntFieldUpdateOperationsInput | number
    client_id?: NullableStringFieldUpdateOperationsInput | string | null
    client_secret?: NullableStringFieldUpdateOperationsInput | string | null
    expires_in?: NullableIntFieldUpdateOperationsInput | number | null
    token_acquired_at?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_number?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationMessageCreateInput = {
    id?: string
    sessionId: string
    message: string
    fromUser: boolean
    createdAt?: Date | string
  }

  export type ConversationMessageUncheckedCreateInput = {
    id?: string
    sessionId: string
    message: string
    fromUser: boolean
    createdAt?: Date | string
  }

  export type ConversationMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    fromUser?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    fromUser?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationMessageCreateManyInput = {
    id?: string
    sessionId: string
    message: string
    fromUser: boolean
    createdAt?: Date | string
  }

  export type ConversationMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    fromUser?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    fromUser?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationSessionCreateInput = {
    id?: string
    userId: string
    phoneNumber: string
    context: JsonNullValueInput | InputJsonValue
    currentStep: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastEvent?: string | null
    events?: ConversationEventCreateNestedManyWithoutSessionInput
  }

  export type ConversationSessionUncheckedCreateInput = {
    id?: string
    userId: string
    phoneNumber: string
    context: JsonNullValueInput | InputJsonValue
    currentStep: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastEvent?: string | null
    events?: ConversationEventUncheckedCreateNestedManyWithoutSessionInput
  }

  export type ConversationSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    context?: JsonNullValueInput | InputJsonValue
    currentStep?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEvent?: NullableStringFieldUpdateOperationsInput | string | null
    events?: ConversationEventUpdateManyWithoutSessionNestedInput
  }

  export type ConversationSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    context?: JsonNullValueInput | InputJsonValue
    currentStep?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEvent?: NullableStringFieldUpdateOperationsInput | string | null
    events?: ConversationEventUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type ConversationSessionCreateManyInput = {
    id?: string
    userId: string
    phoneNumber: string
    context: JsonNullValueInput | InputJsonValue
    currentStep: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastEvent?: string | null
  }

  export type ConversationSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    context?: JsonNullValueInput | InputJsonValue
    currentStep?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEvent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    context?: JsonNullValueInput | InputJsonValue
    currentStep?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEvent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationEventCreateInput = {
    id?: string
    eventType: string
    stepFrom?: string | null
    stepTo?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    session: ConversationSessionCreateNestedOneWithoutEventsInput
  }

  export type ConversationEventUncheckedCreateInput = {
    id?: string
    sessionId: string
    eventType: string
    stepFrom?: string | null
    stepTo?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ConversationEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    stepFrom?: NullableStringFieldUpdateOperationsInput | string | null
    stepTo?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: ConversationSessionUpdateOneRequiredWithoutEventsNestedInput
  }

  export type ConversationEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    stepFrom?: NullableStringFieldUpdateOperationsInput | string | null
    stepTo?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationEventCreateManyInput = {
    id?: string
    sessionId: string
    eventType: string
    stepFrom?: string | null
    stepTo?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ConversationEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    stepFrom?: NullableStringFieldUpdateOperationsInput | string | null
    stepTo?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    stepFrom?: NullableStringFieldUpdateOperationsInput | string | null
    stepTo?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type inventory_currentCreateInput = {
    id?: string
    organization_id?: string | null
    product_id: string
    location_code?: string | null
    location_name?: string | null
    quantity_on_hand?: Decimal | DecimalJsLike | number | string
    available_stock?: Decimal | DecimalJsLike | number | string
    reserved_stock?: Decimal | DecimalJsLike | number | string
    on_order_stock?: Decimal | DecimalJsLike | number | string
    minimum_stock?: Decimal | DecimalJsLike | number | string
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    reorder_point?: Decimal | DecimalJsLike | number | string | null
    average_cost?: Decimal | DecimalJsLike | number | string
    last_purchase_cost?: Decimal | DecimalJsLike | number | string
    standard_cost?: Decimal | DecimalJsLike | number | string
    total_value?: Decimal | DecimalJsLike | number | string | null
    is_low_stock?: boolean
    is_out_of_stock?: boolean
    needs_reorder?: boolean
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    last_movement_date?: Date | string | null
    last_stock_count_date?: Date | string | null
    version_number?: bigint | number
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type inventory_currentUncheckedCreateInput = {
    id?: string
    organization_id?: string | null
    product_id: string
    location_code?: string | null
    location_name?: string | null
    quantity_on_hand?: Decimal | DecimalJsLike | number | string
    available_stock?: Decimal | DecimalJsLike | number | string
    reserved_stock?: Decimal | DecimalJsLike | number | string
    on_order_stock?: Decimal | DecimalJsLike | number | string
    minimum_stock?: Decimal | DecimalJsLike | number | string
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    reorder_point?: Decimal | DecimalJsLike | number | string | null
    average_cost?: Decimal | DecimalJsLike | number | string
    last_purchase_cost?: Decimal | DecimalJsLike | number | string
    standard_cost?: Decimal | DecimalJsLike | number | string
    total_value?: Decimal | DecimalJsLike | number | string | null
    is_low_stock?: boolean
    is_out_of_stock?: boolean
    needs_reorder?: boolean
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    last_movement_date?: Date | string | null
    last_stock_count_date?: Date | string | null
    version_number?: bigint | number
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type inventory_currentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: NullableStringFieldUpdateOperationsInput | string | null
    product_id?: StringFieldUpdateOperationsInput | string
    location_code?: NullableStringFieldUpdateOperationsInput | string | null
    location_name?: NullableStringFieldUpdateOperationsInput | string | null
    quantity_on_hand?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    available_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reserved_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    on_order_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minimum_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    reorder_point?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    average_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_purchase_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    standard_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_value?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_low_stock?: BoolFieldUpdateOperationsInput | boolean
    is_out_of_stock?: BoolFieldUpdateOperationsInput | boolean
    needs_reorder?: BoolFieldUpdateOperationsInput | boolean
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_movement_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_stock_count_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    version_number?: BigIntFieldUpdateOperationsInput | bigint | number
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type inventory_currentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: NullableStringFieldUpdateOperationsInput | string | null
    product_id?: StringFieldUpdateOperationsInput | string
    location_code?: NullableStringFieldUpdateOperationsInput | string | null
    location_name?: NullableStringFieldUpdateOperationsInput | string | null
    quantity_on_hand?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    available_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reserved_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    on_order_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minimum_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    reorder_point?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    average_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_purchase_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    standard_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_value?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_low_stock?: BoolFieldUpdateOperationsInput | boolean
    is_out_of_stock?: BoolFieldUpdateOperationsInput | boolean
    needs_reorder?: BoolFieldUpdateOperationsInput | boolean
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_movement_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_stock_count_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    version_number?: BigIntFieldUpdateOperationsInput | bigint | number
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type inventory_currentCreateManyInput = {
    id?: string
    organization_id?: string | null
    product_id: string
    location_code?: string | null
    location_name?: string | null
    quantity_on_hand?: Decimal | DecimalJsLike | number | string
    available_stock?: Decimal | DecimalJsLike | number | string
    reserved_stock?: Decimal | DecimalJsLike | number | string
    on_order_stock?: Decimal | DecimalJsLike | number | string
    minimum_stock?: Decimal | DecimalJsLike | number | string
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    reorder_point?: Decimal | DecimalJsLike | number | string | null
    average_cost?: Decimal | DecimalJsLike | number | string
    last_purchase_cost?: Decimal | DecimalJsLike | number | string
    standard_cost?: Decimal | DecimalJsLike | number | string
    total_value?: Decimal | DecimalJsLike | number | string | null
    is_low_stock?: boolean
    is_out_of_stock?: boolean
    needs_reorder?: boolean
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    last_movement_date?: Date | string | null
    last_stock_count_date?: Date | string | null
    version_number?: bigint | number
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type inventory_currentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: NullableStringFieldUpdateOperationsInput | string | null
    product_id?: StringFieldUpdateOperationsInput | string
    location_code?: NullableStringFieldUpdateOperationsInput | string | null
    location_name?: NullableStringFieldUpdateOperationsInput | string | null
    quantity_on_hand?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    available_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reserved_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    on_order_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minimum_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    reorder_point?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    average_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_purchase_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    standard_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_value?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_low_stock?: BoolFieldUpdateOperationsInput | boolean
    is_out_of_stock?: BoolFieldUpdateOperationsInput | boolean
    needs_reorder?: BoolFieldUpdateOperationsInput | boolean
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_movement_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_stock_count_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    version_number?: BigIntFieldUpdateOperationsInput | bigint | number
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type inventory_currentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: NullableStringFieldUpdateOperationsInput | string | null
    product_id?: StringFieldUpdateOperationsInput | string
    location_code?: NullableStringFieldUpdateOperationsInput | string | null
    location_name?: NullableStringFieldUpdateOperationsInput | string | null
    quantity_on_hand?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    available_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reserved_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    on_order_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    minimum_stock?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    reorder_point?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    average_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_purchase_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    standard_cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    total_value?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_low_stock?: BoolFieldUpdateOperationsInput | boolean
    is_out_of_stock?: BoolFieldUpdateOperationsInput | boolean
    needs_reorder?: BoolFieldUpdateOperationsInput | boolean
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_movement_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_stock_count_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    version_number?: BigIntFieldUpdateOperationsInput | bigint | number
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type organizationsCreateInput = {
    id?: string
    name: string
    code?: string | null
    tax_id?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    contact_info?: NullableJsonNullValueInput | InputJsonValue
    settings?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type organizationsUncheckedCreateInput = {
    id?: string
    name: string
    code?: string | null
    tax_id?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    contact_info?: NullableJsonNullValueInput | InputJsonValue
    settings?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type organizationsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    tax_id?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    contact_info?: NullableJsonNullValueInput | InputJsonValue
    settings?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type organizationsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    tax_id?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    contact_info?: NullableJsonNullValueInput | InputJsonValue
    settings?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type organizationsCreateManyInput = {
    id?: string
    name: string
    code?: string | null
    tax_id?: string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    contact_info?: NullableJsonNullValueInput | InputJsonValue
    settings?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type organizationsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    tax_id?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    contact_info?: NullableJsonNullValueInput | InputJsonValue
    settings?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type organizationsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    tax_id?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableJsonNullValueInput | InputJsonValue
    contact_info?: NullableJsonNullValueInput | InputJsonValue
    settings?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type product_categoriesCreateInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    product_categories?: product_categoriesCreateNestedOneWithoutOther_product_categoriesInput
    other_product_categories?: product_categoriesCreateNestedManyWithoutProduct_categoriesInput
    products?: productsCreateNestedManyWithoutProduct_categoriesInput
  }

  export type product_categoriesUncheckedCreateInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    parent_id?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    other_product_categories?: product_categoriesUncheckedCreateNestedManyWithoutProduct_categoriesInput
    products?: productsUncheckedCreateNestedManyWithoutProduct_categoriesInput
  }

  export type product_categoriesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    product_categories?: product_categoriesUpdateOneWithoutOther_product_categoriesNestedInput
    other_product_categories?: product_categoriesUpdateManyWithoutProduct_categoriesNestedInput
    products?: productsUpdateManyWithoutProduct_categoriesNestedInput
  }

  export type product_categoriesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parent_id?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    other_product_categories?: product_categoriesUncheckedUpdateManyWithoutProduct_categoriesNestedInput
    products?: productsUncheckedUpdateManyWithoutProduct_categoriesNestedInput
  }

  export type product_categoriesCreateManyInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    parent_id?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type product_categoriesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type product_categoriesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parent_id?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type productsCreateInput = {
    id: string
    organization_id: string
    name: string
    description?: string | null
    status?: string | null
    product_type?: string | null
    sku?: string | null
    part_number?: string | null
    hsn_code?: string | null
    selling_price?: Decimal | DecimalJsLike | number | string | null
    purchase_price?: Decimal | DecimalJsLike | number | string | null
    mrp?: Decimal | DecimalJsLike | number | string | null
    is_taxable?: boolean | null
    tax_rate?: Decimal | DecimalJsLike | number | string | null
    tax_name?: string | null
    reorder_level?: Decimal | DecimalJsLike | number | string | null
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: string | null
    tally_item_name?: string | null
    custom_item_id?: string | null
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    created_by?: string | null
    source_type?: $Enums.product_source_type | null
    product_categories?: product_categoriesCreateNestedOneWithoutProductsInput
  }

  export type productsUncheckedCreateInput = {
    id: string
    organization_id: string
    category_id?: string | null
    name: string
    description?: string | null
    status?: string | null
    product_type?: string | null
    sku?: string | null
    part_number?: string | null
    hsn_code?: string | null
    selling_price?: Decimal | DecimalJsLike | number | string | null
    purchase_price?: Decimal | DecimalJsLike | number | string | null
    mrp?: Decimal | DecimalJsLike | number | string | null
    is_taxable?: boolean | null
    tax_rate?: Decimal | DecimalJsLike | number | string | null
    tax_name?: string | null
    reorder_level?: Decimal | DecimalJsLike | number | string | null
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: string | null
    tally_item_name?: string | null
    custom_item_id?: string | null
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    created_by?: string | null
    source_type?: $Enums.product_source_type | null
  }

  export type productsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    product_type?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    part_number?: NullableStringFieldUpdateOperationsInput | string | null
    hsn_code?: NullableStringFieldUpdateOperationsInput | string | null
    selling_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    purchase_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mrp?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_taxable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    tax_rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    tax_name?: NullableStringFieldUpdateOperationsInput | string | null
    reorder_level?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_item_name?: NullableStringFieldUpdateOperationsInput | string | null
    custom_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: NullableEnumproduct_source_typeFieldUpdateOperationsInput | $Enums.product_source_type | null
    product_categories?: product_categoriesUpdateOneWithoutProductsNestedInput
  }

  export type productsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    category_id?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    product_type?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    part_number?: NullableStringFieldUpdateOperationsInput | string | null
    hsn_code?: NullableStringFieldUpdateOperationsInput | string | null
    selling_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    purchase_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mrp?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_taxable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    tax_rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    tax_name?: NullableStringFieldUpdateOperationsInput | string | null
    reorder_level?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_item_name?: NullableStringFieldUpdateOperationsInput | string | null
    custom_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: NullableEnumproduct_source_typeFieldUpdateOperationsInput | $Enums.product_source_type | null
  }

  export type productsCreateManyInput = {
    id: string
    organization_id: string
    category_id?: string | null
    name: string
    description?: string | null
    status?: string | null
    product_type?: string | null
    sku?: string | null
    part_number?: string | null
    hsn_code?: string | null
    selling_price?: Decimal | DecimalJsLike | number | string | null
    purchase_price?: Decimal | DecimalJsLike | number | string | null
    mrp?: Decimal | DecimalJsLike | number | string | null
    is_taxable?: boolean | null
    tax_rate?: Decimal | DecimalJsLike | number | string | null
    tax_name?: string | null
    reorder_level?: Decimal | DecimalJsLike | number | string | null
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: string | null
    tally_item_name?: string | null
    custom_item_id?: string | null
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    created_by?: string | null
    source_type?: $Enums.product_source_type | null
  }

  export type productsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    product_type?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    part_number?: NullableStringFieldUpdateOperationsInput | string | null
    hsn_code?: NullableStringFieldUpdateOperationsInput | string | null
    selling_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    purchase_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mrp?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_taxable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    tax_rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    tax_name?: NullableStringFieldUpdateOperationsInput | string | null
    reorder_level?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_item_name?: NullableStringFieldUpdateOperationsInput | string | null
    custom_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: NullableEnumproduct_source_typeFieldUpdateOperationsInput | $Enums.product_source_type | null
  }

  export type productsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    category_id?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    product_type?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    part_number?: NullableStringFieldUpdateOperationsInput | string | null
    hsn_code?: NullableStringFieldUpdateOperationsInput | string | null
    selling_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    purchase_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mrp?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_taxable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    tax_rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    tax_name?: NullableStringFieldUpdateOperationsInput | string | null
    reorder_level?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_item_name?: NullableStringFieldUpdateOperationsInput | string | null
    custom_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: NullableEnumproduct_source_typeFieldUpdateOperationsInput | $Enums.product_source_type | null
  }

  export type inventory_movementsCreateInput = {
    id?: string
    organization_id: string
    product_id: string
    location_code?: string | null
    movement_type: string
    transaction_type: string
    quantity_before: Decimal | DecimalJsLike | number | string
    quantity_change: Decimal | DecimalJsLike | number | string
    quantity_after: Decimal | DecimalJsLike | number | string
    unit_cost?: Decimal | DecimalJsLike | number | string | null
    total_cost?: Decimal | DecimalJsLike | number | string | null
    reference_type?: string | null
    reference_id?: string | null
    reference_number?: string | null
    source_system?: string | null
    external_transaction_id?: string | null
    external_data?: NullableJsonNullValueInput | InputJsonValue
    movement_date?: Date | string | null
    posting_date?: Date | string | null
    created_by?: string | null
    notes?: string | null
    created_at?: Date | string | null
  }

  export type inventory_movementsUncheckedCreateInput = {
    id?: string
    organization_id: string
    product_id: string
    location_code?: string | null
    movement_type: string
    transaction_type: string
    quantity_before: Decimal | DecimalJsLike | number | string
    quantity_change: Decimal | DecimalJsLike | number | string
    quantity_after: Decimal | DecimalJsLike | number | string
    unit_cost?: Decimal | DecimalJsLike | number | string | null
    total_cost?: Decimal | DecimalJsLike | number | string | null
    reference_type?: string | null
    reference_id?: string | null
    reference_number?: string | null
    source_system?: string | null
    external_transaction_id?: string | null
    external_data?: NullableJsonNullValueInput | InputJsonValue
    movement_date?: Date | string | null
    posting_date?: Date | string | null
    created_by?: string | null
    notes?: string | null
    created_at?: Date | string | null
  }

  export type inventory_movementsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    location_code?: NullableStringFieldUpdateOperationsInput | string | null
    movement_type?: StringFieldUpdateOperationsInput | string
    transaction_type?: StringFieldUpdateOperationsInput | string
    quantity_before?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    quantity_change?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    quantity_after?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit_cost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_cost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    reference_type?: NullableStringFieldUpdateOperationsInput | string | null
    reference_id?: NullableStringFieldUpdateOperationsInput | string | null
    reference_number?: NullableStringFieldUpdateOperationsInput | string | null
    source_system?: NullableStringFieldUpdateOperationsInput | string | null
    external_transaction_id?: NullableStringFieldUpdateOperationsInput | string | null
    external_data?: NullableJsonNullValueInput | InputJsonValue
    movement_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    posting_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type inventory_movementsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    location_code?: NullableStringFieldUpdateOperationsInput | string | null
    movement_type?: StringFieldUpdateOperationsInput | string
    transaction_type?: StringFieldUpdateOperationsInput | string
    quantity_before?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    quantity_change?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    quantity_after?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit_cost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_cost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    reference_type?: NullableStringFieldUpdateOperationsInput | string | null
    reference_id?: NullableStringFieldUpdateOperationsInput | string | null
    reference_number?: NullableStringFieldUpdateOperationsInput | string | null
    source_system?: NullableStringFieldUpdateOperationsInput | string | null
    external_transaction_id?: NullableStringFieldUpdateOperationsInput | string | null
    external_data?: NullableJsonNullValueInput | InputJsonValue
    movement_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    posting_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type inventory_movementsCreateManyInput = {
    id?: string
    organization_id: string
    product_id: string
    location_code?: string | null
    movement_type: string
    transaction_type: string
    quantity_before: Decimal | DecimalJsLike | number | string
    quantity_change: Decimal | DecimalJsLike | number | string
    quantity_after: Decimal | DecimalJsLike | number | string
    unit_cost?: Decimal | DecimalJsLike | number | string | null
    total_cost?: Decimal | DecimalJsLike | number | string | null
    reference_type?: string | null
    reference_id?: string | null
    reference_number?: string | null
    source_system?: string | null
    external_transaction_id?: string | null
    external_data?: NullableJsonNullValueInput | InputJsonValue
    movement_date?: Date | string | null
    posting_date?: Date | string | null
    created_by?: string | null
    notes?: string | null
    created_at?: Date | string | null
  }

  export type inventory_movementsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    location_code?: NullableStringFieldUpdateOperationsInput | string | null
    movement_type?: StringFieldUpdateOperationsInput | string
    transaction_type?: StringFieldUpdateOperationsInput | string
    quantity_before?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    quantity_change?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    quantity_after?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit_cost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_cost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    reference_type?: NullableStringFieldUpdateOperationsInput | string | null
    reference_id?: NullableStringFieldUpdateOperationsInput | string | null
    reference_number?: NullableStringFieldUpdateOperationsInput | string | null
    source_system?: NullableStringFieldUpdateOperationsInput | string | null
    external_transaction_id?: NullableStringFieldUpdateOperationsInput | string | null
    external_data?: NullableJsonNullValueInput | InputJsonValue
    movement_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    posting_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type inventory_movementsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    location_code?: NullableStringFieldUpdateOperationsInput | string | null
    movement_type?: StringFieldUpdateOperationsInput | string
    transaction_type?: StringFieldUpdateOperationsInput | string
    quantity_before?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    quantity_change?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    quantity_after?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit_cost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_cost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    reference_type?: NullableStringFieldUpdateOperationsInput | string | null
    reference_id?: NullableStringFieldUpdateOperationsInput | string | null
    reference_number?: NullableStringFieldUpdateOperationsInput | string | null
    source_system?: NullableStringFieldUpdateOperationsInput | string | null
    external_transaction_id?: NullableStringFieldUpdateOperationsInput | string | null
    external_data?: NullableJsonNullValueInput | InputJsonValue
    movement_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    posting_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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

  export type business_userCountOrderByAggregateInput = {
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    customerId?: SortOrder
    id?: SortOrder
    platformId?: SortOrder
  }

  export type business_userAvgOrderByAggregateInput = {
    id?: SortOrder
    platformId?: SortOrder
  }

  export type business_userMaxOrderByAggregateInput = {
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    customerId?: SortOrder
    id?: SortOrder
    platformId?: SortOrder
  }

  export type business_userMinOrderByAggregateInput = {
    businessName?: SortOrder
    gstin?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    address?: SortOrder
    notificationPreference?: SortOrder
    customerId?: SortOrder
    id?: SortOrder
    platformId?: SortOrder
  }

  export type business_userSumOrderByAggregateInput = {
    id?: SortOrder
    platformId?: SortOrder
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

  export type integrationsCountOrderByAggregateInput = {
    name?: SortOrder
    id?: SortOrder
  }

  export type integrationsAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type integrationsMaxOrderByAggregateInput = {
    name?: SortOrder
    id?: SortOrder
  }

  export type integrationsMinOrderByAggregateInput = {
    name?: SortOrder
    id?: SortOrder
  }

  export type integrationsSumOrderByAggregateInput = {
    id?: SortOrder
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

  export type zoho_user_credentialCountOrderByAggregateInput = {
    access_token?: SortOrder
    refresh_token?: SortOrder
    organization_id?: SortOrder
    business_user_id?: SortOrder
    id?: SortOrder
    client_id?: SortOrder
    client_secret?: SortOrder
    expires_in?: SortOrder
    token_acquired_at?: SortOrder
    whatsapp_number?: SortOrder
    code?: SortOrder
  }

  export type zoho_user_credentialAvgOrderByAggregateInput = {
    business_user_id?: SortOrder
    id?: SortOrder
    expires_in?: SortOrder
  }

  export type zoho_user_credentialMaxOrderByAggregateInput = {
    access_token?: SortOrder
    refresh_token?: SortOrder
    organization_id?: SortOrder
    business_user_id?: SortOrder
    id?: SortOrder
    client_id?: SortOrder
    client_secret?: SortOrder
    expires_in?: SortOrder
    token_acquired_at?: SortOrder
    whatsapp_number?: SortOrder
    code?: SortOrder
  }

  export type zoho_user_credentialMinOrderByAggregateInput = {
    access_token?: SortOrder
    refresh_token?: SortOrder
    organization_id?: SortOrder
    business_user_id?: SortOrder
    id?: SortOrder
    client_id?: SortOrder
    client_secret?: SortOrder
    expires_in?: SortOrder
    token_acquired_at?: SortOrder
    whatsapp_number?: SortOrder
    code?: SortOrder
  }

  export type zoho_user_credentialSumOrderByAggregateInput = {
    business_user_id?: SortOrder
    id?: SortOrder
    expires_in?: SortOrder
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

  export type ConversationMessageCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    message?: SortOrder
    fromUser?: SortOrder
    createdAt?: SortOrder
  }

  export type ConversationMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    message?: SortOrder
    fromUser?: SortOrder
    createdAt?: SortOrder
  }

  export type ConversationMessageMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    message?: SortOrder
    fromUser?: SortOrder
    createdAt?: SortOrder
  }

  export type ConversationEventListRelationFilter = {
    every?: ConversationEventWhereInput
    some?: ConversationEventWhereInput
    none?: ConversationEventWhereInput
  }

  export type ConversationEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConversationSessionCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    phoneNumber?: SortOrder
    context?: SortOrder
    currentStep?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastEvent?: SortOrder
  }

  export type ConversationSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    phoneNumber?: SortOrder
    currentStep?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastEvent?: SortOrder
  }

  export type ConversationSessionMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    phoneNumber?: SortOrder
    currentStep?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastEvent?: SortOrder
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

  export type ConversationSessionScalarRelationFilter = {
    is?: ConversationSessionWhereInput
    isNot?: ConversationSessionWhereInput
  }

  export type ConversationEventCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    eventType?: SortOrder
    stepFrom?: SortOrder
    stepTo?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
  }

  export type ConversationEventMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    eventType?: SortOrder
    stepFrom?: SortOrder
    stepTo?: SortOrder
    createdAt?: SortOrder
  }

  export type ConversationEventMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    eventType?: SortOrder
    stepFrom?: SortOrder
    stepTo?: SortOrder
    createdAt?: SortOrder
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

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
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

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type inventory_currentOrganization_idProduct_idLocation_codeCompoundUniqueInput = {
    organization_id: string
    product_id: string
    location_code: string
  }

  export type inventory_currentCountOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    product_id?: SortOrder
    location_code?: SortOrder
    location_name?: SortOrder
    quantity_on_hand?: SortOrder
    available_stock?: SortOrder
    reserved_stock?: SortOrder
    on_order_stock?: SortOrder
    minimum_stock?: SortOrder
    maximum_stock?: SortOrder
    reorder_point?: SortOrder
    average_cost?: SortOrder
    last_purchase_cost?: SortOrder
    standard_cost?: SortOrder
    total_value?: SortOrder
    is_low_stock?: SortOrder
    is_out_of_stock?: SortOrder
    needs_reorder?: SortOrder
    last_synced_zoho?: SortOrder
    last_synced_tally?: SortOrder
    last_synced_custom?: SortOrder
    last_movement_date?: SortOrder
    last_stock_count_date?: SortOrder
    version_number?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type inventory_currentAvgOrderByAggregateInput = {
    quantity_on_hand?: SortOrder
    available_stock?: SortOrder
    reserved_stock?: SortOrder
    on_order_stock?: SortOrder
    minimum_stock?: SortOrder
    maximum_stock?: SortOrder
    reorder_point?: SortOrder
    average_cost?: SortOrder
    last_purchase_cost?: SortOrder
    standard_cost?: SortOrder
    total_value?: SortOrder
    version_number?: SortOrder
  }

  export type inventory_currentMaxOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    product_id?: SortOrder
    location_code?: SortOrder
    location_name?: SortOrder
    quantity_on_hand?: SortOrder
    available_stock?: SortOrder
    reserved_stock?: SortOrder
    on_order_stock?: SortOrder
    minimum_stock?: SortOrder
    maximum_stock?: SortOrder
    reorder_point?: SortOrder
    average_cost?: SortOrder
    last_purchase_cost?: SortOrder
    standard_cost?: SortOrder
    total_value?: SortOrder
    is_low_stock?: SortOrder
    is_out_of_stock?: SortOrder
    needs_reorder?: SortOrder
    last_synced_zoho?: SortOrder
    last_synced_tally?: SortOrder
    last_synced_custom?: SortOrder
    last_movement_date?: SortOrder
    last_stock_count_date?: SortOrder
    version_number?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type inventory_currentMinOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    product_id?: SortOrder
    location_code?: SortOrder
    location_name?: SortOrder
    quantity_on_hand?: SortOrder
    available_stock?: SortOrder
    reserved_stock?: SortOrder
    on_order_stock?: SortOrder
    minimum_stock?: SortOrder
    maximum_stock?: SortOrder
    reorder_point?: SortOrder
    average_cost?: SortOrder
    last_purchase_cost?: SortOrder
    standard_cost?: SortOrder
    total_value?: SortOrder
    is_low_stock?: SortOrder
    is_out_of_stock?: SortOrder
    needs_reorder?: SortOrder
    last_synced_zoho?: SortOrder
    last_synced_tally?: SortOrder
    last_synced_custom?: SortOrder
    last_movement_date?: SortOrder
    last_stock_count_date?: SortOrder
    version_number?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type inventory_currentSumOrderByAggregateInput = {
    quantity_on_hand?: SortOrder
    available_stock?: SortOrder
    reserved_stock?: SortOrder
    on_order_stock?: SortOrder
    minimum_stock?: SortOrder
    maximum_stock?: SortOrder
    reorder_point?: SortOrder
    average_cost?: SortOrder
    last_purchase_cost?: SortOrder
    standard_cost?: SortOrder
    total_value?: SortOrder
    version_number?: SortOrder
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

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type organizationsCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    tax_id?: SortOrder
    address?: SortOrder
    contact_info?: SortOrder
    settings?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type organizationsMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    tax_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type organizationsMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    tax_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type Product_categoriesNullableScalarRelationFilter = {
    is?: product_categoriesWhereInput | null
    isNot?: product_categoriesWhereInput | null
  }

  export type Product_categoriesListRelationFilter = {
    every?: product_categoriesWhereInput
    some?: product_categoriesWhereInput
    none?: product_categoriesWhereInput
  }

  export type ProductsListRelationFilter = {
    every?: productsWhereInput
    some?: productsWhereInput
    none?: productsWhereInput
  }

  export type product_categoriesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type productsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type product_categoriesOrganization_idNameCompoundUniqueInput = {
    organization_id: string
    name: string
  }

  export type product_categoriesCountOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    parent_id?: SortOrder
    level?: SortOrder
    sort_order?: SortOrder
    is_active?: SortOrder
    zoho_group_id?: SortOrder
    tally_category?: SortOrder
    custom_category_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type product_categoriesAvgOrderByAggregateInput = {
    level?: SortOrder
    sort_order?: SortOrder
  }

  export type product_categoriesMaxOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    parent_id?: SortOrder
    level?: SortOrder
    sort_order?: SortOrder
    is_active?: SortOrder
    zoho_group_id?: SortOrder
    tally_category?: SortOrder
    custom_category_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type product_categoriesMinOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    parent_id?: SortOrder
    level?: SortOrder
    sort_order?: SortOrder
    is_active?: SortOrder
    zoho_group_id?: SortOrder
    tally_category?: SortOrder
    custom_category_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type product_categoriesSumOrderByAggregateInput = {
    level?: SortOrder
    sort_order?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type Enumproduct_source_typeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.product_source_type | Enumproduct_source_typeFieldRefInput<$PrismaModel> | null
    in?: $Enums.product_source_type[] | ListEnumproduct_source_typeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.product_source_type[] | ListEnumproduct_source_typeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumproduct_source_typeNullableFilter<$PrismaModel> | $Enums.product_source_type | null
  }

  export type productsCountOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    category_id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    product_type?: SortOrder
    sku?: SortOrder
    part_number?: SortOrder
    hsn_code?: SortOrder
    selling_price?: SortOrder
    purchase_price?: SortOrder
    mrp?: SortOrder
    is_taxable?: SortOrder
    tax_rate?: SortOrder
    tax_name?: SortOrder
    reorder_level?: SortOrder
    maximum_stock?: SortOrder
    attributes?: SortOrder
    images?: SortOrder
    zoho_item_id?: SortOrder
    tally_item_name?: SortOrder
    custom_item_id?: SortOrder
    last_synced_zoho?: SortOrder
    last_synced_tally?: SortOrder
    last_synced_custom?: SortOrder
    sync_errors?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    created_by?: SortOrder
    source_type?: SortOrder
  }

  export type productsAvgOrderByAggregateInput = {
    selling_price?: SortOrder
    purchase_price?: SortOrder
    mrp?: SortOrder
    tax_rate?: SortOrder
    reorder_level?: SortOrder
    maximum_stock?: SortOrder
  }

  export type productsMaxOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    category_id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    product_type?: SortOrder
    sku?: SortOrder
    part_number?: SortOrder
    hsn_code?: SortOrder
    selling_price?: SortOrder
    purchase_price?: SortOrder
    mrp?: SortOrder
    is_taxable?: SortOrder
    tax_rate?: SortOrder
    tax_name?: SortOrder
    reorder_level?: SortOrder
    maximum_stock?: SortOrder
    zoho_item_id?: SortOrder
    tally_item_name?: SortOrder
    custom_item_id?: SortOrder
    last_synced_zoho?: SortOrder
    last_synced_tally?: SortOrder
    last_synced_custom?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    created_by?: SortOrder
    source_type?: SortOrder
  }

  export type productsMinOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    category_id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    status?: SortOrder
    product_type?: SortOrder
    sku?: SortOrder
    part_number?: SortOrder
    hsn_code?: SortOrder
    selling_price?: SortOrder
    purchase_price?: SortOrder
    mrp?: SortOrder
    is_taxable?: SortOrder
    tax_rate?: SortOrder
    tax_name?: SortOrder
    reorder_level?: SortOrder
    maximum_stock?: SortOrder
    zoho_item_id?: SortOrder
    tally_item_name?: SortOrder
    custom_item_id?: SortOrder
    last_synced_zoho?: SortOrder
    last_synced_tally?: SortOrder
    last_synced_custom?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    created_by?: SortOrder
    source_type?: SortOrder
  }

  export type productsSumOrderByAggregateInput = {
    selling_price?: SortOrder
    purchase_price?: SortOrder
    mrp?: SortOrder
    tax_rate?: SortOrder
    reorder_level?: SortOrder
    maximum_stock?: SortOrder
  }

  export type Enumproduct_source_typeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.product_source_type | Enumproduct_source_typeFieldRefInput<$PrismaModel> | null
    in?: $Enums.product_source_type[] | ListEnumproduct_source_typeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.product_source_type[] | ListEnumproduct_source_typeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumproduct_source_typeNullableWithAggregatesFilter<$PrismaModel> | $Enums.product_source_type | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumproduct_source_typeNullableFilter<$PrismaModel>
    _max?: NestedEnumproduct_source_typeNullableFilter<$PrismaModel>
  }

  export type inventory_movementsCountOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    product_id?: SortOrder
    location_code?: SortOrder
    movement_type?: SortOrder
    transaction_type?: SortOrder
    quantity_before?: SortOrder
    quantity_change?: SortOrder
    quantity_after?: SortOrder
    unit_cost?: SortOrder
    total_cost?: SortOrder
    reference_type?: SortOrder
    reference_id?: SortOrder
    reference_number?: SortOrder
    source_system?: SortOrder
    external_transaction_id?: SortOrder
    external_data?: SortOrder
    movement_date?: SortOrder
    posting_date?: SortOrder
    created_by?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
  }

  export type inventory_movementsAvgOrderByAggregateInput = {
    quantity_before?: SortOrder
    quantity_change?: SortOrder
    quantity_after?: SortOrder
    unit_cost?: SortOrder
    total_cost?: SortOrder
  }

  export type inventory_movementsMaxOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    product_id?: SortOrder
    location_code?: SortOrder
    movement_type?: SortOrder
    transaction_type?: SortOrder
    quantity_before?: SortOrder
    quantity_change?: SortOrder
    quantity_after?: SortOrder
    unit_cost?: SortOrder
    total_cost?: SortOrder
    reference_type?: SortOrder
    reference_id?: SortOrder
    reference_number?: SortOrder
    source_system?: SortOrder
    external_transaction_id?: SortOrder
    movement_date?: SortOrder
    posting_date?: SortOrder
    created_by?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
  }

  export type inventory_movementsMinOrderByAggregateInput = {
    id?: SortOrder
    organization_id?: SortOrder
    product_id?: SortOrder
    location_code?: SortOrder
    movement_type?: SortOrder
    transaction_type?: SortOrder
    quantity_before?: SortOrder
    quantity_change?: SortOrder
    quantity_after?: SortOrder
    unit_cost?: SortOrder
    total_cost?: SortOrder
    reference_type?: SortOrder
    reference_id?: SortOrder
    reference_number?: SortOrder
    source_system?: SortOrder
    external_transaction_id?: SortOrder
    movement_date?: SortOrder
    posting_date?: SortOrder
    created_by?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
  }

  export type inventory_movementsSumOrderByAggregateInput = {
    quantity_before?: SortOrder
    quantity_change?: SortOrder
    quantity_after?: SortOrder
    unit_cost?: SortOrder
    total_cost?: SortOrder
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

  export type ConversationEventCreateNestedManyWithoutSessionInput = {
    create?: XOR<ConversationEventCreateWithoutSessionInput, ConversationEventUncheckedCreateWithoutSessionInput> | ConversationEventCreateWithoutSessionInput[] | ConversationEventUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: ConversationEventCreateOrConnectWithoutSessionInput | ConversationEventCreateOrConnectWithoutSessionInput[]
    createMany?: ConversationEventCreateManySessionInputEnvelope
    connect?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
  }

  export type ConversationEventUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<ConversationEventCreateWithoutSessionInput, ConversationEventUncheckedCreateWithoutSessionInput> | ConversationEventCreateWithoutSessionInput[] | ConversationEventUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: ConversationEventCreateOrConnectWithoutSessionInput | ConversationEventCreateOrConnectWithoutSessionInput[]
    createMany?: ConversationEventCreateManySessionInputEnvelope
    connect?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
  }

  export type ConversationEventUpdateManyWithoutSessionNestedInput = {
    create?: XOR<ConversationEventCreateWithoutSessionInput, ConversationEventUncheckedCreateWithoutSessionInput> | ConversationEventCreateWithoutSessionInput[] | ConversationEventUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: ConversationEventCreateOrConnectWithoutSessionInput | ConversationEventCreateOrConnectWithoutSessionInput[]
    upsert?: ConversationEventUpsertWithWhereUniqueWithoutSessionInput | ConversationEventUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: ConversationEventCreateManySessionInputEnvelope
    set?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
    disconnect?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
    delete?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
    connect?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
    update?: ConversationEventUpdateWithWhereUniqueWithoutSessionInput | ConversationEventUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: ConversationEventUpdateManyWithWhereWithoutSessionInput | ConversationEventUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: ConversationEventScalarWhereInput | ConversationEventScalarWhereInput[]
  }

  export type ConversationEventUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<ConversationEventCreateWithoutSessionInput, ConversationEventUncheckedCreateWithoutSessionInput> | ConversationEventCreateWithoutSessionInput[] | ConversationEventUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: ConversationEventCreateOrConnectWithoutSessionInput | ConversationEventCreateOrConnectWithoutSessionInput[]
    upsert?: ConversationEventUpsertWithWhereUniqueWithoutSessionInput | ConversationEventUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: ConversationEventCreateManySessionInputEnvelope
    set?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
    disconnect?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
    delete?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
    connect?: ConversationEventWhereUniqueInput | ConversationEventWhereUniqueInput[]
    update?: ConversationEventUpdateWithWhereUniqueWithoutSessionInput | ConversationEventUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: ConversationEventUpdateManyWithWhereWithoutSessionInput | ConversationEventUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: ConversationEventScalarWhereInput | ConversationEventScalarWhereInput[]
  }

  export type ConversationSessionCreateNestedOneWithoutEventsInput = {
    create?: XOR<ConversationSessionCreateWithoutEventsInput, ConversationSessionUncheckedCreateWithoutEventsInput>
    connectOrCreate?: ConversationSessionCreateOrConnectWithoutEventsInput
    connect?: ConversationSessionWhereUniqueInput
  }

  export type ConversationSessionUpdateOneRequiredWithoutEventsNestedInput = {
    create?: XOR<ConversationSessionCreateWithoutEventsInput, ConversationSessionUncheckedCreateWithoutEventsInput>
    connectOrCreate?: ConversationSessionCreateOrConnectWithoutEventsInput
    upsert?: ConversationSessionUpsertWithoutEventsInput
    connect?: ConversationSessionWhereUniqueInput
    update?: XOR<XOR<ConversationSessionUpdateToOneWithWhereWithoutEventsInput, ConversationSessionUpdateWithoutEventsInput>, ConversationSessionUncheckedUpdateWithoutEventsInput>
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type product_categoriesCreateNestedOneWithoutOther_product_categoriesInput = {
    create?: XOR<product_categoriesCreateWithoutOther_product_categoriesInput, product_categoriesUncheckedCreateWithoutOther_product_categoriesInput>
    connectOrCreate?: product_categoriesCreateOrConnectWithoutOther_product_categoriesInput
    connect?: product_categoriesWhereUniqueInput
  }

  export type product_categoriesCreateNestedManyWithoutProduct_categoriesInput = {
    create?: XOR<product_categoriesCreateWithoutProduct_categoriesInput, product_categoriesUncheckedCreateWithoutProduct_categoriesInput> | product_categoriesCreateWithoutProduct_categoriesInput[] | product_categoriesUncheckedCreateWithoutProduct_categoriesInput[]
    connectOrCreate?: product_categoriesCreateOrConnectWithoutProduct_categoriesInput | product_categoriesCreateOrConnectWithoutProduct_categoriesInput[]
    createMany?: product_categoriesCreateManyProduct_categoriesInputEnvelope
    connect?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
  }

  export type productsCreateNestedManyWithoutProduct_categoriesInput = {
    create?: XOR<productsCreateWithoutProduct_categoriesInput, productsUncheckedCreateWithoutProduct_categoriesInput> | productsCreateWithoutProduct_categoriesInput[] | productsUncheckedCreateWithoutProduct_categoriesInput[]
    connectOrCreate?: productsCreateOrConnectWithoutProduct_categoriesInput | productsCreateOrConnectWithoutProduct_categoriesInput[]
    createMany?: productsCreateManyProduct_categoriesInputEnvelope
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
  }

  export type product_categoriesUncheckedCreateNestedManyWithoutProduct_categoriesInput = {
    create?: XOR<product_categoriesCreateWithoutProduct_categoriesInput, product_categoriesUncheckedCreateWithoutProduct_categoriesInput> | product_categoriesCreateWithoutProduct_categoriesInput[] | product_categoriesUncheckedCreateWithoutProduct_categoriesInput[]
    connectOrCreate?: product_categoriesCreateOrConnectWithoutProduct_categoriesInput | product_categoriesCreateOrConnectWithoutProduct_categoriesInput[]
    createMany?: product_categoriesCreateManyProduct_categoriesInputEnvelope
    connect?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
  }

  export type productsUncheckedCreateNestedManyWithoutProduct_categoriesInput = {
    create?: XOR<productsCreateWithoutProduct_categoriesInput, productsUncheckedCreateWithoutProduct_categoriesInput> | productsCreateWithoutProduct_categoriesInput[] | productsUncheckedCreateWithoutProduct_categoriesInput[]
    connectOrCreate?: productsCreateOrConnectWithoutProduct_categoriesInput | productsCreateOrConnectWithoutProduct_categoriesInput[]
    createMany?: productsCreateManyProduct_categoriesInputEnvelope
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type product_categoriesUpdateOneWithoutOther_product_categoriesNestedInput = {
    create?: XOR<product_categoriesCreateWithoutOther_product_categoriesInput, product_categoriesUncheckedCreateWithoutOther_product_categoriesInput>
    connectOrCreate?: product_categoriesCreateOrConnectWithoutOther_product_categoriesInput
    upsert?: product_categoriesUpsertWithoutOther_product_categoriesInput
    disconnect?: product_categoriesWhereInput | boolean
    delete?: product_categoriesWhereInput | boolean
    connect?: product_categoriesWhereUniqueInput
    update?: XOR<XOR<product_categoriesUpdateToOneWithWhereWithoutOther_product_categoriesInput, product_categoriesUpdateWithoutOther_product_categoriesInput>, product_categoriesUncheckedUpdateWithoutOther_product_categoriesInput>
  }

  export type product_categoriesUpdateManyWithoutProduct_categoriesNestedInput = {
    create?: XOR<product_categoriesCreateWithoutProduct_categoriesInput, product_categoriesUncheckedCreateWithoutProduct_categoriesInput> | product_categoriesCreateWithoutProduct_categoriesInput[] | product_categoriesUncheckedCreateWithoutProduct_categoriesInput[]
    connectOrCreate?: product_categoriesCreateOrConnectWithoutProduct_categoriesInput | product_categoriesCreateOrConnectWithoutProduct_categoriesInput[]
    upsert?: product_categoriesUpsertWithWhereUniqueWithoutProduct_categoriesInput | product_categoriesUpsertWithWhereUniqueWithoutProduct_categoriesInput[]
    createMany?: product_categoriesCreateManyProduct_categoriesInputEnvelope
    set?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
    disconnect?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
    delete?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
    connect?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
    update?: product_categoriesUpdateWithWhereUniqueWithoutProduct_categoriesInput | product_categoriesUpdateWithWhereUniqueWithoutProduct_categoriesInput[]
    updateMany?: product_categoriesUpdateManyWithWhereWithoutProduct_categoriesInput | product_categoriesUpdateManyWithWhereWithoutProduct_categoriesInput[]
    deleteMany?: product_categoriesScalarWhereInput | product_categoriesScalarWhereInput[]
  }

  export type productsUpdateManyWithoutProduct_categoriesNestedInput = {
    create?: XOR<productsCreateWithoutProduct_categoriesInput, productsUncheckedCreateWithoutProduct_categoriesInput> | productsCreateWithoutProduct_categoriesInput[] | productsUncheckedCreateWithoutProduct_categoriesInput[]
    connectOrCreate?: productsCreateOrConnectWithoutProduct_categoriesInput | productsCreateOrConnectWithoutProduct_categoriesInput[]
    upsert?: productsUpsertWithWhereUniqueWithoutProduct_categoriesInput | productsUpsertWithWhereUniqueWithoutProduct_categoriesInput[]
    createMany?: productsCreateManyProduct_categoriesInputEnvelope
    set?: productsWhereUniqueInput | productsWhereUniqueInput[]
    disconnect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    delete?: productsWhereUniqueInput | productsWhereUniqueInput[]
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    update?: productsUpdateWithWhereUniqueWithoutProduct_categoriesInput | productsUpdateWithWhereUniqueWithoutProduct_categoriesInput[]
    updateMany?: productsUpdateManyWithWhereWithoutProduct_categoriesInput | productsUpdateManyWithWhereWithoutProduct_categoriesInput[]
    deleteMany?: productsScalarWhereInput | productsScalarWhereInput[]
  }

  export type product_categoriesUncheckedUpdateManyWithoutProduct_categoriesNestedInput = {
    create?: XOR<product_categoriesCreateWithoutProduct_categoriesInput, product_categoriesUncheckedCreateWithoutProduct_categoriesInput> | product_categoriesCreateWithoutProduct_categoriesInput[] | product_categoriesUncheckedCreateWithoutProduct_categoriesInput[]
    connectOrCreate?: product_categoriesCreateOrConnectWithoutProduct_categoriesInput | product_categoriesCreateOrConnectWithoutProduct_categoriesInput[]
    upsert?: product_categoriesUpsertWithWhereUniqueWithoutProduct_categoriesInput | product_categoriesUpsertWithWhereUniqueWithoutProduct_categoriesInput[]
    createMany?: product_categoriesCreateManyProduct_categoriesInputEnvelope
    set?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
    disconnect?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
    delete?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
    connect?: product_categoriesWhereUniqueInput | product_categoriesWhereUniqueInput[]
    update?: product_categoriesUpdateWithWhereUniqueWithoutProduct_categoriesInput | product_categoriesUpdateWithWhereUniqueWithoutProduct_categoriesInput[]
    updateMany?: product_categoriesUpdateManyWithWhereWithoutProduct_categoriesInput | product_categoriesUpdateManyWithWhereWithoutProduct_categoriesInput[]
    deleteMany?: product_categoriesScalarWhereInput | product_categoriesScalarWhereInput[]
  }

  export type productsUncheckedUpdateManyWithoutProduct_categoriesNestedInput = {
    create?: XOR<productsCreateWithoutProduct_categoriesInput, productsUncheckedCreateWithoutProduct_categoriesInput> | productsCreateWithoutProduct_categoriesInput[] | productsUncheckedCreateWithoutProduct_categoriesInput[]
    connectOrCreate?: productsCreateOrConnectWithoutProduct_categoriesInput | productsCreateOrConnectWithoutProduct_categoriesInput[]
    upsert?: productsUpsertWithWhereUniqueWithoutProduct_categoriesInput | productsUpsertWithWhereUniqueWithoutProduct_categoriesInput[]
    createMany?: productsCreateManyProduct_categoriesInputEnvelope
    set?: productsWhereUniqueInput | productsWhereUniqueInput[]
    disconnect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    delete?: productsWhereUniqueInput | productsWhereUniqueInput[]
    connect?: productsWhereUniqueInput | productsWhereUniqueInput[]
    update?: productsUpdateWithWhereUniqueWithoutProduct_categoriesInput | productsUpdateWithWhereUniqueWithoutProduct_categoriesInput[]
    updateMany?: productsUpdateManyWithWhereWithoutProduct_categoriesInput | productsUpdateManyWithWhereWithoutProduct_categoriesInput[]
    deleteMany?: productsScalarWhereInput | productsScalarWhereInput[]
  }

  export type product_categoriesCreateNestedOneWithoutProductsInput = {
    create?: XOR<product_categoriesCreateWithoutProductsInput, product_categoriesUncheckedCreateWithoutProductsInput>
    connectOrCreate?: product_categoriesCreateOrConnectWithoutProductsInput
    connect?: product_categoriesWhereUniqueInput
  }

  export type NullableEnumproduct_source_typeFieldUpdateOperationsInput = {
    set?: $Enums.product_source_type | null
  }

  export type product_categoriesUpdateOneWithoutProductsNestedInput = {
    create?: XOR<product_categoriesCreateWithoutProductsInput, product_categoriesUncheckedCreateWithoutProductsInput>
    connectOrCreate?: product_categoriesCreateOrConnectWithoutProductsInput
    upsert?: product_categoriesUpsertWithoutProductsInput
    disconnect?: product_categoriesWhereInput | boolean
    delete?: product_categoriesWhereInput | boolean
    connect?: product_categoriesWhereUniqueInput
    update?: XOR<XOR<product_categoriesUpdateToOneWithWhereWithoutProductsInput, product_categoriesUpdateWithoutProductsInput>, product_categoriesUncheckedUpdateWithoutProductsInput>
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

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
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

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
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

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
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

  export type NestedEnumproduct_source_typeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.product_source_type | Enumproduct_source_typeFieldRefInput<$PrismaModel> | null
    in?: $Enums.product_source_type[] | ListEnumproduct_source_typeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.product_source_type[] | ListEnumproduct_source_typeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumproduct_source_typeNullableFilter<$PrismaModel> | $Enums.product_source_type | null
  }

  export type NestedEnumproduct_source_typeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.product_source_type | Enumproduct_source_typeFieldRefInput<$PrismaModel> | null
    in?: $Enums.product_source_type[] | ListEnumproduct_source_typeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.product_source_type[] | ListEnumproduct_source_typeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumproduct_source_typeNullableWithAggregatesFilter<$PrismaModel> | $Enums.product_source_type | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumproduct_source_typeNullableFilter<$PrismaModel>
    _max?: NestedEnumproduct_source_typeNullableFilter<$PrismaModel>
  }

  export type ConversationEventCreateWithoutSessionInput = {
    id?: string
    eventType: string
    stepFrom?: string | null
    stepTo?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ConversationEventUncheckedCreateWithoutSessionInput = {
    id?: string
    eventType: string
    stepFrom?: string | null
    stepTo?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ConversationEventCreateOrConnectWithoutSessionInput = {
    where: ConversationEventWhereUniqueInput
    create: XOR<ConversationEventCreateWithoutSessionInput, ConversationEventUncheckedCreateWithoutSessionInput>
  }

  export type ConversationEventCreateManySessionInputEnvelope = {
    data: ConversationEventCreateManySessionInput | ConversationEventCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type ConversationEventUpsertWithWhereUniqueWithoutSessionInput = {
    where: ConversationEventWhereUniqueInput
    update: XOR<ConversationEventUpdateWithoutSessionInput, ConversationEventUncheckedUpdateWithoutSessionInput>
    create: XOR<ConversationEventCreateWithoutSessionInput, ConversationEventUncheckedCreateWithoutSessionInput>
  }

  export type ConversationEventUpdateWithWhereUniqueWithoutSessionInput = {
    where: ConversationEventWhereUniqueInput
    data: XOR<ConversationEventUpdateWithoutSessionInput, ConversationEventUncheckedUpdateWithoutSessionInput>
  }

  export type ConversationEventUpdateManyWithWhereWithoutSessionInput = {
    where: ConversationEventScalarWhereInput
    data: XOR<ConversationEventUpdateManyMutationInput, ConversationEventUncheckedUpdateManyWithoutSessionInput>
  }

  export type ConversationEventScalarWhereInput = {
    AND?: ConversationEventScalarWhereInput | ConversationEventScalarWhereInput[]
    OR?: ConversationEventScalarWhereInput[]
    NOT?: ConversationEventScalarWhereInput | ConversationEventScalarWhereInput[]
    id?: StringFilter<"ConversationEvent"> | string
    sessionId?: StringFilter<"ConversationEvent"> | string
    eventType?: StringFilter<"ConversationEvent"> | string
    stepFrom?: StringNullableFilter<"ConversationEvent"> | string | null
    stepTo?: StringNullableFilter<"ConversationEvent"> | string | null
    payload?: JsonNullableFilter<"ConversationEvent">
    createdAt?: DateTimeFilter<"ConversationEvent"> | Date | string
  }

  export type ConversationSessionCreateWithoutEventsInput = {
    id?: string
    userId: string
    phoneNumber: string
    context: JsonNullValueInput | InputJsonValue
    currentStep: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastEvent?: string | null
  }

  export type ConversationSessionUncheckedCreateWithoutEventsInput = {
    id?: string
    userId: string
    phoneNumber: string
    context: JsonNullValueInput | InputJsonValue
    currentStep: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastEvent?: string | null
  }

  export type ConversationSessionCreateOrConnectWithoutEventsInput = {
    where: ConversationSessionWhereUniqueInput
    create: XOR<ConversationSessionCreateWithoutEventsInput, ConversationSessionUncheckedCreateWithoutEventsInput>
  }

  export type ConversationSessionUpsertWithoutEventsInput = {
    update: XOR<ConversationSessionUpdateWithoutEventsInput, ConversationSessionUncheckedUpdateWithoutEventsInput>
    create: XOR<ConversationSessionCreateWithoutEventsInput, ConversationSessionUncheckedCreateWithoutEventsInput>
    where?: ConversationSessionWhereInput
  }

  export type ConversationSessionUpdateToOneWithWhereWithoutEventsInput = {
    where?: ConversationSessionWhereInput
    data: XOR<ConversationSessionUpdateWithoutEventsInput, ConversationSessionUncheckedUpdateWithoutEventsInput>
  }

  export type ConversationSessionUpdateWithoutEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    context?: JsonNullValueInput | InputJsonValue
    currentStep?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEvent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationSessionUncheckedUpdateWithoutEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    context?: JsonNullValueInput | InputJsonValue
    currentStep?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEvent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type product_categoriesCreateWithoutOther_product_categoriesInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    product_categories?: product_categoriesCreateNestedOneWithoutOther_product_categoriesInput
    products?: productsCreateNestedManyWithoutProduct_categoriesInput
  }

  export type product_categoriesUncheckedCreateWithoutOther_product_categoriesInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    parent_id?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    products?: productsUncheckedCreateNestedManyWithoutProduct_categoriesInput
  }

  export type product_categoriesCreateOrConnectWithoutOther_product_categoriesInput = {
    where: product_categoriesWhereUniqueInput
    create: XOR<product_categoriesCreateWithoutOther_product_categoriesInput, product_categoriesUncheckedCreateWithoutOther_product_categoriesInput>
  }

  export type product_categoriesCreateWithoutProduct_categoriesInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    other_product_categories?: product_categoriesCreateNestedManyWithoutProduct_categoriesInput
    products?: productsCreateNestedManyWithoutProduct_categoriesInput
  }

  export type product_categoriesUncheckedCreateWithoutProduct_categoriesInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    other_product_categories?: product_categoriesUncheckedCreateNestedManyWithoutProduct_categoriesInput
    products?: productsUncheckedCreateNestedManyWithoutProduct_categoriesInput
  }

  export type product_categoriesCreateOrConnectWithoutProduct_categoriesInput = {
    where: product_categoriesWhereUniqueInput
    create: XOR<product_categoriesCreateWithoutProduct_categoriesInput, product_categoriesUncheckedCreateWithoutProduct_categoriesInput>
  }

  export type product_categoriesCreateManyProduct_categoriesInputEnvelope = {
    data: product_categoriesCreateManyProduct_categoriesInput | product_categoriesCreateManyProduct_categoriesInput[]
    skipDuplicates?: boolean
  }

  export type productsCreateWithoutProduct_categoriesInput = {
    id: string
    organization_id: string
    name: string
    description?: string | null
    status?: string | null
    product_type?: string | null
    sku?: string | null
    part_number?: string | null
    hsn_code?: string | null
    selling_price?: Decimal | DecimalJsLike | number | string | null
    purchase_price?: Decimal | DecimalJsLike | number | string | null
    mrp?: Decimal | DecimalJsLike | number | string | null
    is_taxable?: boolean | null
    tax_rate?: Decimal | DecimalJsLike | number | string | null
    tax_name?: string | null
    reorder_level?: Decimal | DecimalJsLike | number | string | null
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: string | null
    tally_item_name?: string | null
    custom_item_id?: string | null
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    created_by?: string | null
    source_type?: $Enums.product_source_type | null
  }

  export type productsUncheckedCreateWithoutProduct_categoriesInput = {
    id: string
    organization_id: string
    name: string
    description?: string | null
    status?: string | null
    product_type?: string | null
    sku?: string | null
    part_number?: string | null
    hsn_code?: string | null
    selling_price?: Decimal | DecimalJsLike | number | string | null
    purchase_price?: Decimal | DecimalJsLike | number | string | null
    mrp?: Decimal | DecimalJsLike | number | string | null
    is_taxable?: boolean | null
    tax_rate?: Decimal | DecimalJsLike | number | string | null
    tax_name?: string | null
    reorder_level?: Decimal | DecimalJsLike | number | string | null
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: string | null
    tally_item_name?: string | null
    custom_item_id?: string | null
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    created_by?: string | null
    source_type?: $Enums.product_source_type | null
  }

  export type productsCreateOrConnectWithoutProduct_categoriesInput = {
    where: productsWhereUniqueInput
    create: XOR<productsCreateWithoutProduct_categoriesInput, productsUncheckedCreateWithoutProduct_categoriesInput>
  }

  export type productsCreateManyProduct_categoriesInputEnvelope = {
    data: productsCreateManyProduct_categoriesInput | productsCreateManyProduct_categoriesInput[]
    skipDuplicates?: boolean
  }

  export type product_categoriesUpsertWithoutOther_product_categoriesInput = {
    update: XOR<product_categoriesUpdateWithoutOther_product_categoriesInput, product_categoriesUncheckedUpdateWithoutOther_product_categoriesInput>
    create: XOR<product_categoriesCreateWithoutOther_product_categoriesInput, product_categoriesUncheckedCreateWithoutOther_product_categoriesInput>
    where?: product_categoriesWhereInput
  }

  export type product_categoriesUpdateToOneWithWhereWithoutOther_product_categoriesInput = {
    where?: product_categoriesWhereInput
    data: XOR<product_categoriesUpdateWithoutOther_product_categoriesInput, product_categoriesUncheckedUpdateWithoutOther_product_categoriesInput>
  }

  export type product_categoriesUpdateWithoutOther_product_categoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    product_categories?: product_categoriesUpdateOneWithoutOther_product_categoriesNestedInput
    products?: productsUpdateManyWithoutProduct_categoriesNestedInput
  }

  export type product_categoriesUncheckedUpdateWithoutOther_product_categoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parent_id?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    products?: productsUncheckedUpdateManyWithoutProduct_categoriesNestedInput
  }

  export type product_categoriesUpsertWithWhereUniqueWithoutProduct_categoriesInput = {
    where: product_categoriesWhereUniqueInput
    update: XOR<product_categoriesUpdateWithoutProduct_categoriesInput, product_categoriesUncheckedUpdateWithoutProduct_categoriesInput>
    create: XOR<product_categoriesCreateWithoutProduct_categoriesInput, product_categoriesUncheckedCreateWithoutProduct_categoriesInput>
  }

  export type product_categoriesUpdateWithWhereUniqueWithoutProduct_categoriesInput = {
    where: product_categoriesWhereUniqueInput
    data: XOR<product_categoriesUpdateWithoutProduct_categoriesInput, product_categoriesUncheckedUpdateWithoutProduct_categoriesInput>
  }

  export type product_categoriesUpdateManyWithWhereWithoutProduct_categoriesInput = {
    where: product_categoriesScalarWhereInput
    data: XOR<product_categoriesUpdateManyMutationInput, product_categoriesUncheckedUpdateManyWithoutProduct_categoriesInput>
  }

  export type product_categoriesScalarWhereInput = {
    AND?: product_categoriesScalarWhereInput | product_categoriesScalarWhereInput[]
    OR?: product_categoriesScalarWhereInput[]
    NOT?: product_categoriesScalarWhereInput | product_categoriesScalarWhereInput[]
    id?: UuidFilter<"product_categories"> | string
    organization_id?: UuidFilter<"product_categories"> | string
    name?: StringFilter<"product_categories"> | string
    code?: StringNullableFilter<"product_categories"> | string | null
    description?: StringNullableFilter<"product_categories"> | string | null
    parent_id?: UuidNullableFilter<"product_categories"> | string | null
    level?: IntNullableFilter<"product_categories"> | number | null
    sort_order?: IntNullableFilter<"product_categories"> | number | null
    is_active?: BoolNullableFilter<"product_categories"> | boolean | null
    zoho_group_id?: StringNullableFilter<"product_categories"> | string | null
    tally_category?: StringNullableFilter<"product_categories"> | string | null
    custom_category_id?: StringNullableFilter<"product_categories"> | string | null
    created_at?: DateTimeNullableFilter<"product_categories"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"product_categories"> | Date | string | null
  }

  export type productsUpsertWithWhereUniqueWithoutProduct_categoriesInput = {
    where: productsWhereUniqueInput
    update: XOR<productsUpdateWithoutProduct_categoriesInput, productsUncheckedUpdateWithoutProduct_categoriesInput>
    create: XOR<productsCreateWithoutProduct_categoriesInput, productsUncheckedCreateWithoutProduct_categoriesInput>
  }

  export type productsUpdateWithWhereUniqueWithoutProduct_categoriesInput = {
    where: productsWhereUniqueInput
    data: XOR<productsUpdateWithoutProduct_categoriesInput, productsUncheckedUpdateWithoutProduct_categoriesInput>
  }

  export type productsUpdateManyWithWhereWithoutProduct_categoriesInput = {
    where: productsScalarWhereInput
    data: XOR<productsUpdateManyMutationInput, productsUncheckedUpdateManyWithoutProduct_categoriesInput>
  }

  export type productsScalarWhereInput = {
    AND?: productsScalarWhereInput | productsScalarWhereInput[]
    OR?: productsScalarWhereInput[]
    NOT?: productsScalarWhereInput | productsScalarWhereInput[]
    id?: UuidFilter<"products"> | string
    organization_id?: StringFilter<"products"> | string
    category_id?: UuidNullableFilter<"products"> | string | null
    name?: StringFilter<"products"> | string
    description?: StringNullableFilter<"products"> | string | null
    status?: StringNullableFilter<"products"> | string | null
    product_type?: StringNullableFilter<"products"> | string | null
    sku?: StringNullableFilter<"products"> | string | null
    part_number?: StringNullableFilter<"products"> | string | null
    hsn_code?: StringNullableFilter<"products"> | string | null
    selling_price?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    purchase_price?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    mrp?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    is_taxable?: BoolNullableFilter<"products"> | boolean | null
    tax_rate?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    tax_name?: StringNullableFilter<"products"> | string | null
    reorder_level?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: DecimalNullableFilter<"products"> | Decimal | DecimalJsLike | number | string | null
    attributes?: JsonNullableFilter<"products">
    images?: JsonNullableFilter<"products">
    zoho_item_id?: StringNullableFilter<"products"> | string | null
    tally_item_name?: StringNullableFilter<"products"> | string | null
    custom_item_id?: StringNullableFilter<"products"> | string | null
    last_synced_zoho?: DateTimeNullableFilter<"products"> | Date | string | null
    last_synced_tally?: DateTimeNullableFilter<"products"> | Date | string | null
    last_synced_custom?: DateTimeNullableFilter<"products"> | Date | string | null
    sync_errors?: JsonNullableFilter<"products">
    created_at?: DateTimeNullableFilter<"products"> | Date | string | null
    updated_at?: DateTimeNullableFilter<"products"> | Date | string | null
    created_by?: StringNullableFilter<"products"> | string | null
    source_type?: Enumproduct_source_typeNullableFilter<"products"> | $Enums.product_source_type | null
  }

  export type product_categoriesCreateWithoutProductsInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    product_categories?: product_categoriesCreateNestedOneWithoutOther_product_categoriesInput
    other_product_categories?: product_categoriesCreateNestedManyWithoutProduct_categoriesInput
  }

  export type product_categoriesUncheckedCreateWithoutProductsInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    parent_id?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
    other_product_categories?: product_categoriesUncheckedCreateNestedManyWithoutProduct_categoriesInput
  }

  export type product_categoriesCreateOrConnectWithoutProductsInput = {
    where: product_categoriesWhereUniqueInput
    create: XOR<product_categoriesCreateWithoutProductsInput, product_categoriesUncheckedCreateWithoutProductsInput>
  }

  export type product_categoriesUpsertWithoutProductsInput = {
    update: XOR<product_categoriesUpdateWithoutProductsInput, product_categoriesUncheckedUpdateWithoutProductsInput>
    create: XOR<product_categoriesCreateWithoutProductsInput, product_categoriesUncheckedCreateWithoutProductsInput>
    where?: product_categoriesWhereInput
  }

  export type product_categoriesUpdateToOneWithWhereWithoutProductsInput = {
    where?: product_categoriesWhereInput
    data: XOR<product_categoriesUpdateWithoutProductsInput, product_categoriesUncheckedUpdateWithoutProductsInput>
  }

  export type product_categoriesUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    product_categories?: product_categoriesUpdateOneWithoutOther_product_categoriesNestedInput
    other_product_categories?: product_categoriesUpdateManyWithoutProduct_categoriesNestedInput
  }

  export type product_categoriesUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parent_id?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    other_product_categories?: product_categoriesUncheckedUpdateManyWithoutProduct_categoriesNestedInput
  }

  export type ConversationEventCreateManySessionInput = {
    id?: string
    eventType: string
    stepFrom?: string | null
    stepTo?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ConversationEventUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    stepFrom?: NullableStringFieldUpdateOperationsInput | string | null
    stepTo?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationEventUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    stepFrom?: NullableStringFieldUpdateOperationsInput | string | null
    stepTo?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationEventUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    stepFrom?: NullableStringFieldUpdateOperationsInput | string | null
    stepTo?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type product_categoriesCreateManyProduct_categoriesInput = {
    id?: string
    organization_id: string
    name: string
    code?: string | null
    description?: string | null
    level?: number | null
    sort_order?: number | null
    is_active?: boolean | null
    zoho_group_id?: string | null
    tally_category?: string | null
    custom_category_id?: string | null
    created_at?: Date | string | null
    updated_at?: Date | string | null
  }

  export type productsCreateManyProduct_categoriesInput = {
    id: string
    organization_id: string
    name: string
    description?: string | null
    status?: string | null
    product_type?: string | null
    sku?: string | null
    part_number?: string | null
    hsn_code?: string | null
    selling_price?: Decimal | DecimalJsLike | number | string | null
    purchase_price?: Decimal | DecimalJsLike | number | string | null
    mrp?: Decimal | DecimalJsLike | number | string | null
    is_taxable?: boolean | null
    tax_rate?: Decimal | DecimalJsLike | number | string | null
    tax_name?: string | null
    reorder_level?: Decimal | DecimalJsLike | number | string | null
    maximum_stock?: Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: string | null
    tally_item_name?: string | null
    custom_item_id?: string | null
    last_synced_zoho?: Date | string | null
    last_synced_tally?: Date | string | null
    last_synced_custom?: Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string | null
    updated_at?: Date | string | null
    created_by?: string | null
    source_type?: $Enums.product_source_type | null
  }

  export type product_categoriesUpdateWithoutProduct_categoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    other_product_categories?: product_categoriesUpdateManyWithoutProduct_categoriesNestedInput
    products?: productsUpdateManyWithoutProduct_categoriesNestedInput
  }

  export type product_categoriesUncheckedUpdateWithoutProduct_categoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    other_product_categories?: product_categoriesUncheckedUpdateManyWithoutProduct_categoriesNestedInput
    products?: productsUncheckedUpdateManyWithoutProduct_categoriesNestedInput
  }

  export type product_categoriesUncheckedUpdateManyWithoutProduct_categoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableIntFieldUpdateOperationsInput | number | null
    sort_order?: NullableIntFieldUpdateOperationsInput | number | null
    is_active?: NullableBoolFieldUpdateOperationsInput | boolean | null
    zoho_group_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_category?: NullableStringFieldUpdateOperationsInput | string | null
    custom_category_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type productsUpdateWithoutProduct_categoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    product_type?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    part_number?: NullableStringFieldUpdateOperationsInput | string | null
    hsn_code?: NullableStringFieldUpdateOperationsInput | string | null
    selling_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    purchase_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mrp?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_taxable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    tax_rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    tax_name?: NullableStringFieldUpdateOperationsInput | string | null
    reorder_level?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_item_name?: NullableStringFieldUpdateOperationsInput | string | null
    custom_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: NullableEnumproduct_source_typeFieldUpdateOperationsInput | $Enums.product_source_type | null
  }

  export type productsUncheckedUpdateWithoutProduct_categoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    product_type?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    part_number?: NullableStringFieldUpdateOperationsInput | string | null
    hsn_code?: NullableStringFieldUpdateOperationsInput | string | null
    selling_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    purchase_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mrp?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_taxable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    tax_rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    tax_name?: NullableStringFieldUpdateOperationsInput | string | null
    reorder_level?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_item_name?: NullableStringFieldUpdateOperationsInput | string | null
    custom_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: NullableEnumproduct_source_typeFieldUpdateOperationsInput | $Enums.product_source_type | null
  }

  export type productsUncheckedUpdateManyWithoutProduct_categoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organization_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    product_type?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    part_number?: NullableStringFieldUpdateOperationsInput | string | null
    hsn_code?: NullableStringFieldUpdateOperationsInput | string | null
    selling_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    purchase_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    mrp?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    is_taxable?: NullableBoolFieldUpdateOperationsInput | boolean | null
    tax_rate?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    tax_name?: NullableStringFieldUpdateOperationsInput | string | null
    reorder_level?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maximum_stock?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    attributes?: NullableJsonNullValueInput | InputJsonValue
    images?: NullableJsonNullValueInput | InputJsonValue
    zoho_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    tally_item_name?: NullableStringFieldUpdateOperationsInput | string | null
    custom_item_id?: NullableStringFieldUpdateOperationsInput | string | null
    last_synced_zoho?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_tally?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    last_synced_custom?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sync_errors?: NullableJsonNullValueInput | InputJsonValue
    created_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_by?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: NullableEnumproduct_source_typeFieldUpdateOperationsInput | $Enums.product_source_type | null
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