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
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common"
import { CharactersService } from "./characters.service"
import { Character } from "@prisma/client"
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger"
import { CreateCharacterDto } from "./dto/create-character.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { CharacterDto } from "./dto/character.dto"

@Controller("characters")
export class CharactersController {
    constructor(private readonly characterService: CharactersService) {}

    @Get()
    @ApiOperation({ summary: "Get all characters without sorting" })
    async getAllCharacters(): Promise<CharacterDto[]> {
        return this.characterService.getAllCharacters()
    }

    @Get("sorted")
    @ApiOperation({ summary: "Get all characters sorted by descending score" })
    async getCharactersOrderedByScore(): Promise<CharacterDto[]> {
        return this.characterService.getCharactersOrderedByScore()
    }

    @Post()
    @UseInterceptors(FileInterceptor("file"))
    @ApiOperation({ summary: "Add new character" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "New character data",
        schema: {
            type: "object",
            properties: {
                name: { type: "string" },
                file: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    })
    async addNewCharacter(
        @UploadedFile() file: Express.Multer.File,
        @Body() character: CreateCharacterDto
    ): Promise<Character> {
        try {
            if (!file)
                throw new HttpException(
                    "A file upload is required",
                    HttpStatus.BAD_REQUEST
                )
            // Upload image to supabase bucket
            const imageFileName = await this.characterService.uploadImage(file)

            const characterWithImage = { ...character, imageFileName }

            return await this.characterService.addNewCharacter(
                characterWithImage
            )
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message,
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
