DO $$ BEGIN
 CREATE TYPE "run_status" AS ENUM('queued', 'running', 'awaiting_approval', 'succeeded', 'failed', 'cancelled', 'timed_out');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"repository" text,
	"connected_at" timestamp with time zone,
	"webhook_secret" text NOT NULL,
	"trigger_push" boolean DEFAULT true NOT NULL,
	"trigger_pull_request" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'offline' NOT NULL,
	"token_hash" text NOT NULL,
	"token_preview" text NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "runners_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"workflow_name" text NOT NULL,
	"trigger" text NOT NULL,
	"status" "run_status" DEFAULT 'queued' NOT NULL,
	"graph" jsonb NOT NULL,
	"events" jsonb NOT NULL,
	"decision" text,
	"decided_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Existing values were written by now() in UTC; convert explicitly.
ALTER TABLE "workflows" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "workflows" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "github_settings" ADD CONSTRAINT "github_settings_single_row" CHECK ("id" = 1);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "runs_workflow_started_idx" ON "runs" ("workflow_id","started_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "runs" ADD CONSTRAINT "runs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
