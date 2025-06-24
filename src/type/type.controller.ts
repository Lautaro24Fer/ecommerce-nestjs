import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { TypeService } from './type.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { ProductType } from './entities/type.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.decorator';

@ApiTags('Type of product')
@Controller('type')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @ApiOperation({ summary: 'Create a new type of product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product type created succesfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error creating the product type'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Post()
  create(@Body() createTypeDto: CreateTypeDto): Promise<IRecourseCreated<ProductType>> {
    return this.typeService.create(createTypeDto);
  }

  @ApiOperation({ summary: 'Get all product types' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product types loaded succefully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error loading the product types'
  })
  @Get()
  findAll(): Promise<IRecourseFound<ProductType[]>> {
    return this.typeService.findAll();
  }

  @ApiOperation({ summary: 'Get a product type by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product type loaded succefully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product type not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error loading the product type'
  })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<IRecourseFound<ProductType>>{
    return this.typeService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a product type by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product type updated succesfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product type not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error updating the product type'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Put(':id')
  update(@Param('id') id: number, @Body() updateTypeDto: UpdateTypeDto): Promise<IRecourseUpdated<ProductType>> {
    return this.typeService.update(id, updateTypeDto);
  }

  @ApiOperation({ summary: 'Delete a product type by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product type deleted succesfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product type not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error deleting the product type'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Delete(':id')
  remove(@Param('id') id: number): Promise<IRecourseDeleted<ProductType>> {
    return this.typeService.remove(id);
  }
}
