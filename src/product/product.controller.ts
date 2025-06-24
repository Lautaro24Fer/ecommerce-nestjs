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
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { QueryParamsDto } from './dto/query-params.dto';
import { IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../global/multer.config';
import { MulterFile } from '../images/dto/multer-file';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.decorator';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created succesfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request, the product was not created',
  })
  @Post()
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: MulterFile): Promise<IRecourseCreated<Product>> {
    return await this.productService.create(createProductDto, file);
  }

  @ApiOperation({ summary: 'Find all products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All products loaded succesfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The products was not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error loading the products',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Name of the product',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price of the product',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price of the product',
  })
  @ApiQuery({
    name: 'price',
    required: false,
    type: Number,
    description: 'Exact price of the product',
  })
  @ApiQuery({
    name: 'brand',
    required: false,
    type: String,
    description: 'Brand of the product',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'type of the product',
  })
  @ApiQuery({
    name: 'minStock',
    required: false,
    type: Number,
    description: 'minium stock of the product',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter products by active status',
  })
  @Get()
  async findAll(@Query() queryParams: QueryParamsDto): Promise<IRecourseFound<Product[]>> {
    return await this.productService.findAll(queryParams);
  }

  @ApiOperation({ summary: 'Find one product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The product by id was loaded succesfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The product by id was not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error loading the product by id',
  })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a product partially by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The product was updated succesfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The product was by id was not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error updating the product',
  })
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', multerOptions))
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  async partialUpdate(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto,@UploadedFile() file?: MulterFile): Promise<IRecourseUpdated<Product>> {
    const responseService: IRecourseUpdated<Product> = (await this.productService.update(id, updateProductDto, file));
    return responseService;
  }

  @ApiOperation({ summary: 'Delete a product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The product was deleted succesfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The product by id was not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error deliting the product',
  })
  @Delete(':id')
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  remove(@Param('id') id: number): Promise<IRecourseDeleted<Product>> {
    return this.productService.remove(id);
  }
}
