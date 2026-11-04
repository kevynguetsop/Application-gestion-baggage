import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRole } from "src/entity/user.entity";
import { ROLES_KEY } from "../decorators/roles.decorator";


@Injectable()
export class RolesGuard implements CanActivate{
    constructor(
        private reflector: Reflector
    ){}

    canActivate(context: ExecutionContext): boolean{
        const requiredRoles= this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [
                context.getHandler(),
                context.getClass()
            ]
        )
        if(!requiredRoles){
            return true
        }
        const request = context.switchToHttp().getRequest()

        const user = request.user
         if(!user){
            throw new ForbiddenException('User not found ')
         }
         if(!requiredRoles.includes(user.role)){
            throw new ForbiddenException('Access denied')
         }
         return true
    }
}