import { Test, TestingModule } from "@nestjs/testing"
import { CharactersService } from "./characters.service"
import { CharactersController } from "./characters.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { SupabaseModule } from "../supabase/supabase.module"
import { SupabaseService } from "../supabase/supabase.service"
import { Character } from "@prisma/client"

describe("CharactersService", () => {
    let service: CharactersService
    let supabase: SupabaseService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule, SupabaseModule],
            controllers: [CharactersController],
            providers: [CharactersService],
        }).compile()

        service = module.get<CharactersService>(CharactersService)
        supabase = module.get<SupabaseService>(SupabaseService)

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
})
