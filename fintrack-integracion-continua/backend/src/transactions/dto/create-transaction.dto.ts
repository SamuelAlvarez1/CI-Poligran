import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, Matches, ValidateBy } from 'class-validator';
import { isPositiveAmount, type TransactionTypeName } from '../../summary/calculate-summary';

export class CreateTransactionDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La descripción es obligatoria' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @IsIn(['INCOME', 'EXPENSE'], { message: 'El tipo debe ser INCOME o EXPENSE' })
  type!: TransactionTypeName;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La categoría es obligatoria' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  category!: string;

  @IsString({ message: 'El monto es obligatorio' })
  @ValidateBy({
    name: 'isPositiveAmount',
    validator: {
      validate: (value: unknown) => typeof value === 'string' && isPositiveAmount(value),
      defaultMessage: () => 'El monto debe ser mayor que cero y tener como máximo dos decimales',
    },
  })
  amount!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato AAAA-MM-DD' })
  @ValidateBy({
    name: 'isRealDate',
    validator: {
      validate: (value: unknown) => typeof value === 'string' && isRealCalendarDate(value),
      defaultMessage: () => 'La fecha no es válida',
    },
  })
  date!: string;
}

function isRealCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
