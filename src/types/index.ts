// src/types/index.ts
import { Driver, Session, Result } from "neo4j-driver";
import { StartedTestContainer } from "testcontainers";

// User domain types
export interface User {
  readonly name: string;
  readonly email: string;
  readonly createdAt: string;
}

export interface CreateUserData {
  readonly name: string;
  readonly email: string;
}

export interface UpdateUserData {
  readonly name?: string;
}

export interface UserStats {
  readonly total: number;
  readonly domains: Record<string, number>;
}

// Database connection types
export interface Neo4jConnection {
  readonly getSession: () => Session;
  readonly close: () => Promise<void>;
  readonly verifyConnectivity: () => Promise<void>;
  readonly driver: Driver;
}

export type QueryExecutor = (session: Session) => Promise<Result>;
export type SessionOperation<T> = (session: Session) => Promise<T>;
export type WithSessionFn = <T>(operation: SessionOperation<T>) => Promise<T>;

// Repository interface
export interface UserRepository {
  readonly createUser: (userData: CreateUserData) => Promise<User>;
  readonly findUserByEmail: (email: string) => Promise<User | null>;
  readonly findAllUsers: () => Promise<User[]>;
  readonly updateUser: (
    email: string,
    updates: UpdateUserData
  ) => Promise<User | null>;
  readonly deleteUser: (email: string) => Promise<void>;
  readonly clearAll: () => Promise<void>;
  readonly countUsers: () => Promise<number>;
}

// Service interface
export interface UserService {
  readonly createUser: (userData: CreateUserData) => Promise<User>;
  readonly getUserByEmail: (email: string) => Promise<User | null>;
  readonly getAllUsers: () => Promise<User[]>;
  readonly updateUser: (
    email: string,
    updates: UpdateUserData
  ) => Promise<User>;
  readonly deleteUser: (email: string) => Promise<{ message: string }>;
  readonly getUserStats: () => Promise<UserStats>;
}

// Test container types
export interface TestEnvironment {
  readonly container: StartedTestContainer;
  readonly connection: Neo4jConnection;
}

export type TestContainerFunction = (testEnv: TestEnvironment) => Promise<void>;

// Validation types
export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
}

// Service error types
export class UserServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "UserServiceError";
  }
}

export class ValidationError extends UserServiceError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class UserNotFoundError extends UserServiceError {
  constructor(email: string) {
    super(`User with email ${email} not found`, "USER_NOT_FOUND");
  }
}

export class UserAlreadyExistsError extends UserServiceError {
  constructor(email: string) {
    super(`User with email ${email} already exists`, "USER_ALREADY_EXISTS");
  }
}
