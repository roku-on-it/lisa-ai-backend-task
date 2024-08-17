import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hash } from 'argon2';

@Entity()
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  timezone: string;

  @Column({ default: 1 })
  currentClaimDayIdx: number;

  @Column({ default: 0 })
  coin: number;

  @Column({ type: 'timestamp without time zone' })
  cannotClaimBeforeAt: Date;

  @Column({ type: 'timestamp without time zone' })
  cannotClaimAfterAt: Date;

  constructor(user: Omit<User, 'id'>) {
    Object.assign(this, user);
  }

  @BeforeInsert()
  private async beforeWrite() {
    this.passwordHash = await hash(this.passwordHash);
  }
}
