-- CreateTable
CREATE TABLE "rest_request_configurations" (
    "id" UUID NOT NULL,
    "endpoint_id" UUID NOT NULL,
    "query_parameters" JSONB NOT NULL,
    "path_parameters" JSONB NOT NULL,
    "headers" JSONB NOT NULL,
    "authentication" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rest_request_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rest_request_configurations_endpoint_id_key" ON "rest_request_configurations"("endpoint_id");

-- AddForeignKey
ALTER TABLE "rest_request_configurations" ADD CONSTRAINT "rest_request_configurations_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "rest_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
