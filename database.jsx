import { createContext, useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import * as SQLite from "expo-sqlite";

const DatabaseContext = createContext(null);

export const DatabaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const database = await SQLite.openDatabaseAsync("YOUSM.db");

      // Run your migrations/table creation
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, username TEXT UNIQUE, password TEXT, email TEXT UNIQUE, role TEXT);
      `);

      // Migration: Add security question columns if they don't exist
      try {
        // Get all columns in the users table
        const columns = await database.getAllAsync("PRAGMA table_info(users);");

        // Check if securityQuestion column exists
        const hasSecurityQuestion = columns.some(
          (col) => col.name === "securityQuestion",
        );

        if (!hasSecurityQuestion) {
          await database.execAsync(`
            ALTER TABLE users ADD COLUMN securityQuestion TEXT;
            ALTER TABLE users ADD COLUMN securityQA TEXT;
          `);
          console.log(
            "Migration: Added securityQuestion and securityQA columns",
          );
        } else {
          console.log("Migration: Security columns already exist");
        }
      } catch (error) {
        console.log("Migration check error:", error.message);
      }

      setDb(database);
      setIsReady(true);
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <View>
        <Text>Loading database...</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
