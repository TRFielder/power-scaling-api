import { Test, type TestingModule } from "@nestjs/testing"
import { HttpStatus, type INestApplication } from "@nestjs/common"
import * as request from "supertest"
import { AppModule } from "../../src/app.module"
import { PrismaService } from "../../src/prisma/prisma.service"
import { Character } from "@prisma/client"
import { CharactersService } from "../../src/characters/characters.service"
import { SupabaseService } from "../../src/supabase/supabase.service"
import { unlinkSync, writeFileSync } from "node:fs"
import { faker } from "@faker-js/faker"

describe("Characters (e2e)", () => {
    let app: INestApplication
    let prisma: PrismaService
    let characterService: CharactersService

    let characters: Character

    const characterShape = expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        imageUrl: expect.any(String),
        score: expect.any(Number),
    })

    beforeAll(async () => {
        // Entire API for testing, including db connection
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        prisma = app.get<PrismaService>(PrismaService)
        characterService =
            moduleFixture.get<CharactersService>(CharactersService)

        // Don't know what this is for yet, it's from class-validator if we need it
        // useContainer(app.select(AppModule), { fallbackOnErrors: true });

        // app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

        console.log("🔧 Setting up mocks")
        // Upload image method - avoiding setting up s3 instance for tests
        jest.spyOn(characterService, "uploadImage").mockResolvedValue(
            "mock-image-url"
        )

        jest.spyOn(characterService, "getImageForCharacter").mockImplementation(
            async (character: Character) => {
                return {
                    id: character.id,
                    name: character.name,
                    score: character.score,
                    imageUrl: "e2e-mock-url",
                }
            }
        )

        await app.init()

        // Seed db with test data, just 3 entries
        console.log("🔧 Creating entries in character table")
        await prisma.character.createMany({
            data: [
                {
                    name: "Goku",
                    imageFileName: "goku.png",
                },
                {
                    name: "Gohan",
                    imageFileName: "gohan.png",
                },
                {
                    name: "Vegeta",
                    imageFileName: "vegeta.png",
                },
            ],
        })

        console.log("✅ Character table successfully populated!")
    })

    describe("GET /characters", () => {
        it("Returns a list of characters", async () => {
            const { status, body } = await request(app.getHttpServer()).get(
                "/characters"
            )

            expect(status).toBe(200)

            expect(body).toStrictEqual(expect.arrayContaining([characterShape]))
        })
    })

    describe("POST /characters", () => {
        it("Correctly creates a character", async () => {
            const characterName: string = "test-name"

            // Generate a mock image as binary data
            const mockImageData = faker.image.dataUri({
                height: 200,
                width: 200,
                type: "svg-base64",
            })

            // Convert the data URI to a binary buffer
            const base64Data = mockImageData.split(",")[1] // Remove the "data:image/png;base64," part
            const binaryData = Buffer.from(base64Data, "base64")

            // Write the binary data to a temporary file
            const file = "temp-test-image.png"
            writeFileSync(file, binaryData)

            try {
                const { status, body } = await request(app.getHttpServer())
                    .post("/characters")
                    .field("name", characterName)
                    .attach("file", file)

                // Expect status code 201
                expect(status).toEqual(HttpStatus.CREATED)
                expect(body).toHaveProperty("id")
                expect(body).toHaveProperty("imageFileName", "mock-image-url")
                expect(body).toHaveProperty("score", 0)
                expect(characterService.uploadImage).toHaveBeenCalledTimes(1)
            } finally {
                // Clean up temporary file
                unlinkSync(file)
            }
        })

        it("Gives the correct error when the name property is missing", async () => {
            // Generate a mock image as binary data
            const mockImageData = faker.image.dataUri({
                height: 200,
                width: 200,
                type: "svg-base64",
            })

            // Convert the data URI to a binary buffer
            const base64Data = mockImageData.split(",")[1] // Remove the "data:image/png;base64," part
            const binaryData = Buffer.from(base64Data, "base64")

            // Write the binary data to a temporary file
            const file = "temp-test-image.png"
            writeFileSync(file, binaryData)

            const { status } = await request(app.getHttpServer())
                .post("/characters")
                .attach("file", file)

            // Expect status code 400
            expect(status).toEqual(HttpStatus.BAD_REQUEST)
        })
    })

    afterAll(async () => {
        // Clean up the character table, remove everything after tests are finished
        console.log("📣 Attempting to clean up the character table")
        await prisma.character.deleteMany()
    })
})
