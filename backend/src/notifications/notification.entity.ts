import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  /**
   * §305 (SE-12) — TYPED, BECAUSE THE CANONICAL CONTRACT TYPES IT.
   *
   * This was a bare `@Column()`, which infers `character varying`, while every value it has ever
   * held is a user id. §305 made the column `uuid` with a foreign key to `user(id)` ON DELETE
   * CASCADE and an index on `("userId", "createdAt")` — the exact shape of `findMine`. Declaring the
   * type here is what stops the entity and the schema disagreeing again: a bare `@Column()` is
   * precisely how SE-6 and this defect were both created.
   */
  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  type: 'assigned_action' | 'overdue_action' | 'due_soon_action' | 'system';

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
