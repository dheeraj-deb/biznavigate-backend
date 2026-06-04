import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../../generated/prisma";
import postgres = require("postgres");

// ── Column type OID → Prisma ColumnTypeEnum ──────────────────────────────────
const OID_MAP: Record<number, number> = {
    16: 5,    // bool
    17: 13,   // bytea
    20: 1,    // int8
    21: 0,    // int2
    23: 0,    // int4
    26: 0,    // oid
    700: 2,   // float4
    701: 3,   // float8
    1700: 4,  // numeric
    114: 11,  // json
    3802: 11, // jsonb
    1082: 8,  // date
    1083: 9,  // time
    1114: 10, // timestamp
    1184: 10, // timestamptz
    2950: 15, // uuid
    25: 7,    // text
    1043: 7,  // varchar
    18: 6,    // char
    // arrays
    1000: 69, 1005: 64, 1007: 64, 1016: 65,
    1021: 66, 1022: 67, 1231: 68,
    199: 75, 3807: 75,
    1182: 72, 1183: 73, 1115: 74,
    2951: 78, 1009: 71,
};

function oidToColumnType(oid: number): number {
    return OID_MAP[oid] ?? 7;
}

function serializeValue(val: unknown, oid: number): unknown {
    if (val === null || val === undefined) return null;
    if (oid === 114 || oid === 3802) return JSON.stringify(val);
    if (val instanceof Date) {
        if (oid === 1082) return val.toISOString().split("T")[0];           // date → YYYY-MM-DD
        if (oid === 1083) return val.toISOString().split("T")[1].replace("Z", ""); // time
        return val.toISOString();                                            // timestamp
    }
    if (typeof val === "bigint") return String(val);
    return val;
}

function isRetryable(err: unknown): boolean {
    const msg: string = (err as any)?.message ?? "";
    const code: string = String((err as any)?.code ?? "");
    // code 26000 = undefined_prepared_statement (PgCat stale prepared statement from pg.Pool)
    return msg.includes("idle transaction timeout") || msg.includes("CONNECTION_CLOSED") || code === "26000";
}

// ── Inline positional params into SQL string (simple query protocol) ──────────
// PgCat transaction-mode cannot route extended-protocol (Parse/Bind/Execute)
// queries across backends correctly — results get crossed. Using the simple
// query protocol (no params) avoids this entirely.
function inlineParams(sql: string, args: unknown[]): string {
    if (!args || args.length === 0) return sql;
    return sql.replace(/\$(\d+)/g, (_, n) => {
        const val = args[parseInt(n, 10) - 1];
        return formatSqlLiteral(val);
    });
}

function formatSqlLiteral(val: unknown): string {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
    if (typeof val === "number") return isFinite(val) ? String(val) : "NULL";
    if (typeof val === "bigint") return String(val);
    if (val instanceof Date) return `'${val.toISOString()}'`;
    if (Buffer.isBuffer(val)) return `'\\x${val.toString("hex")}'`;
    if (Array.isArray(val)) {
        // PostgreSQL array literal syntax: '{"a","b"}' for text[], '{1,2}' for int[]
        if (val.length === 0) return "'{}'";
        const elements = (val as unknown[]).map((el) => {
            if (el === null || el === undefined) return "NULL";
            const s = typeof el === "string" ? el : JSON.stringify(el);
            return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        });
        return `'{${elements.join(",")}}'`;
    }
    if (typeof val === "object") {
        // JSON/JSONB object — serialize and escape
        return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    }
    // String — escape single quotes
    return `'${String(val).replace(/'/g, "''")}'`;
}

// ── Shared query executor ─────────────────────────────────────────────────────
async function performQuery(
    client: postgres.Sql | postgres.ReservedSql,
    query: { sql: string; args: unknown[] },
    retryOnce = true,
): Promise<{ columnNames: string[]; columnTypes: number[]; rows: unknown[][] }> {
    try {
        // Inline parameters so postgres.js sends the simple query protocol (no
        // Parse/Bind/Execute). Extended protocol causes PgCat to cross results
        // between backends in transaction mode.
        const inlined = inlineParams(query.sql, query.args as unknown[]);
        const rows: postgres.Row[] = await (client as any).unsafe(inlined);
        const columns: { name: string; type: number }[] = (rows as any).columns ?? [];
        const columnNames = columns.map((c) => c.name);
        const columnTypes = columns.map((c) => oidToColumnType(c.type));
        const serializedRows = rows.map((row) =>
            columns.map((col) => serializeValue(row[col.name], col.type)),
        );
        return { columnNames, columnTypes, rows: serializedRows };
    } catch (err) {
        // Stale PgCat connection: the backend had an expired idle transaction.
        // postgres.js discards the dead connection on error; a retry gets a fresh one.
        if (retryOnce && isRetryable(err)) {
            return performQuery(client, query, false);
        }
        throw err;
    }
}

// ── Safely send a command on a reserved connection ────────────────────────────
// When PgCat kills an idle-in-transaction connection the socket becomes null.
// Calling unsafe() on a dead socket throws asynchronously from a setImmediate
// callback — outside our try/catch — which crashes the process. We guard by
// checking the socket state before writing and ignoring all errors.
function safeExec(reserved: postgres.ReservedSql, sql: string): Promise<void> {
    return new Promise((resolve) => {
        const conn = reserved as any;
        // If postgres.js already marked the socket as gone, skip the write.
        if (!conn.socket || conn.socket.destroyed) {
            resolve();
            return;
        }
        conn.unsafe(sql).then(resolve).catch(resolve);
    });
}

// ── Transaction adapter ───────────────────────────────────────────────────────
class PostgresTransaction {
    // usePhantomQuery: false → we are responsible for BEGIN.
    // We send BEGIN lazily (on the first actual query) so the idle window
    // between startTransaction() and the first database call is zero.
    readonly options = { usePhantomQuery: false };

    private begun = false;

    constructor(private readonly reserved: postgres.ReservedSql) {}

    get provider() { return "postgres" as const; }
    get adapterName() { return "@custom/adapter-postgres"; }

    private async ensureBegun(): Promise<void> {
        if (!this.begun) {
            this.begun = true;
            // Rollback any stale transaction that PgCat may have inherited on
            // this backend connection from a previous frontend session.
            try { await (this.reserved as any).unsafe("ROLLBACK"); } catch { /* no-op */ }
            await (this.reserved as any).unsafe("BEGIN");
        }
    }

    async queryRaw(query: { sql: string; args: unknown[] }) {
        await this.ensureBegun();
        return performQuery(this.reserved, query, false);
    }
    async executeRaw(query: { sql: string; args: unknown[] }) {
        await this.ensureBegun();
        const inlined = inlineParams(query.sql, query.args as unknown[]);
        const rows: postgres.Row[] = await (this.reserved as any).unsafe(inlined);
        return (rows as any).count ?? 0;
    }
    async commit() {
        if (this.begun) await safeExec(this.reserved, "COMMIT");
        try { this.reserved.release(); } catch { /* ignore */ }
    }
    async rollback() {
        if (this.begun) await safeExec(this.reserved, "ROLLBACK");
        try { this.reserved.release(); } catch { /* ignore */ }
    }
}

// ── Main adapter ──────────────────────────────────────────────────────────────
class PostgresAdapter {
    readonly provider = "postgres" as const;
    readonly adapterName = "@custom/adapter-postgres";

    constructor(private readonly sql: postgres.Sql) {}

    async queryRaw(query: { sql: string; args: unknown[] }) {
        return performQuery(this.sql, query);
    }
    async executeRaw(query: { sql: string; args: unknown[] }) {
        try {
            const inlined = inlineParams(query.sql, query.args as unknown[]);
            const rows: postgres.Row[] = await (this.sql as any).unsafe(inlined);
            return (rows as any).count ?? 0;
        } catch (err) {
            if (isRetryable(err)) {
                const inlined = inlineParams(query.sql, query.args as unknown[]);
                const rows: postgres.Row[] = await (this.sql as any).unsafe(inlined);
                return (rows as any).count ?? 0;
            }
            throw err;
        }
    }
    async executeScript(script: { sql: string }) {
        await (this.sql as any).unsafe(script.sql);
    }
    async dispose() {
        // no-op: pool lifecycle is managed by PrismaService.onModuleDestroy
    }
    async startTransaction() {
        const reserved = await this.sql.reserve();
        return new PostgresTransaction(reserved);
    }
}

// ── Adapter factory ───────────────────────────────────────────────────────────
class PostgresAdapterFactory {
    readonly provider = "postgres" as const;
    readonly adapterName = "@custom/adapter-postgres";

    constructor(private readonly sql: postgres.Sql) {}

    async connect() {
        return new PostgresAdapter(this.sql);
    }
}

function buildAdapter() {
    const url = new URL(process.env.DATABASE_URL!);
    const schema = url.searchParams.get("schema") ?? "public";
    url.searchParams.delete("pgbouncer");
    url.searchParams.delete("statement_cache_size");
    url.searchParams.delete("schema");

    const sql = postgres(url.toString(), {
        prepare: false,
        ssl: "require",
        onnotice: () => {},
        max: 20,
        idle_timeout: 20,
        connect_timeout: 10,
        connection: { search_path: schema },
    });

    return new PostgresAdapterFactory(sql);
}

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor() {
        super({ adapter: buildAdapter() as any });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
