import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['citation', 'agency'], { unique: true })
export class Standard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  citation: string;

  @Column()
  agency: string; // MSHA | OSHA

  @Column()
  title: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ nullable: true })
  part: string;

  @Column({ nullable: true })
  subpart: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: true })
  isActive: boolean;
}
