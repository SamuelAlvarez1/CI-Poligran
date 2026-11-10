import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Transaction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.transaction.findMany({
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    return rows.map(toResponse);
  }

  async create(dto: CreateTransactionDto) {
    const created = await this.prisma.transaction.create({
      data: {
        description: dto.description,
        type: dto.type,
        category: dto.category,
        amount: new Prisma.Decimal(dto.amount),
        date: new Date(`${dto.date}T00:00:00.000Z`),
      },
    });

    return toResponse(created);
  }

  async remove(id: number) {
    try {
      const deleted = await this.prisma.transaction.delete({ where: { id } });
      return toResponse(deleted);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('El movimiento no existe');
      }
      throw error;
    }
  }
}

function toResponse(transaction: Transaction) {
  return {
    id: transaction.id,
    description: transaction.description,
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount.toFixed(2),
    date: transaction.date.toISOString().slice(0, 10),
    createdAt: transaction.createdAt.toISOString(),
  };
}
