import { Field, ObjectType } from "type-graphql";
import { Book } from "./book.entity";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";

@ObjectType()
@Entity()
export class Author {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  fullName!: string;

  @Field(() => [Book], { nullable: true })
  @OneToMany(() => Book, (book) => book.author)
  books!: Book[];

  @Field(() => String)
  @CreateDateColumn({ type: "timestamp" })
  createAt!: string;
}
