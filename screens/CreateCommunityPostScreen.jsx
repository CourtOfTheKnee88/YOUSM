import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SERVER_URL, CURRENT_USER_ID } from "../config";
import { COLORS, SPACING } from "../theme";

export default function CreateCommunityPostScreen({ route, navigation }) {
  const { communityId, postType = "post", name } = route.params;

  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAnnouncement = postType === "announcement";

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const submitPost = async () => {
    if (!content.trim() && !selectedImage) {
      Alert.alert(
        "Missing Content",
        isAnnouncement
          ? "Please write an announcement or add an image."
          : "Please write a post or add an image."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("authorId", CURRENT_USER_ID.toString());
      formData.append("communityId", communityId.toString());
      formData.append("postType", postType);

      if (content.trim()) {
        formData.append("content", content.trim());
      }

      if (selectedImage) {
        const localUri = selectedImage.uri;
        const filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : "jpg";

        formData.append("media", {
          uri: localUri,
          name: filename,
          type: `image/${ext}`,
        });
      }

      const res = await fetch(`${SERVER_URL}/posts`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post.");
      }

      Alert.alert(
        "Success",
        isAnnouncement
          ? "Announcement created!"
          : "Community post created!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Community post error:", error);
      Alert.alert("Error", error.message || "Could not create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.badge}>
            {isAnnouncement ? (
              <MaterialCommunityIcons
                name="bullhorn-outline"
                size={18}
                color={COLORS.primary}
              />
            ) : (
              <Ionicons
                name="create-outline"
                size={18}
                color={COLORS.primary}
              />
            )}

            <Text style={styles.badgeText}>
              {isAnnouncement ? "Announcement" : "Community Post"}
            </Text>
          </View>

          <Text style={styles.title}>
            {isAnnouncement ? "Create an announcement" : "Create a post"}
          </Text>

          <Text style={styles.subtitle}>
            Posting inside {name || "this community"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>
            {isAnnouncement
              ? "Announcement Message"
              : "What's happening in the community?"}
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder={
              isAnnouncement
                ? "Write an important community announcement..."
                : "Share something with your community..."
            }
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={6}
            value={content}
            onChangeText={setContent}
            editable={!loading}
          />
        </View>

        {selectedImage && (
          <View style={styles.card}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Image Selected</Text>

              <Pressable onPress={removeImage} disabled={loading}>
                <Ionicons name="close" size={24} color={COLORS.error} />
              </Pressable>
            </View>

            <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Add Media</Text>

          <Pressable
            style={styles.mediaButton}
            onPress={pickImage}
            disabled={loading}
          >
            <Ionicons name="image-outline" size={22} color={COLORS.primary} />
            <Text style={styles.mediaButtonText}>Choose Image</Text>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
          ]}
          onPress={submitPost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isAnnouncement ? "Publish Announcement" : "Publish Post"}
            </Text>
          )}
        </Pressable>

        {isAnnouncement && (
          <Text style={styles.note}>
            Only community admins can create announcements.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: SPACING.padding,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textAccent,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 10,
  },
  textInput: {
    minHeight: 140,
    textAlignVertical: "top",
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewTitle: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 12,
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 8,
  },
  mediaButton: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  mediaButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  note: {
    textAlign: "center",
    marginTop: 12,
    color: COLORS.textLight,
    fontSize: 13,
  },
});