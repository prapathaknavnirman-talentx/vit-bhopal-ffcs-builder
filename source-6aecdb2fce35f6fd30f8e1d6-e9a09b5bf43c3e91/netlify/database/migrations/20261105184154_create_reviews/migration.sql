CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_range" CHECK ("rating" between 1 and 5),
	CONSTRAINT "reviews_name_length" CHECK (length("name") between 1 and 80),
	CONSTRAINT "reviews_comment_length" CHECK (length("comment") between 1 and 1500)
);
