/*
  Warnings:

  - You are about to drop the column `defaultTeamId` on the `CustomSetting` table. All the data in the column will be lost.
  - You are about to drop the `defaultTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomSetting" DROP CONSTRAINT "CustomSetting_defaultTeamId_fkey";

-- DropIndex
DROP INDEX "CustomSetting_defaultTeamId_key";

-- AlterTable
ALTER TABLE "CustomSetting" DROP COLUMN "defaultTeamId",
ADD COLUMN     "defaultTeams" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "defaultTeam";
