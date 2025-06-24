import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from '../supplier/entities/supplier.entity';
import { BrandService } from '../brand/brand.service';
import { SupplierService } from '../supplier/supplier.service';
import { Brand } from '../brand/entities/brand.entity';
import { QueryParamsDto } from './dto/query-params.dto';
import { ProductType } from '../type/entities/type.entity';
import { TypeService } from '../type/type.service';
import { ImagesService } from '../images/images.service';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { UpdateProductDto } from './dto/update-product.dto';
import { ItemDto } from '../payment/dto/preference-payment';
import { MulterFile } from '../images/dto/multer-file';
import { FtpService } from '../ftp/ftp.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(forwardRef(() => ImagesService)) private readonly productImageService: ImagesService,
    private readonly brandService: BrandService,
    private readonly supplierService: SupplierService,
    private readonly typeService: TypeService,
    private readonly ftpService: FtpService,
  ) {}

  async create(createProductDto: CreateProductDto, file: MulterFile): Promise<IRecourseCreated<Product>> {

    // Verificar que el id de supplier y brand existen. Para eso primero haremos sus respectivos repositorios primero

    const brand: Brand = (await this.brandService.findOne(createProductDto.brandId))?.recourse;

    const supplier: Supplier = (await this.supplierService.findOne(createProductDto.supplierId))?.recourse;

    const type: ProductType = (await this.typeService.findOne(createProductDto.typeId))?.recourse;

    if(createProductDto.cost >= createProductDto.price){
      const badRequestError: IBadRequestex = {
        status: false,
        message: "The cost value can not be equal or higher than the price value"
      };
      throw new BadRequestException(badRequestError);
    }

    let imageUrl: string = await this.ftpService.saveImageOnFTPServer(file);

    const newProduct: Product = this.productRepository.create({  
      ...createProductDto,
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      type,
      supplier,
      brand,
      image: imageUrl
    });

    const { id }: Product = await this.productRepository.save(newProduct).catch((error) => {
      console.error(error)
      const badRequestError: IBadRequestex = {
        status: false,
        message: `error saving the product instance`
      };
      throw new BadRequestException(badRequestError);
    });

    // if(createProductDto.secondariesImages){
    //   const secondariesImagesMapped: ProductImage[] = await Promise.all(createProductDto.secondariesImages.map(async(image) =>{
    //     return (await this.productImageService.create({ productId: id, url: image })).recourse;
    //   }));

    //   newProduct.secondariesImages = [ ...secondariesImagesMapped ];
    //   await this.productRepository.save(newProduct);
    // }

    const productCreated: Product = (await this.findOne(id)).recourse;
    const response: IRecourseCreated<Product> = {
      status: true,
      message: "The product was created succesfully",
      recourse: productCreated
    }
    return response;
  } 

  async findAll(queryParams: QueryParamsDto): Promise<IRecourseFound<Product[]>> {

    const queryBuilder = this.productRepository
      .createQueryBuilder('product') 
      .innerJoinAndSelect('product.brand', 'brand')
      .innerJoinAndSelect('product.type', 'type')
      .orderBy('product.id', 'ASC')

    if (queryParams.brand) {
      queryBuilder.andWhere('brand.name LIKE :brand', {
        brand: `%${queryParams.brand}%`,
      });
    }

    if (queryParams.maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: queryParams.maxPrice,
      });
    }

    if (queryParams.minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: queryParams.minPrice,
      });
    }

    if (queryParams.price) {
      queryBuilder.andWhere('product.price = :price', {
        price: queryParams.price,
      });
    }

    if (queryParams.name) {
      queryBuilder.andWhere('product.name LIKE :name', {
        name: `%${queryParams.name}%`,
      });
    }

    if(queryParams.type){
      queryBuilder.andWhere('type.name LIKE :type', { // name es una propiedad de la tabla type
        type: `%${queryParams.type}%`
      })
    }

    if (queryParams.minStock) {
      queryBuilder.andWhere('product.stock >= :minStock', {
        minStock: queryParams.minStock,
      });
    }

    if (queryParams.limit) {
      queryBuilder.take(queryParams.limit);
    }

    if (queryParams.isActive === 'false') {
      queryBuilder.andWhere('product.isActive = :isActive', {
        isActive: false,
      });
    }
    else{
      queryBuilder.andWhere('product.isActive = :isActive', {
        isActive: true,
      });
    }

    const products: Product[] = await queryBuilder.getMany().catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error loading all products"
      };
      throw new BadRequestException(badRequestError);
    });

    const response: IRecourseFound<Product[]> = {
      status: true,
      message: "The products was found succesfully",
      recourse: products
    }

    return response;
  }

  async findOne(id: number): Promise<IRecourseFound<Product>> {
    const product: Product = await this.productRepository.findOne({
      where: { id }, relations: ['brand', 'supplier', 'type', 'secondariesImages']})
      .catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error finding the product by id"
      };
      throw new BadRequestException(badRequestError);
    })
    if ((!product) || (!product.isActive)) {
      const notFoundError: INotFoundEx = {
        status: false,
        message: `The product with id '${id}' was not found`
      }
      throw new NotFoundException(notFoundError);
    }
    const recourseFound: IRecourseFound<Product> = {
      status: true,
      message: "The product was found successfully",
      recourse: product
    };
    return recourseFound;
  }

  async update(id: number, updateProductDto: UpdateProductDto, file?: MulterFile): Promise<IRecourseUpdated<Product>> {
    const productFound: Product = (await this.findOne(id)).recourse;

    const body: Product = {
      ...productFound,
      ...updateProductDto
    }

    if (updateProductDto.brandId) {
      const brand: Brand = (await this.brandService.findOne(updateProductDto?.brandId)).recourse;
     body.brand = brand;
    }

    if (updateProductDto.supplierId) {
      const supplier: Supplier = (await this.supplierService.findOne(updateProductDto?.supplierId)).recourse;
     body.supplier = supplier;
    }

    if(updateProductDto.typeId){
      const type: ProductType = (await this.typeService.findOne(updateProductDto?.typeId)).recourse;
     body.type = type;
    }

    if(file){
      const newImageUrl: string = await this.ftpService.saveImageOnFTPServer(file);
      if(productFound.image.includes('padel-point')){
        const imageExists: boolean = await this.ftpService.checkFileExists(productFound.image)
        if(imageExists){
          await this.ftpService.deleteFile(productFound.image).catch((error) => {
            console.error(error);
            const ftpError: IBadRequestex = {
              status: false,
              message: "Error deleting the image on the server"
            };
            throw new InternalServerErrorException(ftpError);
          });
        }
      }
      body.image = newImageUrl;
    }

    if(updateProductDto.isActive){
      body.isActive = updateProductDto.isActive;
    }

    const productUpdated: Product = await this.productRepository.save(body).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error updating the product"
      };
      throw new BadRequestException(badRequestError);
    });
    const recourse: IRecourseUpdated<Product> = {
      status: true,
      message: "The product was updated succesfully",
      recourse: productUpdated
    };

    return recourse;
  }

  async remove(id: number): Promise<IRecourseDeleted<Product>> {
    const product: Product = (await this.findOne(id))?.recourse;
    const urlPath: string = product.image;
    if (urlPath?.includes('padel-point')) {
      await this.ftpService.deleteFile(urlPath);
    }
    if (Array.isArray(product?.secondariesImages)) {
      await Promise.all(product.secondariesImages.map(async (image) => {
        await this.productImageService?.remove(image.id);
      }));
    }

    product.isActive = false;

    const removed: Product = await this.productRepository.save(product).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error removing the product with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseDeleted<Product> = {
      status: true,
      message: "The product was deleted succesfully",
      recourse: removed
    };
    return response;
  }

  async validateOperation(items: ItemDto[]): Promise<IRecourseFound<any>> {
    for(const item of items) {
      const product: Product = (await this.findOne(item.id)).recourse;
      if(product.stock < item.quantity) {
        const badRequestError: IBadRequestex = {
          status: false,
          message: `There is not enough stock of the product with id '${item.id}' to carry out the operation`
        }
        throw new BadRequestException(badRequestError);
      }
    }
    const response: IRecourseFound<any> = {
      status: true,
      message: "The operation vas validated succesfully. Valid order",
      recourse: null
    };
    return response;
  }
}
