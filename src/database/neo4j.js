// src/database/neo4j.js
const neo4j = require("neo4j-driver");

class Neo4jConnection {
  constructor(uri, user, password) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async getSession() {
    return this.driver.session();
  }

  async close() {
    await this.driver.close();
  }

  async verifyConnectivity() {
    await this.driver.verifyConnectivity();
  }
}

module.exports = Neo4jConnection;
