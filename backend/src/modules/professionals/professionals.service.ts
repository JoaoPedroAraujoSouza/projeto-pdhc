import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

const professionalInclude = {
  specialty: {
    select: { id: true, name: true },
  },
} as const;

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProfessionalDto) {
    await this.assertSpecialtyExists(dto.specialtyId);

    return this.prisma.professional.create({
      data: {
        fullName: dto.fullName,
        specialtyId: dto.specialtyId,
      },
      include: professionalInclude,
    });
  }

  async findAll() {
    return this.prisma.professional.findMany({
      include: professionalInclude,
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      include: professionalInclude,
    });

    if (!professional) {
      throw new NotFoundException('Professional not found.');
    }

    return professional;
  }

  async update(id: string, dto: UpdateProfessionalDto) {
    await this.findOne(id);

    if (dto.specialtyId !== undefined) {
      await this.assertSpecialtyExists(dto.specialtyId);
    }

    return this.prisma.professional.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.specialtyId !== undefined && { specialtyId: dto.specialtyId }),
      },
      include: professionalInclude,
    });
  }

  private async assertSpecialtyExists(specialtyId: string): Promise<void> {
    const specialty = await this.prisma.specialty.findUnique({
      where: { id: specialtyId },
    });

    if (!specialty) {
      throw new NotFoundException('Specialty not found.');
    }
  }
}
