import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"

@Injectable()
export class SupabaseService {
    private readonly supabase: SupabaseClient
    private readonly bucketName: string
    private readonly logger = new Logger(SupabaseService.name)

    constructor() {
        // Initialize Supabase client with your project's URL and service role key
        const SUPABASE_URL = process.env.SUPABASE_URL
        const SUPABASE_KEY = process.env.SUPABASE_KEY // You should use a service role key for server-side operations
        this.bucketName = process.env.BUCKET_NAME
        this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    }

    // Function to get a signed URL for a file stored in Supabase Storage
    async getSignedUrl(
        fileName: string,
        expiryTimeSeconds: number
    ): Promise<string> {
        this.logger.log("Generating signed image URL for filename", fileName)

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .createSignedUrl(fileName, expiryTimeSeconds)

        if (error) {
            this.logger.error("Error generating signed URL", error)
            throw new HttpException(
                `Error generating signed URL for character image with filename ${fileName}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }

        this.logger.log(
            `Signed URL generated for filename: ${fileName}, URL is ${data.signedUrl}`
        )

        return data.signedUrl
    }

    async uploadImage(file: Express.Multer.File) {
        try {
            this.logger.log(
                `Attempting to upload an image with name: ${file.originalname}, size is ${file.size}`
            )
            // Generate a unique file name
            const filename = `${randomUUID()}-${file.originalname}`
            const { error } = await this.supabase.storage
                .from(process.env.BUCKET_NAME)
                .upload(filename, file.buffer, {
                    contentType: file.mimetype,
                })

            if (error)
                throw new HttpException(
                    `Failed to upload file: ${error.message}`,
                    HttpStatus.INTERNAL_SERVER_ERROR
                )

            return filename
        } catch (error) {
            throw new HttpException(
                `Upload failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
