-- AlterTable
ALTER TABLE "video_entry" ADD COLUMN     "metadataFetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "video_entry_metadataFetchedAt_idx" ON "video_entry"("metadataFetchedAt");
