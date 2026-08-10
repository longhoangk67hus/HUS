import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, IsEmail, IsEnum, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TheaterStatus } from './theater-status.enum';

/**
 * Theater Entity
 * Represents cinema theater/branch locations
 */
@Entity('theater')
export class Theater {
  @PrimaryGeneratedColumn({ name: 'TheaterId' })
  @ApiProperty({ description: 'Theater ID', example: 1 })
  theaterId!: number;

  @Column({ name: 'TheaterCode', length: 50 })
  @ApiProperty({ description: 'Theater code', example: 'CGV-HN01', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  theaterCode!: string;

  @Column({ name: 'Name', length: 200 })
  @ApiProperty({ description: 'Theater name', example: 'CGV Vincom Center', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @Column({ name: 'Address', length: 500 })
  @ApiProperty({ description: 'Theater address', example: '191 Ba Trieu, Hai Ba Trung', maxLength: 500 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  address!: string;

  @Column({ name: 'City', length: 100 })
  @ApiProperty({ description: 'City', example: 'Hanoi', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city!: string;

  @Column({ name: 'State', length: 100 })
  @ApiProperty({ description: 'State/Province', example: 'Hanoi', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  state!: string;

  @Column({ name: 'PostalCode', length: 20 })
  @ApiProperty({ description: 'Postal code', example: '100000', maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  postalCode!: string;

  @Column({ name: 'Phone', length: 20 })
  @ApiProperty({ description: 'Contact phone', example: '1900-6017', maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone!: string;

  @Column({ name: 'Email', length: 100 })
  @ApiProperty({ description: 'Contact email', example: 'info@cgv.vn', maxLength: 100 })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email!: string;

  @Column({
    name: 'Status',
    type: 'enum',
    enum: TheaterStatus,
    default: TheaterStatus.Active,
  })
  @ApiProperty({
    description: 'Theater status',
    enum: TheaterStatus,
    example: TheaterStatus.Active,
    default: TheaterStatus.Active,
  })
  @IsEnum(TheaterStatus)
  status!: TheaterStatus;

  // Audit fields
  @Column({ name: 'CreatedDate', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @ApiPropertyOptional({ description: 'Created date' })
  createdDate?: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Created by' })
  @IsOptional()
  @MaxLength(100)
  createdBy?: string;

  @Column({ name: 'ModifiedDate', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Modified date' })
  modifiedDate?: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Modified by' })
  @IsOptional()
  @MaxLength(100)
  modifiedBy?: string;

  // Relations (will add Room relation later)
  // @OneToMany(() => Room, room => room.theater)
  // rooms?: Room[];
}
