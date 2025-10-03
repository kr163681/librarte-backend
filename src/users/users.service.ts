// src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, RolUsuario } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  /**
   * Crea un usuario nuevo usando email como identificador único.
   */
  async create(email: string, password: string, role: RolUsuario) {
    const exists = await this.repo.findOne({ where: { email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, passwordHash, role });
    return this.repo.save(user);
  }

  /**
   * Busca por email (para login o validaciones).
   */
  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  /**
   * Valida password plano contra el hash guardado.
   */
  async validatePassword(user: User, password: string) {
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Busca por id (útil en estrategias JWT).
   */
  async findById(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
