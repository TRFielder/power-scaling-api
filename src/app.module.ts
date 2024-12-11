import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { ConfigModule } from "@nestjs/config"
import { CharactersModule } from "./characters/characters.module"

@Module({
    imports: [ConfigModule.forRoot(), CharactersModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
