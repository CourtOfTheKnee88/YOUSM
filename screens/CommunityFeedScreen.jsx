import React, { useCallback, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SERVER_URL } from "../config";
import { COLORS, SPACING } from "../theme";
import { useAuth } from "../navigation";

export default function CommunityFeedScreen({ route, navigation }) {
  const { communityId, name, isAdmin } = route.params;
  const { userId } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${SERVER_URL}/communities/${communityId}/feed?userId=${userId}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load community feed.");
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error("Community feed error:", error);
      Alert.alert("Error", error.message || "Could not load feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFeed();
    }, [communityId, userId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const goToCreatePost = (postType = "post") => {
    navigation.navigate("CreateCommunityPost", {
      communityId,
      name,
      postType,
    });
  };

  const goToAdminPanel = () => {
    navigation.navigate("CommunityAdmin", {
      communityId,
      name,
    });
  };

  const deletePost = async (postId) => {
    Alert.alert("Delete Post", "Remove this post from the community feed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${SERVER_URL}/posts/${postId}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adminUserId: userId }),
            });

            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.error || "Failed to delete post.");
            }

            setPosts((prev) => prev.filter((post) => post.id !== postId));
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to delete post.");
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
          styles.postCard,
          isAnnouncement && styles.announcementCard,
        ]}
      >
        <View style={styles.postHeader}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.displayName || item.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.authorTextWrap}>
              <Text style={styles.authorName}>
                {item.displayName || item.username || "Unknown"}
              </Text>
              <Text style={styles.postTime}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.postHeaderActions}>
            {isAnnouncement && (
              <View style={styles.smallAnnouncementBadge}>
                <MaterialCommunityIcons
                  name="bullhorn"
                  size={13}
                  color="#FFFFFF"
                />
                <Text style={styles.smallAnnouncementText}>
                  Announcement
                </Text>
              </View>
            )}

            {isAdmin && (
              <Pressable
                style={styles.deleteButton}
                onPress={() => deletePost(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </View>

        {item.content && <Text style={styles.postContent}>{item.content}</Text>}

        {item.imageUrl && (
          <Image
            source={{ uri: `${SERVER_URL}${item.imageUrl}` }}
            style={styles.postImage}
          />
        )}

        {item.videoUrl && (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={54} color={COLORS.primary} />
            <Text style={styles.videoText}>Video Post</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <Text style={styles.statText}>{item.likeCount || 0} Likes</Text>
          <Text style={styles.statText}>{item.commentCount || 0} Comments</Text>
          <Text style={styles.statText}>{item.shareCount || 0} Shares</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.heroBadgeText}>Community Feed</Text>
        </View>

        <Text style={styles.heroTitle}>{name || "Community"}</Text>
        <Text style={styles.heroSubtitle}>
          Posts and announcements shared inside this community.
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => goToCreatePost("post")}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Post</Text>
          </Pressable>

          {isAdmin && (
            <>
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

              <Pressable
                style={styles.adminButton}
                onPress={goToAdminPanel}
              >
                <MaterialCommunityIcons
                  name="shield-account-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.adminButtonText}>Admin</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={54}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              Start a conversation inside this community.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 18,
    margin: SPACING.padding,
    marginBottom: 10,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: COLORS.textAccent,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  announcementButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  announcementButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  adminButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  adminButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  listContent: {
    padding: SPACING.padding,
    paddingTop: 4,
    paddingBottom: 50,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  announcementCard: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: "#FFF7E8",
  },
  postHeader: {
    gap: 10,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  authorTextWrap: {
    flex: 1,
  },
  authorName: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  postTime: {
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 2,
  },
  postHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  smallAnnouncementBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  smallAnnouncementText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  postContent: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  postImage: {
    marginTop: 12,
    width: "100%",
    height: 220,
    borderRadius: 16,
  },
  videoPlaceholder: {
    marginTop: 12,
    height: 180,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  videoText: {
    color: COLORS.primary,
    fontWeight: "800",
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  statText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});