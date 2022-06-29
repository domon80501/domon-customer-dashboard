import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';

export enum SocialType {
  Individual = 'individual',
  Google = 'google',
  Facebook = 'facebook',
}

@Entity('customers')
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  createdat!: Date;

  @Column()
  emailverified!: boolean;

  @Column()
  emailverifiedat!: Date;

  @Column({
    type: 'enum',
    enum: SocialType,
    default: SocialType.Individual,
  })
  socialtype!: SocialType;

  @Column()
  logincount!: number;

  @Column()
  lastloginat!: Date;
}

export default Customer;
