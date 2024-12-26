import { ApiProperty } from "@nestjs/swagger"

export class CharacterDto {
    @ApiProperty({
        description: "The unique identifier for the character",
    })
    id: number

    @ApiProperty()
    name: string

    @ApiProperty()
    imageUrl: string

    @ApiProperty()
    score: number
}

export class NewCharacterDto {
    @ApiProperty({
        description: "The unique identifier for the character",
    })
    id: number

    @ApiProperty()
    name: string

    @ApiProperty()
    imageFileName: string

    @ApiProperty()
    score: number
}
