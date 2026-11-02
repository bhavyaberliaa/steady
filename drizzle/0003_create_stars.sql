CREATE TABLE "stars" (
	"user_id" uuid NOT NULL,
	"affirmation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stars_user_id_affirmation_id_pk" PRIMARY KEY("user_id","affirmation_id")
);
--> statement-breakpoint
ALTER TABLE "stars" ADD CONSTRAINT "stars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stars" ADD CONSTRAINT "stars_affirmation_id_affirmations_id_fk" FOREIGN KEY ("affirmation_id") REFERENCES "public"."affirmations"("id") ON DELETE cascade ON UPDATE no action;