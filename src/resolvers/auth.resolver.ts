import { IsEmail, Length } from "class-validator";
import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  ObjectType,
} from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { hash, compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { environment } from "../config/environment";

@InputType()
class UserInput {
  @Field()
  @Length(3, 64)
  fullName!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(8, 254)
  password!: string;
}

@InputType()
class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  password!: string;
}

@ObjectType()
class LoginResponse {
  @Field()
  userId!: number;

  @Field()
  jwt!: string;
}

@Resolver()
export class AuthResolver {
  userRepository: Repository<User>;

  constructor() {
    this.userRepository = getRepository(User);
  }

  @Mutation(() => User)
  async register(
    @Arg("input", () => UserInput) input: UserInput
  ): Promise<User | undefined> {
    try {
      const { fullName, email, password } = input;
      const userExsists = await this.userRepository.findOne({
        where: { email },
      });

      if (userExsists) {
        const error = new Error();
        error.message = "Email is not available.";
        throw error;
      }

      const hashedPassword = await hash(password, 10);

      const newUser = await this.userRepository.insert({
        fullName,
        email,
        password: hashedPassword,
      });

      return this.userRepository.findOne(newUser.identifiers[0].id);
    } catch (e) {
      throw e;
    }
  }

  @Mutation(() => LoginResponse)
  async login(@Arg("input", () => LoginInput) input: LoginInput) {
    const { email, password } = input;

    const userFound = await this.userRepository.findOne({ where: { email } });

    try {
      if (!userFound) {
        const error = new Error();
        error.message = "Invalid credentials";
        throw error;
      }

      const isValidPassword: Boolean = compareSync(
        password,
        userFound.password
      );

      if (!isValidPassword) {
        const error = new Error();
        error.message = "Invalid credentials";
        throw error;
      }

      const jwt: string = sign({ id: userFound.id }, environment.JWT_SECRET);

      return {
        userId: userFound.id,
        jwt: jwt,
      };
    } catch (e) {
      throw e;
    }
  }
}