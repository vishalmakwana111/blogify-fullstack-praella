-- CreateTable
CREATE TABLE "post_saves" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_saves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_saves_userId_idx" ON "post_saves"("userId");

-- CreateIndex
CREATE INDEX "post_saves_postId_idx" ON "post_saves"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "post_saves_userId_postId_key" ON "post_saves"("userId", "postId");

-- AddForeignKey
ALTER TABLE "post_saves" ADD CONSTRAINT "post_saves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_saves" ADD CONSTRAINT "post_saves_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
