import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * RoomType Entity
 * Represents different types of cinema rooms (Standard, VIP, IMAX, 4DX, etc.)
 * Migrated from CinemaSystem.Common.Entities.RoomType
 */
@Entity('room_type')
export class RoomType {
  @PrimaryGeneratedColumn({ name: 'RoomTypeId' })
  @ApiProperty({ example: 1, description: 'Room type ID' })
  roomTypeId: number;

  @Column({ name: 'TypeName', type: 'varchar', length: 50, nullable: false })
  @ApiProperty({ 
    example: 'VIP', 
    description: 'Type name of the room (Standard, VIP, IMAX, 4DX)',
    maxLength: 50
  })
  typeName: string;

  @Column({ name: 'PriceMultiplier', type: 'decimal', precision: 5, scale: 2, nullable: false })
  @ApiProperty({ 
    example: 1.5, 
    description: 'Price multiplier for this room type (e.g., 1.5 means 150% of base price)',
    type: 'number'
  })
  priceMultiplier: number;

  @Column({ name: 'Description', type: 'text', nullable: true })
  @ApiProperty({ 
    example: 'Premium seats with extra legroom and reclining features', 
    description: 'Description of the room type features',
    required: false
  })
  description?: string;

  // Relationship: One room type can have many rooms
  // @OneToMany(() => Room, room => room.roomType)
  // rooms: Room[];
}
