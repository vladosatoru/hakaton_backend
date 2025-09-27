-- CreateEnum
CREATE TYPE "EvacuationRequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "content_category_id" INTEGER;

-- AlterTable
ALTER TABLE "news" ADD COLUMN     "category_id" INTEGER;

-- CreateTable
CREATE TABLE "fine_statistics" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "violations_detected" INTEGER NOT NULL,
    "decrees_issued" INTEGER NOT NULL,
    "fines_imposed" INTEGER NOT NULL,
    "fines_collected" INTEGER NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fine_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evacuation_statistics" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "tow_trucks_on_line" INTEGER NOT NULL,
    "callouts" INTEGER NOT NULL,
    "evacuations_count" INTEGER NOT NULL,
    "impound_lot_revenue" INTEGER NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "evacuation_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evacuation_routes" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "efficiency" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "evacuation_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evacuation_requests" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "estimated_cost" INTEGER,
    "status" "EvacuationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,

    CONSTRAINT "evacuation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_light_registry" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "registry_number" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "light_type" TEXT NOT NULL,
    "install_year" INTEGER NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "last_maintenance" TIMESTAMP(3),
    "is_public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "traffic_light_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_categories" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "content_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacancies" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "salary" TEXT,
    "location" TEXT,
    "employment_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "publish_date" TIMESTAMP(3),
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "image_url" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "budget" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "working_hours" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_contents" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "page_key" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "page_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "traffic_light_registry_registry_number_key" ON "traffic_light_registry"("registry_number");

-- CreateIndex
CREATE UNIQUE INDEX "content_categories_name_key" ON "content_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "page_contents_page_key_key" ON "page_contents"("page_key");

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "content_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_content_category_id_fkey" FOREIGN KEY ("content_category_id") REFERENCES "content_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_contents" ADD CONSTRAINT "page_contents_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
