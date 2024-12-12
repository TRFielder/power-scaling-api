import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication } from "@nestjs/common"
import * as request from "supertest"
import { AppModule } from "../../src/app.module"
import { PrismaService } from "../../src/prisma/prisma.service"
import { Character } from "@prisma/client"

describe("Characters (e2e)", () => {
    let app: INestApplication
    let prisma: PrismaService

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

        // Don't know what this is for yet, it's from class-validator if we need it
        // useContainer(app.select(AppModule), { fallbackOnErrors: true });

        // app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

        await app.init()

        // Seed db with test data, just 3 entries
        console.log("🔧 Creating entries in character table")
        await prisma.character.createMany({
            data: [
                {
                    name: "Goku",
                    imageUrl: "test-url-1",
                },
                {
                    name: "Gohan",
                    imageUrl: "test-url-2",
                },
                {
                    name: "Vegeta",
                    imageUrl: "test-url-3",
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

    afterAll(async () => {
        // Clean up the character table, remove everything after tests are finished
        await prisma.character.deleteMany()
    })
})
