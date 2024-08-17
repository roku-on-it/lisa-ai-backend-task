import { validate } from 'class-validator';
import { IsPassword } from './is-password';

class TestClass {
  @IsPassword()
  password: string;
}

describe('IsPassword decorator', () => {
  it('should pass validation for a valid password', async () => {
    const test = new TestClass();
    test.password = 'ValidP@ssw0rd';
    const errors = await validate(test);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if password is too short', async () => {
    const test = new TestClass();
    test.password = 'Short1!';
    const errors = await validate(test);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should fail validation if password is too long', async () => {
    const test = new TestClass();
    test.password = 'A'.repeat(129) + 'a1!';
    const errors = await validate(test);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should fail validation if password does not contain a number', async () => {
    const test = new TestClass();
    test.password = 'ValidPasswordNoNumber!';
    const errors = await validate(test);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('matches');
    expect(errors[0].constraints.matches).toContain(
      'must include at least one number',
    );
  });

  it('should fail validation if password does not contain a lowercase letter', async () => {
    const test = new TestClass();
    test.password = 'VALIDPASSWORD1!';
    const errors = await validate(test);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('matches');
    expect(errors[0].constraints.matches).toContain(
      'must include at least one lowercase letter',
    );
  });

  it('should fail validation if password does not contain an uppercase letter', async () => {
    const test = new TestClass();
    test.password = 'validpassword1!';
    const errors = await validate(test);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('matches');
    expect(errors[0].constraints.matches).toContain(
      'must include at least one uppercase letter',
    );
  });

  it('should fail validation if password does not contain a symbol', async () => {
    const test = new TestClass();
    test.password = 'ValidPassword1';
    const errors = await validate(test);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('matches');
    expect(errors[0].constraints.matches).toContain(
      'must include at least one symbol',
    );
  });
});
