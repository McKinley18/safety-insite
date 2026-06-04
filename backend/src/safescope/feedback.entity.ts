import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  findingId: string;

  @Column()
  citation: string;

  @Column()
  action: string; // accepted | rejected | changed

  @CreateDateColumn()
  createdAt: Date;
}
