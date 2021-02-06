import * as bycrypt from "bcryptjs";
import { User } from "../entity/User";
import * as yup from "yup";
import { ResolverMap } from "../types/graphql-utils";
import { formatYupError } from "../utils/formatYupError";
import { v4 } from "uuid";

const schema = yup.object().shape({
  firstName: yup.string().min(1).max(255),
  lastName: yup.string().min(1).max(255),
  email: yup.string().min(3).max(255).email(),
  password: yup.string().min(3).max(255),
});

export const UserResolver: ResolverMap = {
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        formatYupError(err);
      }

      const { firstName, lastName, email, password } = args;

      // Check if user already exists

      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"],
      });

      if (userAlreadyExists) {
        return [
          {
            field: "email",
            message: "already exists",
          },
        ];
      }

      const hashedPass = await bycrypt.hash(password, 10);
      const user = User.create({
        id: v4(),
        firstName,
        lastName,
        email,
        password: hashedPass,
      });

      await user.save(); // Adds user to database
      return null; // Returns no errors
    },
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session }
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return [
          {
            field: "email",
            message: "Invalid email or password.", // Although user does not exist, we do not tell the person this as it makes it easier to hack.
          },
        ];
      }

      const valid = await bycrypt.compare(password, user.password);

      if (!valid) {
        return [
          {
            field: "email",
            message: "Invalid email or password.",
          },
        ];
      }

      // Set user cookie
      session.userId = user.id;

      return null; // Returns no errors
    },
  },
};
