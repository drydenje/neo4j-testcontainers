// tests/setup/testcontainers.ts
import { GenericContainer, Wait, StartedTestContainer } from "testcontainers";
import { createConnection } from "@/database/neo4j";
import {
  Neo4jConnection,
  TestEnvironment,
  TestContainerFunction,
} from "@/types";

export const createTestContainer = async (): Promise<TestEnvironment> => {
  const container: StartedTestContainer = await new GenericContainer(
    "neo4j:5.15"
  )
    .withEnvironment({
      NEO4J_AUTH: "neo4j/testpassword",
      NEO4J_PLUGINS: '["apoc"]',
    })
    .withExposedPorts(7687, 7474)
    .withWaitStrategy(Wait.forLogMessage("Remote interface available"))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(7687);
  const uri = `bolt://${host}:${port}`;

  const connection = createConnection(uri, "neo4j", "testpassword");

  // Wait for Neo4j to be ready
  await waitForConnection(connection);

  return { container, connection };
};

export const waitForConnection = async (
  connection: Neo4jConnection,
  maxRetries: number = 30,
  delay: number = 1000
): Promise<void> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await connection.verifyConnectivity();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const stopTestContainer = async ({
  container,
  connection,
}: TestEnvironment): Promise<void> => {
  if (connection) {
    await connection.close();
  }
  if (container) {
    await container.stop();
  }
};

// Higher-order function for test setup
export const withTestContainer = (testFn: TestContainerFunction) => {
  return async (): Promise<void> => {
    const testEnv = await createTestContainer();
    try {
      await testFn(testEnv);
    } finally {
      await stopTestContainer(testEnv);
    }
  };
};

// Shared test container for test suite
let sharedTestEnv: TestEnvironment | null = null;

export const setupSharedContainer = async (): Promise<TestEnvironment> => {
  if (!sharedTestEnv) {
    sharedTestEnv = await createTestContainer();
  }
  return sharedTestEnv;
};

export const teardownSharedContainer = async (): Promise<void> => {
  if (sharedTestEnv) {
    await stopTestContainer(sharedTestEnv);
    sharedTestEnv = null;
  }
};
