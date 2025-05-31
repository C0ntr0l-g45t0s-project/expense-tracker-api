import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly catService: CategoriesService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto, @Request() req) {
    return this.catService.create(dto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.catService.findAll(req.user.id);
  }
}
