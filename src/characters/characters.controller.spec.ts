import { Test, TestingModule } from "@nestjs/testing"
import { CharactersController } from "./characters.controller"
import { CharactersService } from "./characters.service"
import { Character } from "@prisma/client"
import { PrismaModule } from "../prisma/prisma.module"
import { CreateCharacterDto } from "./dto/create-character.dto"
import { Readable } from "node:stream"
import { CharacterDto } from "./dto/character.dto"

describe("CharactersController", () => {
    let controller: CharactersController
    let service: CharactersService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            controllers: [CharactersController],
            providers: [CharactersService],
        }).compile()

        controller = module.get<CharactersController>(CharactersController)
        service = module.get<CharactersService>(CharactersService)
    })

    it("Controller should be defined", () => {
        expect(controller).toBeDefined()
    })

    it("Service should be defined", () => {
        expect(service).toBeDefined()
    })

    it("Should return an array of characters when calling get all characters", async () => {
        const result: CharacterDto[] = [
            {
                id: 1,
                name: "Goku",
                imageUrl: "http://google.com",
                score: 1,
            },
            {
                id: 2,
                name: "Gohan",
                imageUrl: "http://google.com",
                score: 3,
            },
        ]

        jest.spyOn(controller, "getAllCharacters").mockImplementation(
            async () => result
        )

        expect(await controller.getAllCharacters()).toBe(result)
    })

    it("Should return an array of characters when calling get characters ordered by score", async () => {
        const result: CharacterDto[] = [
            {
                id: 2,
                name: "Gohan",
                imageUrl: "http://google.com",
                score: 3,
            },
            {
                id: 1,
                name: "Goku",
                imageUrl: "http://google.com",
                score: 1,
            },
        ]

        jest.spyOn(
            controller,
            "getCharactersOrderedByScore"
        ).mockImplementation(async () => result)

        expect(await controller.getCharactersOrderedByScore()).toBe(result)
    })

    it("Should return the newly created character when calling add new character", async () => {
        const result: Character = {
            id: 1,
            name: "Gohan",
            imageFileName: "unittestfilename",
            score: 0,
        }

        const input: CreateCharacterDto = {
            name: "Gohan",
        }

        const mockFile: Express.Multer.File = {
            fieldname: "image",
            originalname: "test-image.png",
            encoding: "7bit",
            mimetype: "image/png",
            size: 1024,
            buffer: Buffer.from("fake-binary-content"),
            stream: Readable.from(Buffer.from("fake-binary-content")),
            destination: "uploads/",
            filename: "test-image.png",
            path: "uploads/test-image.png",
        }

        jest.spyOn(controller, "addNewCharacter").mockImplementation(
            async () => result
        )

        expect(await controller.addNewCharacter(mockFile, input)).toBe(result)
    })
})
