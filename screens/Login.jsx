import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useDatabase } from "../database";
import { useAuth } from "../navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotUsername, setForgotUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotPasswordUserId, setForgotPasswordUserId] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const db = useDatabase();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Password is required");
      return;
    }

    setLoading(true);
    try {
      if (!db) {
        Alert.alert("Error", "Database not initialized");
        return;
      }

      // Query database for user with matching username
      const user = await db.getFirstAsync(
        "SELECT id, password, role FROM users WHERE username = ?",
        [username],
      );

      if (!user) {
        Alert.alert("Error", "Username not found");
        setLoading(false);
        return;
      }

      // Check if password matches
      if (user.password !== password) {
        Alert.alert("Error", "Incorrect password");
        setLoading(false);
        return;
      }

      // Login successful
      Alert.alert("Success", "Login successful!");
      // Save user data to AsyncStorage
      await AsyncStorage.setItem("userToken", `token_${user.id}`);
      await AsyncStorage.setItem("userId", user.id.toString());
      await AsyncStorage.setItem("userRole", user.role);
      await AsyncStorage.setItem("username", username);
      // Call signIn from auth context
      await signIn(username, password);
    } catch (error) {
      Alert.alert("Error", error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    setForgotPasswordStep(1);
    setForgotUsername("");
    setSecurityQuestion("");
    setSecurityAnswer("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotPasswordUserId(null);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordStep(1);
    setForgotUsername("");
    setSecurityQuestion("");
    setSecurityAnswer("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotPasswordUserId(null);
  };

  const handleForgotPasswordStep1 = async () => {
    if (!forgotUsername.trim()) {
      Alert.alert("Error", "Please enter your username");
      return;
    }

    try {
      // Find user by username
      const user = await db.getFirstAsync(
        "SELECT id, securityQuestion, securityQA FROM users WHERE username = ?",
        [forgotUsername],
      );

      if (!user) {
        Alert.alert("Error", "Username not found");
        return;
      }

      if (!user.securityQuestion) {
        Alert.alert("Error", "No security question found for this user");
        return;
      }

      setSecurityQuestion(user.securityQuestion);
      setForgotPasswordUserId(user.id);
      setForgotPasswordStep(2);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to find user");
    }
  };

  const handleForgotPasswordStep2 = async () => {
    if (!securityAnswer.trim()) {
      Alert.alert("Error", "Please enter your security answer");
      return;
    }

    try {
      // Verify security answer
      const user = await db.getFirstAsync(
        "SELECT securityQA FROM users WHERE id = ?",
        [forgotPasswordUserId],
      );

      if (!user) {
        Alert.alert("Error", "User not found");
        return;
      }

      if (user.securityQA.toLowerCase() !== securityAnswer.toLowerCase()) {
        Alert.alert("Error", "Incorrect security answer");
        return;
      }

      setForgotPasswordStep(3);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to verify answer");
    }
  };

  const handleForgotPasswordStep3 = async () => {
    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      // Update password in database
      await db.runAsync("UPDATE users SET password = ? WHERE id = ?", [
        newPassword,
        forgotPasswordUserId,
      ]);

      Alert.alert("Success", "Password reset successfully! Please log in.");
      closeForgotPasswordModal();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to reset password. Please try again.",
      );
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
          style={{ width: 200, height: 200 }}
        />
      </View>
      <View style={styles.loginContainer}>
        <View style={styles.inputWrapper}>
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
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="#7b7b7b"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "LOGIN"}
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", marginTop: 40 }}>
          <Pressable onPress={handleSignUp}>
            <Text style={{ fontSize: 16 }}>Sign Up</Text>
          </Pressable>
          <Text style={{ fontSize: 16 }}> | </Text>
          <Pressable onPress={handleForgotPassword}>
            <Text style={{ fontSize: 16 }}>Forgot Password?</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showForgotPasswordModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeForgotPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reset Password</Text>

            {forgotPasswordStep === 1 && (
              <ScrollView style={styles.modalContent}>
                <Text style={styles.stepText}>Step 1: Enter Your Username</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Username"
                  placeholderTextColor="#7b7b7b"
                  value={forgotUsername}
                  onChangeText={setForgotUsername}
                />
                <Pressable
                  style={styles.modalButton}
                  onPress={handleForgotPasswordStep1}
                >
                  <Text style={styles.modalButtonText}>Next</Text>
                </Pressable>
              </ScrollView>
            )}

            {forgotPasswordStep === 2 && (
              <ScrollView style={styles.modalContent}>
                <Text style={styles.stepText}>
                  Step 2: Answer Your Security Question
                </Text>
                <View style={styles.questionBox}>
                  <Text style={styles.questionText}>{securityQuestion}</Text>
                </View>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Your answer"
                  placeholderTextColor="#7b7b7b"
                  value={securityAnswer}
                  onChangeText={setSecurityAnswer}
                />
                <Pressable
                  style={styles.modalButton}
                  onPress={handleForgotPasswordStep2}
                >
                  <Text style={styles.modalButtonText}>Verify Answer</Text>
                </Pressable>
              </ScrollView>
            )}

            {forgotPasswordStep === 3 && (
              <ScrollView style={styles.modalContent}>
                <Text style={styles.stepText}>
                  Step 3: Enter Your New Password
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="New Password"
                    secureTextEntry={!showNewPassword}
                    placeholderTextColor="#7b7b7b"
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <Pressable
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                  >
                    <Text>{showNewPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    secureTextEntry={!showConfirmNewPassword}
                    placeholderTextColor="#7b7b7b"
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                  />
                  <Pressable
                    onPress={() =>
                      setShowConfirmNewPassword(!showConfirmNewPassword)
                    }
                    style={styles.eyeIcon}
                  >
                    <Text>{showConfirmNewPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={styles.modalButton}
                  onPress={handleForgotPasswordStep3}
                >
                  <Text style={styles.modalButtonText}>Reset Password</Text>
                </Pressable>
              </ScrollView>
            )}

            <Pressable
              style={styles.closeButton}
              onPress={closeForgotPasswordModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#082348",
    marginBottom: 20,
    textAlign: "center",
  },
  stepText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  modalContent: {
    marginBottom: 15,
  },
  questionBox: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#082348",
  },
  questionText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  modalInput: {
    height: 50,
    backgroundColor: "#DADCDF",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#DADCDF",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 10,
  },
  modalButton: {
    backgroundColor: "#082348",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});
