import React from "react";
import { DatabaseProvider } from "./database";
import { NavigationStack, AuthProvider } from "./navigation";

export default function App() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <NavigationStack />
      </AuthProvider>
    </DatabaseProvider>
  );
}
