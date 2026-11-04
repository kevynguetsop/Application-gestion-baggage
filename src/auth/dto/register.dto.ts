import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/entity/user.entity';


export class RegisterDto{
    @IsString()
    @IsNotEmpty()
    firstName! : string 
     
    @IsString()
    @IsNotEmpty()
    lastName!: string 

    @IsEmail()
     email! : string
      @IsNotEmpty()
     phoneNumber! : number
     
     @MinLength(6)
     password!: string

      // Permet de recevoir le rôle envoyé par Postman
  @IsEnum(UserRole)
  role!: UserRole;
}