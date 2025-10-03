import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private billingService: BillingService, // 👈 lo inyectamos
  ) {}

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashed = await bcrypt.hash(password, 10);

    // Crear usuario "limpio"
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
      },
    });

    // ✅ Asignar plan Free
    await this.billingService.assignDefaultPlan(user.id);

    return this.signToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
