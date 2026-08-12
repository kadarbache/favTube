-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "replyToId" TEXT;

-- CreateIndex
CREATE INDEX "comment_replyToId_idx" ON "comment"("replyToId");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
