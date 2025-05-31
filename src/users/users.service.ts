import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async create(user: Partial<User>) {
    const newUser = this.usersRepo.create(user);
    return this.usersRepo.save(newUser);
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }
}
