// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface DatabaseConfig {
  uri: string;
  username: string;
  password: string;
}

export type DbResult<T> = Promise<T>;
export type DbOperation<T> = (config: DatabaseConfig) => DbResult<T>;
