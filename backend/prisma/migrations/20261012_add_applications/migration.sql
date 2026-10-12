-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "pitch" TEXT,
    "proposed_rate" DECIMAL(12,2),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "brand_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_creator_id_campaign_id_key" ON "applications"("creator_id", "campaign_id");

-- CreateIndex
CREATE INDEX "applications_campaign_id_status_idx" ON "applications"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "applications_creator_id_status_idx" ON "applications"("creator_id", "status");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
