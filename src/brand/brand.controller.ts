import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { Brand } from './entities/brand.entity';
import { QueryParamsBrandDto } from './dto/query-params.dto';
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/auth.decorator';

@ApiTags('Brands')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The new brand was created succesfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request. The new brand was not created',
  })
 @UseGuards(AuthGuard)
  // @Roles(['admin'])
  @Post()
  create(@Body() createBrandDto: CreateBrandDto): Promise<IRecourseCreated<Brand>> {
    return this.brandService.create(createBrandDto);
  }

  @ApiOperation({ summary: 'Find all brands' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All brands are loaded succesfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request. The brands are not loaded',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Brands not found',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Name of the brand',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit of the orders returned',
  })
  
  @Get()
  findAll(@Query() queryParams: QueryParamsBrandDto): Promise<IRecourseFound<Brand[]>> {
    return this.brandService.findAll(queryParams);
  }

  @ApiOperation({ summary: 'Find a brand by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The brand was loaded succesfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request. The brand are not loaded',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Brand not found',
  })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<IRecourseFound<Brand>> {
    return this.brandService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a brand by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The brand was updated succesfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request. The brand was not updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Brand not found',
  })
 @UseGuards(AuthGuard)
  // @Roles(['admin'])
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateBrandDto: UpdateBrandDto): Promise<IRecourseUpdated<Brand>> {
    return this.brandService.update(id, updateBrandDto);
  }

  @ApiOperation({ summary: 'Delete a brand by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The brand was deleted succesfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request. The brand was not deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Brand not found',
  })
 @UseGuards(AuthGuard)
  // @Roles(['admin'])
  @Delete(':id')
  remove(@Param('id') id: number): Promise<IRecourseDeleted<Brand>> {
    return this.brandService.remove(id);
  }
}
