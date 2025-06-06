// src/repositories/userRepository.ts
import { withSession, runQuery } from "../database/neo4j";
import {
  Neo4jConnection,
  UserRepository,
  User,
  CreateUserData,
  UpdateUserData,
} from "../types";

export const createUserRepository = (
  connection: Neo4jConnection
): UserRepository => {
  const executeQuery = withSession(connection);

  const createUser = async (userData: CreateUserData): Promise<User> => {
    return executeQuery(async (session) => {
      const query = runQuery(session);
      const result = await query(
        "CREATE (u:User {name: $name, email: $email, createdAt: datetime()}) RETURN u",
        userData
      );
      const userNode = result.records[0].get("u");
      return {
        name: userNode.properties.name,
        email: userNode.properties.email,
        createdAt: userNode.properties.createdAt.toString(),
      };
    });
  };

  const findUserByEmail = async (email: string): Promise<User | null> => {
    return executeQuery(async (session) => {
      const query = runQuery(session);
      const result = await query("MATCH (u:User {email: $email}) RETURN u", {
        email,
      });

      if (result.records.length === 0) {
        return null;
      }

      const userNode = result.records[0].get("u");
      return {
        name: userNode.properties.name,
        email: userNode.properties.email,
        createdAt: userNode.properties.createdAt.toString(),
      };
    });
  };

  const findAllUsers = async (): Promise<User[]> => {
    return executeQuery(async (session) => {
      const query = runQuery(session);
      const result = await query(
        "MATCH (u:User) RETURN u ORDER BY u.createdAt"
      );

      return result.records.map((record) => {
        const userNode = record.get("u");
        return {
          name: userNode.properties.name,
          email: userNode.properties.email,
          createdAt: userNode.properties.createdAt.toString(),
        };
      });
    });
  };

  const updateUser = async (
    email: string,
    updates: UpdateUserData
  ): Promise<User | null> => {
    return executeQuery(async (session) => {
      const query = runQuery(session);
      const setClause = Object.keys(updates)
        .map((key) => `u.${key} = $${key}`)
        .join(", ");

      if (setClause.length === 0) {
        const existingUser = await findUserByEmail(email);
        return existingUser;
      }

      const result = await query(
        `MATCH (u:User {email: $email}) SET ${setClause} RETURN u`,
        { email, ...updates }
      );

      if (result.records.length === 0) {
        return null;
      }

      const userNode = result.records[0].get("u");
      return {
        name: userNode.properties.name,
        email: userNode.properties.email,
        createdAt: userNode.properties.createdAt.toString(),
      };
    });
  };

  const deleteUser = async (email: string): Promise<void> => {
    return executeQuery(async (session) => {
      const query = runQuery(session);
      await query("MATCH (u:User {email: $email}) DELETE u", { email });
    });
  };

  const clearAll = async (): Promise<void> => {
    return executeQuery(async (session) => {
      const query = runQuery(session);
      await query("MATCH (n) DETACH DELETE n");
    });
  };

  const countUsers = async (): Promise<number> => {
    return executeQuery(async (session) => {
      const query = runQuery(session);
      const result = await query("MATCH (u:User) RETURN count(u) as count");
      return result.records[0].get("count").toNumber();
    });
  };

  return {
    createUser,
    findUserByEmail,
    findAllUsers,
    updateUser,
    deleteUser,
    clearAll,
    countUsers,
  };
};
