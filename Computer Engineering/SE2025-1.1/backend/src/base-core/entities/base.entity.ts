import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity as TypeORMBaseEntity,
} from 'typeorm';

/**
 * Base Entity class - Tương tự BaseEntity trong C#
 * Chứa các thuộc tính chung cho tất cả entities
 */
export abstract class BaseEntity extends TypeORMBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate!: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @UpdateDateColumn({ name: 'modified_date', nullable: true })
  modifiedDate?: Date;

  @Column({ name: 'modified_by', nullable: true })
  modifiedBy?: string;

  /**
   * Lifecycle hook - Trước khi save
   */
  beforeSave?(): void | Promise<void>;

  /**
   * Lifecycle hook - Sau khi save
   */
  afterSave?(): void | Promise<void>;

  /**
   * Lifecycle hook - Sau khi commit transaction
   */
  afterCommit?(): void | Promise<void>;
}
