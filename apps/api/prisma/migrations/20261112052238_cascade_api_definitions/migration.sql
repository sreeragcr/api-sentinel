-- DropForeignKey
ALTER TABLE "api_definitions" DROP CONSTRAINT "api_definitions_project_id_fkey";

-- AddForeignKey
ALTER TABLE "api_definitions" ADD CONSTRAINT "api_definitions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
