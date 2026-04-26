import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SERVER_URL } from "../config";
import { COLORS, SPACING } from "../theme";
import { useAuth } from "../navigation";

export default function OtherUserProfileScreen({ route, navigation }) {
  const { userId: viewerId } = useAuth();
  const targetUserId = route.params?.userId;

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followStatus, setFollowStatus] = useState("none");
  const [canViewPosts, setCanViewPosts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    if (!targetUserId || !viewerId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await fetch(
        `${SERVER_URL}/users/${targetUserId}/profile?viewerId=${viewerId}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load profile");
      }

      setProfileUser(data.user);
      setPosts(data.posts || []);
      setFollowStatus(data.user?.followStatus || "none");
      setCanViewPosts(data.user?.canViewPosts === true);
    } catch (error) {
      console.error("Failed to load other profile:", error);
      Alert.alert("Error", "Could not load this profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [targetUserId, viewerId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleFollowPress = async () => {
    if (!viewerId || !targetUserId || actionLoading) return;

    setActionLoading(true);

    try {
      if (followStatus === "following" || followStatus === "requested") {
        const res = await fetch(
          `${SERVER_URL}/users/${targetUserId}/follow/${viewerId}`,
          { method: "DELETE" }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to update follow");
        }

        setFollowStatus("none");
        fetchProfile();
        return;
      }

      const res = await fetch(`${SERVER_URL}/users/${targetUserId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId: viewerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to follow user");
      }

      setFollowStatus(data.status || "none");
      fetchProfile();
    } catch (error) {
      console.error("Follow action failed:", error);
      Alert.alert("Error", error.message || "Could not update follow status.");
    } finally {
      setActionLoading(false);
    }
  };

  const getFollowButtonText = () => {
    if (actionLoading) return "Please wait...";
    if (followStatus === "following") return "Following";
    if (followStatus === "requested") return "Requested";
    return "Follow";
  };

  const getFollowButtonStyle = () => {
    if (followStatus === "following" || followStatus === "requested") {
      return [styles.followButton, styles.secondaryButton];
    }

    return styles.followButton;
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${SERVER_URL}${imagePath}`;
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.smallAvatar}>
          {profileUser?.profileImage ? (
            <Image
              source={{ uri: getFullImageUrl(profileUser.profileImage) }}
              style={styles.smallAvatarImage}
            />
          ) : (
            <Text style={styles.smallAvatarText}>
              {(profileUser?.displayName || profileUser?.username || "U")
                .charAt(0)
                .toUpperCase()}
            </Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.postAuthor}>
            {profileUser?.displayName || profileUser?.username}
          </Text>
          <Text style={styles.postDate}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "Recently"}
          </Text>
        </View>
      </View>

      {!!item.content && <Text style={styles.postContent}>{item.content}</Text>}

      {item.imageUrl && (
        <Image
          source={{ uri: getFullImageUrl(item.imageUrl) }}
          style={styles.postImage}
        />
      )}

      <View style={styles.postStats}>
        <Text style={styles.postStat}>{item.likeCount || 0} likes</Text>
        <Text style={styles.postStat}>{item.commentCount || 0} comments</Text>
        <Text style={styles.postStat}>{item.shareCount || 0} shares</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!profileUser) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <Text style={styles.emptyTitle}>Profile not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={canViewPosts ? posts : []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.container}>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                {profileUser.profileImage ? (
                  <Image
                    source={{ uri: getFullImageUrl(profileUser.profileImage) }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {(profileUser.displayName || profileUser.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                )}
              </View>

              <Text style={styles.name}>
                {profileUser.displayName || profileUser.username}
              </Text>

              <Text style={styles.username}>@{profileUser.username}</Text>

              <View style={styles.roleBadge}>
                <MaterialCommunityIcons
                  name="account"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.roleBadgeText}>
                  {profileUser.role || "Student"}
                </Text>
              </View>

              {!!profileUser.bio && (
                <Text style={styles.bio}>{profileUser.bio}</Text>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoNumber}>
                    {profileUser.followerCount || 0}
                  </Text>
                  <Text style={styles.infoLabel}>Followers</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoNumber}>
                    {profileUser.followingCount || 0}
                  </Text>
                  <Text style={styles.infoLabel}>Following</Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Basic Information</Text>
                <Text style={styles.detailLine}>
                  Role: {profileUser.role || "Not set"}
                </Text>
                <Text style={styles.detailLine}>
                  Major: {profileUser.major || "Not set"}
                </Text>
                <Text style={styles.detailLine}>
                  Account: {profileUser.isPrivate ? "Private" : "Public"}
                </Text>
              </View>

              {followStatus !== "self" && (
                <Pressable
                  style={getFollowButtonStyle()}
                  onPress={handleFollowPress}
                  disabled={actionLoading}
                >
                  <Ionicons
                    name={
                      followStatus === "following"
                        ? "checkmark-circle"
                        : followStatus === "requested"
                          ? "time-outline"
                          : "person-add"
                    }
                    size={20}
                    color={
                      followStatus === "following" ||
                      followStatus === "requested"
                        ? COLORS.primary
                        : "#FFFFFF"
                    }
                  />
                  <Text
                    style={[
                      styles.followButtonText,
                      (followStatus === "following" ||
                        followStatus === "requested") &&
                        styles.secondaryButtonText,
                    ]}
                  >
                    {getFollowButtonText()}
                  </Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.sectionTitle}>Posts</Text>

            {!canViewPosts && (
              <View style={styles.privateCard}>
                <Ionicons name="lock-closed" size={28} color={COLORS.primary} />
                <Text style={styles.privateTitle}>This account is private</Text>
                <Text style={styles.privateText}>
                  Follow this user to see their posts.
                </Text>
              </View>
            )}

            {canViewPosts && posts.length === 0 && (
              <View style={styles.privateCard}>
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color={COLORS.primary}
                />
                <Text style={styles.privateTitle}>No posts yet</Text>
                <Text style={styles.privateText}>
                  This user has not shared any public posts.
                </Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 30,
  },
  container: {
    padding: SPACING.padding,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 22,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
  },
  name: {
    fontSize: 25,
    fontWeight: "900",
    color: COLORS.primary,
    textAlign: "center",
  },
  username: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 12,
  },
  roleBadgeText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  bio: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  infoBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
  },
  infoNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "700",
    marginTop: 2,
  },
  detailCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
  },
  detailTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  detailLine: {
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: 5,
  },
  followButton: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  followButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
  },
  privateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  privateTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 4,
  },
  privateText: {
    color: COLORS.textLight,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  postCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.padding,
    marginBottom: 14,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  smallAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  smallAvatarImage: {
    width: "100%",
    height: "100%",
  },
  smallAvatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
  },
  postAuthor: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 15,
  },
  postDate: {
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: "row",
    gap: 12,
  },
  postStat: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "700",
  },
});