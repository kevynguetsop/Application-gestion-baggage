import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";


export class CreateBookingDto{
    @IsNotEmpty()
    @IsInt()
    tripId!: number

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    packageWeight!: number

 @IsNotEmpty()
    @IsString()
    packageDescription!: string    

}