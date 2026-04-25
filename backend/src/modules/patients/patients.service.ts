import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatientDto) {
    await this.assertCpfIsUnique(dto.cpf);

    return this.prisma.patient.create({
      data: {
        fullName: dto.fullName,
        cpf: dto.cpf,
        birthDate: new Date(dto.birthDate),
        phone: dto.phone,
      },
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);

    if (dto.cpf !== undefined) {
      await this.assertCpfIsUnique(dto.cpf, id);
    }

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.cpf !== undefined && { cpf: dto.cpf }),
        ...(dto.birthDate !== undefined && {
          birthDate: new Date(dto.birthDate),
        }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const activeAppointment = await this.prisma.appointment.findFirst({
      where: {
        patientId: id,
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
      },
      select: { id: true },
    });

    if (activeAppointment) {
      throw new UnprocessableEntityException(
        'Não é possível excluir o paciente pois ele possui consulta agendada ou confirmada.',
      );
    }

    await this.prisma.patient.delete({
      where: { id },
    });
  }

  private async assertCpfIsUnique(
    cpf: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.patient.findUnique({
      where: { cpf },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'Já existe um paciente cadastrado com este CPF.',
      );
    }
  }
}
