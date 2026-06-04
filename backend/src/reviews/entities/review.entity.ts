import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reportId: string;

  @Column()
  classificationId: string;

  @Column({ nullable: true })
  reviewerUserId: string;

  @Column()
  reviewAction: 'approve' | 'modify_and_approve' | 'reject' | 'request_more_info';

  @Column('text', { nullable: true })
  notes: string;

  @Column('simple-json', { nullable: true })
  beforeSnapshot: any;

  @Column('simple-json', { nullable: true })
  afterSnapshot: any;

  @CreateDateColumn()
  createdAt: Date;
}
