import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { CharactersController } from "./characters/characters.controller"
import { ConfigModule } from "@nestjs/config"

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [AppController, CharactersController],
    providers: [AppService],
})
export class AppModule {}
