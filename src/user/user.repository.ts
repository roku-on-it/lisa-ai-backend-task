import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityNotFoundError, Repository } from 'typeorm';
import { User } from './user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';

type FindOneByOrFailArgs = Partial<{ id: string; username: string }>;
type InsertOrFailArgs = {
  username: string;
  passwordHash: string;
  timezone: string;
};
type FindByIdAndUpdateOrFail = {
  id: string;
  update: Partial<User>;
};

interface IUserRepo {
  findOneByOrFail(args: FindOneByOrFailArgs): Promise<User>;

  insertOrFail(args: InsertOrFailArgs): Promise<User>;
}

@Injectable()
export class UserRepository implements IUserRepo {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByIdAndUpdateOrFail(args: FindByIdAndUpdateOrFail) {
    return this.repo.update({ id: args.id }, args.update);
  }

  async findOneByOrFail(args: FindOneByOrFailArgs): Promise<User> {
    return this.repo.findOneOrFail({ where: args }).catch((error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('User not found');
      }

      Logger.error(`${this.constructor.name}#findOneByOrFail`);
      console.error(error);

      throw error;
    });
  }

  async insertOrFail(args: InsertOrFailArgs): Promise<User> {
    const now = DateTime.local({ zone: 'utc' });

    const user = new User({
      username: args.username,
      passwordHash: args.passwordHash,
      timezone: args.timezone,
      currentClaimDayIdx: 1,
      coin: 0,
      cannotClaimBeforeAt: now.toJSDate(),
      cannotClaimAfterAt: now.plus({ years: 100 }).toJSDate(),
    });

    await this.repo.insert(user).catch((error) => {
      if (error.code === '23505') {
        throw new ConflictException('User conflict');
      }

      Logger.error(`${this.constructor.name}#registerUser`);
      console.error(error);

      throw error;
    });

    return user;
  }
}
