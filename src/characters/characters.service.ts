import {
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { Character, Prisma } from "@prisma/client"
import { CharacterDto } from "./dto/character.dto"
import { SupabaseService } from "../supabase/supabase.service"

@Injectable()
export class CharactersService {
    private readonly logger = new Logger(CharactersService.name)
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabase: SupabaseService
    ) {}

    async getImageForCharacter(character: Character): Promise<CharacterDto> {
        this.logger.log(
            "Generating signed image URL for filename",
            character.imageFileName
        )

        const url = await this.supabase.getSignedUrl(
            character.imageFileName,
            10 * 60
        )

        return {
            id: character.id,
            name: character.name,
            score: character.score,
            imageUrl: url,
        }
    }

    async getAllCharacters(): Promise<CharacterDto[]> {
        this.logger.log("Request made to get all characters")
        const characters = await this.prisma.character.findMany()

        const charactersWithSignedImageUrls: Promise<CharacterDto[]> =
            Promise.all(
                characters.map(async (character) =>
                    this.getImageForCharacter(character)
                )
            )

        return charactersWithSignedImageUrls
    }

    async getCharactersOrderedByScore(): Promise<CharacterDto[]> {
        this.logger.log("Request made to get characters ordered by score")
        const characters = await this.prisma.character.findMany({
            orderBy: [{ score: "desc" }],
        })

        const charactersWithSignedImageUrls: Promise<CharacterDto[]> =
            Promise.all(
                characters.map(async (character) =>
                    this.getImageForCharacter(character)
                )
            )

        return charactersWithSignedImageUrls
    }

    async addNewCharacter(
        data: Prisma.CharacterCreateInput
    ): Promise<Character> {
        this.logger.log(
            `Request made to create a character with details ${JSON.stringify(data)}`
        )
        return this.prisma.character.create({ data })
    }

    async incrementScore(params: {
        where: Prisma.CharacterWhereUniqueInput
    }): Promise<Character> {
        const { where } = params

        this.logger.log(
            `Matchup result submitted. Incrementing score for ID: ${where.id}`
        )
        return this.prisma.character.update({
            where,
            data: {
                score: {
                    increment: 5,
                },
            },
        })
    }

    async decrementScore(params: {
        where: Prisma.CharacterWhereUniqueInput
    }): Promise<Character> {
        const { where } = params

        // Fetch current score, if it's already 0 we'll just leave it there
        const character = await this.prisma.character.findUnique({
            where,
            select: { score: true },
        })

        if (!character) {
            throw new NotFoundException(
                `Character with ID ${where.id} not found.`
            )
        }

        // Check if the score is 0
        if (character.score <= 0) {
            this.logger.log(
                `Score is already 0 for ID: ${where.id}. No changes made.`
            )
            return await this.prisma.character.findUnique({ where }) // Return the character as is
        }

        // Decrement the score if it is greater than 0
        return this.prisma.character.update({
            where,
            data: {
                score: {
                    decrement: 5,
                },
            },
        })
    }

    // Upload an image file for a character
    async uploadImage(file: Express.Multer.File) {
        this.logger.log(
            `Attempting to upload an image with name: ${file.originalname}`
        )
        try {
            return await this.supabase.uploadImage(file)
        } catch (error) {
            this.logger.error(
                `Error calling uploadImage from character service: ${error}`
            )
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
