import { applyDecorators } from '@nestjs/common';
import { Length, Matches, ValidationOptions } from 'class-validator';

export function IsPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return applyDecorators(
    Length(12, 128, validationOptions),
    Matches(/\d/, { message: '$property must include at least one number' }),
    Matches(/(.*[a-z].*)/, {
      message: '$property must include at least one lowercase letter',
    }),
    Matches(/(.*[A-Z].*)/, {
      message: '$property must include at least one uppercase letter',
    }),
    Matches(/(.*\W.*)/, {
      message: '$property must include at least one symbol',
    }),
  );
}
