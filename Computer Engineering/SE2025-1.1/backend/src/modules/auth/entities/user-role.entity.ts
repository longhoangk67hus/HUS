import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

/**
 * UserRole Entity (Junction table)
 * Migrated from CinemaSystem user_role table
 */
@Entity('user_role')
export class UserRole {
  @PrimaryColumn({ name: 'ID', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'UserID', type: 'char', length: 36 })
  userId!: string;

  @Column({ name: 'RoleID', type: 'char', length: 36 })
  roleId!: string;

  @Column({ name: 'CreatedDate', type: 'datetime', nullable: true })
  createdDate?: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: true })
  createdBy?: string;

  @Column({ name: 'ModifiedDate', type: 'datetime', nullable: true })
  modifiedDate?: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: true })
  modifiedBy?: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'UserID', referencedColumnName: 'userId' })
  user?: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'RoleID', referencedColumnName: 'roleId' })
  role?: Role;
}
