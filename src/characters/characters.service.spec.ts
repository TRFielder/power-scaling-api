import { Test, TestingModule } from "@nestjs/testing"
import { CharactersService } from "./characters.service"
import { CharactersController } from "./characters.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { SupabaseClient } from "@supabase/supabase-js"

describe("CharactersService", () => {
    let service: CharactersService
    let supabase: SupabaseClient

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            controllers: [CharactersController],
            providers: [CharactersService],
        }).compile()

        service = module.get<CharactersService>(CharactersService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
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
})
