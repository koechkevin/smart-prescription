-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PHYSICIAN', 'PHARMACIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FindingType" AS ENUM ('OBSERVATION', 'SYMPTOM', 'SIGN', 'VITAL', 'LAB_RESULT');

-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('DAYS', 'WEEKS', 'MONTHS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PHYSICIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionTemplate" (
    "id" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "description" TEXT,
    "icd11Code" TEXT NOT NULL,
    "icd11Description" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "instructions" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateFinding" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "finding" TEXT NOT NULL,
    "findingType" "FindingType" NOT NULL DEFAULT 'OBSERVATION',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TemplateFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateDrugItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "drugCode" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "duration" INTEGER,
    "durationUnit" "DurationUnit" NOT NULL DEFAULT 'DAYS',
    "routeOfAdministration" TEXT,
    "instructions" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TemplateDrugItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugCatalog" (
    "id" TEXT NOT NULL,
    "genericConceptCode" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "strength" TEXT,
    "route" TEXT,
    "dosageForm" TEXT,
    "shelfLife" INTEGER,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrugCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PrescriptionTemplate_icd11Code_idx" ON "PrescriptionTemplate"("icd11Code");

-- CreateIndex
CREATE INDEX "PrescriptionTemplate_createdById_idx" ON "PrescriptionTemplate"("createdById");

-- CreateIndex
CREATE INDEX "PrescriptionTemplate_visibility_idx" ON "PrescriptionTemplate"("visibility");

-- CreateIndex
CREATE INDEX "TemplateDrugItem_drugCode_idx" ON "TemplateDrugItem"("drugCode");

-- CreateIndex
CREATE UNIQUE INDEX "DrugCatalog_genericConceptCode_key" ON "DrugCatalog"("genericConceptCode");

-- CreateIndex
CREATE INDEX "DrugCatalog_genericName_idx" ON "DrugCatalog"("genericName");

-- AddForeignKey
ALTER TABLE "PrescriptionTemplate" ADD CONSTRAINT "PrescriptionTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateFinding" ADD CONSTRAINT "TemplateFinding_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PrescriptionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateDrugItem" ADD CONSTRAINT "TemplateDrugItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PrescriptionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
