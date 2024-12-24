import { Test, TestingModule } from "@nestjs/testing"
import { CharactersService } from "./characters.service"
import { CharactersController } from "./characters.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { SupabaseModule } from "../supabase/supabase.module"
import { SupabaseService } from "../supabase/supabase.service"
import { Character } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service"

describe("CharactersService", () => {
    let service: CharactersService
    let supabase: SupabaseService
    let prisma: PrismaService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule, SupabaseModule],
            controllers: [CharactersController],
            providers: [CharactersService],
        }).compile()

        service = module.get<CharactersService>(CharactersService)
        supabase = module.get<SupabaseService>(SupabaseService)
        prisma = module.get<PrismaService>(PrismaService)

        // Set up mocks
        jest.spyOn(supabase, "getSignedUrl").mockImplementation(
            async (_fileName: string, _expiryTimeSeconds: number) => {
                return "service-test-url"
            }
        )
    })

    it("The service should be defined", () => {
        expect(service).toBeDefined()
    })

    it("The supabase service should be defined", () => {
        expect(supabase).toBeDefined()
    })

    // Not convinced this test is actually useful. Let's work on this later and actually run some functionality
    // Either that or just not use this test at all
    it("Should upload an image and return its URL", async () => {
        const mockFile = {
            originalname: "test.png",
            buffer: Buffer.from("file content"),
        } as Express.Multer.File

        const mockUploadFunction = jest
            .spyOn(service, "uploadImage")
            .mockImplementation(async (file: Express.Multer.File) => {
                return `https://this-is-a-mock-url.com/uploads/file/${file.originalname}`
            })

        const result = await service.uploadImage(mockFile)

        expect(mockUploadFunction).toHaveBeenCalledWith(mockFile)
        expect(result).toEqual(
            `https://this-is-a-mock-url.com/uploads/file/${mockFile.originalname}`
        )
    })

    it("Should return an image URL when getting a character's image", async () => {
        const mockCharacter: Character = {
            id: 1,
            name: "Test",
            imageFileName: "test.png",
            score: 0,
        }

        const result = await service.getImageForCharacter(mockCharacter)

        expect(result).toBeDefined()
        expect(result).toHaveProperty("imageUrl")
        expect(result).not.toHaveProperty("imageFileName")
    })

    it("Should return a pair of characters when calling getPairOfCharacters", async () => {
        // Mock the return value of finding IDs in the db
        jest.spyOn(prisma.character, "findMany").mockResolvedValueOnce([
            //@ts-expect-error This is deliberate as we are only calling for IDs here, nothing more
            { id: 1 },
            //@ts-expect-error This is deliberate as we are only calling for IDs here, nothing more
            { id: 2 },
            //@ts-expect-error This is deliberate as we are only calling for IDs here, nothing more
            { id: 3 },
            //@ts-expect-error This is deliberate as we are only calling for IDs here, nothing more
            { id: 4 },
        ])

        // Mock the return value of finding a pair in the db
        jest.spyOn(prisma.character, "findMany").mockResolvedValueOnce([
            {
                id: 1,
                name: "Character 1",
                imageFileName: "image1.png",
                score: 0,
            },
            {
                id: 2,
                name: "Character 2",
                imageFileName: "image2.png",
                score: 0,
            },
        ])

        const result = await service.getPairOfCharacters()

        expect(result.length).toBe(2)
        expect(result[0]).toHaveProperty("imageUrl")
        expect(result[1]).toHaveProperty("imageUrl")
    })
})
