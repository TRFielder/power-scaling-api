import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
} from "@nestjs/common"
import { CharactersService } from "./characters.service"
import { Character } from "@prisma/client"
import { ApiOperation } from "@nestjs/swagger"
import { CreateCharacterDto } from "./dto/create-character.dto"

@Controller("characters")
export class CharactersController {
    constructor(private readonly characterService: CharactersService) {}

    @Get()
    @ApiOperation({ summary: "Get all characters without sorting" })
    async getAllCharacters(): Promise<Character[]> {
        return this.characterService.getAllCharacters()
    }

    @Get("sorted")
    @ApiOperation({ summary: "Get all characters sorted by descending score" })
    async getCharactersOrderedByScore(): Promise<Character[]> {
        return this.characterService.getCharactersOrderedByScore()
    }

    @Post()
    @ApiOperation({ summary: "Add new character" })
    async addNewCharacter(
        @Body() character: CreateCharacterDto
    ): Promise<Character> {
        try {
            return await this.characterService.addNewCharacter(character)
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: "Check your input",
                },
                HttpStatus.BAD_REQUEST,
                { cause: error }
            )
        }
    }

    @Patch(":id/up")
    @ApiOperation({ summary: "Increment character's score by 5" })
    async incrementScoreForCharacter(
        @Param("id") id: string
    ): Promise<Character> {
        if (Number.isNaN(Number(id)))
            throw new BadRequestException("ID was not parsed as a number")
        return await this.characterService.incrementScore({
            where: { id: Number(id) },
        })
    }

    @Patch(":id/down")
    @ApiOperation({ summary: "Decrement character's score by 5" })
    async decrementScoreForCharacter(
        @Param("id") id: string
    ): Promise<Character> {
        if (Number.isNaN(Number(id)))
            throw new BadRequestException("ID was not parsed as a number")
        return await this.characterService.decrementScore({
            where: { id: Number(id) },
        })
    }
}
