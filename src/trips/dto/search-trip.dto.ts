import { IsOptional, IsString } from "class-validator";


export class SearchTripDto{
    @IsOptional()
    @IsString()
    destination?: string

     @IsOptional()
    @IsString()
    departureDate?: Date
}