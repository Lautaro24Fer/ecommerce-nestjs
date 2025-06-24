import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateIdTypeDto } from './dto/create-id-type.dto';
import { UpdateIdTypeDto } from './dto/update-id-type.dto';
import { Repository } from 'typeorm';
import { IdType } from './entities/id-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from "../global/responseInterfaces"

@Injectable()
export class IdTypeService {

  constructor( @InjectRepository(IdType) private readonly idTypeRepository: Repository<IdType> ) {}
  // DNI: Argentina, Perú
  // CPF: Brazil
  // CURP: Mexico
  // RUT: Chile

  async create(createIdTypeDto: CreateIdTypeDto): Promise<IRecourseCreated<IdType>> {
    const idTypeCreated: IdType = await this.idTypeRepository.save(createIdTypeDto).catch((error) => {
      console.error(error);
      const exResponse: IBadRequestex = { 
        status: false, 
        message: "Error in the creation of the identification type" 
      };
      throw new BadRequestException(exResponse);
    });
    const recourse: IRecourseCreated<IdType> = {
      status: true,
      message: "The identifiaction type was created succsfully",
      recourse: idTypeCreated
    }
    return recourse;
    
  }

  async findAll(): Promise<IRecourseFound<IdType[]>> {
    const idTypes: IdType[] = await this.idTypeRepository.find().catch((error) => {
      console.error(error);
      const exResponse: IBadRequestex = { 
        status: false, 
        message: "Error finding the products" 
      }
      throw new BadRequestException(exResponse);
    });
    const recourse: IRecourseFound<IdType[]> = {
      status: true,
      message: "The identifiaction type was created succsfully",
      recourse: idTypes
    };
    return recourse;
  }

  async findOne(id: number): Promise<IRecourseFound<IdType>> {
    const idType: IdType = await this.idTypeRepository.findOneBy({ id }).catch((error) => {
      console.error(error);
      const exResponse: IBadRequestex = { status: false, message: `Error finding the product by id '${id}'` };
      throw new BadRequestException(exResponse);
    });
    if(!idType){
      const exResponse: INotFoundEx = { status: false, message: `Identification type not found by id '${id}'` };
      throw new NotFoundException(exResponse);
    }
    const recourse: IRecourseFound<IdType> = {
      status: true,
      message: "The identifiaction type was found succsfully",
      recourse: idType
    };
    return recourse;
  }

  async update(id: number, updateIdTypeDto: UpdateIdTypeDto): Promise<IRecourseUpdated<IdType>> {
    const idTypeToUpdate: IdType = (await this.findOne(id)).recourse;
    const idTypeUpdatedBody = { ...idTypeToUpdate, ...updateIdTypeDto };

    const idTypeUpdated: IdType = await this.idTypeRepository.save(idTypeUpdatedBody).catch((error) => {
      console.error();
      const exResponse: IBadRequestex = { status: false, message: `Error saving the product by id '${id}'` };
      throw new BadRequestException(exResponse);
    });
    const recourse: IRecourseUpdated<IdType> = {
      status: true,
      message: "The identifiaction type was found succsfully",
      recourse: idTypeUpdated
    };
    return recourse;
  }

  async remove(id: number): Promise<IRecourseDeleted<IdType>> {
    
    const idTypeToRemove: IdType = (await this.findOne(id)).recourse;

    const removed: IdType = await this.idTypeRepository.remove(idTypeToRemove).catch((error) => {
      console.error(error);
      const exResponse: IBadRequestex = { status: false, message: `Error removing the product by id '${id}'` };
      throw new BadRequestException(exResponse);
    });

    const response: IRecourseDeleted<IdType> = {
      status: true,
      message: "The identification type was deleted succesfully",
      recourse: removed
    };
    return response;
  }
}
