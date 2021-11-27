import { Mutation, Query, Resolver, Arg, InputType, Field } from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { Author } from "../entity/author.entity";
import { Length, IsString } from "class-validator";

@InputType()
class AuthorInput {
  @Field()
  @Length(3, 64)
  @IsString()
  fullName!: string;
}
@InputType()
class AuthorUpdateInput {
  @Field(() => Number)
  id!: number;

  @Field()
  @Length(3, 64)
  fullName?: string;
}

@InputType()
class AuthorIdInput {
  @Field(() => Number)
  id!: number;
}

@Resolver()
export class AuthorResolver {
  authorRepository: Repository<Author>;

  constructor() {
    this.authorRepository = getRepository(Author);
  }

  @Mutation(() => Author)
  async createAuthor(
    @Arg("input", () => AuthorInput) input: AuthorInput
  ): Promise<Author | undefined> {
    try {
      const createdAuthor = await this.authorRepository.insert({
        fullName: input.fullName,
      });
      const result = await this.authorRepository.findOne(
        createdAuthor.identifiers[0].id
      );
      return result;
    } catch (error) {
      console.error;
    }
  }

  @Query(() => [Author])
  async getAllAuthors(): Promise<Author[]> {
    return await this.authorRepository.find({ relations: ["books"] });
  }

  @Query(() => Author)
  async getOneAuthor(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Author | undefined> {
    try {
      const author = this.authorRepository.findOne(input.id);
      if (!author) {
        const error = new Error();
        error.message = "Author does not exist.";
        throw error;
      }
      return author;
    } catch (e) {
      throw new Error();
    }
  }

  @Mutation(() => Author)
  async updateOneAuthor(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    const authorExist = await this.authorRepository.findOne(input.id);
    if (!authorExist) {
      throw new Error("Author not exist");
    }

    const updateAuthor = await this.authorRepository.save({
      id: input.id,
      fullName: input.fullName,
    });
    return await this.authorRepository.findOne(updateAuthor.id);
  }

  @Mutation(() => Boolean)
  async deleteOneAuthor(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Boolean> {
    await this.authorRepository.delete(input.id);
    return true;
  }
}
