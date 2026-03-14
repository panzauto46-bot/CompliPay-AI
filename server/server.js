import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import express from "express";
import dotenv from "dotenv";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PORT = Number(process.env.SERVER_PORT || 8787);
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || 24);
const PASSWORD_SALT = process.env.AUTH_PASSWORD_SALT || "complipay-demo-salt";
const AI_API_KEY = process.env.DASHSCOPE_API_KEY || process.env.MODEL_STUDIO_API_KEY || "";
const AI_BASE_URL = process.env.AI_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const AI_MODEL = process.env.AI_MODEL || "qwen-plus";
const AI_SYSTEM_PROMPT =
  process.env.AI_SYSTEM_PROMPT ||
  "You are CompliPay AI assistant for institutional stablecoin operations. Provide concise, compliant guidance focused on KYC, KYT, AML, Travel Rule, settlement, and auditability.";
const COMPLIANCE_PROVIDER_URL = process.env.COMPLIANCE_PROVIDER_URL || "";
const COMPLIANCE_PROVIDER_KEY = process.env.COMPLIANCE_PROVIDER_KEY || "";
const SOLANA_WALLET_CLUSTER = process.env.SOLANA_WALLET_CLUSTER || "devnet";
const SOLANA_RPC_ENDPOINT = process.env.SOLANA_RPC_ENDPOINT || "";

const dataDir = process.env.DB_DIR
  ? path.resolve(process.env.DB_DIR)
  : path.resolve(__dirname, "data");
mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "complipay.db"));
db.exec("PRAGMA journal_mode = WAL;");
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
  simulated INTEGER NOT NULL DEFAULT 0
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

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  return `${prefix}-${crypto.randomBytes(5).toString("hex")}`;
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(`${password}:${PASSWORD_SALT}`).digest("hex");
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

async function executeOnCluster(uiAmount, cluster) {
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
  };
}

async function executePaymentOnSolana(uiAmount) {
  try {
    return await executeOnCluster(uiAmount, "testnet");
  } catch {
    try {
      return await executeOnCluster(uiAmount, "devnet");
    } catch {
      const signature = pseudoSignature();
      return {
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        network: "simulated",
        simulated: true,
      };
    }
  }
}

function parseAuthToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

function getSessionUser(token) {
  const row = db
    .prepare(
      `SELECT s.token, s.expires_at, u.*
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
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

  for (const row of rows) {
    let nextBalance = row.balance;
    try {
      if (row.currency === "USDC" || row.currency === "USDT") {
        const lamports = await connection.getBalance(row.address);
        nextBalance = Number((lamports / LAMPORTS_PER_SOL).toFixed(6));
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
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

const requestBuckets = new Map();
function rateLimit({ windowMs, max, keyPrefix }) {
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || "unknown"}`;
    const now = Date.now();
    const bucket = requestBuckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    requestBuckets.set(key, bucket);
    if (bucket.count > max) {
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
    persistence: "sqlite",
  });
});

app.post("/api/auth/login", rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "login" }), (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = crypto.randomUUID();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    token,
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
  db.prepare("DELETE FROM sessions WHERE token = ?").run(req.auth.token);
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
  const body = req.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type : "";
  const recipient = typeof body.recipient === "string" ? body.recipient.trim() : "";
  const currency = typeof body.currency === "string" ? body.currency : "USDC";
  const amount = Number(body.amount || 0);
  const conditions = Array.isArray(body.conditions) ? body.conditions.filter(Boolean) : [];

  if (!name || !recipient || !amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid payment payload." });
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
    name,
    type || "escrow",
    amount,
    currency,
    "active",
    JSON.stringify(conditions.length > 0 ? conditions : ["Policy validated"]),
    createdAt,
    body.nextExecution || null,
    recipient,
    toBoolFlag(Boolean(body.recipientKycVerified)),
    toBoolFlag(Boolean(body.travelRuleReady)),
    null,
    null,
    updatedAt
  );

  const auditEvent = appendAuditEvent({
    category: "payment",
    action: "created",
    message: `Payment contract "${name}" created.`,
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

app.post("/api/payments/:id/ai-recommendation", requireAuth, async (req, res) => {
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

  const execution = await executePaymentOnSolana(payment.amount);
  const txType =
    payment.type === "milestone" ? "payment" : payment.type === "automated" ? "treasury" : payment.type;
  const txId = randomId("tx");
  const txTimestamp = nowIso();
  db.prepare(
    `INSERT INTO transactions (
      id, type, amount, currency, status, sender, receiver, timestamp, tx_hash, compliance_status,
      explorer_url, network, simulated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    txId,
    txType,
    payment.amount,
    payment.currency,
    execution.simulated ? "processing" : "completed",
    req.auth.user.institution,
    payment.recipient,
    txTimestamp,
    execution.signature,
    "passed",
    execution.explorerUrl,
    execution.network,
    toBoolFlag(execution.simulated)
  );

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
  rateLimit({ windowMs: 60_000, max: 40, keyPrefix: "ai-chat" }),
  async (req, res) => {
  try {
    if (!AI_API_KEY) {
      return res.status(500).json({
        error: "AI API key is not configured. Set DASHSCOPE_API_KEY in your .env file.",
      });
    }

    const body = req.body ?? {};
    const inputMessage = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];
    if (!inputMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    const safeHistory = history
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        role: item.role === "assistant" || item.role === "user" ? item.role : "user",
        content: String(item.content || ""),
      }))
      .filter((item) => item.content.trim().length > 0)
      .slice(-12);

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

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(SERVER_PORT, () => {
  console.log(`CompliPay API server running on http://localhost:${SERVER_PORT}`);
  console.log("Demo login credentials:");
  console.log(" - admin@complipay.ai / Admin123!");
  console.log(" - ops@complipay.ai / Ops123!");
  console.log(" - viewer@complipay.ai / View123!");
});
