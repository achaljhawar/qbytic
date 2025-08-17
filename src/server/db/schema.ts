import { relations, sql } from "drizzle-orm";
import { 
  index, 
  pgTableCreator, 
  pgEnum,
  varchar,
  integer,
  decimal,
  bigint,
  timestamp,
  boolean,
  text,
  primaryKey,
  unique
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `qbytic_${name}`);

export const loanStatusEnum = pgEnum("loan_status", [
  "NONE",
  "PROPOSED",
  "ACTIVE",
  "REPAID",
  "DEFAULTED",
  "CANCELLED",
]);

export const stablecoinEnum = pgEnum("stablecoin", ["USDC", "USDT"]);

// Users table
export const users = createTable("user", {
  id: integer("id").generatedByDefaultAsIdentity().primaryKey(),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  creditScore: integer("credit_score"),
  image: varchar("image", { length: 255 }),
});

// Loans table (mirror LoanVault struct)
export const loans = createTable(
  "loan",
  {
    id: integer("id").generatedByDefaultAsIdentity(),

    // Participants
    borrowerId: integer("borrower_id").notNull().references(() => users.id),
    lenderId: integer("lender_id").references(() => users.id),

    // Loan terms
    collateralAmount: decimal("collateral_amount", { precision: 38, scale: 18 }),
    principalAmount: decimal("principal_amount", { precision: 38, scale: 18 }).notNull(),
    outstandingDebt: decimal("outstanding_debt", { precision: 38, scale: 18 }),
    interestRate: integer("interest_rate"), // basis points (10000 = 100%)
    monthlyPayment: decimal("monthly_payment", { precision: 38, scale: 18 }),
    duration: bigint("duration", { mode: "bigint" }).notNull(), // in seconds

    // Timestamps
    proposalTime: timestamp("proposal_time", { withTimezone: true }),
    startTime: timestamp("start_time", { withTimezone: true }),
    lastPaymentTime: timestamp("last_payment_time", { withTimezone: true }),
    proposalExpiration: timestamp("proposal_expiration", { withTimezone: true }),

    // Tracking
    creditScore: integer("credit_score"),
    stablecoin: stablecoinEnum("stablecoin").notNull(),
    status: loanStatusEnum("loan_status").default("PROPOSED").notNull(),
    totalRepaid: decimal("total_repaid", { precision: 38, scale: 18 }).default("0"),
    liquidatedAmount: decimal("liquidated_amount", { precision: 38, scale: 18 }).default("0"),

    // Collateral state
    collateralDeposited: boolean("collateral_deposited").default(false),
    collateralHolder: varchar("collateral_holder", { length: 255 }),

    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    loanBorrowerIdx: index("loan_borrower_idx").on(t.borrowerId),
    loanLenderIdx: index("loan_lender_idx").on(t.lenderId),
    loanStatusIdx: index("loan_status_idx").on(t.status),
  }),
);

// NextAuth tables for authentication
export const accounts = createTable(
  "account",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 }).notNull().primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  })
);

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  borrowedLoans: many(loans, { relationName: "borrower" }),
  lentLoans: many(loans, { relationName: "lender" }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// Loan relations
export const loansRelations = relations(loans, ({ one }) => ({
  borrower: one(users, {
    fields: [loans.borrowerId],
    references: [users.id],
    relationName: "borrower",
  }),
  lender: one(users, {
    fields: [loans.lenderId],
    references: [users.id],
    relationName: "lender",
  }),
}));