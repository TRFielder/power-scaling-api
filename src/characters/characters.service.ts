import { Injectable, Logger } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { Character } from "@prisma/client"

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
}
