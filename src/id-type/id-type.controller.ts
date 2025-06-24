import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, UseGuards } from '@nestjs/common';
import { IdTypeService } from './id-type.service';
import { CreateIdTypeDto } from './dto/create-id-type.dto';
import { UpdateIdTypeDto } from './dto/update-id-type.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { IdType } from './entities/id-type.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.decorator';

@ApiTags('Identification Types')
@Controller('id-type')
export class IdTypeController {
  constructor(private readonly idTypeService: IdTypeService) {}

  @ApiOperation({
    summary: 'Create e new identification type'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New identification type created'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to create identification types'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error in the creation of the identification type'
  })
  @Post()
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  create(@Body() createIdTypeDto: CreateIdTypeDto): Promise<IRecourseCreated<IdType>> {
    return this.idTypeService.create(createIdTypeDto);
  }

  @ApiOperation({
    summary: 'Get all identification types'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All identification types loaded'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to get identification types'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The identification type id was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error in the finding of the identification types'
  })
  @Get()
  findAll(): Promise<IRecourseFound<IdType[]>> {
    return this.idTypeService.findAll();
  }

  @ApiOperation({
    summary: 'Find a identification type by id'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Identification type found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to find identification types'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The identification type id was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error in the loading of the identification type'
  })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<IRecourseFound<IdType>> {
    return this.idTypeService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update of identification type by id'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The identidication type was updated succesfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to update identification types'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The identification type id was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error in the updating of the identification type'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateIdTypeDto: UpdateIdTypeDto): Promise<IRecourseUpdated<IdType>> {
    return this.idTypeService.update(id, updateIdTypeDto);
  }

  @ApiOperation({
    summary: 'Delete a identification type by id'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The identification type was deleted succesfully'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You are not autorize to delete identification types'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The identification type id was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error in the deleting of the identification type'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<IRecourseDeleted<IdType>> {
    return await this.idTypeService.remove(id);
  }
}
