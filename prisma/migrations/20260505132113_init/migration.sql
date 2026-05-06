-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FARMER', 'BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('RU', 'TJ');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('ACTIVE', 'SOLD', 'HIDDEN');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "region" TEXT,
    "district" TEXT,
    "role" "Role" NOT NULL DEFAULT 'FARMER',
    "language" "Language" NOT NULL DEFAULT 'RU',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTj" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameTj" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "wateringGuideRu" TEXT NOT NULL,
    "wateringGuideTj" TEXT NOT NULL,
    "commonDiseasesRu" TEXT NOT NULL,
    "commonDiseasesTj" TEXT NOT NULL,
    "careTipsRu" TEXT NOT NULL,
    "careTipsTj" TEXT NOT NULL,
    "harvestTimeRu" TEXT NOT NULL,
    "harvestTimeTj" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disease" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameTj" TEXT NOT NULL,
    "symptomsRu" TEXT NOT NULL,
    "symptomsTj" TEXT NOT NULL,
    "treatmentRu" TEXT NOT NULL,
    "treatmentTj" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosisHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "detectedProblem" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "aiAdviceJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosisHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IrrigationHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "soilType" TEXT NOT NULL,
    "growthStage" TEXT NOT NULL,
    "fieldSize" DOUBLE PRECISION NOT NULL,
    "dripIrrigation" BOOLEAN NOT NULL DEFAULT false,
    "aiAdviceJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrrigationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" "MarketStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'RU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketPriceAdvice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "adviceJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketPriceAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE INDEX "Region_name_idx" ON "Region"("name");

-- CreateIndex
CREATE INDEX "Crop_nameRu_idx" ON "Crop"("nameRu");

-- CreateIndex
CREATE INDEX "Crop_nameTj_idx" ON "Crop"("nameTj");

-- CreateIndex
CREATE INDEX "Disease_cropId_idx" ON "Disease"("cropId");

-- CreateIndex
CREATE INDEX "Disease_riskLevel_idx" ON "Disease"("riskLevel");

-- CreateIndex
CREATE INDEX "DiagnosisHistory_userId_createdAt_idx" ON "DiagnosisHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DiagnosisHistory_cropId_idx" ON "DiagnosisHistory"("cropId");

-- CreateIndex
CREATE INDEX "DiagnosisHistory_regionId_idx" ON "DiagnosisHistory"("regionId");

-- CreateIndex
CREATE INDEX "DiagnosisHistory_riskLevel_idx" ON "DiagnosisHistory"("riskLevel");

-- CreateIndex
CREATE INDEX "IrrigationHistory_userId_createdAt_idx" ON "IrrigationHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "IrrigationHistory_cropId_idx" ON "IrrigationHistory"("cropId");

-- CreateIndex
CREATE INDEX "IrrigationHistory_regionId_idx" ON "IrrigationHistory"("regionId");

-- CreateIndex
CREATE INDEX "MarketProduct_userId_createdAt_idx" ON "MarketProduct"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MarketProduct_cropId_idx" ON "MarketProduct"("cropId");

-- CreateIndex
CREATE INDEX "MarketProduct_regionId_idx" ON "MarketProduct"("regionId");

-- CreateIndex
CREATE INDEX "MarketProduct_status_idx" ON "MarketProduct"("status");

-- CreateIndex
CREATE INDEX "MarketProduct_title_idx" ON "MarketProduct"("title");

-- CreateIndex
CREATE INDEX "AiChatMessage_userId_createdAt_idx" ON "AiChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiChatMessage_language_idx" ON "AiChatMessage"("language");

-- CreateIndex
CREATE INDEX "MarketPriceAdvice_userId_createdAt_idx" ON "MarketPriceAdvice"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MarketPriceAdvice_productId_idx" ON "MarketPriceAdvice"("productId");

-- CreateIndex
CREATE INDEX "AdminLog_adminId_createdAt_idx" ON "AdminLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_targetType_targetId_idx" ON "AdminLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Disease" ADD CONSTRAINT "Disease_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisHistory" ADD CONSTRAINT "DiagnosisHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisHistory" ADD CONSTRAINT "DiagnosisHistory_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisHistory" ADD CONSTRAINT "DiagnosisHistory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationHistory" ADD CONSTRAINT "IrrigationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationHistory" ADD CONSTRAINT "IrrigationHistory_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IrrigationHistory" ADD CONSTRAINT "IrrigationHistory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketProduct" ADD CONSTRAINT "MarketProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketProduct" ADD CONSTRAINT "MarketProduct_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketProduct" ADD CONSTRAINT "MarketProduct_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketPriceAdvice" ADD CONSTRAINT "MarketPriceAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketPriceAdvice" ADD CONSTRAINT "MarketPriceAdvice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MarketProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
