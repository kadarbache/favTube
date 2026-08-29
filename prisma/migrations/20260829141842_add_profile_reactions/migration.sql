-- CreateEnum
CREATE TYPE "ProfileReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "profile_reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileUserId" TEXT NOT NULL,
    "type" "ProfileReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_reaction_profileUserId_idx" ON "profile_reaction"("profileUserId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_reaction_userId_profileUserId_key" ON "profile_reaction"("userId", "profileUserId");

-- AddForeignKey
ALTER TABLE "profile_reaction" ADD CONSTRAINT "profile_reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_reaction" ADD CONSTRAINT "profile_reaction_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
