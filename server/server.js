import crypto from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createMint,
  createTransferCheckedInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_VERCEL_RUNTIME = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_URL);

const SERVER_PORT = Number(process.env.SERVER_PORT || 8787);
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || 24);
const PASSWORD_SALT = process.env.AUTH_PASSWORD_SALT || "complipay-demo-salt";
const SESSION_TOKEN_PEPPER = process.env.SESSION_TOKEN_PEPPER || PASSWORD_SALT;
const PBKDF2_ITERATIONS = (() => {
  const raw = Number(process.env.AUTH_PBKDF2_ITERATIONS || 210_000);
  return Number.isInteger(raw) && raw >= 120_000 ? raw : 210_000;
})();
const AI_API_KEY = process.env.DASHSCOPE_API_KEY || process.env.MODEL_STUDIO_API_KEY || "";
const AI_BASE_URL = process.env.AI_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const AI_MODEL = process.env.AI_MODEL || "qwen-plus";
const AI_SYSTEM_PROMPT =
  process.env.AI_SYSTEM_PROMPT ||
  "You are CompliPay AI assistant for institutional stablecoin operations. Provide concise, compliant guidance focused on KYC, KYT, AML, Travel Rule, settlement, and auditability.";
const COMPLIANCE_PROVIDER_URL = process.env.COMPLIANCE_PROVIDER_URL || "";
const COMPLIANCE_PROVIDER_KEY = process.env.COMPLIANCE_PROVIDER_KEY || "";
const DATABASE_URL = process.env.DATABASE_URL || "";
const TRUST_PROXY = process.env.TRUST_PROXY;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const SOLANA_WALLET_CLUSTER = process.env.SOLANA_WALLET_CLUSTER || "devnet";
const SOLANA_RPC_ENDPOINT = process.env.SOLANA_RPC_ENDPOINT || "";
const USDC_TOKEN_MINT = process.env.USDC_TOKEN_MINT || "";
const USDT_TOKEN_MINT = process.env.USDT_TOKEN_MINT || "";
const SPL_DEFAULT_DECIMALS = Number(process.env.SPL_DEFAULT_DECIMALS || 6);
const MEMO_PROGRAM_ID = new PublicKey(
  process.env.MEMO_PROGRAM_ID || "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

const defaultDbDir = IS_VERCEL_RUNTIME
  ? path.resolve("/tmp", "complipay-data")
  : path.resolve(__dirname, "data");
const dataDir = process.env.DB_DIR
  ? path.resolve(process.env.DB_DIR)
  : defaultDbDir;
mkdirSync(dataDir, { recursive: true });

const sqliteDbPath = path.join(dataDir, "complipay.db");
const SQLITE_SNAPSHOT_KEY = "complipay-sqlite-main";

let snapshotPool = null;
let remoteSnapshotEnabled = false;
let sqliteDirty = false;
let flushInFlight = null;

function shouldEnableSnapshot(url) {
  return typeof url === "string" && url.trim().toLowerCase().startsWith("postgres");
}

function resolvePgSsl(url) {
  if (!url || /localhost|127\.0\.0\.1/i.test(url)) return undefined;
  return { rejectUnauthorized: false };
}

async function initRemoteSnapshot() {
  if (!shouldEnableSnapshot(DATABASE_URL)) return;

  snapshotPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: resolvePgSsl(DATABASE_URL),
  });

  await snapshotPool.query(`
    CREATE TABLE IF NOT EXISTS app_state_snapshots (
      id TEXT PRIMARY KEY,
      sqlite_blob BYTEA NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await snapshotPool.query(
    "SELECT sqlite_blob FROM app_state_snapshots WHERE id = $1 LIMIT 1",
    [SQLITE_SNAPSHOT_KEY]
  );

  const row = result.rows[0];
  if (row?.sqlite_blob) {
    writeFileSync(sqliteDbPath, row.sqlite_blob);
    console.log("Loaded SQLite snapshot from Postgres state store.");
  } else {
    console.log("No remote SQLite snapshot found. Initializing fresh local state.");
  }

  remoteSnapshotEnabled = true;
}

async function pushSqliteSnapshot() {
  if (!remoteSnapshotEnabled || !snapshotPool) return;

  const sqliteBlob = readFileSync(sqliteDbPath);
  await snapshotPool.query(
    `
      INSERT INTO app_state_snapshots (id, sqlite_blob, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id)
      DO UPDATE SET sqlite_blob = EXCLUDED.sqlite_blob, updated_at = NOW()
    `,
    [SQLITE_SNAPSHOT_KEY, sqliteBlob]
  );
  sqliteDirty = false;
}

function flushSqliteSnapshotSoon() {
  if (!remoteSnapshotEnabled || !snapshotPool) return;
  if (flushInFlight) {
    sqliteDirty = true;
    return;
  }

  flushInFlight = (async () => {
    do {
      sqliteDirty = false;
      await pushSqliteSnapshot();
    } while (sqliteDirty);
  })()
    .catch((error) => {
      sqliteDirty = true;
      console.error("Failed to sync SQLite snapshot to Postgres:", error);
    })
    .finally(() => {
      flushInFlight = null;
      if (sqliteDirty) flushSqliteSnapshotSoon();
    });
}

function markSqliteDirty() {
  if (!remoteSnapshotEnabled) return;
  sqliteDirty = true;
  flushSqliteSnapshotSoon();
}

try {
  await initRemoteSnapshot();
} catch (error) {
  console.error("Remote snapshot init failed, falling back to local SQLite only:", error);
  remoteSnapshotEnabled = false;
  if (snapshotPool) {
    try {
      await snapshotPool.end();
    } catch {
      // Ignore pool close errors during fallback.
    }
  }
  snapshotPool = null;
}

const db = new DatabaseSync(sqliteDbPath);
const originalDbExec = db.exec.bind(db);
const originalDbPrepare = db.prepare.bind(db);

db.exec = (...args) => {
  const result = originalDbExec(...args);
  markSqliteDirty();
  return result;
};

db.prepare = (...args) => {
  const statement = originalDbPrepare(...args);
  return {
    run: (...params) => {
      const result = statement.run(...params);
      markSqliteDirty();
      return result;
    },
    get: (...params) => statement.get(...params),
    all: (...params) => statement.all(...params),
  };
};

const sqliteJournalMode = remoteSnapshotEnabled ? "DELETE" : "WAL";
db.exec(`PRAGMA journal_mode = ${sqliteJournalMode};`);
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  institution TEXT NOT NULL,
  role TEXT NOT NULL,
  kyc_status TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  conditions_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  next_execution TEXT,
  recipient TEXT NOT NULL,
  recipient_kyc_verified INTEGER NOT NULL,
  travel_rule_ready INTEGER NOT NULL,
  compliance_result_json TEXT,
  last_tx_hash TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  compliance_status TEXT NOT NULL,
  explorer_url TEXT,
  network TEXT,
  simulated INTEGER NOT NULL DEFAULT 0,
  asset_type TEXT NOT NULL DEFAULT 'sol',
  token_mint TEXT,
  batch_id TEXT
);

CREATE TABLE IF NOT EXISTS compliance_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL,
  transaction_id TEXT,
  payment_id TEXT
);

CREATE TABLE IF NOT EXISTS ai_tasks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  last_run TEXT,
  next_run TEXT,
  savings REAL
);

CREATE TABLE IF NOT EXISTS wallets (
  address TEXT PRIMARY KEY,
  balance REAL NOT NULL,
  currency TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  payment_id TEXT,
  transaction_id TEXT,
  user_id TEXT
);
`);

function ensureColumn(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

ensureColumn("transactions", "asset_type", "TEXT NOT NULL DEFAULT 'sol'");
ensureColumn("transactions", "token_mint", "TEXT");
ensureColumn("transactions", "batch_id", "TEXT");

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  return `${prefix}-${crypto.randomBytes(5).toString("hex")}`;
}

function secureEqual(left, right) {
  const a = Buffer.from(String(left), "utf8");
  const b = Buffer.from(String(right), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function hashPasswordLegacy(password) {
  return crypto.createHash("sha256").update(`${password}:${PASSWORD_SALT}`).digest("hex");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha512").toString("hex");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${digest}`;
}

function isLegacyPasswordHash(hashValue) {
  return typeof hashValue === "string" && !hashValue.startsWith("pbkdf2$");
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string" || storedHash.length === 0) return false;
  if (!storedHash.startsWith("pbkdf2$")) {
    return secureEqual(hashPasswordLegacy(password), storedHash);
  }

  const [scheme, iterationText, salt, digest] = storedHash.split("$");
  if (scheme !== "pbkdf2") return false;
  const iterations = Number(iterationText);
  if (!Number.isInteger(iterations) || iterations < 120_000 || !salt || !digest) return false;

  const candidate = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha512").toString("hex");
  return secureEqual(candidate, digest);
}

function hashSessionToken(token) {
  return crypto.createHash("sha256").update(`${token}:${SESSION_TOKEN_PEPPER}`).digest("hex");
}

function resolveTrustProxy(value) {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim();
  if (!normalized) return false;
  const lower = normalized.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (/^\d+$/.test(normalized)) return Number(normalized);
  return normalized;
}

function resolveCorsOrigins(value) {
  if (value === undefined || value === null) return ["*"];
  const normalized = String(value).trim();
  if (!normalized) return ["*"];
  return normalized
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeClientIp(req) {
  return String(req.ip || req.socket?.remoteAddress || "unknown").replace(/^::ffff:/, "");
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toBoolFlag(value) {
  return value ? 1 : 0;
}

function validateSchema(payload, schema) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Invalid JSON payload." };
  }

  const result = {};
  for (const [field, rules] of Object.entries(schema)) {
    const hasValue = payload[field] !== undefined && payload[field] !== null;
    if (!hasValue) {
      if (rules.required) {
        return { ok: false, error: `${field} is required.` };
      }
      if (Object.hasOwn(rules, "default")) {
        result[field] = rules.default;
      }
      continue;
    }

    if (rules.type === "string") {
      if (typeof payload[field] !== "string") {
        return { ok: false, error: `${field} must be a string.` };
      }
      const normalized = rules.trim ? payload[field].trim() : payload[field];
      const nextValue = rules.uppercase
        ? normalized.toUpperCase()
        : rules.lowercase
          ? normalized.toLowerCase()
          : normalized;
      if (rules.min && nextValue.length < rules.min) {
        return { ok: false, error: `${field} is too short.` };
      }
      if (rules.max && nextValue.length > rules.max) {
        return { ok: false, error: `${field} is too long.` };
      }
      if (rules.pattern && !rules.pattern.test(nextValue)) {
        return { ok: false, error: `${field} has an invalid format.` };
      }
      if (rules.enum && !rules.enum.includes(nextValue)) {
        return { ok: false, error: `${field} is not supported.` };
      }
      result[field] = nextValue;
      continue;
    }

    if (rules.type === "number") {
      const nextValue = rules.coerce ? Number(payload[field]) : payload[field];
      if (typeof nextValue !== "number" || Number.isNaN(nextValue)) {
        return { ok: false, error: `${field} must be a number.` };
      }
      if (rules.finite && !Number.isFinite(nextValue)) {
        return { ok: false, error: `${field} must be finite.` };
      }
      if (rules.min !== undefined && nextValue < rules.min) {
        return { ok: false, error: `${field} is below minimum allowed value.` };
      }
      if (rules.max !== undefined && nextValue > rules.max) {
        return { ok: false, error: `${field} exceeds maximum allowed value.` };
      }
      result[field] = nextValue;
      continue;
    }

    if (rules.type === "boolean") {
      const input = payload[field];
      if (typeof input === "boolean") {
        result[field] = input;
        continue;
      }
      if (rules.coerce) {
        if (typeof input === "number") {
          if (input === 1) {
            result[field] = true;
            continue;
          }
          if (input === 0) {
            result[field] = false;
            continue;
          }
        }
        if (typeof input === "string") {
          const normalized = input.trim().toLowerCase();
          if (["1", "true", "yes", "y", "on"].includes(normalized)) {
            result[field] = true;
            continue;
          }
          if (["0", "false", "no", "n", "off", ""].includes(normalized)) {
            result[field] = false;
            continue;
          }
        }
        if (input === null || input === undefined) {
          result[field] = false;
          continue;
        }
        return { ok: false, error: `${field} must be a boolean.` };
      }
      return { ok: false, error: `${field} must be a boolean.` };
    }

    if (rules.type === "string[]") {
      if (!Array.isArray(payload[field])) {
        return { ok: false, error: `${field} must be an array.` };
      }
      if (rules.maxItems && payload[field].length > rules.maxItems) {
        return { ok: false, error: `${field} has too many items.` };
      }
      const list = [];
      for (const value of payload[field]) {
        if (typeof value !== "string") {
          return { ok: false, error: `${field} items must be strings.` };
        }
        const nextValue = rules.trim ? value.trim() : value;
        if (nextValue.length === 0) continue;
        if (rules.itemMax && nextValue.length > rules.itemMax) {
          return { ok: false, error: `${field} item is too long.` };
        }
        list.push(nextValue);
      }
      if (rules.minItems && list.length < rules.minItems) {
        return { ok: false, error: `${field} must include at least one item.` };
      }
      result[field] = list;
      continue;
    }
  }

  return { ok: true, value: result };
}

function toPublicKeyOrNull(value) {
  if (!value || typeof value !== "string") return null;
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

async function fetchSplTokenBalance(connection, ownerAddress, mintAddress) {
  const owner = toPublicKeyOrNull(ownerAddress);
  const mint = toPublicKeyOrNull(mintAddress);
  if (!owner || !mint) return null;

  const response = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }, "confirmed");
  if (!Array.isArray(response?.value) || response.value.length === 0) {
    return null;
  }

  const expectedMint = mint.toBase58();
  let totalBalance = 0;
  let foundMatchingAccount = false;
  for (const accountInfo of response.value) {
    const accountMint = accountInfo?.account?.data?.parsed?.info?.mint;
    if (accountMint !== expectedMint) continue;
    foundMatchingAccount = true;

    const tokenAmount = accountInfo?.account?.data?.parsed?.info?.tokenAmount;
    const parsedAmount = Number(tokenAmount?.uiAmountString ?? tokenAmount?.uiAmount ?? 0);
    if (Number.isFinite(parsedAmount)) {
      totalBalance += parsedAmount;
    }
  }
  if (!foundMatchingAccount) return null;
  return Number(totalBalance.toFixed(6));
}

function aiChatRateLimitKey(req, keyPrefix) {
  const userId = req.auth?.user?.id || "anonymous";
  const ip = normalizeClientIp(req);
  return `${keyPrefix}:user:${userId}:ip:${ip}`;
}

function cleanupExpiredRateLimitBuckets(now, storage) {
  for (const [key, value] of storage) {
    if (now > value.resetAt) storage.delete(key);
  }
}

const loginSchema = {
  email: {
    type: "string",
    required: true,
    trim: true,
    lowercase: true,
    min: 5,
    max: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: "string",
    required: true,
    min: 6,
    max: 128,
  },
};

const createPaymentSchema = {
  name: {
    type: "string",
    required: true,
    trim: true,
    min: 2,
    max: 120,
  },
  type: {
    type: "string",
    required: false,
    trim: true,
    enum: ["escrow", "milestone", "subscription", "automated"],
    default: "escrow",
  },
  amount: {
    type: "number",
    required: true,
    coerce: true,
    finite: true,
    min: 0.000001,
    max: 1_000_000_000,
  },
  currency: {
    type: "string",
    required: false,
    trim: true,
    uppercase: true,
    enum: ["USDC", "USDT", "SOL"],
    default: "USDC",
  },
  recipient: {
    type: "string",
    required: true,
    trim: true,
    min: 2,
    max: 160,
  },
  conditions: {
    type: "string[]",
    required: false,
    trim: true,
    maxItems: 20,
    itemMax: 160,
    default: [],
  },
  recipientKycVerified: {
    type: "boolean",
    required: false,
    coerce: true,
    default: false,
  },
  travelRuleReady: {
    type: "boolean",
    required: false,
    coerce: true,
    default: false,
  },
};

const batchExecuteSchema = {
  paymentIds: {
    type: "string[]",
    required: true,
    trim: true,
    minItems: 1,
    maxItems: 20,
    itemMax: 80,
  },
  mode: {
    type: "string",
    required: false,
    trim: true,
    enum: ["manual", "ai"],
    default: "manual",
  },
};

const aiChatSchema = {
  message: {
    type: "string",
    required: true,
    trim: true,
    min: 1,
    max: 2000,
  },
};

function parseOptionalIsoDate(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString();
}

function sanitizeChatHistory(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(-20)
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const role = item.role === "assistant" || item.role === "user" ? item.role : "user";
      const content = String(item.content || "").trim().slice(0, 2000);
      return { role, content };
    })
    .filter((item) => item.content.length > 0)
    .slice(-12);
}

function serializeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    institution: row.institution,
    role: row.role,
    kycStatus: row.kyc_status,
  };
}

function serializePayment(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    conditions: parseJson(row.conditions_json, []),
    createdAt: row.created_at,
    nextExecution: row.next_execution || undefined,
    recipient: row.recipient,
    recipientKycVerified: Boolean(row.recipient_kyc_verified),
    travelRuleReady: Boolean(row.travel_rule_ready),
    complianceResult: parseJson(row.compliance_result_json, undefined),
    lastTxHash: row.last_tx_hash || undefined,
    updatedAt: row.updated_at,
  };
}

function serializeTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    sender: row.sender,
    receiver: row.receiver,
    timestamp: row.timestamp,
    txHash: row.tx_hash,
    complianceStatus: row.compliance_status,
    explorerUrl: row.explorer_url || undefined,
    network: row.network || undefined,
    simulated: Boolean(row.simulated),
    assetType: row.asset_type || "sol",
    tokenMint: row.token_mint || undefined,
    batchId: row.batch_id || undefined,
  };
}

function serializeAlert(row) {
  return {
    id: row.id,
    type: row.type,
    severity: row.severity,
    message: row.message,
    timestamp: row.timestamp,
    status: row.status,
    transactionId: row.transaction_id || undefined,
    paymentId: row.payment_id || undefined,
  };
}

function serializeTask(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    description: row.description,
    lastRun: row.last_run || undefined,
    nextRun: row.next_run || undefined,
    savings: row.savings ?? undefined,
  };
}

function serializeWallet(row) {
  return {
    address: row.address,
    balance: row.balance,
    currency: row.currency,
    provider: row.provider,
    status: row.status,
  };
}

function serializeAudit(row) {
  return {
    id: row.id,
    category: row.category,
    action: row.action,
    message: row.message,
    timestamp: row.timestamp,
    paymentId: row.payment_id || undefined,
    transactionId: row.transaction_id || undefined,
  };
}

function seedDatabase() {
  const usersCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (usersCount === 0) {
    const now = nowIso();
    const insertUser = db.prepare(
      `INSERT INTO users (id, name, email, institution, role, kyc_status, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertUser.run(
      "u-admin",
      "John Smith",
      "admin@complipay.ai",
      "Global Finance Corp",
      "admin",
      "verified",
      hashPassword("Admin123!"),
      now
    );
    insertUser.run(
      "u-ops",
      "Sara Lee",
      "ops@complipay.ai",
      "Global Finance Corp",
      "operator",
      "verified",
      hashPassword("Ops123!"),
      now
    );
    insertUser.run(
      "u-view",
      "Michael Tan",
      "viewer@complipay.ai",
      "Global Finance Corp",
      "viewer",
      "verified",
      hashPassword("View123!"),
      now
    );
  }

  const paymentsCount = db.prepare("SELECT COUNT(*) AS c FROM payments").get().c;
  if (paymentsCount === 0) {
    const insert = db.prepare(
      `INSERT INTO payments (
        id, name, type, amount, currency, status, conditions_json, created_at, next_execution,
        recipient, recipient_kyc_verified, travel_rule_ready, compliance_result_json, last_tx_hash, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insert.run(
      "pp-001",
      "Supplier Payment - Q1",
      "milestone",
      500000,
      "USDC",
      "active",
      JSON.stringify(["Delivery confirmed", "Quality check passed", "Invoice approved"]),
      "2026-03-14T03:10:00.000Z",
      "2026-03-18T09:00:00.000Z",
      "Manufacturing Inc",
      1,
      1,
      null,
      null,
      nowIso()
    );
    insert.run(
      "pp-002",
      "Treasury Rebalancing",
      "automated",
      100000,
      "USDC",
      "active",
      JSON.stringify(["Balance threshold reached", "AI optimization trigger"]),
      "2026-03-14T04:15:00.000Z",
      "2026-03-17T08:00:00.000Z",
      "Reserve Wallet",
      1,
      1,
      null,
      null,
      nowIso()
    );
  }

  const tasksCount = db.prepare("SELECT COUNT(*) AS c FROM ai_tasks").get().c;
  if (tasksCount === 0) {
    const insert = db.prepare(
      `INSERT INTO ai_tasks (id, type, status, description, last_run, next_run, savings)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    insert.run(
      "ai-001",
      "treasury_optimization",
      "running",
      "Analyzing treasury positions for optimal yield allocation",
      "2026-03-15T01:00:00.000Z",
      "2026-03-15T13:00:00.000Z",
      12500
    );
    insert.run(
      "ai-002",
      "payment_execution",
      "scheduled",
      "Automated batch payment processing for approved invoices",
      null,
      "2026-03-16T02:00:00.000Z",
      null
    );
    insert.run(
      "ai-003",
      "fx_conversion",
      "completed",
      "FX rate optimization for EUR/USDC conversion",
      "2026-03-15T00:30:00.000Z",
      null,
      8750
    );
    insert.run(
      "ai-004",
      "risk_monitoring",
      "running",
      "Continuous monitoring of counterparty risk scores",
      "2026-03-15T03:00:00.000Z",
      null,
      null
    );
  }

  const walletsCount = db.prepare("SELECT COUNT(*) AS c FROM wallets").get().c;
  if (walletsCount === 0) {
    const insert = db.prepare(
      `INSERT INTO wallets (address, balance, currency, provider, status)
       VALUES (?, ?, ?, ?, ?)`
    );
    const walletA = Keypair.generate().publicKey.toBase58();
    const walletB = Keypair.generate().publicKey.toBase58();
    const walletC = Keypair.generate().publicKey.toBase58();
    insert.run(walletA, 5250000, "USDC", "fireblocks", "connected");
    insert.run(walletB, 1750000, "USDT", "fireblocks", "connected");
    insert.run(walletC, 850000, "USDC", "internal", "connected");
  }
}

seedDatabase();
await pushSqliteSnapshot();

function appendAuditEvent({ category, action, message, paymentId, transactionId, userId }) {
  const id = randomId("audit");
  const timestamp = nowIso();
  db.prepare(
    `INSERT INTO audit_events (id, category, action, message, timestamp, payment_id, transaction_id, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    category,
    action,
    message,
    timestamp,
    paymentId || null,
    transactionId || null,
    userId || null
  );
  const row = db.prepare("SELECT * FROM audit_events WHERE id = ?").get(id);
  return serializeAudit(row);
}

async function evaluateCompliance(input) {
  const local = () => {
    const recipient = input.recipient.toLowerCase();
    const checks = {
      kyc: input.recipientKycVerified ? "pass" : "fail",
      kyt: input.amount > 500_000 ? "review" : "pass",
      aml: recipient.includes("sanction") || recipient.includes("blocked") ? "fail" : "pass",
      travelRule: input.amount > 250_000 && !input.travelRuleReady ? "review" : "pass",
    };
    const reasons = [];
    if (checks.kyc === "fail") reasons.push("Recipient KYC is not verified.");
    if (checks.kyt === "review") reasons.push("Transfer amount crossed enhanced due diligence threshold.");
    if (checks.aml === "fail") reasons.push("Recipient matched an AML/sanctions risk indicator.");
    if (checks.travelRule === "review") reasons.push("Travel Rule metadata is incomplete for this transfer size.");
    if (reasons.length === 0) reasons.push("All mandatory compliance checks passed.");
    const score = Object.values(checks)
      .map((status) => (status === "pass" ? 25 : status === "review" ? 15 : 0))
      .reduce((a, b) => a + b, 0);
    const statuses = Object.values(checks);
    const decision = statuses.includes("fail") ? "block" : statuses.includes("review") ? "review" : "allow";
    return {
      decision,
      score,
      checks,
      reasons,
      evaluatedAt: nowIso(),
      provider: "local-policy",
    };
  };

  if (!COMPLIANCE_PROVIDER_URL) return local();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(COMPLIANCE_PROVIDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(COMPLIANCE_PROVIDER_KEY ? { Authorization: `Bearer ${COMPLIANCE_PROVIDER_KEY}` } : {}),
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return local();
    const data = await response.json();
    if (!data?.decision || !data?.checks) return local();
    return {
      decision: data.decision,
      score: Number(data.score || 0),
      checks: data.checks,
      reasons: Array.isArray(data.reasons) ? data.reasons : ["Compliance provider returned a decision."],
      evaluatedAt: data.evaluatedAt || nowIso(),
      provider: "external-provider",
    };
  } catch {
    return local();
  }
}

function pseudoSignature() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let value = "";
  for (let i = 0; i < 88; i += 1) value += alphabet[Math.floor(Math.random() * alphabet.length)];
  return value;
}

function buildConditionDigest(payment) {
  const payload = JSON.stringify({
    paymentId: payment.id,
    conditions: Array.isArray(payment.conditions) ? payment.conditions : [],
    decision: payment.complianceResult?.decision || "unknown",
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function uiAmountToRawUnits(uiAmount, decimals) {
  const safeAmount = Number.isFinite(uiAmount) ? Math.max(0, uiAmount) : 0;
  const factor = 10 ** decimals;
  return BigInt(Math.max(1, Math.round(safeAmount * factor)));
}

async function executeSolOnCluster(uiAmount, cluster) {
  const connection = new Connection(clusterApiUrl(cluster), "confirmed");
  const sender = Keypair.generate();
  const recipient = Keypair.generate().publicKey;

  const airdropSignature = await connection.requestAirdrop(sender.publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSignature, "confirmed");

  const lamports = Math.max(5_000, Math.round(Math.min(uiAmount, 5_000) * 2_000));
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient,
      lamports,
    })
  );
  const signature = await sendAndConfirmTransaction(connection, tx, [sender], {
    commitment: "confirmed",
    skipPreflight: false,
  });

  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`,
    network: cluster,
    simulated: false,
    assetType: "sol",
    tokenMint: null,
  };
}

async function executeSplOnCluster(payment, cluster, mode) {
  const connection = new Connection(clusterApiUrl(cluster), "confirmed");
  const payer = Keypair.generate();
  const recipientOwner = Keypair.generate().publicKey;

  const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSignature, "confirmed");

  const decimals = SPL_DEFAULT_DECIMALS;
  const mint = await createMint(connection, payer, payer.publicKey, null, decimals);
  const senderAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
  const recipientAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, recipientOwner);

  const rawAmount = uiAmountToRawUnits(payment.amount, decimals);
  const mintSignature = await mintTo(
    connection,
    payer,
    mint,
    senderAta.address,
    payer,
    rawAmount
  );

  const memoPayload = {
    product: "CompliPay AI",
    kind: "programmable_payment_policy",
    paymentId: payment.id,
    decision: payment.complianceResult?.decision || "unknown",
    mode,
    conditionDigest: buildConditionDigest(payment),
    timestamp: nowIso(),
  };
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(JSON.stringify(memoPayload), "utf8"),
  });
  const transferInstruction = createTransferCheckedInstruction(
    senderAta.address,
    mint,
    recipientAta.address,
    payer.publicKey,
    rawAmount,
    decimals
  );
  const tx = new Transaction().add(memoInstruction, transferInstruction);
  const transferSignature = await sendAndConfirmTransaction(connection, tx, [payer], {
    commitment: "confirmed",
    skipPreflight: false,
  });

  return {
    signature: transferSignature,
    explorerUrl: `https://explorer.solana.com/tx/${transferSignature}?cluster=${cluster}`,
    network: cluster,
    simulated: false,
    assetType: "spl",
    tokenMint: mint.toBase58(),
    setupTxHash: mintSignature,
  };
}

async function executePaymentOnSolana(payment, mode = "manual") {
  const isStablecoinLike = payment.currency === "USDC" || payment.currency === "USDT";
  try {
    return isStablecoinLike
      ? await executeSplOnCluster(payment, "testnet", mode)
      : await executeSolOnCluster(payment.amount, "testnet");
  } catch {
    try {
      return isStablecoinLike
        ? await executeSplOnCluster(payment, "devnet", mode)
        : await executeSolOnCluster(payment.amount, "devnet");
    } catch {
      const signature = pseudoSignature();
      return {
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        network: "simulated",
        simulated: true,
        assetType: isStablecoinLike ? "spl-simulated" : "sol",
        tokenMint: null,
        setupTxHash: null,
      };
    }
  }
}

function mapPaymentTypeToTransactionType(paymentType) {
  return paymentType === "milestone"
    ? "payment"
    : paymentType === "automated"
      ? "treasury"
      : paymentType;
}

function insertTransactionRecord({
  transactionId,
  payment,
  execution,
  senderInstitution,
  batchId,
}) {
  const txTimestamp = nowIso();
  db.prepare(
    `INSERT INTO transactions (
      id, type, amount, currency, status, sender, receiver, timestamp, tx_hash, compliance_status,
      explorer_url, network, simulated, asset_type, token_mint, batch_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    transactionId,
    mapPaymentTypeToTransactionType(payment.type),
    payment.amount,
    payment.currency,
    execution.simulated ? "processing" : "completed",
    senderInstitution,
    payment.recipient,
    txTimestamp,
    execution.signature,
    "passed",
    execution.explorerUrl,
    execution.network,
    toBoolFlag(execution.simulated),
    execution.assetType || "sol",
    execution.tokenMint || null,
    batchId || null
  );
}

function parseAuthToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

function getSessionUser(token) {
  const hashedToken = hashSessionToken(token);
  let row = db
    .prepare(
      `SELECT s.token, s.expires_at, u.*
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(hashedToken);

  let legacyTokenMatched = false;
  if (!row) {
    row = db
      .prepare(
        `SELECT s.token, s.expires_at, u.*
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token = ?`
      )
      .get(token);
    legacyTokenMatched = Boolean(row);
  }

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(row.token);
    return null;
  }

  if (legacyTokenMatched) {
    try {
      db.prepare("UPDATE sessions SET token = ? WHERE token = ?").run(hashedToken, token);
    } catch {
      // Keep legacy session active if migration fails for any reason.
    }
  }

  return row;
}

function requireAuth(req, res, next) {
  const token = parseAuthToken(req);
  if (!token) return res.status(401).json({ error: "Unauthorized." });
  const sessionUser = getSessionUser(token);
  if (!sessionUser) return res.status(401).json({ error: "Session expired or invalid." });
  req.auth = { token, user: sessionUser };
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    const role = req.auth?.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden for this role." });
    }
    next();
  };
}

async function refreshWalletBalances() {
  const rows = db.prepare("SELECT * FROM wallets ORDER BY rowid ASC").all();
  const endpoint = SOLANA_RPC_ENDPOINT || clusterApiUrl(SOLANA_WALLET_CLUSTER);
  const connection = new Connection(endpoint, "confirmed");
  const update = db.prepare("UPDATE wallets SET balance = ? WHERE address = ?");
  const refreshed = [];
  const stablecoinMints = {
    USDC: USDC_TOKEN_MINT,
    USDT: USDT_TOKEN_MINT,
  };

  for (const row of rows) {
    let nextBalance = row.balance;
    try {
      if (row.currency === "SOL") {
        const owner = toPublicKeyOrNull(row.address);
        if (owner) {
          const lamports = await connection.getBalance(owner);
          nextBalance = Number((lamports / LAMPORTS_PER_SOL).toFixed(6));
        }
      } else if (row.currency === "USDC" || row.currency === "USDT") {
        const mintAddress = stablecoinMints[row.currency];
        if (mintAddress) {
          const splBalance = await fetchSplTokenBalance(connection, row.address, mintAddress);
          if (splBalance !== null) {
            nextBalance = splBalance;
          }
        }
      } else {
        const owner = toPublicKeyOrNull(row.address);
        if (owner) {
          const lamports = await connection.getBalance(owner);
          nextBalance = Number((lamports / LAMPORTS_PER_SOL).toFixed(6));
        }
      }
    } catch {
      nextBalance = row.balance;
    }
    update.run(nextBalance, row.address);
    refreshed.push({ ...row, balance: nextBalance });
  }

  return refreshed.map(serializeWallet);
}

const app = express();
app.set("trust proxy", resolveTrustProxy(TRUST_PROXY));
const corsOrigins = resolveCorsOrigins(CORS_ORIGIN);
const allowAnyCorsOrigin = corsOrigins.includes("*");
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    if (req.method === "OPTIONS") return res.status(204).end();
    return next();
  }

  const isAllowedOrigin = allowAnyCorsOrigin || corsOrigins.includes(origin);
  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowAnyCorsOrigin ? "*" : origin);
    if (!allowAnyCorsOrigin) {
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") {
    return res.status(isAllowedOrigin ? 204 : 403).end();
  }

  return next();
});
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (payload) => {
    if (sqliteDirty) {
      try {
        await pushSqliteSnapshot();
      } catch (error) {
        console.error("Failed to flush SQLite snapshot before response:", error);
      }
    }
    return originalJson(payload);
  };
  next();
});
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

const requestBuckets = new Map();
function rateLimit({ windowMs, max, keyPrefix, keyBuilder }) {
  return (req, res, next) => {
    const key = typeof keyBuilder === "function"
      ? keyBuilder(req, keyPrefix)
      : `${keyPrefix}:ip:${normalizeClientIp(req)}`;
    const now = Date.now();

    if (requestBuckets.size > 10_000) {
      cleanupExpiredRateLimitBuckets(now, requestBuckets);
    }

    const bucket = requestBuckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    requestBuckets.set(key, bucket);

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      return res.status(429).json({ error: "Too many requests. Please retry later." });
    }
    next();
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(AI_API_KEY),
    model: AI_MODEL,
    persistence: remoteSnapshotEnabled ? "sqlite+postgres-snapshot" : "sqlite",
  });
});

app.post("/api/auth/login", rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "login" }), (req, res) => {
  const parsed = validateSchema(req.body ?? {}, loginSchema);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const { email, password } = parsed.value;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  if (isLegacyPasswordHash(user.password_hash)) {
    const upgradedHash = hashPassword(password);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(upgradedHash, user.id);
    user.password_hash = upgradedHash;
  }

  const token = crypto.randomUUID();
  const tokenHash = hashSessionToken(token);
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    tokenHash,
    user.id,
    createdAt,
    expiresAt
  );

  return res.json({
    token,
    expiresAt,
    user: serializeUser(user),
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  return res.json({
    user: serializeUser(req.auth.user),
  });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  const tokenHash = hashSessionToken(req.auth.token);
  db.prepare("DELETE FROM sessions WHERE token = ? OR token = ?").run(tokenHash, req.auth.token);
  return res.json({ ok: true });
});

app.get("/api/bootstrap", requireAuth, (req, res) => {
  const payments = db.prepare("SELECT * FROM payments ORDER BY created_at DESC").all().map(serializePayment);
  const transactions = db
    .prepare("SELECT * FROM transactions ORDER BY timestamp DESC")
    .all()
    .map(serializeTransaction);
  const complianceAlerts = db
    .prepare("SELECT * FROM compliance_alerts ORDER BY timestamp DESC")
    .all()
    .map(serializeAlert);
  const aiAgentTasks = db.prepare("SELECT * FROM ai_tasks ORDER BY rowid ASC").all().map(serializeTask);
  const wallets = db.prepare("SELECT * FROM wallets ORDER BY rowid ASC").all().map(serializeWallet);
  const auditEvents = db
    .prepare("SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT 500")
    .all()
    .map(serializeAudit);

  return res.json({
    currentUser: serializeUser(req.auth.user),
    payments,
    transactions,
    complianceAlerts,
    aiAgentTasks,
    wallets,
    auditEvents,
  });
});

app.post("/api/wallets/refresh", requireAuth, requireRole(["admin", "operator"]), async (req, res) => {
  const wallets = await refreshWalletBalances();
  appendAuditEvent({
    category: "execution",
    action: "wallet_refresh",
    message: "Wallet balances refreshed from RPC endpoint.",
    userId: req.auth.user.id,
  });
  return res.json({ wallets });
});

app.post("/api/payments", requireAuth, requireRole(["admin", "operator"]), (req, res) => {
  const parsed = validateSchema(req.body ?? {}, createPaymentSchema);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const payload = parsed.value;

  const nextExecution = parseOptionalIsoDate(req.body?.nextExecution);
  if (req.body?.nextExecution !== undefined && req.body?.nextExecution !== null && !nextExecution) {
    return res.status(400).json({ error: "nextExecution must be a valid ISO date string." });
  }

  const id = randomId("pp");
  const createdAt = nowIso();
  const updatedAt = nowIso();
  db.prepare(
    `INSERT INTO payments (
      id, name, type, amount, currency, status, conditions_json, created_at, next_execution,
      recipient, recipient_kyc_verified, travel_rule_ready, compliance_result_json, last_tx_hash, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    payload.name,
    payload.type,
    payload.amount,
    payload.currency,
    "active",
    JSON.stringify(payload.conditions.length > 0 ? payload.conditions : ["Policy validated"]),
    createdAt,
    nextExecution,
    payload.recipient,
    toBoolFlag(payload.recipientKycVerified),
    toBoolFlag(payload.travelRuleReady),
    null,
    null,
    updatedAt
  );

  const auditEvent = appendAuditEvent({
    category: "payment",
    action: "created",
    message: `Payment contract "${payload.name}" created.`,
    paymentId: id,
    userId: req.auth.user.id,
  });

  const payment = serializePayment(db.prepare("SELECT * FROM payments WHERE id = ?").get(id));
  return res.status(201).json({ payment, auditEvent });
});

app.post("/api/payments/:id/compliance", requireAuth, requireRole(["admin", "operator"]), async (req, res) => {
  const paymentRow = db.prepare("SELECT * FROM payments WHERE id = ?").get(req.params.id);
  if (!paymentRow) return res.status(404).json({ error: "Payment not found." });

  const payment = serializePayment(paymentRow);
  const result = await evaluateCompliance({
    amount: payment.amount,
    recipient: payment.recipient,
    recipientKycVerified: payment.recipientKycVerified ?? true,
    travelRuleReady: payment.travelRuleReady ?? true,
  });

  db.prepare("UPDATE payments SET compliance_result_json = ?, updated_at = ? WHERE id = ?").run(
    JSON.stringify(result),
    nowIso(),
    payment.id
  );

  const alerts = [];
  const createAlert = db.prepare(
    `INSERT INTO compliance_alerts (id, type, severity, message, timestamp, status, transaction_id, payment_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const checks = result.checks || {};
  if (checks.kyc && checks.kyc !== "pass") {
    const id = randomId("ca");
    createAlert.run(
      id,
      "kyc",
      checks.kyc === "fail" ? "high" : "medium",
      "Recipient KYC validation requires attention.",
      nowIso(),
      checks.kyc === "fail" ? "open" : "investigating",
      null,
      payment.id
    );
    alerts.push(serializeAlert(db.prepare("SELECT * FROM compliance_alerts WHERE id = ?").get(id)));
  }
  if (checks.kyt && checks.kyt !== "pass") {
    const id = randomId("ca");
    createAlert.run(
      id,
      "kyt",
      "medium",
      "KYT review triggered due to transfer profile.",
      nowIso(),
      "investigating",
      null,
      payment.id
    );
    alerts.push(serializeAlert(db.prepare("SELECT * FROM compliance_alerts WHERE id = ?").get(id)));
  }
  if (checks.aml && checks.aml !== "pass") {
    const id = randomId("ca");
    createAlert.run(
      id,
      "aml",
      "high",
      "AML screening returned a potential sanctions signal.",
      nowIso(),
      "open",
      null,
      payment.id
    );
    alerts.push(serializeAlert(db.prepare("SELECT * FROM compliance_alerts WHERE id = ?").get(id)));
  }
  if (checks.travelRule && checks.travelRule !== "pass") {
    const id = randomId("ca");
    createAlert.run(
      id,
      "travel_rule",
      "medium",
      "Travel Rule metadata is incomplete for this transfer.",
      nowIso(),
      "investigating",
      null,
      payment.id
    );
    alerts.push(serializeAlert(db.prepare("SELECT * FROM compliance_alerts WHERE id = ?").get(id)));
  }

  const auditEvent = appendAuditEvent({
    category: "compliance",
    action: "evaluated",
    message: `Compliance decision for "${payment.name}": ${String(result.decision || "").toUpperCase()}.`,
    paymentId: payment.id,
    userId: req.auth.user.id,
  });

  const nextPayment = serializePayment(db.prepare("SELECT * FROM payments WHERE id = ?").get(payment.id));
  return res.json({
    result,
    payment: nextPayment,
    alerts,
    auditEvent,
  });
});

app.post("/api/payments/:id/ai-recommendation", requireAuth, requireRole(["admin", "operator"]), async (req, res) => {
  const paymentRow = db.prepare("SELECT * FROM payments WHERE id = ?").get(req.params.id);
  if (!paymentRow) return res.status(404).json({ error: "Payment not found." });

  const payment = serializePayment(paymentRow);
  const decision = payment.complianceResult?.decision;
  const recommendation =
    decision === "allow"
      ? "AI recommends execution now. Estimated settlement window: under 20 seconds."
      : decision === "review"
        ? "AI recommends manual compliance review before execution."
        : decision === "block"
          ? "AI blocks automation due to hard compliance fail."
          : "Run compliance first to unlock AI execution guidance.";

  db.prepare(
    `UPDATE ai_tasks
     SET description = ?, status = ?, last_run = ?, next_run = ?
     WHERE type = 'payment_execution'`
  ).run(
    recommendation,
    decision === "allow" ? "scheduled" : "paused",
    nowIso(),
    decision === "allow" ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null
  );

  const auditEvent = appendAuditEvent({
    category: "ai",
    action: "recommendation",
    message: `AI recommendation generated for "${payment.name}".`,
    paymentId: payment.id,
    userId: req.auth.user.id,
  });

  const taskRow = db.prepare("SELECT * FROM ai_tasks WHERE type = 'payment_execution'").get();
  return res.json({
    recommendation,
    task: taskRow ? serializeTask(taskRow) : null,
    auditEvent,
  });
});

app.post("/api/payments/:id/execute", requireAuth, requireRole(["admin", "operator"]), async (req, res) => {
  const paymentRow = db.prepare("SELECT * FROM payments WHERE id = ?").get(req.params.id);
  if (!paymentRow) return res.status(404).json({ error: "Payment not found." });
  const payment = serializePayment(paymentRow);

  if (!payment.complianceResult) {
    return res.status(409).json({ error: "Run compliance checks before execution." });
  }
  if (payment.complianceResult.decision !== "allow") {
    return res
      .status(409)
      .json({ error: `Execution blocked by policy: ${payment.complianceResult.decision.toUpperCase()}.` });
  }

  const mode = req.body?.mode === "ai" ? "ai" : "manual";
  appendAuditEvent({
    category: "execution",
    action: "requested",
    message: `${mode.toUpperCase()} execution requested for "${payment.name}".`,
    paymentId: payment.id,
    userId: req.auth.user.id,
  });

  const execution = await executePaymentOnSolana(payment, mode);
  const txId = randomId("tx");
  insertTransactionRecord({
    transactionId: txId,
    payment,
    execution,
    senderInstitution: req.auth.user.institution,
  });

  db.prepare("UPDATE payments SET status = ?, last_tx_hash = ?, updated_at = ? WHERE id = ?").run(
    execution.simulated ? "active" : "completed",
    execution.signature,
    nowIso(),
    payment.id
  );

  const alerts = [];
  if (execution.simulated) {
    const alertId = randomId("ca");
    db.prepare(
      `INSERT INTO compliance_alerts (id, type, severity, message, timestamp, status, transaction_id, payment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      alertId,
      "kyt",
      "low",
      "Execution ran in fallback simulation mode due network constraints.",
      nowIso(),
      "investigating",
      txId,
      payment.id
    );
    alerts.push(serializeAlert(db.prepare("SELECT * FROM compliance_alerts WHERE id = ?").get(alertId)));
  }

  const auditEvent = appendAuditEvent({
    category: "execution",
    action: execution.simulated ? "simulated" : "completed",
    message: `Execution for "${payment.name}" ${execution.simulated ? "simulated" : "confirmed"} on ${execution.network}.`,
    paymentId: payment.id,
    transactionId: txId,
    userId: req.auth.user.id,
  });

  return res.json({
    transaction: serializeTransaction(db.prepare("SELECT * FROM transactions WHERE id = ?").get(txId)),
    payment: serializePayment(db.prepare("SELECT * FROM payments WHERE id = ?").get(payment.id)),
    alerts,
    auditEvent,
  });
});

app.post(
  "/api/payments/batch-execute",
  requireAuth,
  requireRole(["admin", "operator"]),
  async (req, res) => {
    const parsed = validateSchema(req.body ?? {}, batchExecuteSchema);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });
    const uniqueIds = [...new Set(parsed.value.paymentIds)];
    if (uniqueIds.length === 0) {
      return res.status(400).json({ error: "paymentIds must contain at least one valid payment id." });
    }
    if (uniqueIds.length > 20) {
      return res.status(400).json({ error: "Batch size limit is 20 payments per request." });
    }

    const mode = parsed.value.mode;
    const batchId = randomId("batch");
    const results = [];
    const executedTransactions = [];
    const updatedPayments = [];
    const alerts = [];
    const auditEvents = [];

    for (const paymentId of uniqueIds) {
      const paymentRow = db.prepare("SELECT * FROM payments WHERE id = ?").get(paymentId);
      if (!paymentRow) {
        results.push({
          paymentId,
          status: "failed",
          reason: "Payment not found.",
        });
        continue;
      }
      const payment = serializePayment(paymentRow);
      if (!payment.complianceResult) {
        results.push({
          paymentId: payment.id,
          status: "failed",
          reason: "Compliance has not been run.",
        });
        continue;
      }
      if (payment.complianceResult.decision !== "allow") {
        results.push({
          paymentId: payment.id,
          status: "failed",
          reason: `Blocked by policy: ${String(payment.complianceResult.decision).toUpperCase()}.`,
        });
        continue;
      }

      try {
        const execution = await executePaymentOnSolana(payment, mode);
        const txId = randomId("tx");
        insertTransactionRecord({
          transactionId: txId,
          payment,
          execution,
          senderInstitution: req.auth.user.institution,
          batchId,
        });
        db.prepare("UPDATE payments SET status = ?, last_tx_hash = ?, updated_at = ? WHERE id = ?").run(
          execution.simulated ? "active" : "completed",
          execution.signature,
          nowIso(),
          payment.id
        );

        if (execution.simulated) {
          const alertId = randomId("ca");
          db.prepare(
            `INSERT INTO compliance_alerts (id, type, severity, message, timestamp, status, transaction_id, payment_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            alertId,
            "kyt",
            "low",
            "Batch execution ran in fallback simulation mode due to network constraints.",
            nowIso(),
            "investigating",
            txId,
            payment.id
          );
          alerts.push(serializeAlert(db.prepare("SELECT * FROM compliance_alerts WHERE id = ?").get(alertId)));
        }

        const event = appendAuditEvent({
          category: "execution",
          action: execution.simulated ? "batch_simulated" : "batch_completed_item",
          message: `Batch ${batchId} execution for "${payment.name}" ${execution.simulated ? "simulated" : "confirmed"} on ${execution.network}.`,
          paymentId: payment.id,
          transactionId: txId,
          userId: req.auth.user.id,
        });
        auditEvents.push(event);
        const transaction = serializeTransaction(db.prepare("SELECT * FROM transactions WHERE id = ?").get(txId));
        const updatedPayment = serializePayment(db.prepare("SELECT * FROM payments WHERE id = ?").get(payment.id));
        executedTransactions.push(transaction);
        updatedPayments.push(updatedPayment);
        results.push({
          paymentId: payment.id,
          status: execution.simulated ? "simulated" : "completed",
          reason: execution.simulated
            ? "Executed using simulation fallback."
            : "Executed and confirmed on-chain.",
          txHash: execution.signature,
          network: execution.network,
          assetType: execution.assetType,
          tokenMint: execution.tokenMint || null,
        });
      } catch (error) {
        results.push({
          paymentId: payment.id,
          status: "failed",
          reason: error instanceof Error ? error.message : "Execution failed.",
        });
      }
    }

    const summary = {
      total: uniqueIds.length,
      completed: results.filter((item) => item.status === "completed").length,
      simulated: results.filter((item) => item.status === "simulated").length,
      failed: results.filter((item) => item.status === "failed").length,
    };

    const batchAuditEvent = appendAuditEvent({
      category: "execution",
      action: "batch_completed",
      message: `Batch ${batchId} finished: ${summary.completed} completed, ${summary.simulated} simulated, ${summary.failed} failed.`,
      userId: req.auth.user.id,
    });
    auditEvents.unshift(batchAuditEvent);

    return res.json({
      batchId,
      mode,
      summary,
      results,
      transactions: executedTransactions,
      payments: updatedPayments,
      alerts,
      auditEvents,
    });
  }
);

app.post("/api/compliance/alerts/:id/resolve", requireAuth, requireRole(["admin", "operator"]), (req, res) => {
  const alertRow = db.prepare("SELECT * FROM compliance_alerts WHERE id = ?").get(req.params.id);
  if (!alertRow) return res.status(404).json({ error: "Alert not found." });

  db.prepare("UPDATE compliance_alerts SET status = 'resolved' WHERE id = ?").run(alertRow.id);
  const nextAlert = serializeAlert(db.prepare("SELECT * FROM compliance_alerts WHERE id = ?").get(alertRow.id));
  const auditEvent = appendAuditEvent({
    category: "compliance",
    action: "resolved",
    message: `Compliance alert resolved: ${nextAlert.type.toUpperCase()} (${nextAlert.message})`,
    paymentId: nextAlert.paymentId,
    transactionId: nextAlert.transactionId,
    userId: req.auth.user.id,
  });

  return res.json({ alert: nextAlert, auditEvent });
});

app.post(
  "/api/ai/chat",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 40, keyPrefix: "ai-chat", keyBuilder: aiChatRateLimitKey }),
  async (req, res) => {
  try {
    if (!AI_API_KEY) {
      return res.status(500).json({
        error: "AI API key is not configured. Set DASHSCOPE_API_KEY in your .env file.",
      });
    }

    const parsed = validateSchema(req.body ?? {}, aiChatSchema);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });
    const inputMessage = parsed.value.message;
    const safeHistory = sanitizeChatHistory(req.body?.history);

    const messages = [
      { role: "system", content: AI_SYSTEM_PROMPT },
      ...safeHistory,
      { role: "user", content: inputMessage },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Model API request failed.",
        details: text.slice(0, 500),
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const normalizedContent =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((item) => (typeof item?.text === "string" ? item.text : "")).join("\n")
          : "";

    if (!normalizedContent) {
      return res.status(502).json({ error: "Model returned an empty response." });
    }

    return res.json({
      content: normalizedContent,
      model: data?.model || AI_MODEL,
      usage: data?.usage || null,
      provider: "alibaba-model-studio",
    });
  } catch (error) {
    const isAbort = error && typeof error === "object" && error.name === "AbortError";
    return res.status(isAbort ? 504 : 500).json({
      error: isAbort ? "Model request timed out." : "Failed to process chat request.",
    });
  }
  }
);

if (process.env.NODE_ENV === "production" && !IS_VERCEL_RUNTIME) {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (!IS_VERCEL_RUNTIME) {
  app.listen(SERVER_PORT, () => {
    console.log(`CompliPay API server running on http://localhost:${SERVER_PORT}`);
    console.log("Security hardening enabled: PBKDF2 passwords, hashed sessions, and schema validation.");
  });
}

export default app;
