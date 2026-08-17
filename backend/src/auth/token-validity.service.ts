import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class TokenValidityService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // Same revocation check as JwtStrategy.validate: a deleted account or a
  // password change issued after the token's iat immediately invalidates it,
  // regardless of the token's own (unexpired) exp.
  async assertTokenNotRevoked(payload: { userId?: string; iat?: number }): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: String(payload.userId) } });
    if (!user || user.deletedAt) throw new UnauthorizedException();
    if (
      user.passwordChangedAt &&
      (!payload.iat || payload.iat * 1000 < user.passwordChangedAt.getTime())
    ) {
      throw new UnauthorizedException();
    }
  }
}
