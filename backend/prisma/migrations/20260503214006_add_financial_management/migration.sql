/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `installmentNumber` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalInstallments` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `treatmentId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TreatmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_patientId_fkey";

-- DropIndex
DROP INDEX "Payment_appointmentId_key";

-- DropIndex
DROP INDEX "Payment_status_dueDate_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "appointmentId",
DROP COLUMN "patientId",
ADD COLUMN     "installmentNumber" INTEGER NOT NULL,
ADD COLUMN     "totalInstallments" INTEGER NOT NULL,
ADD COLUMN     "treatmentId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "method" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "TreatmentStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Treatment_patientId_status_idx" ON "Treatment"("patientId", "status");

-- CreateIndex
CREATE INDEX "Treatment_createdAt_idx" ON "Treatment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_treatmentId_status_idx" ON "Payment"("treatmentId", "status");

-- CreateIndex
CREATE INDEX "Payment_dueDate_idx" ON "Payment"("dueDate");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
