import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SERVER_URL, CURRENT_USER_ID } from "../config";
import { COLORS, SPACING } from "../theme";

export default function CommunityFeedScreen({ route, navigation }) {
  const { communityId, name, isAdmin } = route.params;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async () => {
    try {
      const res = await fetch(
        `${SERVER_URL}/communities/${communityId}/feed?userId=${CURRENT_USER_ID}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load feed");
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error("Feed error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const goToCreatePost = (type = "post") => {
    navigation.navigate("CreateCommunityPost", {
      communityId,
      postType: type,
      name,
    });
  };

  const deletePost = async (postId) => {
    Alert.alert("Delete Post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${SERVER_URL}/posts/${postId}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adminUserId: CURRENT_USER_ID }),
            });

            fetchFeed();
          } catch (error) {
            Alert.alert("Error", "Failed to delete post");
          }
        },
      },
    ]);
  };

  const renderPost = ({ item }) => {
    const isAnnouncement = item.postType === "announcement";

    return (
      <View
        style={[
          styles.postContainer,
          isAnnouncement && styles.announcementContainer,
        ]}
      >
        {/* Header */}
        <View style={styles.postHeader}>
          <View>
            <Text style={styles.author}>
              {item.displayName || item.username}
            </Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {isAdmin && (
            <Pressable onPress={() => deletePost(item.id)}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </Pressable>
          )}
        </View>

        {/* Announcement Badge */}
        {isAnnouncement && (
          <View style={styles.announcementBadge}>
            <MaterialCommunityIcons
              name="bullhorn"
              size={14}
              color="#fff"
            />
            <Text style={styles.announcementText}>Announcement</Text>
          </View>
        )}

        {/* Content */}
        {item.content && (
          <Text style={styles.content}>{item.content}</Text>
        )}

        {/* Image */}
        {item.imageUrl && (
          <Image
            source={{ uri: `${SERVER_URL}${item.imageUrl}` }}
            style={styles.image}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.postButton}
          onPress={() => goToCreatePost("post")}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Post</Text>
        </Pressable>

        {isAdmin && (
          <Pressable
            style={styles.announcementButton}
            onPress={() => goToCreatePost("announcement")}
          >
            <MaterialCommunityIcons
              name="bullhorn-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.announcementButtonText}>
              Announcement
            </Text>
          </Pressable>
        )}
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No posts yet. Be the first!
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  postButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },

  announcementButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },

  buttonText: { color: "#fff", fontWeight: "700" },
  announcementButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  postContainer: {
    backgroundColor: "#fff",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  announcementContainer: {
    backgroundColor: "#FFF7E8",
  },

  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  author: { fontWeight: "700", color: COLORS.primary },
  date: { fontSize: 12, color: "#666" },

  content: { marginTop: 10, fontSize: 15 },

  image: {
    marginTop: 10,
    width: "100%",
    height: 200,
    borderRadius: 10,
  },

  announcementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    alignSelf: "flex-start",
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },

  announcementText: { color: "#fff", fontSize: 12 },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
  },
});