// src/services/userService.ts
import { Driver } from "neo4j-driver";
import { User, CreateUserInput } from "../types";
import { withSession } from "../database/connection";
import {
  createUser,
  findUserById,
  findAllUsers,
  deleteUser,
} from "../database/operations";
import * as TE from "fp-ts/TaskEither";

export const userService = (driver: Driver) => ({
  create: (input: CreateUserInput): TE.TaskEither<Error, User> =>
    TE.fromTask(() =>
      withSession(driver, (session) => createUser(session)(input)())
    ),

  findById: (id: string): TE.TaskEither<Error, User | null> =>
    TE.fromTask(() =>
      withSession(driver, (session) => findUserById(session)(id)())
    ),

  findAll: (): TE.TaskEither<Error, User[]> =>
    TE.fromTask(() =>
      withSession(driver, (session) => findAllUsers(session)())
    ),

  delete: (id: string): TE.TaskEither<Error, boolean> =>
    TE.fromTask(() =>
      withSession(driver, (session) => deleteUser(session)(id)())
    ),
});
