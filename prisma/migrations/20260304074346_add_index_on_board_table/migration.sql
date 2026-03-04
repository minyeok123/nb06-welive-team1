-- DropIndex
DROP INDEX "boards_board_type_created_at_idx";

-- CreateIndex
CREATE INDEX "boards_board_type_apt_id_idx" ON "boards"("board_type", "apt_id");
