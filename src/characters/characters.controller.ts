import { Controller, Get, Patch, Param } from "@nestjs/common"

@Controller("characters")
export class CharactersController {
    @Get()
    findAll(): string {
        return "This action returns all characters"
    }

    @Get("pair")
    findPair(): string {
        return "This action returns a pair of characters for a battle"
    }

    @Patch(":id")
    updateScore(@Param("id") id: string): string {
        return "This action is a vote for a character"
    }
}
