import LoginScreen from "./screens/Login";
import MessageScreen from "./screens/MessageScreen";
import SignUpScreen from "./screens/SignUp";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export const NavigationStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        {/* Copy the format of the stack.screen item above to add a new screen */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
