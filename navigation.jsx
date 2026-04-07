import TempScreen from "./screens/temp";
import LoginScreen from "./screens/Login";
import MessageScreen from "./screens/MessageScreen";
import HomeScreen from "./screens/home";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export const NavigationStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "YOUSM Home" }}
        />
        <Stack.Screen
          name="Temp"
          component={TempScreen}
          options={{ title: "Temp Screen" }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Message"
          component={MessageScreen}
          options={{ headerShown: false }}
        />
        {/* Copy the format of the stack.screen item above to add a new screen */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
