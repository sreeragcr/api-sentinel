-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");
