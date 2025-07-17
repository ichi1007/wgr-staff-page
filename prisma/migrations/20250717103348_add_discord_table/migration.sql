/*
  Warnings:

  - You are about to drop the `Discord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Discord" DROP CONSTRAINT "Discord_userId_fkey";

-- DropTable
DROP TABLE "Discord";

-- CreateTable
CREATE TABLE "discord" (
    "discordUserId" TEXT NOT NULL,
    "discordName" TEXT NOT NULL,
    "avatar" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "discord_pkey" PRIMARY KEY ("discordUserId")
);

-- CreateTable
CREATE TABLE "overlay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overlayCustomName" TEXT NOT NULL,
    "overlayMatchNumber" INTEGER NOT NULL,
    "scoreBar" BOOLEAN NOT NULL DEFAULT true,
    "teamInfo" BOOLEAN NOT NULL DEFAULT true,
    "playerInventory" BOOLEAN NOT NULL DEFAULT true,
    "teamDestruction" BOOLEAN NOT NULL DEFAULT true,
    "observerName" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "overlay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_userId_key" ON "discord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "overlay_userId_key" ON "overlay"("userId");

-- AddForeignKey
ALTER TABLE "discord" ADD CONSTRAINT "discord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overlay" ADD CONSTRAINT "overlay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
