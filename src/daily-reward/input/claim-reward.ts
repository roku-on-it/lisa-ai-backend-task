import { Max, Min } from 'class-validator';

export class ClaimRewardBody {
  @Min(1)
  @Max(30)
  dayIndex: number;
}
