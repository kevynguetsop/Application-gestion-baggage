import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from "../auth.service";



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false, 
            secretOrKey:'jwt_secret'
        })
    }
    async validate(payload: any){
        const user = await this.authService.getUserById(payload.sub)
        if (!user){
            throw new UnauthorizedException('Invalid token ')
        }
        return {
            ...user,
            role : payload.role
        }
    }
    
}