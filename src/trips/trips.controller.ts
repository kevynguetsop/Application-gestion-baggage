import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTripDto } from './dto/create-trip.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/entity/user.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { SearchTripDto } from './dto/search-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('trips')
export class TripsController {

    constructor(
        private readonly tripsService: TripsService
    ){}

    @UseGuards(JwtAuthGuard, RolesGuard)   //seul un utilisateur connecte peut creer un voyage 
    @Roles(UserRole.TRAVELER)
    @Post()
    create(
        @Body() dto: CreateTripDto,
        @CurrentUser() user: User
    ){
return this.tripsService.create(dto, user,)
    }
    @Get()
    findAll(
        @Query() pagination: PaginationQueryDto
    ){
        return this.tripsService.findAll(pagination)
    }
    @Get('search')
    search(
        @Query() dto: SearchTripDto
    ){
        return this.tripsService.search(dto)
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ){
  return  this.tripsService.findOne(id)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAVELER)
    @Put(':id')
    update(
        @Param('id', ParseIntPipe)
        id: number,
        @Body()
        dto: UpdateTripDto,
        @CurrentUser()
        user: User
    ){
        return this.tripsService.update(id,dto,user)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAVELER,
        UserRole.ADMIN
    )
    @Delete(':id')
   remove(
    @Param('id', ParseIntPipe)
    id: number,
     @CurrentUser()
     user: User
   ){
    return this.tripsService.remove(id,user)
   }



}
