import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsEmail, IsString, MaxLength, MinLength, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from './user-role.entity';

/**
 * User Entity
 * Migrated from CinemaSystem user table
 */
@Entity('user')
export class User {
  @PrimaryColumn({ name: 'UserID', type: 'char', length: 36 })
  @ApiProperty({ description: 'User ID (UUID)', example: '8fcff9db-103a-46fb-9292-33437d166035' })
  @IsString()
  userId!: string;

  @Column({ name: 'UserCode', length: 20 })
  @ApiProperty({ description: 'User code', example: '@KXBXJ5', maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  userCode!: string;

  @Column({ name: 'UserName', length: 100 })
  @ApiProperty({ description: 'Username for login', example: 'meomaybe', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  userName!: string;

  @Column({ name: 'Password', length: 100 })
  @ApiProperty({ description: 'Hashed password (SHA256)', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @Column({ name: 'FullName', length: 100 })
  @ApiProperty({ description: 'Full name', example: 'Nguyễn Văn An', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName!: string;

  @Column({ name: 'PhoneNumber', type: 'char', length: 12, nullable: true })
  @ApiPropertyOptional({ description: 'Phone number', example: '0329080098', maxLength: 12 })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  phoneNumber?: string;

  @Column({ name: 'Email', length: 255 })
  @ApiProperty({ description: 'Email address', example: 'user@example.com', maxLength: 255 })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Column({ name: 'Status', type: 'tinyint', default: 1 })
  @ApiPropertyOptional({ description: 'Status (1=Active, 0=Inactive)', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  // Audit fields
  @Column({ name: 'CreatedDate', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Created date' })
  createdDate?: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Created by' })
  createdBy?: string;

  @Column({ name: 'ModifiedDate', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Modified date' })
  modifiedDate?: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Modified by' })
  modifiedBy?: string;

  // Relations
  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles?: UserRole[];
}
