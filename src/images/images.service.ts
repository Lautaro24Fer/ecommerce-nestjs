import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImage } from './entities/image.entity';
import { Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound } from '../global/responseInterfaces';
import { FtpService } from '../ftp/ftp.service';
import { MulterFile } from './dto/multer-file';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImagesService {

  constructor(
    @InjectRepository(ProductImage) private readonly imageRepository: Repository<ProductImage>,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
    private readonly ftpService: FtpService,
    private readonly configService: ConfigService) {}
  
  async create(id: number, file: MulterFile) {

    const product: Product = (await this.productService.findOne(id)).recourse;

    const imageUrl = await this.ftpService.saveImageOnFTPServer(file);

    const imageCreated: ProductImage = this.imageRepository.create({ product, url: imageUrl });

    const imageSaved: ProductImage = await this.imageRepository.save(imageCreated).catch(async (error) => {
      console.error(error);
      await this.ftpService.deleteFile(imageUrl).catch((error) => {
        console.error(error);
        const badRequestError: IBadRequestex = {
          status: false,
          message: "Error deleting file in FTP server"
        };
        throw new BadRequestException(badRequestError);
      })
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the creation of the product image"
      };
      throw new BadRequestException(badRequestError);
    });

    const response: IRecourseCreated<ProductImage> = {
      status: true,
      message: "The product image was created successfully",
      recourse: imageSaved
    }
    return response;
  }

  async findAll(): Promise<IRecourseFound<ProductImage[]>> {
    try{
      const allImages: ProductImage[] = await this.imageRepository.createQueryBuilder('product_image')
      .leftJoin('product_image.product', 'product')
      .addSelect('product.id')
      .orderBy('product_image.id', 'ASC') 
      .getMany()
      const recourse: IRecourseFound<ProductImage[]> = {
        status: true,
        message: "The product images was found successfully",
        recourse: allImages
      }
      return recourse;
    }
    catch(error){
      throw new BadRequestException({ error: 'Error exception loading all images' })
    }
  }

  async findOne(id: number): Promise<IRecourseFound<ProductImage>> {
    const productImage: ProductImage = await this.imageRepository.findOne({ where: { id }, relations: ['product'] }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error loading the product with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    if(!productImage){
      const notFoundError: INotFoundEx = {
        status: false,
        message: `The image with id '${id}' was not found`
      };
      throw new NotFoundException(notFoundError);
    }
    const recourse: IRecourseFound<ProductImage> = {
      status: true,
      message: "The product image was found successfully",
      recourse: productImage
    }
    return recourse;
  }

  // async findOneByIdAndUrl(productId: number, url: string): Promise<IRecourseFound<ProductImage>>{
  //   const productImage = await this.imageRepository.findOneBy({ product: { id: productId }, url}).catch((error) => {
  //     console.error(error);
  //     const badRequestError: IBadRequestex = {
  //       status: false,
  //       message: `Error loading the product with id '${productId}' and url '${url}'`
  //     };
  //     throw new BadRequestException(badRequestError);
  //   });
  //   if(!productImage){
  //     const notFoundError: INotFoundEx = {
  //       status: false,
  //       message: `The product image with id '${productId}' and url '${url}' was not found`
  //     }
  //     throw new NotFoundException(notFoundError);
  //   }
  //   const recourse: IRecourseFound<ProductImage> = {
  //     status: true,
  //     message: "The product image was found successfully",
  //     recourse: productImage
  //   }
  //   return recourse;
  // }

  async removeByUrl(url: string): Promise<IRecourseDeleted<ProductImage>>{
    const image: ProductImage = await this.imageRepository.findOne({ where: {url} }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error finding the image with url '${url}' in database`
      };
      throw new BadRequestException(badRequestError);
    });
    if(!image){
      const notFoundError: INotFoundEx = {
        status: false,
        message: `The image with url '${url}' was not found`
      };
      throw new NotFoundException(notFoundError);
    }
    const removed: IRecourseDeleted<ProductImage> = await this.remove(image.id);
    return removed;
  }

  async remove(id: number): Promise<IRecourseDeleted<ProductImage>> {
    const productImage: ProductImage = (await this.findOne(id)).recourse;
    const remotePath: string = productImage.url;
    if(remotePath.includes('padel-point')){
      await this.ftpService.deleteFile(remotePath);
    }
    const removed: ProductImage = await this.imageRepository.remove(productImage).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error removing the product image with id: '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const recourse: IRecourseDeleted<ProductImage> = {
      status: true,
      message: "The product image was deleted successfully",
      recourse: removed
    };
    return recourse;
  }
}
