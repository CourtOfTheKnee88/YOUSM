import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  Alert,
} from "react-native";
import { COLORS, SPACING } from "../theme";
import { SERVER_URL } from "../config";
import { useAuth } from "../navigation";

export default function CreateCommunityScreen({ navigation }) {
  const { userId } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Club");
  const [category, setCategory] = useState("Social");

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to create a community.");
      return;
    }

    if (!name.trim() || !description.trim() || !type.trim() || !category.trim()) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/communities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: type.trim(),
          category: category.trim(),
          description: description.trim(),
          creatorId: parseInt(userId, 10),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Your community has been created!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Error", data.error || "Failed to create community.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network request failed.");
    }
  };

  const formIncomplete =
    !name.trim() || !description.trim() || !type.trim() || !category.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.label, { marginTop: 0 }]}>Community Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Data Science Club"
          placeholderTextColor={COLORS.textLight}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Tell us about your community..."
          placeholderTextColor={COLORS.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Club, Course, Organization"
          placeholderTextColor={COLORS.textLight}
          value={type}
          onChangeText={setType}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Academic, Social, Leadership"
          placeholderTextColor={COLORS.textLight}
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.hint}>Groups are subject to campus guidelines.</Text>

        <Pressable
          style={[styles.button, formIncomplete && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={formIncomplete}
        >
          <Text style={styles.buttonText}>Submit Request</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.padding },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});