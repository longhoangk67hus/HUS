import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theater } from './entities/theater.entity';
import { TheaterController } from './theater.controller';
import { TheaterService } from './services/theater.service';
import { TheaterRepository } from './repositories/theater.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Theater])],
  controllers: [TheaterController],
  providers: [TheaterService, TheaterRepository],
  exports: [TheaterService],
})
export class TheaterModule {}
