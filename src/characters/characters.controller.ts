import { Controller, Get } from "@nestjs/common"
import { CharactersService } from "./characters.service"
import { Character } from "@prisma/client"

@Controller("characters")
export class CharactersController {
    constructor(private readonly characterService: CharactersService) {}

    @Get()
    async getAllCharacters(): Promise<Character[]> {
        return this.characterService.getAllCharacters()
    }

    @Get("sorted")
    async getCharactersOrderedByScore(): Promise<Character[]> {
        return this.characterService.getCharactersOrderedByScore()
    }
}
