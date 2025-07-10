-- CreateTable
CREATE TABLE "Customs" (
    "id" SERIAL NOT NULL,
    "itemCount" INTEGER NOT NULL,

    CONSTRAINT "Customs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customsId" INTEGER NOT NULL,

    CONSTRAINT "CustomItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomSetting" (
    "id" TEXT NOT NULL,
    "customItemId" TEXT NOT NULL,
    "customName" TEXT NOT NULL,
    "algs" BOOLEAN NOT NULL DEFAULT false,
    "killPointLimit" INTEGER,
    "killPoint" INTEGER,
    "placementPointId" TEXT,
    "polandRule" BOOLEAN NOT NULL DEFAULT false,
    "polandKillPoint" INTEGER,
    "matchPoint" INTEGER,
    "teamDeathMatch" BOOLEAN NOT NULL DEFAULT false,
    "tdmKillPoint" INTEGER,
    "tdmPoint1" INTEGER,
    "tdmPoint2" INTEGER,

    CONSTRAINT "CustomSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementPoint" (
    "id" TEXT NOT NULL,
    "place1" INTEGER NOT NULL,
    "place2" INTEGER NOT NULL,
    "place3" INTEGER NOT NULL,
    "place4" INTEGER NOT NULL,
    "place5" INTEGER NOT NULL,
    "place6" INTEGER NOT NULL,
    "place7" INTEGER NOT NULL,
    "place8" INTEGER NOT NULL,
    "place9" INTEGER NOT NULL,
    "place10" INTEGER NOT NULL,
    "place11" INTEGER NOT NULL,
    "place12" INTEGER NOT NULL,
    "place13" INTEGER NOT NULL,
    "place14" INTEGER NOT NULL,
    "place15" INTEGER NOT NULL,
    "place16" INTEGER NOT NULL,
    "place17" INTEGER NOT NULL,
    "place18" INTEGER NOT NULL,
    "place19" INTEGER NOT NULL,
    "place20" INTEGER NOT NULL,

    CONSTRAINT "PlacementPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomData" (
    "id" TEXT NOT NULL,
    "customItemId" TEXT NOT NULL,
    "mapName" TEXT NOT NULL,
    "mid" TEXT NOT NULL,
    "matchStart" TEXT NOT NULL,

    CONSTRAINT "CustomData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerResult" (
    "id" TEXT NOT NULL,
    "customDataId" TEXT NOT NULL,
    "teamNum" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamPlacement" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "kill" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "damage" DOUBLE PRECISION NOT NULL,
    "shots" INTEGER NOT NULL,
    "hits" INTEGER NOT NULL,
    "killPoint" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PlayerResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamResult" (
    "id" TEXT NOT NULL,
    "customDataId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teamNum" INTEGER NOT NULL,
    "placement" INTEGER NOT NULL,
    "placementPoint" DOUBLE PRECISION NOT NULL,
    "killPoint" DOUBLE PRECISION NOT NULL,
    "allPoint" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TeamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCountTop" (
    "id" TEXT NOT NULL,
    "customItemId" TEXT NOT NULL,

    CONSTRAINT "PlayerCountTop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KillCountTop" (
    "id" TEXT NOT NULL,
    "playerCountTopId" TEXT NOT NULL,
    "playerName1" TEXT NOT NULL,
    "kill1" INTEGER NOT NULL,
    "damage1" INTEGER NOT NULL,
    "playerName2" TEXT NOT NULL,
    "kill2" INTEGER NOT NULL,
    "damage2" INTEGER NOT NULL,
    "playerName3" TEXT NOT NULL,
    "kill3" INTEGER NOT NULL,
    "damage3" INTEGER NOT NULL,
    "playerName4" TEXT NOT NULL,
    "kill4" INTEGER NOT NULL,
    "damage4" INTEGER NOT NULL,
    "playerName5" TEXT NOT NULL,
    "kill5" INTEGER NOT NULL,
    "damage5" INTEGER NOT NULL,

    CONSTRAINT "KillCountTop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageCountTop" (
    "id" TEXT NOT NULL,
    "playerCountTopId" TEXT NOT NULL,
    "playerName1" TEXT NOT NULL,
    "kill1" INTEGER NOT NULL,
    "damage1" INTEGER NOT NULL,
    "playerName2" TEXT NOT NULL,
    "kill2" INTEGER NOT NULL,
    "damage2" INTEGER NOT NULL,
    "playerName3" TEXT NOT NULL,
    "kill3" INTEGER NOT NULL,
    "damage3" INTEGER NOT NULL,
    "playerName4" TEXT NOT NULL,
    "kill4" INTEGER NOT NULL,
    "damage4" INTEGER NOT NULL,
    "playerName5" TEXT NOT NULL,
    "kill5" INTEGER NOT NULL,
    "damage5" INTEGER NOT NULL,

    CONSTRAINT "DamageCountTop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterUse" (
    "id" TEXT NOT NULL,
    "customItemId" TEXT NOT NULL,
    "lastGet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterUseMatches" (
    "id" TEXT NOT NULL,
    "characterUseId" TEXT NOT NULL,
    "alter" INTEGER NOT NULL DEFAULT 0,
    "ash" INTEGER NOT NULL DEFAULT 0,
    "ballistic" INTEGER NOT NULL DEFAULT 0,
    "bangalore" INTEGER NOT NULL DEFAULT 0,
    "bloodhound" INTEGER NOT NULL DEFAULT 0,
    "catalyst" INTEGER NOT NULL DEFAULT 0,
    "caustic" INTEGER NOT NULL DEFAULT 0,
    "conduit" INTEGER NOT NULL DEFAULT 0,
    "crypto" INTEGER NOT NULL DEFAULT 0,
    "fuse" INTEGER NOT NULL DEFAULT 0,
    "gibraltar" INTEGER NOT NULL DEFAULT 0,
    "horizon" INTEGER NOT NULL DEFAULT 0,
    "lifeline" INTEGER NOT NULL DEFAULT 0,
    "loba" INTEGER NOT NULL DEFAULT 0,
    "madmaggie" INTEGER NOT NULL DEFAULT 0,
    "mirage" INTEGER NOT NULL DEFAULT 0,
    "newcastle" INTEGER NOT NULL DEFAULT 0,
    "octane" INTEGER NOT NULL DEFAULT 0,
    "pathfinder" INTEGER NOT NULL DEFAULT 0,
    "rampart" INTEGER NOT NULL DEFAULT 0,
    "revenant" INTEGER NOT NULL DEFAULT 0,
    "seer" INTEGER NOT NULL DEFAULT 0,
    "valkyrie" INTEGER NOT NULL DEFAULT 0,
    "vantage" INTEGER NOT NULL DEFAULT 0,
    "wattson" INTEGER NOT NULL DEFAULT 0,
    "wraith" INTEGER NOT NULL DEFAULT 0,
    "banCharacter" TEXT,

    CONSTRAINT "CharacterUseMatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDataAll" (
    "id" TEXT NOT NULL,
    "customItemId" TEXT NOT NULL,

    CONSTRAINT "CustomDataAll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamData" (
    "id" TEXT NOT NULL,
    "customDataAllId" TEXT NOT NULL,
    "placement" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "placementPoint" INTEGER NOT NULL,
    "killPoint" INTEGER NOT NULL,
    "allPoint" INTEGER NOT NULL,

    CONSTRAINT "TeamData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomSetting_customItemId_key" ON "CustomSetting"("customItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCountTop_customItemId_key" ON "PlayerCountTop"("customItemId");

-- CreateIndex
CREATE UNIQUE INDEX "KillCountTop_playerCountTopId_key" ON "KillCountTop"("playerCountTopId");

-- CreateIndex
CREATE UNIQUE INDEX "DamageCountTop_playerCountTopId_key" ON "DamageCountTop"("playerCountTopId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterUse_customItemId_key" ON "CharacterUse"("customItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDataAll_customItemId_key" ON "CustomDataAll"("customItemId");

-- AddForeignKey
ALTER TABLE "CustomItem" ADD CONSTRAINT "CustomItem_customsId_fkey" FOREIGN KEY ("customsId") REFERENCES "Customs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSetting" ADD CONSTRAINT "CustomSetting_customItemId_fkey" FOREIGN KEY ("customItemId") REFERENCES "CustomItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSetting" ADD CONSTRAINT "CustomSetting_placementPointId_fkey" FOREIGN KEY ("placementPointId") REFERENCES "PlacementPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomData" ADD CONSTRAINT "CustomData_customItemId_fkey" FOREIGN KEY ("customItemId") REFERENCES "CustomItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResult" ADD CONSTRAINT "PlayerResult_customDataId_fkey" FOREIGN KEY ("customDataId") REFERENCES "CustomData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamResult" ADD CONSTRAINT "TeamResult_customDataId_fkey" FOREIGN KEY ("customDataId") REFERENCES "CustomData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCountTop" ADD CONSTRAINT "PlayerCountTop_customItemId_fkey" FOREIGN KEY ("customItemId") REFERENCES "CustomItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KillCountTop" ADD CONSTRAINT "KillCountTop_playerCountTopId_fkey" FOREIGN KEY ("playerCountTopId") REFERENCES "PlayerCountTop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageCountTop" ADD CONSTRAINT "DamageCountTop_playerCountTopId_fkey" FOREIGN KEY ("playerCountTopId") REFERENCES "PlayerCountTop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterUse" ADD CONSTRAINT "CharacterUse_customItemId_fkey" FOREIGN KEY ("customItemId") REFERENCES "CustomItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterUseMatches" ADD CONSTRAINT "CharacterUseMatches_characterUseId_fkey" FOREIGN KEY ("characterUseId") REFERENCES "CharacterUse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDataAll" ADD CONSTRAINT "CustomDataAll_customItemId_fkey" FOREIGN KEY ("customItemId") REFERENCES "CustomItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamData" ADD CONSTRAINT "TeamData_customDataAllId_fkey" FOREIGN KEY ("customDataAllId") REFERENCES "CustomDataAll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
