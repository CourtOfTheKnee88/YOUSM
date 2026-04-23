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

export default function CreateCommunityAnnouncementScreen({
  route,
  navigation,
  user,
  communityAnnouncements,
  setCommunityAnnouncements,
}) {
  const { community } = route.params;

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handlePostAnnouncement = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Missing Information", "Please fill out all fields.");
      return;
    }

    const newAnnouncement = {
      id: `${community.id}-announcement-${Date.now()}`,
      author: user.name,
      time: "Just now",
      content: message.trim(),
      likes: 0,
      comments: 0,
      type: "Community Announcement",
      title: title.trim(),
    };

    setCommunityAnnouncements((prev) => {
      const existing = prev[community.id] || [];
      return {
        ...prev,
        [community.id]: [newAnnouncement, ...existing],
      };
    });

    Alert.alert(
      "Announcement Posted",
      `Your announcement was posted in ${community.name}.`,
      [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("CommunityFeed", { community }),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>Community Announcement</Text>
        <Text style={styles.title}>Post to {community.name}</Text>
        <Text style={styles.subtitle}>
          Share an update, notice, or important message with this community.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Announcement Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ex. Meeting moved to Thursday"
          placeholderTextColor="#6B7280"
        />

        <Text style={styles.label}>Announcement Message</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={message}
          onChangeText={setMessage}
          placeholder="Write your announcement here"
          placeholderTextColor="#6B7280"
          multiline
        />
      </View>

      <Pressable style={styles.postButton} onPress={handlePostAnnouncement}>
        <Text style={styles.postButtonText}>Post Announcement</Text>
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
    borderWidth: 2,
    borderColor: "#F5A841",
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
    minHeight: 120,
    textAlignVertical: "top",
  },
  postButton: {
    backgroundColor: "#042752",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});