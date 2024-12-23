import {
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { Character, Prisma } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"

@Injectable()
export class CharactersService {
    private readonly logger = new Logger(CharactersService.name)
    private readonly supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    )
    constructor(private readonly prisma: PrismaService) {}

    async getAllCharacters(): Promise<Character[]> {
        this.logger.log("Request made to get all characters")
        return this.prisma.character.findMany()
    }

    async getCharactersOrderedByScore(): Promise<Character[]> {
        this.logger.log("Request made to get characters ordered by score")
        return this.prisma.character.findMany({
            orderBy: [{ score: "desc" }],
        })
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
        try {
            // Generate a unique file name
            const filename = `${randomUUID()}-${file.originalname}`

            // Upload the file to the storage bucket
            const { error } = await this.supabase.storage
                .from(process.env.BUCKET_NAME)
                .upload(filename, file.buffer, {
                    contentType: file.mimetype,
                })

            if (error)
                throw new HttpException(
                    `Failed to upload file: ${error.message}`,
                    HttpStatus.INTERNAL_SERVER_ERROR
                )

            // Retrieve the public URL of the uploaded file, and send it back to be added to the db
            const response = this.supabase.storage
                .from(process.env.BUCKET_NAME)
                .getPublicUrl(filename)

            return response.data.publicUrl
        } catch (error) {
            throw new HttpException(
                `Upload failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
