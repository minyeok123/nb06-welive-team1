-- AddForeignKey
ALTER TABLE "registers" ADD CONSTRAINT "registers_apt_id_fkey" FOREIGN KEY ("apt_id") REFERENCES "apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
