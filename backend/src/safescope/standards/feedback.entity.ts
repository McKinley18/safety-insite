import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class FeedbackEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  citation: string;

  @Column()
  action: string; // accepted | rejected | replaced

  @Column({ nullable: true })
  replacementCitation?: string;

  @CreateDateColumn()
  createdAt: Date;
}
