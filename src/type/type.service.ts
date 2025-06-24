import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from './entities/type.entity';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';

@Injectable()
export class TypeService {

  constructor(@InjectRepository(ProductType) private readonly typeRepository: Repository<ProductType>){}

  async create(createTypeDto: CreateTypeDto): Promise<IRecourseCreated<ProductType>> {
    const nameExists: boolean = await this.typeRepository.existsBy({ name: createTypeDto.name}).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the creation of the product type"
      };
      throw new BadRequestException(badRequestError);
    });
    if(nameExists){
      const badRequestError: IBadRequestex = {
        status: false,
        message: `the product type name '${createTypeDto.name}' already exists`
      };
      throw new BadRequestException(badRequestError);
    }
    const newProductType: ProductType = await this.typeRepository.save(createTypeDto).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error saving the product type"
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseCreated<ProductType> = {
      status: true,
      message: "The product type was created succesfully",
      recourse: newProductType
    }
    return response;
  }

  async findAll(): Promise<IRecourseFound<ProductType[]>> {
    const productTypes: ProductType[] = await this.typeRepository.find().catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error loading the product types"
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseFound<ProductType[]> = {
      status: true,
      message: "The product types was loaded succesfully",
      recourse: productTypes
    }
    return response;
  }

  async findOne(id: number): Promise<IRecourseFound<ProductType>> {
    const productType: ProductType = await this.typeRepository.findOneBy({ id }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error loading the product type with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    if(!productType){
      const badRequestError: INotFoundEx = {
        status: false,
        message: `Product type with id '${id}' not found`
      };
      throw new NotFoundException(badRequestError);
    }
    const response: IRecourseFound<ProductType> = {
      status: true,
      message: "The product type was found succesfully",
      recourse: productType
    }
    return response;
  }

  async update(id: number, updateTypeDto: UpdateTypeDto): Promise<IRecourseUpdated<ProductType>> {
    const productTypeToUpdate: ProductType = (await this.findOne(id)).recourse;
    const bodyProductType: ProductType = { ...productTypeToUpdate, ...updateTypeDto };
    const productTypeUpdated: ProductType = await this.typeRepository.save(bodyProductType).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error updating the product type with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseUpdated<ProductType> = {
      status: true,
      message: "The product type was updated succesfully",
      recourse: productTypeUpdated
    };
    return response;
  }

  async remove(id: number): Promise<IRecourseDeleted<ProductType>> {
    const productType: ProductType = (await this.findOne(id)).recourse;
    const removed: ProductType = await this.typeRepository.remove(productType).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error updating the product type with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseDeleted<ProductType> = {
      status: true,
      message: "The product type was deleted succesfully",
      recourse: removed
    };
    return response;
  }
}
