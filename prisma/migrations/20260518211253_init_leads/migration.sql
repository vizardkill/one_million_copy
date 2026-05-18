-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('instagram', 'facebook', 'landing_page', 'referido', 'otro');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "source" "LeadSource" NOT NULL,
    "product_interest" TEXT,
    "budget" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_email_key" ON "leads"("email");

-- CreateIndex
CREATE INDEX "idx_leads_source_created_at" ON "leads"("source", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_leads_created_at" ON "leads"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_leads_deleted_created_at" ON "leads"("deleted_at", "created_at" DESC);
