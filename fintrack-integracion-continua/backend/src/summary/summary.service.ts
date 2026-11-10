import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { summarize } from './calculate-summary';

@Injectable()
export class SummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const rows = await this.prisma.transaction.findMany({
      select: { type: true, amount: true },
    });

    return summarize(
      rows.map((row) => ({
        type: row.type,
        amount: row.amount.toFixed(2),
      })),
    );
  }
}
