import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { Character } from "@prisma/client"

@Injectable()
export class CharactersService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllCharacters(): Promise<Character[]> {
        return this.prisma.character.findMany()
    }
}
