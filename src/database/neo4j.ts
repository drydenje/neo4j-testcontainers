// src/database/neo4j.ts
import neo4j, { Driver, Session, auth } from "neo4j-driver";
import { Neo4jConnection, SessionOperation, WithSessionFn } from "../types";

export const createConnection = (
  uri: string,
  user: string,
  password: string
): Neo4jConnection => {
  const driver: Driver = neo4j.driver(uri, auth.basic(user, password));

  return {
    getSession: (): Session => driver.session(),
    close: (): Promise<void> => driver.close(),
    verifyConnectivity: (): Promise<void> => driver.verifyConnectivity(),
    driver,
  };
};

export const withSession = (connection: Neo4jConnection): WithSessionFn => {
  return async <T>(operation: SessionOperation<T>): Promise<T> => {
    const session = connection.getSession();
    try {
      return await operation(session);
    } finally {
      await session.close();
    }
  };
};

export const runQuery = (session: Session) => {
  return (query: string, params: Record<string, any> = {}) =>
    session.run(query, params);
};
