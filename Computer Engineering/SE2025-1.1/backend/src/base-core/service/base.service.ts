import { DataSource, QueryRunner } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { BaseRepository } from '../repository/base.repository';
import { ServiceResponse, ValidationResult } from '../dto/service-response.dto';
import { validate } from 'class-validator';

/**
 * Base Service - Tương tự BaseBL trong C#
 * Chứa business logic, transaction lifecycle, validation
 */
export abstract class BaseService<T extends BaseEntity> {
  protected dataSource: DataSource;
  protected repository: BaseRepository<T>;
  protected currentUser?: string;

  constructor(dataSource: DataSource, repository: BaseRepository<T>) {
    this.dataSource = dataSource;
    this.repository = repository;
  }

  /**
   * Set current user (từ JWT token)
   */
  setCurrentUser(username: string): void {
    this.currentUser = username;
  }

  /**
   * Get all entities
   */
  async getAll(): Promise<ServiceResponse<T[]>> {
    const entities = await this.repository.findAll();
    return ServiceResponse.success(entities);
  }

  /**
   * Get entity by ID
   */
  async getById(id: number): Promise<ServiceResponse<T>> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      return ServiceResponse.error('Entity not found', 404);
    }
    return ServiceResponse.success(entity);
  }

  /**
   * Save entity (insert or update)
   * Tương tự method Save() trong BaseBL C#
   */
  async save(entity: T): Promise<ServiceResponse<T>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate
      const validateResult = await this.validateBeforeSave(entity);
      if (validateResult.length > 0) {
        await queryRunner.rollbackTransaction();
        return ServiceResponse.validationError(validateResult);
      }

      // 2. Set created/modified info
      if (!entity.id) {
        entity.createdBy = this.currentUser;
        entity.createdDate = new Date();
      } else {
        entity.modifiedBy = this.currentUser;
        entity.modifiedDate = new Date();
      }

      // 3. Before save hook
      await this.beforeSave(entity);
      if (entity.beforeSave) {
        await entity.beforeSave();
      }

      // 4. Do save
      const savedEntity = await this.doSave(entity, queryRunner);

      // 5. After save hook
      await this.afterSave(savedEntity, queryRunner);
      if (savedEntity.afterSave) {
        await savedEntity.afterSave();
      }

      // 6. Commit transaction
      await queryRunner.commitTransaction();

      // 7. After commit hook
      await this.afterCommit(savedEntity);
      if (savedEntity.afterCommit) {
        await savedEntity.afterCommit();
      }

      return ServiceResponse.success(savedEntity);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete entity
   */
  async delete(id: number): Promise<ServiceResponse<void>> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      return ServiceResponse.error('Entity not found', 404);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.beforeDelete(entity);
      await this.repository.delete(id, queryRunner);
      await queryRunner.commitTransaction();
      await this.afterDelete(entity);

      return ServiceResponse.success();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== LIFECYCLE HOOKS ====================
  // Các method này có thể override trong class con

  /**
   * Validate trước khi save
   * Override method này để custom validation
   */
  protected async validateBeforeSave(entity: T): Promise<ValidationResult[]> {
    // Sử dụng class-validator
    const errors = await validate(entity);
    const validationResults: ValidationResult[] = [];

    for (const error of errors) {
      if (error.constraints) {
        for (const constraint of Object.values(error.constraints)) {
          validationResults.push({
            field: error.property,
            message: constraint,
            value: error.value,
          });
        }
      }
    }

    return validationResults;
  }

  /**
   * Hook: Trước khi save
   */
  protected async beforeSave(entity: T): Promise<void> {
    // Override để custom logic
  }

  /**
   * Hook: Thực hiện save (có thể override để custom)
   */
  protected async doSave(entity: T, queryRunner: QueryRunner): Promise<T> {
    return this.repository.save(entity, queryRunner);
  }

  /**
   * Hook: Sau khi save (trong transaction)
   */
  protected async afterSave(entity: T, queryRunner: QueryRunner): Promise<void> {
    // Override để custom logic (vẫn trong transaction)
  }

  /**
   * Hook: Sau khi commit transaction
   */
  protected async afterCommit(entity: T): Promise<void> {
    // Override để custom logic (sau khi commit thành công)
  }

  /**
   * Hook: Trước khi delete
   */
  protected async beforeDelete(entity: T): Promise<void> {
    // Override để custom logic
  }

  /**
   * Hook: Sau khi delete
   */
  protected async afterDelete(entity: T): Promise<void> {
    // Override để custom logic
  }
}
