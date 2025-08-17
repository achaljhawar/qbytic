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
  boolean
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
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  creditScore: integer("credit_score"),
  image: varchar("image", { length: 255 }),
});

// Loans table (mirror LoanVault struct)
export const loans = createTable(
  "loan",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),

    // Participants
    borrowerId: varchar("borrower_id", { length: 255 }).notNull().references(() => users.id),
    lenderId: varchar("lender_id", { length: 255 }).references(() => users.id),

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

// Loan relations
export const loansRelations = relations(loans, ({ one }) => ({
  borrower: one(users, {
    fields: [loans.borrowerId],
    references: [users.id],
  }),
  lender: one(users, {
    fields: [loans.lenderId],
    references: [users.id],
  }),
}));