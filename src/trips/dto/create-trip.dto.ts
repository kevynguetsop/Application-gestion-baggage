import { IsDateString, IsNotEmpty, IsNumber, IsString, Matches, Min } from "class-validator";


export class CreateTripDto{
    @IsString()
    @IsNotEmpty()
    departureCountry!: string

    @IsString()
    @IsNotEmpty()
    destinationCountry!: string

    @IsDateString()
    departureDate!: Date

@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'departureTime must be in HH: mm'
})
     departureTime!: string
     
    @IsNumber()
    @Min(1)
    availableKg!: number

    @IsNumber()
    @Min(1)
    pricePerKg! : number
}