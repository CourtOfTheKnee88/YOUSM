import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#082348", "#1355AE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      />
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={{ width: 200, height: 200 }}
        />
      </View>
      <View style={styles.loginContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            placeholderTextColor="#7b7b7b"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="#7b7b7b"
          />
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </Pressable>

        <View style={{ flexDirection: "row", marginTop: 40 }}>
          <Pressable>
            <Text style={{ fontSize: 16 }}>Sign Up</Text>
          </Pressable>
          <Text style={{ fontSize: 16 }}> | </Text>
          <Pressable>
            <Text style={{ fontSize: 16 }}>Forgot Password?</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#082348",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  logoContainer: {
    height: "40%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  textInput: {
    height: 55,
    width: "80%",
    backgroundColor: "#DADCDF",
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#082348",
    height: 55,
    width: "80%",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 1,
  },
});
