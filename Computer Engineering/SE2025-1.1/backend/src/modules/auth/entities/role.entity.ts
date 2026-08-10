import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from './user-role.entity';

/**
 * Role Entity
 * Migrated from CinemaSystem role table
 */
@Entity('role')
export class Role {
  @PrimaryColumn({ name: 'RoleID', type: 'char', length: 36 })
  @ApiProperty({ description: 'Role ID (UUID)', example: '3d262a90-87cd-11ee-8b32-0250832bcf68' })
  @IsString()
  roleId!: string;

  @Column({ name: 'RoleName', length: 255 })
  @ApiProperty({ description: 'Role display name', example: 'Người dùng', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  roleName!: string;

  @Column({ name: 'RoleCode', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Role code', example: 'USER', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  roleCode?: string;

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
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles?: UserRole[];
}
