import "server-only";
import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import type {
  Customer,
  Policy,
  Claim,
  Payment,
  Agent,
  DocumentRecord,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "insurance.xlsx");

export const SHEETS = {
  customers: "Customers",
  policies: "Policies",
  claims: "Claims",
  payments: "Payments",
  agents: "Agents",
  documents: "Documents",
} as const;

/* ------------------------------------------------------------------ */
/*  Simple in-process write lock so concurrent API writes never clash  */
/* ------------------------------------------------------------------ */
let writeChain: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => T | Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  // keep the chain alive even if a task rejects
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run as Promise<T>;
}

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */
function seed() {
  const customers: Customer[] = [
    {
      customerId: "CUST-0001",
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+91 98765 43210",
      address: "12 Marine Drive, Mumbai, MH 400002",
      createdAt: "2025-11-02",
    },
    {
      customerId: "CUST-0002",
      name: "Diya Nair",
      email: "diya.nair@example.com",
      phone: "+91 90123 45678",
      address: "44 MG Road, Bengaluru, KA 560001",
      createdAt: "2026-01-18",
    },
  ];

  const policies: Policy[] = [
    {
      policyId: "POL-2026-00001",
      customerId: "CUST-0001",
      policyName: "Health Shield Elite",
      category: "Health",
      coverage: 10000000,
      premium: 1499,
      duration: "1 Year",
      status: "Active",
      startDate: "2026-02-01",
      endDate: "2027-01-31",
      nominee: "Isha Sharma",
      createdAt: "2026-02-01",
    },
    {
      policyId: "POL-2026-00002",
      customerId: "CUST-0001",
      policyName: "Motor Secure Comprehensive",
      category: "Motor",
      coverage: 1500000,
      premium: 583,
      duration: "1 Year",
      status: "Active",
      startDate: "2026-03-12",
      endDate: "2027-03-11",
      nominee: "Isha Sharma",
      createdAt: "2026-03-12",
    },
    {
      policyId: "POL-2026-00003",
      customerId: "CUST-0002",
      policyName: "Life Secure Term Plan",
      category: "Life",
      coverage: 20000000,
      premium: 999,
      duration: "40 Years",
      status: "Active",
      startDate: "2026-04-05",
      endDate: "2066-04-04",
      nominee: "Rohan Nair",
      createdAt: "2026-04-05",
    },
  ];

  const claims: Claim[] = [
    {
      claimId: "CLM-2026-0001",
      policyId: "POL-2026-00001",
      customerName: "Aarav Sharma",
      claimType: "Hospitalization",
      incidentDate: "2026-05-14",
      description: "Emergency appendectomy at network hospital.",
      amount: 185000,
      status: "Approved",
      submittedDate: "2026-05-16",
      documentName: "discharge-summary.pdf",
    },
    {
      claimId: "CLM-2026-0002",
      policyId: "POL-2026-00002",
      customerName: "Aarav Sharma",
      claimType: "Accident",
      incidentDate: "2026-06-22",
      description: "Front bumper damage from minor collision.",
      amount: 42000,
      status: "Under Review",
      submittedDate: "2026-06-24",
      documentName: "vehicle-photos.zip",
    },
  ];

  const payments: Payment[] = [
    {
      paymentId: "PAY-2026-0001",
      policyId: "POL-2026-00001",
      amount: 17988,
      date: "2026-02-01",
      status: "Success",
      last4: "1111",
      method: "Visa",
      reference: "REF-8FJ2K9Q1",
    },
    {
      paymentId: "PAY-2026-0002",
      policyId: "POL-2026-00002",
      amount: 6996,
      date: "2026-03-12",
      status: "Success",
      last4: "4444",
      method: "Mastercard",
      reference: "REF-7DK1M4P8",
    },
    {
      paymentId: "PAY-2026-0003",
      policyId: "POL-2026-00003",
      amount: 11988,
      date: "2026-04-05",
      status: "Success",
      last4: "1111",
      method: "Visa",
      reference: "REF-2QW9Z7X3",
    },
  ];

  const agents: Agent[] = [
    { agentId: "AGT-001", name: "Kabir Menon", email: "kabir.menon@insureplus.com", phone: "+91 98111 22233", region: "West", rating: 4.9 },
    { agentId: "AGT-002", name: "Sara Khan", email: "sara.khan@insureplus.com", phone: "+91 97444 55566", region: "South", rating: 4.8 },
    { agentId: "AGT-003", name: "Vikram Rao", email: "vikram.rao@insureplus.com", phone: "+91 96777 88899", region: "North", rating: 4.7 },
  ];

  const documents: DocumentRecord[] = [
    { documentId: "DOC-0001", policyId: "POL-2026-00001", name: "Policy Certificate.pdf", type: "Certificate", uploadedDate: "2026-02-01" },
    { documentId: "DOC-0002", policyId: "POL-2026-00001", name: "Tax Receipt 80D.pdf", type: "Receipt", uploadedDate: "2026-02-01" },
    { documentId: "DOC-0003", policyId: "POL-2026-00003", name: "Policy Certificate.pdf", type: "Certificate", uploadedDate: "2026-04-05" },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customers), SHEETS.customers);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(policies), SHEETS.policies);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(claims), SHEETS.claims);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payments), SHEETS.payments);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agents), SHEETS.agents);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(documents), SHEETS.documents);

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  XLSX.writeFile(wb, DB_PATH);
}

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) seed();
}

function loadBook(): XLSX.WorkBook {
  ensureDb();
  return XLSX.readFile(DB_PATH, { cellDates: false });
}

function saveBook(wb: XLSX.WorkBook) {
  XLSX.writeFile(wb, DB_PATH);
}

function readSheet<T>(name: string): T[] {
  const wb = loadBook();
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<T>(ws, { defval: "" });
}

function writeSheet<T>(name: string, rows: T[]) {
  const wb = loadBook();
  const ws = XLSX.utils.json_to_sheet(rows as Record<string, unknown>[]);
  wb.Sheets[name] = ws;
  if (!wb.SheetNames.includes(name)) wb.SheetNames.push(name);
  saveBook(wb);
}

/* ------------------------------------------------------------------ */
/*  Public read helpers                                                */
/* ------------------------------------------------------------------ */
export function getCustomers() { return readSheet<Customer>(SHEETS.customers); }
export function getPolicies() { return readSheet<Policy>(SHEETS.policies); }
export function getClaims() { return readSheet<Claim>(SHEETS.claims); }
export function getPayments() { return readSheet<Payment>(SHEETS.payments); }
export function getAgents() { return readSheet<Agent>(SHEETS.agents); }
export function getDocuments() { return readSheet<DocumentRecord>(SHEETS.documents); }

export function getCustomerByEmail(email: string): Customer | undefined {
  const target = email.trim().toLowerCase();
  return getCustomers().find((c) => (c.email || "").toLowerCase() === target);
}

/* ------------------------------------------------------------------ */
/*  ID generation                                                      */
/* ------------------------------------------------------------------ */
function nextSeq(ids: string[], prefix: string): number {
  let max = 0;
  for (const id of ids) {
    const m = String(id).match(/(\d+)\s*$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

export function newPolicyId(): string {
  const seq = nextSeq(getPolicies().map((p) => p.policyId), "POL");
  return `POL-2026-${String(seq).padStart(5, "0")}`;
}
export function newCustomerId(): string {
  const seq = nextSeq(getCustomers().map((c) => c.customerId), "CUST");
  return `CUST-${String(seq).padStart(4, "0")}`;
}
export function newClaimId(): string {
  const seq = nextSeq(getClaims().map((c) => c.claimId), "CLM");
  return `CLM-2026-${String(seq).padStart(4, "0")}`;
}
export function newPaymentId(): string {
  const seq = nextSeq(getPayments().map((p) => p.paymentId), "PAY");
  return `PAY-2026-${String(seq).padStart(4, "0")}`;
}
export function newDocumentId(): string {
  const seq = nextSeq(getDocuments().map((d) => d.documentId), "DOC");
  return `DOC-${String(seq).padStart(4, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Public write helpers (serialised through the lock)                 */
/* ------------------------------------------------------------------ */
export function addCustomer(c: Customer) {
  return withLock(() => {
    const rows = getCustomers();
    rows.push(c);
    writeSheet(SHEETS.customers, rows);
    return c;
  });
}

export function upsertCustomer(input: Omit<Customer, "customerId" | "createdAt"> & { customerId?: string }) {
  return withLock(() => {
    const rows = getCustomers();
    const existing = rows.find((r) => r.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      Object.assign(existing, { name: input.name, phone: input.phone, address: input.address });
      writeSheet(SHEETS.customers, rows);
      return existing;
    }
    const created: Customer = {
      customerId: input.customerId || `CUST-${String(nextSeq(rows.map((r) => r.customerId), "CUST")).padStart(4, "0")}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    rows.push(created);
    writeSheet(SHEETS.customers, rows);
    return created;
  });
}

export function addPolicy(p: Policy) {
  return withLock(() => {
    const rows = getPolicies();
    rows.push(p);
    writeSheet(SHEETS.policies, rows);
    return p;
  });
}

export function addClaim(c: Claim) {
  return withLock(() => {
    const rows = getClaims();
    rows.push(c);
    writeSheet(SHEETS.claims, rows);
    return c;
  });
}

export function addPayment(p: Payment) {
  return withLock(() => {
    const rows = getPayments();
    rows.push(p);
    writeSheet(SHEETS.payments, rows);
    return p;
  });
}

export function addDocument(d: DocumentRecord) {
  return withLock(() => {
    const rows = getDocuments();
    rows.push(d);
    writeSheet(SHEETS.documents, rows);
    return d;
  });
}
