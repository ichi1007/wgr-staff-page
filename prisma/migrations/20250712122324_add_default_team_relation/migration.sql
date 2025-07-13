/*
  Warnings:

  - A unique constraint covering the columns `[defaultTeamId]` on the table `CustomSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CustomSetting" ADD COLUMN     "defaultTeamId" TEXT;

-- CreateTable
CREATE TABLE "defaultTeam" (
    "id" TEXT NOT NULL,
    "team1Name" TEXT NOT NULL,
    "team2Name" TEXT NOT NULL,
    "team3Name" TEXT NOT NULL,
    "team4Name" TEXT NOT NULL,
    "team5Name" TEXT NOT NULL,
    "team6Name" TEXT NOT NULL,
    "team7Name" TEXT NOT NULL,
    "team8Name" TEXT NOT NULL,
    "team9Name" TEXT NOT NULL,
    "team10Name" TEXT NOT NULL,
    "team11Name" TEXT NOT NULL,
    "team12Name" TEXT NOT NULL,
    "team13Name" TEXT NOT NULL,
    "team14Name" TEXT NOT NULL,
    "team15Name" TEXT NOT NULL,
    "team16Name" TEXT NOT NULL,
    "team17Name" TEXT NOT NULL,
    "team18Name" TEXT NOT NULL,
    "team19Name" TEXT NOT NULL,
    "team20Name" TEXT NOT NULL,

    CONSTRAINT "defaultTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomSetting_defaultTeamId_key" ON "CustomSetting"("defaultTeamId");

-- AddForeignKey
ALTER TABLE "CustomSetting" ADD CONSTRAINT "CustomSetting_defaultTeamId_fkey" FOREIGN KEY ("defaultTeamId") REFERENCES "defaultTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
