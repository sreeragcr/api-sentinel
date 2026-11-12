-- CreateEnum
CREATE TYPE "http_method" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS');

-- CreateTable
CREATE TABLE "rest_endpoints" (
    "id" UUID NOT NULL,
    "api_definition_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "method" "http_method" NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rest_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rest_endpoints_api_definition_id_idx" ON "rest_endpoints"("api_definition_id");

-- CreateIndex
CREATE UNIQUE INDEX "rest_endpoints_api_definition_id_method_path_key" ON "rest_endpoints"("api_definition_id", "method", "path");

-- AddForeignKey
ALTER TABLE "rest_endpoints" ADD CONSTRAINT "rest_endpoints_api_definition_id_fkey" FOREIGN KEY ("api_definition_id") REFERENCES "api_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
