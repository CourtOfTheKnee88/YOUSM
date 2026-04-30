import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useAuth } from "../navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "../config";

const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What is your favorite movie?",
  "What street did you grow up on?",
];

const ROLE_OPTIONS = ["Student", "Faculty"];

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(
    SECURITY_QUESTIONS[0],
  );
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return false;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Password is required");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (!securityAnswer.trim()) {
      Alert.alert("Error", "Security answer is required");
      return false;
    }

    return true;
  };

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Registering user on backend...");

      const backendResponse = await fetch(`${SERVER_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role: selectedRole.toLowerCase(),
          securityQuestion,
          securityAnswer,
        }),
      });

      const rawText = await backendResponse.text();
      console.log("SIGNUP RAW RESPONSE:", rawText);

      let backendUser;

      try {
        backendUser = JSON.parse(rawText);
      } catch (parseError) {
        console.error("Backend did not return JSON:", rawText);

        Alert.alert(
          "Server Error",
          rawText || "The server returned an invalid response.",
        );

        return;
      }

      if (!backendResponse.ok) {
        Alert.alert(
          "Error",
          backendUser.error || "Failed to create account on server",
        );

        return;
      }

      if (!backendUser.user || !backendUser.user.id) {
        console.error("Unexpected signup response shape:", backendUser);

        Alert.alert(
          "Server Error",
          "Account may have been created, but the server response was missing the user ID.",
        );

        return;
      }

      const backendUserId = backendUser.user.id;
      console.log("User created on backend with ID:", backendUserId);

      await AsyncStorage.setItem("userToken", `token_${backendUserId}`);
      await AsyncStorage.setItem("userId", backendUserId.toString());
      await AsyncStorage.setItem("userRole", selectedRole.toLowerCase());
      await AsyncStorage.setItem("username", username);

      Alert.alert("Success", "Account created successfully!");

      await signUp(username, email);
    } catch (error) {
      console.error("Sign up error:", error);

      Alert.alert(
        "Error",
        error.message || "Sign up failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
          style={{ width: 60, height: 60 }}
        />
      </View>

      <ScrollView
        style={styles.loginContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Create Your Account</Text>

          <TextInput
            style={styles.textInput}
            placeholder="Username"
            placeholderTextColor="#7b7b7b"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />

          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="#7b7b7b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.securityLabel}>Select Your Role</Text>

          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowRoleDropdown(true)}
            disabled={loading}
          >
            <Text style={styles.pickerText}>{selectedRole}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          <Modal
            transparent
            visible={showRoleDropdown}
            animationType="fade"
            onRequestClose={() => setShowRoleDropdown(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowRoleDropdown(false)}
            >
              <View style={styles.dropdownMenu}>
                <FlatList
                  data={ROLE_OPTIONS}
                  keyExtractor={(item) => item}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedRole(item);
                        setShowRoleDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              placeholderTextColor="#7b7b7b"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={styles.eyeIcon}
            >
              <Text>{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter Password"
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#7b7b7b"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />

            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              style={styles.eyeIcon}
            >
              <Text>{showConfirmPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>

          <Text style={styles.securityLabel}>Select Security Question</Text>

          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowDropdown(true)}
            disabled={loading}
          >
            <Text style={styles.pickerText}>{securityQuestion}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          <Modal
            transparent
            visible={showDropdown}
            animationType="fade"
            onRequestClose={() => setShowDropdown(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowDropdown(false)}
            >
              <View style={styles.dropdownMenu}>
                <FlatList
                  data={SECURITY_QUESTIONS}
                  keyExtractor={(item) => item}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSecurityQuestion(item);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <TextInput
            style={styles.textInput}
            placeholder="Your answer"
            placeholderTextColor="#7b7b7b"
            value={securityAnswer}
            onChangeText={setSecurityAnswer}
            editable={!loading}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.backButton}
            onPress={handleBack}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    height: "15%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    flexDirection: "row",
  },
  loginContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  inputWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#082348",
  },
  securityLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: "10%",
    fontWeight: "600",
  },
  pickerContainer: {
    height: 55,
    width: "80%",
    backgroundColor: "#DADCDF",
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
  },
  picker: {
    width: "100%",
    height: "100%",
    color: "#000",
  },
  pickerText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#7b7b7b",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "80%",
    maxHeight: 300,
    paddingVertical: 10,
  },
  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginBottom: 15,
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    height: 55,
    backgroundColor: "#DADCDF",
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 10,
  },
  textInput: {
    height: 55,
    width: "80%",
    backgroundColor: "#DADCDF",
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#082348",
    height: 55,
    width: "80%",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 1,
  },
  backButton: {
    height: 55,
    width: "80%",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    borderWidth: 2,
    borderColor: "#082348",
  },
  backButtonText: {
    color: "#082348",
    fontWeight: "600",
    fontSize: 16,
  },
});