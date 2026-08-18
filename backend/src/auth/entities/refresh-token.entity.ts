import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// Opaque rotating refresh token. Only a sha256 hash of the raw token is ever
// stored, matching the existing passwordResetTokenHash convention. A row is
// consumed (revokedAt set) on every /auth/refresh call and replaced by a new
// row; presenting an already-revoked-but-unexpired token is treated as a
// reuse/theft signal (see AuthService.refresh).
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar' })
  @Index('idx_refresh_token_hash')
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
