-- CreateTable
CREATE TABLE "api_environments" (
    "id" UUID NOT NULL,
    "api_definition_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "base_url" VARCHAR(500) NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_environments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_environments_api_definition_id_name_key" ON "api_environments"("api_definition_id", "name");

-- CreateIndex
CREATE INDEX "api_environments_api_definition_id_idx" ON "api_environments"("api_definition_id");

-- AddForeignKey
ALTER TABLE "api_environments" ADD CONSTRAINT "api_environments_api_definition_id_fkey" FOREIGN KEY ("api_definition_id") REFERENCES "api_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
