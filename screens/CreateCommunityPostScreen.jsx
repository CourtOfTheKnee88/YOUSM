import { useState } from "react";
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
import { SERVER_URL } from "../config";
import { COLORS, SPACING } from "../theme";
import { useAuth } from "../navigation";

export default function CreateCommunityPostScreen({ route, navigation }) {
  const { communityId, name, postType = "post" } = route.params;
  const { userId } = useAuth();

  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
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
      setSelectedVideo(null);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets[0]);
      setSelectedImage(null);
    }
  };

  const createPost = async () => {
    if (!content.trim() && !selectedImage && !selectedVideo) {
      Alert.alert("Error", "Please add content, an image, or a video.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("authorId", userId.toString());
      formData.append("communityId", communityId.toString());
      formData.append("postType", postType);

      if (content.trim()) {
        formData.append("content", content.trim());
      }

      const selectedMedia = selectedImage || selectedVideo;

      if (selectedMedia) {
        const uri = selectedMedia.uri;
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = selectedImage ? "image" : "video";
        const ext = match ? match[1] : type === "image" ? "jpg" : "mp4";

        formData.append("media", {
          uri,
          name: filename,
          type: `${type}/${ext}`,
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
          ? "Announcement posted!"
          : "Post created successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Create post error:", error);

      if (error.message.includes("banned")) {
        Alert.alert(
          "Posting Restricted",
          "You are temporarily banned from posting in this community."
        );
      } else {
        Alert.alert("Error", error.message || "Failed to create post.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View
          style={[
            styles.hero,
            isAnnouncement && styles.announcementHero,
          ]}
        >
          <View style={styles.badge}>
            <MaterialCommunityIcons
              name={isAnnouncement ? "bullhorn" : "account-group"}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.badgeText}>
              {isAnnouncement ? "Announcement" : "Community Post"}
            </Text>
          </View>

          <Text style={styles.title}>{name}</Text>

          <Text style={styles.subtitle}>
            {isAnnouncement
              ? "Share an important update with your community."
              : "Start a conversation inside this community."}
          </Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {isAnnouncement
              ? "Announcement Content"
              : "What's on your mind?"}
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder={
              isAnnouncement
                ? "Write your announcement..."
                : "Share your thoughts..."
            }
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            value={content}
            onChangeText={setContent}
            editable={!loading}
          />
        </View>

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.section}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Image Selected</Text>
              <Pressable onPress={() => setSelectedImage(null)}>
                <Ionicons name="close" size={22} color="#E74C3C" />
              </Pressable>
            </View>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.imagePreview}
            />
          </View>
        )}

        {/* Video Preview */}
        {selectedVideo && (
          <View style={styles.section}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Video Selected</Text>
              <Pressable onPress={() => setSelectedVideo(null)}>
                <Ionicons name="close" size={22} color="#E74C3C" />
              </Pressable>
            </View>
            <View style={styles.videoPreview}>
              <Ionicons name="play-circle" size={54} color={COLORS.primary} />
              <Text style={styles.videoText}>
                {selectedVideo.uri.split("/").pop()}
              </Text>
            </View>
          </View>
        )}

        {/* Media Buttons */}
        <View style={styles.section}>
          <Text style={styles.label}>Add Media</Text>

          <View style={styles.mediaRow}>
            <Pressable
              style={styles.mediaButton}
              onPress={pickImage}
              disabled={loading || !!selectedVideo}
            >
              <Ionicons name="image" size={22} color={COLORS.primary} />
              <Text style={styles.mediaText}>Photo</Text>
            </Pressable>

            <Pressable
              style={styles.mediaButton}
              onPress={pickVideo}
              disabled={loading || !!selectedImage}
            >
              <Ionicons name="videocam" size={22} color={COLORS.primary} />
              <Text style={styles.mediaText}>Video</Text>
            </Pressable>
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.submitButton, loading && { opacity: 0.5 }]}
          onPress={createPost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>
              {isAnnouncement ? "Post Announcement" : "Post"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.padding, paddingBottom: 50 },

  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  announcementHero: {
    backgroundColor: "#C46A00",
  },

  badge: {
    backgroundColor: "#FFFFFF30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#EAEAEA",
    fontSize: 14,
  },

  section: { marginBottom: 16 },
  label: {
    color: COLORS.primary,
    fontWeight: "800",
    marginBottom: 6,
  },

  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  previewTitle: {
    fontWeight: "700",
    color: COLORS.primary,
  },

  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },

  videoPreview: {
    height: 160,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  videoText: {
    marginTop: 6,
    color: COLORS.primary,
    fontWeight: "700",
  },

  mediaRow: {
    flexDirection: "row",
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaText: {
    marginTop: 4,
    fontWeight: "700",
    color: COLORS.primary,
  },

  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});