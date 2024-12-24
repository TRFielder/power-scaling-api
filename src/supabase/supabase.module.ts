import { Module } from "@nestjs/common"
import { SupabaseService } from "./supabase.service"

@Module({
    providers: [SupabaseService],
    exports: [SupabaseService], //export this service to use in other modules
})
export class SupabaseModule {}
