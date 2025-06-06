// src/services/userService.ts
import {
  UserRepository,
  UserService,
  User,
  CreateUserData,
  UpdateUserData,
  UserStats,
  ValidationError,
  UserNotFoundError,
  UserAlreadyExistsError,
} from "../types";

type EmailValidator = (email: string) => boolean;
type UserDataValidator = (userData: CreateUserData) => string[];

export const createUserService = (
  userRepository: UserRepository
): UserService => {
  // Validation functions
  const validateEmail: EmailValidator = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUserData: UserDataValidator = (
    userData: CreateUserData
  ): string[] => {
    const errors: string[] = [];

    if (!userData.name || userData.name.trim().length === 0) {
      errors.push("Name is required");
    }

    if (!userData.email || !validateEmail(userData.email)) {
      errors.push("Valid email is required");
    }

    return errors;
  };

  // Service operations
  const createUser = async (userData: CreateUserData): Promise<User> => {
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
      throw new ValidationError(
        `Validation failed: ${validationErrors.join(", ")}`
      );
    }

    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(userData.email);
    }

    return userRepository.createUser({
      ...userData,
      name: userData.name.trim(),
    });
  };

  const getUserByEmail = async (email: string): Promise<User | null> => {
    if (!validateEmail(email)) {
      throw new ValidationError("Invalid email format");
    }
    return userRepository.findUserByEmail(email);
  };

  const getAllUsers = async (): Promise<User[]> => {
    return userRepository.findAllUsers();
  };

  const updateUser = async (
    email: string,
    updates: UpdateUserData
  ): Promise<User> => {
    if (!validateEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    const sanitizedUpdates: UpdateUserData = { ...updates };
    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (trimmedName.length === 0) {
        throw new ValidationError("Name cannot be empty");
      }
      sanitizedUpdates.name = trimmedName;
    }

    const updatedUser = await userRepository.updateUser(
      email,
      sanitizedUpdates
    );
    if (!updatedUser) {
      throw new UserNotFoundError(email);
    }

    return updatedUser;
  };

  const deleteUser = async (email: string): Promise<{ message: string }> => {
    if (!validateEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (!existingUser) {
      throw new UserNotFoundError(email);
    }

    await userRepository.deleteUser(email);
    return { message: "User deleted successfully" };
  };

  const getUserStats = async (): Promise<UserStats> => {
    const totalUsers = await userRepository.countUsers();
    const allUsers = await userRepository.findAllUsers();

    return {
      total: totalUsers,
      domains: countEmailDomains(allUsers),
    };
  };

  // Helper functions
  const countEmailDomains = (users: User[]): Record<string, number> => {
    return users.reduce((acc: Record<string, number>, user: User) => {
      const domain = user.email.split("@")[1];
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});
  };

  return {
    createUser,
    getUserByEmail,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserStats,
  };
};
