import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { Character, Prisma } from "@prisma/client"

@Injectable()
export class CharactersService {
    private readonly logger = new Logger(CharactersService.name)
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
}
