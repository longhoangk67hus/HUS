import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TheaterService } from './services/theater.service';
import { CreateTheaterDto, UpdateTheaterDto } from './dto';
import { Theater } from './entities/theater.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Theater Controller
 * Handles HTTP requests for theater management
 */
@ApiTags('theaters')
@Controller('api/theaters')
export class TheaterController {
  constructor(private readonly theaterService: TheaterService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all theaters', 
    description: 'Returns all SE2025 Cinema theater locations (Hanoi x2, Ho Chi Minh, Da Nang)'
  })
  @ApiResponse({ status: 200, description: 'All theater information', type: [Theater] })
  async findAll() {
    const theaters = await this.theaterService.findAll();
    
    return {
      isSuccess: true,
      data: theaters,
      message: 'SE2025 Cinema operates in 4 locations across Vietnam',
    };
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Get active theaters', 
    description: 'Returns all active SE2025 Cinema theaters'
  })
  @ApiResponse({ status: 200, description: 'Active theater information', type: [Theater] })
  async findActive() {
    const theaters = await this.theaterService.findActive();
    
    return {
      isSuccess: true,
      data: theaters,
      message: 'All active SE2025 Cinema locations',
    };
  }

  @Get('city')
  @ApiOperation({ 
    summary: 'Get theaters by city',
    description: 'Returns SE2025 Cinema theaters in specified city (Hanoi, Ho Chi Minh, Da Nang)'
  })
  @ApiQuery({ name: 'name', description: 'City name - Hanoi, Ho Chi Minh, or Da Nang', example: 'Hanoi' })
  @ApiResponse({ status: 200, description: 'Theaters in specified city', type: [Theater] })
  async findByCity(@Query('name') city: string) {
    const supportedCities = ['hanoi', 'ho chi minh', 'da nang'];
    const normalizedCity = city?.toLowerCase();
    
    if (!supportedCities.includes(normalizedCity)) {
      return {
        isSuccess: false,
        data: [],
        message: 'SE2025 Cinema operates in Hanoi, Ho Chi Minh, and Da Nang only',
      };
    }
    
    const theaters = await this.theaterService.findByCity(city);
    
    return {
      isSuccess: true,
      data: theaters,
      message: `SE2025 Cinema location(s) in ${city}`,
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get theater by ID',
    description: 'Get SE2025 Cinema details by ID (1-4 are valid)'
  })
  @ApiParam({ name: 'id', description: 'Theater ID (1-4)', example: 1 })
  @ApiResponse({ status: 200, description: 'Theater details', type: Theater })
  @ApiResponse({ status: 404, description: 'Theater not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    if (id < 1 || id > 4) {
      return {
        isSuccess: false,
        message: 'Theater ID must be between 1-4 (SE2025 Cinema locations)',
        data: null,
      };
    }
    
    const theater = await this.theaterService.findById(id);
    
    if (!theater) {
      return {
        isSuccess: false,
        message: `Theater ID=${id} not found`,
        data: null,
      };
    }
    
    return {
      isSuccess: true,
      data: theater,
      message: 'SE2025 Cinema information',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a new theater (Admin only)',
    description: 'Create additional SE2025 Cinema location (expansion mode)',
  })
  @ApiResponse({ status: 201, description: 'Theater created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createTheaterDto: CreateTheaterDto) {
    const theater = await this.theaterService.create(createTheaterDto);
    
    return {
      isSuccess: true,
      data: theater,
      message: 'New SE2025 Cinema location created successfully',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update a theater (Admin only)',
    description: 'Update SE2025 Cinema details for any location (ID 1-4)'
  })
  @ApiParam({ name: 'id', description: 'Theater ID (1-4)', example: 1 })
  @ApiResponse({ status: 200, description: 'Theater updated successfully', type: Theater })
  @ApiResponse({ status: 404, description: 'Theater not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTheaterDto: UpdateTheaterDto,
  ) {
    if (id < 1 || id > 4) {
      return {
        isSuccess: false,
        message: 'Theater ID must be between 1-4 (SE2025 Cinema locations)',
        data: null,
      };
    }
    
    const theater = await this.theaterService.update(id, updateTheaterDto);
    
    if (!theater) {
      return {
        isSuccess: false,
        message: `Theater ID=${id} not found`,
        data: null,
      };
    }
    
    return {
      isSuccess: true,
      data: theater,
      message: 'SE2025 Cinema updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete a theater (Admin only)',
    description: 'Remove a SE2025 Cinema location (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Theater ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Theater deleted successfully' })
  @ApiResponse({ status: 404, description: 'Theater not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const theater = await this.theaterService.delete(id);
    
    if (!theater) {
      return {
        isSuccess: false,
        message: `Theater ID=${id} not found`,
        data: null,
      };
    }
    
    return {
      isSuccess: true,
      data: null,
      message: 'SE2025 Cinema location deleted successfully',
    };
  }
}
