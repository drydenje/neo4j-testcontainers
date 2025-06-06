// src/database/operations.ts
import { Session } from "neo4j-driver";
import { User, CreateUserInput } from "../types";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

const executeQuery =
  (session: Session) =>
  (query: string, parameters: any = {}) =>
    TE.tryCatch(
      () => session.run(query, parameters),
      (error) => new Error(`Database query failed: ${error}`)
    );

const mapToUser = (record: any): User => ({
  id: record.get("u").properties.id,
  name: record.get("u").properties.name,
  email: record.get("u").properties.email,
  createdAt: new Date(record.get("u").properties.createdAt),
});

export const createUser =
  (session: Session) =>
  (input: CreateUserInput): TE.TaskEither<Error, User> => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    return pipe(
      executeQuery(session)(
        "CREATE (u:User {id: $id, name: $name, email: $email, createdAt: $createdAt}) RETURN u",
        { id, ...input, createdAt }
      ),
      TE.map((result) => mapToUser(result.records[0]))
    );
  };

export const findUserById =
  (session: Session) =>
  (id: string): TE.TaskEither<Error, User | null> =>
    pipe(
      executeQuery(session)("MATCH (u:User {id: $id}) RETURN u", { id }),
      TE.map((result) =>
        result.records.length > 0 ? mapToUser(result.records[0]) : null
      )
    );

export const findAllUsers = (session: Session): TE.TaskEither<Error, User[]> =>
  pipe(
    executeQuery(session)("MATCH (u:User) RETURN u ORDER BY u.createdAt"),
    TE.map((result) => result.records.map(mapToUser))
  );

export const deleteUser =
  (session: Session) =>
  (id: string): TE.TaskEither<Error, boolean> =>
    pipe(
      executeQuery(session)(
        "MATCH (u:User {id: $id}) DELETE u RETURN count(u) as deleted",
        { id }
      ),
      TE.map((result) => result.records[0].get("deleted").toNumber() > 0)
    );
