import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";

export default function CreateCommunityScreen() {
  const [communityName, setCommunityName] = useState("");
  const [communityType, setCommunityType] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (
      !communityName.trim() ||
      !communityType.trim() ||
      !category.trim() ||
      !description.trim()
    ) {
      Alert.alert("Missing Information", "Please fill out all fields.");
      return;
    }

    Alert.alert(
      "Community Created",
      `${communityName} has been created locally for demo purposes.`
    );

    setCommunityName("");
    setCommunityType("");
    setCategory("");
    setDescription("");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>Create Community</Text>
        <Text style={styles.title}>Start a new campus space</Text>
        <Text style={styles.subtitle}>
          Build a new club, course group, or organization community for YOUSM.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Community Name</Text>
        <TextInput
          style={styles.input}
          value={communityName}
          onChangeText={setCommunityName}
          placeholder="Ex. Robotics Club"
          placeholderTextColor="#6B7280"
        />

        <Text style={styles.label}>Type</Text>
        <TextInput
          style={styles.input}
          value={communityType}
          onChangeText={setCommunityType}
          placeholder="Ex. Club, Course, Organization"
          placeholderTextColor="#6B7280"
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Ex. Academic, Social, Administrative"
          placeholderTextColor="#6B7280"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the purpose of this community"
          placeholderTextColor="#6B7280"
          multiline
        />
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Live Preview</Text>

        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>
            {communityType || "Type"}
          </Text>
        </View>

        <Text style={styles.previewName}>
          {communityName || "Community Name"}
        </Text>
        <Text style={styles.previewCategory}>
          {category || "Category"}
        </Text>
        <Text style={styles.previewDescription}>
          {description || "Your community description will appear here."}
        </Text>
      </View>

      <Pressable style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Create Community</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  hero: {
    backgroundColor: "#042752",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5A841",
    color: "#042752",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#D7E4FF",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 16,
  },
  label: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F5A841",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#042752",
    fontSize: 15,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 16,
  },
  previewTitle: {
    color: "#042752",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  previewBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5A841",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  previewBadgeText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 12,
  },
  previewName: {
    color: "#042752",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  previewCategory: {
    color: "#F5A841",
    fontWeight: "700",
    marginBottom: 10,
  },
  previewDescription: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: "#042752",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});