// tests/unit/userService.unit.test.ts
import { createUserService } from '../../src/services/userService';
import { 
  UserRepository, 
  UserService, 
  User, 
  CreateUserData, 
  UpdateUserData,
  ValidationError,
  UserNotFoundError,
  UserAlreadyExistsError
} from '../../src/types';

// Mock type for UserRepository
type MockUserRepository = jest.Mocked<UserRepository>;

describe('UserService Unit Tests', () => {
  // Mock repository factory
  const createMockRepository = (overrides: Partial<MockUserRepository> = {}): MockUserRepository => ({
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    findAllUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    countUsers: jest.fn(),
    clearAll: jest.fn(),
    ...overrides
  });

  const createTestUser = (overrides: Partial<User> = {}): User => ({
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date().toISOString(),
    ...overrides
  });

  const createTestUserData = (overrides: Partial<CreateUserData> = {}): CreateUserData => ({
    name: 'John Doe',
    email: 'john@example.com',
    ...overrides
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const mockRepo = createMockRepository();
      const userData = createTestUserData();
      const expectedUser = createTestUser();
      
      mockRepo.findUserByEmail.mockResolvedValue(null);
      mockRepo.createUser.mockResolvedValue(expectedUser);
      
      const userService: UserService = createUserService(mockRepo);
      const result: User = await userService.createUser(userData);

      expect(mockRepo.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockRepo.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual(expectedUser);
    });

    it('should throw ValidationError for invalid email', async () => {
      const mockRepo = createMockRepository();
      const userService: UserService = createUserService(mockRepo);
      
      const invalidUserData = createTestUserData({ email: 'invalid-email' });

      await expect(userService.createUser(invalidUserData))
        .rejects.toThrow(ValidationError);
      
      expect(mockRepo.createUser).not.toHaveBeenCalled();
    });

    // it('should throw ValidationError for missing name', async () => {
    //   const mockRepo = createMockRepository();
    //   const userService: UserService = createUserService(mockRepo);
      
    //   const invalidUserData = createTestUserData({ name: '' });