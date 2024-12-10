import { Controller, Get } from "@nestjs/common"
// biome-ignore lint: I'll get to this. this is a type import but it's a class...
import { AppService } from "./app.service"

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello()
    }
}
