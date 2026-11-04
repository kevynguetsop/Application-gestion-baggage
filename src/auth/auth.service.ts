import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { promises } from 'dns';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService
    ){}

    private async hashPassword(password: string): Promise<string> {
return bcrypt.hash(password, 10)
    }

     async register(registerDto: RegisterDto){
          // Vérifier ce que le DTO reçoit
  console.log(
    'ROLE REÇU DANS LE DTO :',
    registerDto.role,
  );
         const existingUser = await this.userRepository.findOne({
             where: {
                email: registerDto.email
             }
         })
         if(existingUser){
            throw new ConflictException('Email already exists',) 
         }
         const hashedPassword= await this.hashPassword(registerDto.password)

         const user = this.userRepository.create({
              ...registerDto,
              // Remplacer le mot de passe original
  // par sa version hashée
              password: hashedPassword,
                role: registerDto.role,
             });
         const savedUser = await this.userRepository.save(user)

         const {password, ...result}= savedUser
         return{
            user: result,
            message: 'Registration successful'
         }
     }

     private async verifyPassword(
        plainPassword: string,
        hashPassword: string,
     ): Promise<boolean>{
        return bcrypt.compare(
         plainPassword,
         hashPassword
        )
     }
     private generateAccesToken(user: User): string{
        const payload = {
            sub: user.id,
            email: user.email,
            role : user.role
        }
        return this.jwtService.sign(payload)
     }

     async login(loginDto: LoginDto){
        const user = await this.userRepository
       .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email = :mail', {
      mail: loginDto.email,
    })
    .getOne();
        if(!user || !(await this.verifyPassword(
            loginDto.password,
            user.password
        ))
    ){
        throw new UnauthorizedException(
            'Invalid credentials '
        )
    }
    const accessToken = this.generateAccesToken(user);
    const {password, ...result}= user

    return {
        user: result,
        accessToken
    }
     }
     async getUserById(id: number): Promise<User | null> {
  return this.userRepository.findOne({
    where: {
      id,
    },
  });
}
}
