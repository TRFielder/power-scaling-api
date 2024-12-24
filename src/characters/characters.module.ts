import { Module } from "@nestjs/common"
import { CharactersController } from "./characters.controller"
import { CharactersService } from "./characters.service"
import { PrismaModule } from "../prisma/prisma.module"
import { SupabaseModule } from "../supabase/supabase.module"

@Module({
    imports: [PrismaModule, SupabaseModule],
    controllers: [CharactersController],
    providers: [CharactersService],
})
export class CharactersModule {}
