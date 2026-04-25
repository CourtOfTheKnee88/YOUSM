import React from "react";
import { NavigationStack, AuthProvider } from "./navigation";

export default function App() {
  return (
    <AuthProvider>
      <NavigationStack />
    </AuthProvider>
  );
}
