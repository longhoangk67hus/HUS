import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role, UserRole } from '../entities';
import { LoginDto, RegisterDto, JwtPayload, LoginResponse } from '../dto';
import { ServiceResponse } from '@base-core/dto/service-response.dto';
import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { RegistrationEmailService } from '../../email/services';

/**
 * Authentication Service
 * Migrated from BaseCoreService.Authen.AuthBL
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private jwtService: JwtService,
    private registrationEmailService: RegistrationEmailService,
  ) {}

  /**
   * Hash password using SHA256 (same as .NET SecurityUtils.HashPassword)
   */
  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  /**
   * Generate random user code (e.g., @KXBXJ5)
   */
  private generateUserCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '@';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<ServiceResponse<LoginResponse>> {
    try {
      const { userName, password } = loginDto;
      const hashedPassword = this.hashPassword(password);

      // Find user with userRoles relation
      const user = await this.userRepository.findOne({
        where: { userName, password: hashedPassword },
        relations: ['userRoles', 'userRoles.role'],
      });

      if (!user) {
        return ServiceResponse.error('Tên đăng nhập hoặc mật khẩu không đúng', 401);
      }

      if (user.status !== 1) {
        return ServiceResponse.error('Tài khoản đã bị khóa hoặc chưa được kích hoạt', 403);

      }

      // Extract roles from userRoles
      const roles = user.userRoles?.map(ur => ur.role?.roleCode || '').filter(Boolean) || [];

      // Generate JWT token
      const payload: JwtPayload = {
        userId: user.userId,
        userName: user.userName,
        email: user.email,
        fullName: user.fullName,
        roles,
      };

      const token = this.jwtService.sign(payload);

      const response: LoginResponse = {
        token,
        user: {
          userId: user.userId,
          userName: user.userName,
          email: user.email,
          fullName: user.fullName,
          roles: payload.roles,
        },
      };

      return ServiceResponse.success(response);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<ServiceResponse<User>> {
    try {
      // Check if username already exists
      const existingUser = await this.userRepository.findOne({
        where: { userName: registerDto.userName },
      });

      if (existingUser) {
        return ServiceResponse.error('Tên đăng nhập đã tồn tại', 409);


      }

      // Check if email already exists
      const existingEmail = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingEmail) {
        return ServiceResponse.error('Email đã được sử dụng', 409);
      }

      // Get default USER role
      const userRole = await this.roleRepository.findOne({
        where: { roleCode: 'USER' },
      });

      if (!userRole) {
        return ServiceResponse.error(
  'Không tìm thấy quyền mặc định cho người dùng. Vui lòng liên hệ quản trị viên.',
  500
);

      }

      // Create new user
      const newUserId = uuidv4();
      const user = this.userRepository.create({
        userId: newUserId,
        userCode: this.generateUserCode(),
        userName: registerDto.userName,
        password: this.hashPassword(registerDto.password),
        fullName: registerDto.fullName,
        email: registerDto.email,
        phoneNumber: registerDto.phoneNumber,
        status: 1,
        createdDate: new Date(),
      });

      const savedUser = await this.userRepository.save(user);

      // Create user-role mapping
      const userRoleMapping = this.userRoleRepository.create({
        id: uuidv4(),
        userId: newUserId,
        roleId: userRole.roleId,
        createdDate: new Date(),
      });
      await this.userRoleRepository.save(userRoleMapping);

      // Send registration email (async, don't wait)
      this.registrationEmailService
        .sendRegistrationEmail(registerDto.email, registerDto.userName, registerDto.fullName)
        .catch(error => console.error('Failed to send registration email:', error));

      // Remove password from response
      delete (savedUser as any).password;

      return ServiceResponse.success(savedUser);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user by ID with roles
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { userId },
      relations: ['userRoles', 'userRoles.role'],
    });
  }
}
