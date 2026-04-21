import { DatabaseProvider } from "./database";
import { NavigationStack } from "./navigation";

export default function App() {
  return (
    <DatabaseProvider>
      <NavigationStack />
    </DatabaseProvider>
  );
}
