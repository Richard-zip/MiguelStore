CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"image_pathname" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
