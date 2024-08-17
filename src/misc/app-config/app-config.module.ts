import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().greater(1024).required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().min(24).required(),
        POSTGRES_DATABASE: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.bool().default(false),
        DB_LOGGING: Joi.bool().default(false),
        DB_DROP_SCHEMA: Joi.bool().default(false),
      }),
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
