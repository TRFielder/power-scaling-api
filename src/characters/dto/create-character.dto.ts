import { ApiProperty } from "@nestjs/swagger"

export class CreateCharacterDto {
    @ApiProperty()
    readonly name: string

    @ApiProperty()
    readonly imageUrl: string
}
