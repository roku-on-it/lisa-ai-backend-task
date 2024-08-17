import { IsAlphanumeric, Length } from 'class-validator';
import { IsPassword } from '../../shared/decorator/validator/is-password';

// also used for login
export class RegisterUserBody {
  @Length(2, 32)
  @IsAlphanumeric()
  username: string;

  @IsPassword()
  password: string;
}
