// src/database/connection.ts
import neo4j, { Driver, Session } from "neo4j-driver";
import { DatabaseConfig } from "../types";

export const createDriver = (config: DatabaseConfig): Driver =>
  neo4j.driver(config.uri, neo4j.auth.basic(config.username, config.password));

export const createSession = (driver: Driver): Session => driver.session();

export const closeDriver = async (driver: Driver): Promise<void> => {
  await driver.close();
};

export const withSession = <T>(
  driver: Driver,
  operation: (session: Session) => Promise<T>
): Promise<T> => {
  const session = createSession(driver);
  return operation(session).finally(() => session.close());
};
