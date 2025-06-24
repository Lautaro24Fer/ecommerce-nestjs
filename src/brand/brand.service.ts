import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { QueryParamsBrandDto } from './dto/query-params.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<IRecourseCreated<Brand>> {
    const brandCreated: Brand = await this.brandRepository.save(createBrandDto).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the creation of the brand"
      };
      throw new BadRequestException(badRequestError);
    });
    const recourse: IRecourseCreated<Brand> = {
      status: true,
      message: "The brand was created succesfully",
      recourse: brandCreated
    };
    return recourse;
  }

  async findAll(queryParams: QueryParamsBrandDto): Promise<IRecourseCreated<Brand[]>> {
  
    const { name, limit } = queryParams;
    
    try{
      // Buscará todas las coincidencias desde principio a fin unicamente. Ej
      // 'ad' => 'ADIDAS' ✔
      // 'didas' => 'ADIDAS' ❌
      // 'didas' => null ✔
      const queryBuilder = this.brandRepository.createQueryBuilder('brand');
      if(name){
        queryBuilder.andWhere('brand.name LIKE :name', { name: `${name}%` });
      }
      if(limit){
        queryBuilder.take(limit);
      }

      const brands: Brand[] = await queryBuilder.getMany();
      const recourse: IRecourseCreated<Brand[]> = {
        status: true,
        message: "The brands were loaded successfully",
        recourse: brands
      };
      return recourse;
    }
    catch(error) {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error finding the brands"
      };
      throw new BadRequestException(badRequestError);
    };
  }

  async findOne(id: number): Promise<IRecourseFound<Brand>> {
    const brand: Brand = await this.brandRepository.findOneBy({ id }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error finding the brand"
      };
      throw new BadRequestException(badRequestError);
    });
    if (!brand) {
      const badRequestError: INotFoundEx = {
        status: false,
        message: `The brand with id: '${id}' was not found`
      };
      throw new NotFoundException(badRequestError);
    }
    const recourse: IRecourseFound<Brand> = {
      status: true,
      message: "The brands was loaded succesfully",
      recourse: brand
    };
    return recourse;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<IRecourseUpdated<Brand>> {
    const brand: Brand = (await this.findOne(id)).recourse;
    Object.assign(brand, updateBrandDto);
    const brandUpdated: Brand = await this.brandRepository.save(brand).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error updating the brand with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const recourse: IRecourseUpdated<Brand> = {
      status: true,
      message: "The brand was updated succesfully",
      recourse: brand
    };
    return recourse;
  }

  async remove(id: number): Promise<IRecourseDeleted<Brand>> {
    const brand: Brand = (await this.findOne(id)).recourse;
    const removed: Brand = await this.brandRepository.remove(brand).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error removing the brand with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const recourse: IRecourseDeleted<Brand> = {
      status: true,
      message: "The brand was removed succesfully",
      recourse: removed
    };
    return recourse;
  }
}
