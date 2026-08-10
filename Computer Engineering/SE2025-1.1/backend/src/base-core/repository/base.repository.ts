import { Repository, EntityTarget, FindOptionsWhere, QueryRunner } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

/**
 * Base Repository - Tương tự BaseDL trong C#
 * Generic CRUD operations cho tất cả entities
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected repository: Repository<T>;
  protected entityClass: EntityTarget<T>;

  constructor(repository: Repository<T>, entityClass: EntityTarget<T>) {
    this.repository = repository;
    this.entityClass = entityClass;
  }

  /**
   * Lấy tất cả records
   */
  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  /**
   * Lấy record theo ID
   */
  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  /**
   * Lấy records theo điều kiện
   */
  async findByFilter(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where });
  }

  /**
   * Lấy một record theo điều kiện
   */
  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  /**
   * Tạo mới entity (chưa save)
   */
  create(data: Partial<T> | Partial<T>[]): T | T[] {
    return this.repository.create(data as any) as T | T[];
  }

  /**
   * Save entity (insert hoặc update)
   */
  async save(entity: T, queryRunner?: QueryRunner): Promise<T> {
    if (queryRunner) {
      return queryRunner.manager.save(entity);
    }
    return this.repository.save(entity);
  }

  /**
   * Save nhiều entities
   */
  async saveMany(entities: T[], queryRunner?: QueryRunner): Promise<T[]> {
    if (queryRunner) {
      return queryRunner.manager.save(entities);
    }
    return this.repository.save(entities);
  }

  /**
   * Update entity
   */
  async update(id: number, data: Partial<T>, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager.update(this.entityClass, id, data as any);
    } else {
      await this.repository.update(id, data as any);
    }
  }

  /**
   * Delete entity (soft delete)
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager.delete(this.entityClass, id);
    } else {
      await this.repository.delete(id);
    }
  }

  /**
   * Count records
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Check if record exists
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * Execute raw SQL query
   */
  async query<Result = any>(sql: string, parameters?: any[]): Promise<Result> {
    return this.repository.query(sql, parameters);
  }
}
