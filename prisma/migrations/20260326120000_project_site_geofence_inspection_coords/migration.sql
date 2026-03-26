-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "siteLatitude" DOUBLE PRECISION,
ADD COLUMN     "siteLongitude" DOUBLE PRECISION,
ADD COLUMN     "geofenceRadiusMeters" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "siteAddress" TEXT,
ADD COLUMN     "siteLabel" TEXT;

-- AlterTable
ALTER TABLE "Inspection" ADD COLUMN     "submittedLatitude" DOUBLE PRECISION,
ADD COLUMN     "submittedLongitude" DOUBLE PRECISION;
