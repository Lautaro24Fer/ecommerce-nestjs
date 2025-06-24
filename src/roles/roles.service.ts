import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';

@Injectable()
export class RolesService {

  constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>){}

  async create(createRoleDto: CreateRoleDto): Promise<IRecourseCreated<Role>> {
    const roleCreated: Role = await this.roleRepository.save(createRoleDto).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the creation of the role"
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseCreated<Role> = {
      status: true,
      message: "The role was created succesfully",
      recourse: roleCreated
    };

    return response;
  }

  async findAll(): Promise<IRecourseFound<Role[]>> {
    const rolesFound: Role[] = await this.roleRepository.find().catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the loading of the role"
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseFound<Role[]> = {
      status: true,
      message: "The role was created succesfully",
      recourse: rolesFound
    };
    return response;
  }

  async findOne(id: number): Promise<IRecourseFound<Role>>{
    
    const roleFound: Role = await this.roleRepository.findOneBy({ id }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the loading of the role"
      };
      throw new BadRequestException(badRequestError);
    });
    if(!roleFound) {
      const notFoundError: INotFoundEx = {
      status: false,
      message: `The role with id '${id}' was not found`
    };
      throw new NotFoundException(notFoundError);
    }
    const response: IRecourseFound<Role> = {
      status: true,
      message: "The role was found succesfully",
      recourse: roleFound
    };
    return response;
  }

  async findOneByName(name: string): Promise<IRecourseFound<Role>>{
    const role: Role = await this.roleRepository.findOneBy({ name }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the load of the role"
      };
      throw new BadRequestException(badRequestError);
    });
    if(!role) {
      const notFoundError: INotFoundEx = {
      status: false,
      message: `The role with name '${name}' was not found`
    };
      throw new NotFoundException(notFoundError);
    }
    const response: IRecourseFound<Role> = {
      status: true,
      message: "The role was found succesfully",
      recourse: role
    };
    return response;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<IRecourseUpdated<Role>> {
    const roleFound: Role = (await this.findOne(id)).recourse;
    const roleBody: Role = { ...roleFound, ...updateRoleDto };
    const updated: Role = await this.roleRepository.save(roleBody).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error updating the role with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseUpdated<Role> = {
      status: true,
      message: "Role updated succesfully",
      recourse: updated
    };
    return response;
  }

  async remove(id: number): Promise<IRecourseDeleted<Role>> {
    const role: Role = (await this.findOne(id)).recourse;
    // Sería interesante aplicar una logica de NO eliminación del rol de usuarios o administrador
    // para evitar problemas con los usuarios existentes, entonces solo podrías borrar aquellos 
    // roles secundarios como moderadores, que generarían menos problemas
    if(role.name === "user" || role.name === "admin") {
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Cant delete user or admin role"
      };
      throw new BadRequestException(badRequestError);
    }
    const removed: Role = await this.roleRepository.remove(role).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error removing the role with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const response: IRecourseDeleted<Role> = {
      status: true,
      message: "The role was deleted succesfully",
      recourse: removed
    };
    return response;
  }
}
