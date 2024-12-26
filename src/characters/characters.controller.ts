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
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiOkResponse,
    ApiResponse,
} from "@nestjs/swagger"
import { CreateCharacterDto } from "./dto/create-character.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { CharacterDto, NewCharacterDto } from "./dto/character.dto"

@Controller("characters")
export class CharactersController {
    constructor(private readonly characterService: CharactersService) {}

    @Get()
    @ApiOperation({ summary: "Get all characters without sorting" })
    @ApiOkResponse({
        description: "List of characters",
        type: [CharacterDto],
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "Error generating signed URL for character image",
        content: {
            "application/json": {
                example: {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message:
                        "Error generating signed URL for character image with filename example.png",
                },
            },
        },
    })
    async getAllCharacters(): Promise<CharacterDto[]> {
        return this.characterService.getAllCharacters()
    }

    @Get("sorted")
    @ApiOperation({ summary: "Get all characters sorted by descending score" })
    @ApiOkResponse({
        description: "List of characters sorted by score",
        type: [CharacterDto],
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "Error generating signed URL for character image",
        content: {
            "application/json": {
                example: {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message:
                        "Error generating signed URL for character image with filename example.png",
                },
            },
        },
    })
    async getCharactersOrderedByScore(): Promise<CharacterDto[]> {
        return this.characterService.getCharactersOrderedByScore()
    }

    @Get("pair")
    @ApiOperation({ summary: "Get a random pair of characters" })
    @ApiOkResponse({
        description: "Two random characters",
        type: [CharacterDto],
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "Error generating signed URL for character image",
        content: {
            "application/json": {
                example: {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message:
                        "Error generating signed URL for character image with filename example.png",
                },
            },
        },
    })
    async getPairOfCharacters(): Promise<CharacterDto[]> {
        return this.characterService.getPairOfCharacters()
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
    @ApiOkResponse({
        description: "The newly created character",
        type: NewCharacterDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: "A file was expected but not supplied",
        content: {
            "application/json": {
                example: {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "A file upload is required",
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "Failed to upload image to supabase storage",
        content: {
            "application/json": {
                example: {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: "Failed to upload file: [Error message]",
                },
            },
        },
    })
    async addNewCharacter(
        @UploadedFile() file: Express.Multer.File,
        @Body() character: CreateCharacterDto
    ): Promise<NewCharacterDto> {
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
    @ApiOkResponse({
        description: "The updated character, reflecting the new score",
        type: CharacterDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "An unknown error occurred",
        content: {
            "application/json": {
                example: {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: "Example error message",
                },
            },
        },
    })
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
    @ApiOkResponse({
        description: "The updated character, reflecting the new score",
        type: CharacterDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "An unknown error occurred",
        content: {
            "application/json": {
                example: {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: "Example error message",
                },
            },
        },
    })
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
