-- CreateEnum
CREATE TYPE "credential_type" AS ENUM ('BEARER', 'BASIC', 'API_KEY');

-- CreateTable
CREATE TABLE "credentials" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" "credential_type" NOT NULL,
    "encrypted_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credentials_workspace_id_idx" ON "credentials"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "credentials_workspace_id_name_key" ON "credentials"("workspace_id", "name");

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
