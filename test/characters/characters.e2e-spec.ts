import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import * as request from "supertest"
import { CharactersModule } from "../../src/characters/characters.module"
import { CharactersService } from "../../src/characters/characters.service"

describe("Characters Controller (e2e)", () => {
    let app: INestApplication
    const charactersService = {
        getAllCharacters: () => [
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
        ],

        getCharactersOrderedByScore: () => [
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
        ],
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CharactersModule],
        })
            .overrideProvider(CharactersService)
            .useValue(charactersService)
            .compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    it("/characters (GET)", () => {
        return request(app.getHttpServer())
            .get("/characters")
            .expect(200)
            .expect(charactersService.getAllCharacters())
    })

    it("/characters/sorted (GET)", () => {
        return request(app.getHttpServer())
            .get("/characters/sorted")
            .expect(200)
            .expect(charactersService.getCharactersOrderedByScore())
    })
})
