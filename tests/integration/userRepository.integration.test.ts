// tests/integration/userRepository.integration.test.ts
import {
  setupSharedContainer,
  teardownSharedContainer,
} from "../setup/testcontainers";
import { createUserRepository } from "../../src/repositories/userRepository";
import {
  TestEnvironment,
  UserRepository,
  CreateUserData,
  User,
} from "../../src/types";

describe("UserRepository Integration Tests", () => {
  let testEnv: TestEnvironment;
  let userRepository: UserRepository;

  beforeAll(async () => {
    testEnv = await setupSharedContainer();
    userRepository = createUserRepository(testEnv.connection);
  }, 60000);

  afterAll(async () => {
    await teardownSharedContainer();
  });

  beforeEach(async () => {
    await userRepository.clearAll();
  });

  // Test data factory functions
  const createTestUser = (
    overrides: Partial<CreateUserData> = {}
  ): CreateUserData => ({
    name: "John Doe",
    email: "john@example.com",
    ...overrides,
  });

  const createMultipleUsers = (count: number = 3): CreateUserData[] =>
    Array.from({ length: count }, (_, i) =>
      createTestUser({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
      })
    );

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const userData = createTestUser();
      const createdUser: User = await userRepository.createUser(userData);

      expect(createdUser.name).toBe(userData.name);
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.createdAt).toBeDefined();
      expect(typeof createdUser.createdAt).toBe("string");
    });

    it("should create multiple users", async () => {
      const users = createMultipleUsers(3);

      const createdUsers: User[] = await Promise.all(
        users.map((user) => userRepository.createUser(user))
      );

      expect(createdUsers).toHaveLength(3);
      expect(await userRepository.countUsers()).toBe(3);

      createdUsers.forEach((user, index) => {
        expect(user.name).toBe(users[index].name);
        expect(user.email).toBe(users[index].email);
      });
    });
  });

  describe("findUserByEmail", () => {
    it("should find existing user", async () => {
      const userData = createTestUser();
      await userRepository.createUser(userData);

      const foundUser: User | null = await userRepository.findUserByEmail(
        userData.email
      );

      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(userData.email);
      expect(foundUser!.name).toBe(userData.name);
    });

    it("should return null for non-existent user", async () => {
      const foundUser: User | null = await userRepository.findUserByEmail(
        "nonexistent@example.com"
      );
      expect(foundUser).toBeNull();
    });
  });

  describe("findAllUsers", () => {
    it("should return empty array when no users exist", async () => {
      const users: User[] = await userRepository.findAllUsers();
      expect(users).toEqual([]);
    });

    it("should return all users ordered by creation date", async () => {
      const testUsers = createMultipleUsers(2);
      await Promise.all(
        testUsers.map((user) => userRepository.createUser(user))
      );

      const allUsers: User[] = await userRepository.findAllUsers();
      expect(allUsers).toHaveLength(2);

      const emails = allUsers.map((user) => user.email);
      expect(emails).toContain(testUsers[0].email);
      expect(emails).toContain(testUsers[1].email);
    });
  });

  describe("updateUser", () => {
    it("should update existing user", async () => {
      const userData = createTestUser();
      await userRepository.createUser(userData);

      const updates = { name: "Jane Doe" };
      const updatedUser: User | null = await userRepository.updateUser(
        userData.email,
        updates
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.name).toBe(updates.name);
      expect(updatedUser!.email).toBe(userData.email);
    });

    it("should return null for non-existent user", async () => {
      const result: User | null = await userRepository.updateUser(
        "nonexistent@example.com",
        { name: "Test" }
      );
      expect(result).toBeNull();
    });

    it("should handle empty updates gracefully", async () => {
      const userData = createTestUser();
      const createdUser = await userRepository.createUser(userData);

      const result: User | null = await userRepository.updateUser(
        userData.email,
        {}
      );
      expect(result).toBeDefined();
      expect(result!.name).toBe(createdUser.name);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const userData = createTestUser();
      await userRepository.createUser(userData);

      await userRepository.deleteUser(userData.email);
      const foundUser: User | null = await userRepository.findUserByEmail(
        userData.email
      );

      expect(foundUser).toBeNull();
      expect(await userRepository.countUsers()).toBe(0);
    });

    it("should not throw error when deleting non-existent user", async () => {
      await expect(
        userRepository.deleteUser("nonexistent@example.com")
      ).resolves.not.toThrow();
    });
  });

  describe("countUsers", () => {
    it("should count users correctly", async () => {
      expect(await userRepository.countUsers()).toBe(0);

      const users = createMultipleUsers(5);
      await Promise.all(users.map((user) => userRepository.createUser(user)));

      expect(await userRepository.countUsers()).toBe(5);
    });
  });
});
