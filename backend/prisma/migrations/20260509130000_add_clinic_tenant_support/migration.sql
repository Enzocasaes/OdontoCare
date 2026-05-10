-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicMember" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClinicMember_clinicId_userId_key" ON "ClinicMember"("clinicId", "userId");

-- CreateIndex
CREATE INDEX "ClinicMember_userId_idx" ON "ClinicMember"("userId");

-- Seed default clinic for existing data
INSERT INTO "Clinic" ("id", "name", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Consultório Principal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "MedicalRecord" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "Anamnesis" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "Treatment" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "ClinicalRecord" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "Odontogram" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "Attachment" ADD COLUMN "clinicId" TEXT;

-- Backfill clinicId for existing rows
UPDATE "Patient" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "Appointment" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "MedicalRecord" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "Anamnesis" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "Payment" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "Treatment" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "ActivityLog" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "ClinicalRecord" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "Odontogram" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;
UPDATE "Attachment" SET "clinicId" = '00000000-0000-0000-0000-000000000001' WHERE "clinicId" IS NULL;

-- Make columns required
ALTER TABLE "Patient" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "MedicalRecord" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Anamnesis" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Treatment" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "ActivityLog" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "ClinicalRecord" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Odontogram" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Attachment" ALTER COLUMN "clinicId" SET NOT NULL;

-- Remove old unique constraints that are now tenant-scoped
DROP INDEX IF EXISTS "Patient_document_key";
DROP INDEX IF EXISTS "Odontogram_patientId_key";
DROP INDEX IF EXISTS "Anamnesis_patientId_version_key";

-- CreateIndexes
CREATE UNIQUE INDEX "Patient_clinicId_document_key" ON "Patient"("clinicId", "document");
CREATE UNIQUE INDEX "Odontogram_clinicId_patientId_key" ON "Odontogram"("clinicId", "patientId");
CREATE UNIQUE INDEX "Anamnesis_clinicId_patientId_version_key" ON "Anamnesis"("clinicId", "patientId", "version");
CREATE INDEX "Patient_clinicId_fullName_idx" ON "Patient"("clinicId", "fullName");
CREATE INDEX "Appointment_clinicId_startAt_idx" ON "Appointment"("clinicId", "startAt");
CREATE INDEX "MedicalRecord_clinicId_patientId_createdAt_idx" ON "MedicalRecord"("clinicId", "patientId", "createdAt");
CREATE INDEX "Anamnesis_clinicId_patientId_version_idx" ON "Anamnesis"("clinicId", "patientId", "version");
CREATE INDEX "Payment_clinicId_treatmentId_status_idx" ON "Payment"("clinicId", "treatmentId", "status");
CREATE INDEX "Treatment_clinicId_patientId_status_idx" ON "Treatment"("clinicId", "patientId", "status");
CREATE INDEX "ActivityLog_clinicId_createdAt_idx" ON "ActivityLog"("clinicId", "createdAt");
CREATE INDEX "ClinicalRecord_clinicId_patientId_createdAt_idx" ON "ClinicalRecord"("clinicId", "patientId", "createdAt");
CREATE INDEX "ClinicalRecord_clinicId_dentistId_idx" ON "ClinicalRecord"("clinicId", "dentistId");
CREATE INDEX "Odontogram_clinicId_patientId_idx" ON "Odontogram"("clinicId", "patientId");
CREATE INDEX "Attachment_clinicId_patientId_idx" ON "Attachment"("clinicId", "patientId");
CREATE INDEX "Attachment_clinicId_clinicalRecordId_idx" ON "Attachment"("clinicId", "clinicalRecordId");
CREATE INDEX "Attachment_clinicId_createdAt_idx" ON "Attachment"("clinicId", "createdAt");

-- AddForeignKey
ALTER TABLE "ClinicMember" ADD CONSTRAINT "ClinicMember_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicMember" ADD CONSTRAINT "ClinicMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Patient" ADD CONSTRAINT "Patient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Anamnesis" ADD CONSTRAINT "Anamnesis_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClinicalRecord" ADD CONSTRAINT "ClinicalRecord_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Odontogram" ADD CONSTRAINT "Odontogram_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
