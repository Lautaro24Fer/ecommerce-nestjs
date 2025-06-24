import { Test, TestingModule } from '@nestjs/testing';
import { IdTypeService } from './id-type.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdType } from './entities/id-type.entity';
import { CreateIdTypeDto } from './dto/create-id-type.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('IdTypeService', () => {
  let service: IdTypeService;
  let repository: Repository<IdType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdTypeService,
        {
          provide: getRepositoryToken(IdType),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<IdTypeService>(IdTypeService);
    repository = module.get<Repository<IdType>>(getRepositoryToken(IdType));
  });

  it('test_create_id_type_success', async () => {
    const createIdTypeDto: CreateIdTypeDto = { name: 'DNI' };
    const idType: IdType = { id: 1, name: 'DNI' };

    jest.spyOn(repository, 'save').mockResolvedValue(idType);

    const result = await service.create(createIdTypeDto);

    expect(result.status).toBe(true);
    expect(result.message).toBe('The identifiaction type was created succsfully');
    expect(result.recourse).toEqual(idType);
  });

  it('test_find_all_id_types_success', async () => {
    const idTypes: IdType[] = [{ id: 1, name: 'DNI' }, { id: 2, name: 'CPF' }];

    jest.spyOn(repository, 'find').mockResolvedValue(idTypes);

    const result = await service.findAll();

    expect(result.status).toBe(true);
    expect(result.message).toBe('The identifiaction type was created succsfully');
    expect(result.recourse).toEqual(idTypes);
  });

  it('test_find_all_id_types_success', async () => {
    const idTypes: IdType[] = [{ id: 1, name: 'DNI' }, { id: 2, name: 'CPF' }];

    jest.spyOn(repository, 'find').mockResolvedValue(idTypes);

    const result = await service.findAll();

    expect(result.status).toBe(true);
    expect(result.message).toBe('The identifiaction type was created succsfully');
    expect(result.recourse).toEqual(idTypes);
  });

  it('test_find_one_id_type_not_found', async () => {
    const id = 1;

    jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
  });
});