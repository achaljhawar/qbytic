CREATE TABLE "qbytic_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "qbytic_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "qbytic_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qbytic_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "qbytic_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "qbytic_user" ADD COLUMN "username" varchar(255);--> statement-breakpoint
ALTER TABLE "qbytic_user" ADD COLUMN "email_verified" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "qbytic_account" ADD CONSTRAINT "qbytic_account_user_id_qbytic_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."qbytic_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qbytic_session" ADD CONSTRAINT "qbytic_session_user_id_qbytic_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."qbytic_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "qbytic_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "qbytic_session" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "qbytic_user" ADD CONSTRAINT "qbytic_user_username_unique" UNIQUE("username");