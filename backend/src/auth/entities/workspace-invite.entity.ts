import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('workspace_invites')
export class WorkspaceInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  inviteToken: string;

  @Column()
  email: string;

  @Column()
  tenantId: string;

  @Column()
  companyName: string;

  @Column({ default: 'inspector' })
  role: 'owner' | 'admin' | 'manager' | 'inspector' | 'viewer';

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'cancelled';

  @Column({ nullable: true })
  invitedByUserId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
