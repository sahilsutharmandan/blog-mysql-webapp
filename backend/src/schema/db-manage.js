import mysql from "mysql2/promise";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  host: "localhost",
  user: "root",
  password: "Mandan@sahil1994",
  multipleStatements: true,
};

async function executeSqlFile(connection, filePath) {
  try {
    console.log(`Reading SQL file: ${filePath}`);
    const sql = await fs.readFile(filePath, "utf8");

    // Split the SQL file into individual statements
    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    // Execute each statement separately
    for (const statement of statements) {
      try {
        await connection.query(statement + ";");
        console.log("Executed SQL statement successfully");
      } catch (error) {
        console.error("Error executing statement:", statement);
        console.error("Error details:", error.message);
        throw error;
      }
    }

    console.log(`Successfully executed all statements in ${filePath}`);
  } catch (error) {
    console.error(`Error executing ${filePath}:`, error);
    throw error;
  }
}

async function initializeDatabase() {
  let connection;
  try {
    console.log("Initializing database...");

    // Create connection without database
    connection = await mysql.createConnection({
      ...config,
      database: "mysql", // Connect to default database first
    });

    // Read and execute init.sql
    const initSqlPath = path.join(__dirname, "init.sql");
    await executeSqlFile(connection, initSqlPath);

    // Execute table creation files
    const tableFiles = ["users.sql", "blogs.sql"];
    for (const file of tableFiles) {
      const tablePath = path.join(__dirname, "tables", file);
      await executeSqlFile(connection, tablePath);
    }

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function seedDatabase() {
  let connection;
  try {
    console.log("Seeding database...");

    // Create connection with database
    connection = await mysql.createConnection({
      ...config,
      database: "test_db",
    });

    // Read and execute seed files
    const seedFiles = ["users.sql", "blogs.sql"];
    for (const file of seedFiles) {
      const seedPath = path.join(__dirname, "seeds", file);
      await executeSqlFile(connection, seedPath);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Handle command line arguments
const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case "init":
        await initializeDatabase();
        break;
      case "seed":
        await seedDatabase();
        break;
      case "reset":
        await initializeDatabase();
        await seedDatabase();
        break;
      default:
        console.error("Invalid command. Use: init, seed, or reset");
        process.exit(1);
    }
  } catch (error) {
    console.error("Operation failed:", error);
    process.exit(1);
  }
}

// Add error handling for unhandled rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});

main();
