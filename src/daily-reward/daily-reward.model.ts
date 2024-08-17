import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RewardClaimState {
  LOCKED,
  CLAIMABLE,
  CLAIMED,
}

@Entity()
export class DailyReward {
  @PrimaryGeneratedColumn('uuid')
  id: number;
  @Column()
  coin: number;
  @Column()
  dayIndex: number;

  title: string;
  state: RewardClaimState;
  claimStartDate: Date;
  claimEndDate: Date;

  constructor(args: Partial<DailyReward>) {
    Object.assign(this, args);
  }
}
