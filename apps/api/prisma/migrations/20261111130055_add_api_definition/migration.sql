-- CreateEnum
CREATE TYPE "api_protocol" AS ENUM ('REST', 'GRAPHQL', 'GRPC');

-- CreateTable
CREATE TABLE "api_definitions" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "protocol" "api_protocol" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "api_definitions_project_id_idx" ON "api_definitions"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_definitions_project_id_name_key" ON "api_definitions"("project_id", "name");

-- AddForeignKey
ALTER TABLE "api_definitions" ADD CONSTRAINT "api_definitions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
