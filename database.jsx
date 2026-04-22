import { createContext, useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import * as SQLite from "expo-sqlite";

const DatabaseContext = createContext(null);

export const DatabaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
<<<<<<< HEAD
      try {
        const database = await SQLite.openDatabaseAsync("YOUSM.db");

        // Run your migrations/table creation
        await database.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, username TEXT, password TEXT, email TEXT, role TEXT);
        `);

        setDb(database);
        setIsReady(true);
      } catch (error) {
        console.error("Database initialization error:", error);
        setIsReady(true); // Still mark as ready even if there's an error so app doesn't hang
      }
=======
      const database = await SQLite.openDatabaseAsync("YOUSM.db");

      // Run your migrations/table creation
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, username TEXT, password TEXT, email TEXT, role TEXT);
      `);

      setDb(database);
      setIsReady(true);
>>>>>>> Gage---Messaging
    }
    init();
  }, []);

  if (!isReady) {
    return (
<<<<<<< HEAD
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
=======
      <View>
>>>>>>> Gage---Messaging
        <Text>Loading database...</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
