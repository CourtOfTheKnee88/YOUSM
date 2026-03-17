import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TempScreen from "./screens/temp";
import LoginScreen from "./screens/Login";
// You do need to import the screen you are working on to add it to the stack navigator

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to YOUSM!</Text>
      <Text style={styles.subtitle}>
        Open up App.js to start working on your app!
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Temp Screen"
          onPress={() => navigation.navigate("Temp")}
        />
        <Button
          title="Go to Login Screen"
          onPress={() => navigation.navigate("Login")}
        />
        {/* Copy the format of the button above to make a new button to get to the page you are working on */}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
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
        {/* Copy the format of the stack.screen item above to add a new screen */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  buttonContainer: {
    marginTop: 20,
    width: "80%",
  },
});
