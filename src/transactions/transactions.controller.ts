import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Delete,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto, @Request() req) {
    return this.txService.create(dto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.txService.findAllForUser(req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @Request() req,
  ) {
    return this.txService.update(+id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.txService.delete(+id, req.user.id);
  }

  @Get('summary')
  getSummary(@Request() req) {
    return this.txService.getSummary(req.user.id);
  }

  @Get('summary/monthly')
  getMonthlySummary(@Request() req) {
    return this.txService.getMonthlySummary(req.user.id);
  }

  @Get('summary/by-category')
  getCategorySummary(
    @Request() req,
    @Query('type') type: 'income' | 'expense',
  ) {
    if (type !== 'income' && type !== 'expense') {
      throw new Error('Tipo inválido: debe ser income o expense');
    }

    return this.txService.getCategorySummary(req.user.id, type);
  }
}
