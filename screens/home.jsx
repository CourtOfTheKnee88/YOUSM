import { StyleSheet, Text, View, Button } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen({ navigation }) {
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
        <Button
          title="Go to Message Screen"
          onPress={() => navigation.navigate("Message")}
        />
        {/* Copy the format of the button above to make a new button to get to the page you are working on */}
      </View>
      <StatusBar style="auto" />
    </View>
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
