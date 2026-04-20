import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Specialty } from '@prisma/client';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
    try {
      return await this.prisma.specialty.create({
        data: {
          name: createSpecialtyDto.name,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Specialty name already exists.');
      }

      throw error;
    }
  }

  async findAll(): Promise<Specialty[]> {
    return this.prisma.specialty.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
