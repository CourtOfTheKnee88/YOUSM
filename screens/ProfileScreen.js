import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SERVER_URL } from "../config";
import { COLORS, SPACING } from "../theme";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../navigation";

export default function ProfileScreen({ navigation }) {
  const { userId, signOut } = useAuth();

  const [user, setUser] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoadingId, setRequestLoadingId] = useState(null);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${SERVER_URL}${imagePath}`;
  };

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const [userRes, commRes, requestRes] = await Promise.all([
        fetch(`${SERVER_URL}/users/${userId}`),
        fetch(`${SERVER_URL}/communities/user/${userId}`),
        fetch(`${SERVER_URL}/users/${userId}/follow-requests`),
      ]);

      const userData = await userRes.json();
      const commData = await commRes.json();
      const requestData = await requestRes.json();

      if (userData.user) setUser(userData.user);
      if (commData.communities) setJoinedCommunities(commData.communities);
      if (requestData.requests) setFollowRequests(requestData.requests);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleFollowRequestResponse = async (requestId, action) => {
    if (!userId || !requestId) return;

    setRequestLoadingId(requestId);

    try {
      const res = await fetch(
        `${SERVER_URL}/users/${userId}/follow-requests/${requestId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to respond to request");
      }

      setFollowRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );

      fetchProfile();
    } catch (error) {
      console.error("Follow request response failed:", error);
      Alert.alert("Error", error.message || "Could not update request.");
    } finally {
      setRequestLoadingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [userId])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out" size={24} color="#FFFFFF" />
        </Pressable>
      ),
    });
  }, [navigation]);

  if (loading || !user) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const renderRoleSection = () => {
    if (user.role === "Student") {
      return (
        <InfoCard title="Academic Information">
          <Text style={styles.infoLine}>Major: {user.major || "Not set"}</Text>
          <Text style={styles.infoLine}>
            Degree: {user.degree || "Not set"}
          </Text>
          <Text style={styles.infoLine}>
            Graduation Year: {user.gradYear || "Not set"}
          </Text>
        </InfoCard>
      );
    }

    if (user.role === "Faculty") {
      return (
        <InfoCard title="Faculty Information">
          <Text style={styles.infoLine}>
            Department: {user.department || "Not set"}
          </Text>
          <Text style={styles.infoLine}>
            Degree: {user.degree || "Not set"}
          </Text>
          <Text style={styles.infoLine}>
            Office Hours: {user.officeHours || "Not set"}
          </Text>
        </InfoCard>
      );
    }

    if (user.role === "Alumni") {
      return (
        <InfoCard title="Alumni Information">
          <Text style={styles.infoLine}>
            Degree: {user.degree || "Not set"}
          </Text>
          <Text style={styles.infoLine}>Major: {user.major || "Not set"}</Text>
          <Text style={styles.infoLine}>
            Employer: {user.employer || "Not set"}
          </Text>
          <Text style={styles.infoLine}>
            Job Title: {user.jobTitle || "Not set"}
          </Text>
        </InfoCard>
      );
    }

    if (user.role === "Moderator") {
      return (
        <InfoCard title="Moderator Information">
          <Text style={styles.infoLine}>
            Moderation Level: {user.moderationLevel || "Not set"}
          </Text>
          <Text style={styles.infoLine}>
            Department: {user.department || "Not set"}
          </Text>
          <Text style={styles.infoLine}>
            Office Hours: {user.officeHours || "Not set"}
          </Text>
        </InfoCard>
      );
    }

    return null;
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.avatarCircle}>
          {user.profileImage ? (
            <Image
              source={{ uri: getFullImageUrl(user.profileImage) }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarInitial}>
              {(user.displayName || user.username || "U").charAt(0)}
            </Text>
          )}
        </View>

        <Text style={styles.profileName}>
          {user.displayName || user.username}
        </Text>

        <Text style={styles.profileUsername}>
          @{user.username} • {user.role}
        </Text>

        <View style={styles.accountBadge}>
          <Ionicons
            name={user.isPrivate ? "lock-closed" : "globe-outline"}
            size={15}
            color={COLORS.primary}
          />
          <Text style={styles.accountBadgeText}>
            {user.isPrivate ? "Private Account" : "Public Account"}
          </Text>
        </View>

        <Text style={styles.bioText}>{user.bio || "No bio yet."}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user.followerCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user.followingCount || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <Pressable
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditProfile", { user })}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </Pressable>
      </View>

      {followRequests.length > 0 && (
        <InfoCard title="Follow Requests">
          {followRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <Pressable
                style={styles.requestUser}
                onPress={() =>
                  navigation.navigate("OtherUserProfile", {
                    userId: request.requesterId,
                  })
                }
              >
                <View style={styles.requestAvatar}>
                  {request.profileImage ? (
                    <Image
                      source={{ uri: getFullImageUrl(request.profileImage) }}
                      style={styles.requestAvatarImage}
                    />
                  ) : (
                    <Text style={styles.requestAvatarText}>
                      {(request.displayName || request.username || "U").charAt(
                        0
                      )}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.requestName}>
                    {request.displayName || request.username}
                  </Text>
                  <Text style={styles.requestMeta}>
                    @{request.username} • {request.role || "Student"}
                  </Text>
                </View>
              </Pressable>

              <View style={styles.requestButtons}>
                <Pressable
                  style={styles.acceptButton}
                  disabled={requestLoadingId === request.id}
                  onPress={() =>
                    handleFollowRequestResponse(request.id, "accept")
                  }
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </Pressable>

                <Pressable
                  style={styles.denyButton}
                  disabled={requestLoadingId === request.id}
                  onPress={() =>
                    handleFollowRequestResponse(request.id, "deny")
                  }
                >
                  <Text style={styles.denyButtonText}>Deny</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </InfoCard>
      )}

      {renderRoleSection()}

      <InfoCard title="Interests">
        {user.interests ? (
          <View style={styles.tagWrap}>
            {user.interests
              .split(",")
              .map((interest) => interest.trim())
              .filter(Boolean)
              .map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
          </View>
        ) : (
          <Text style={styles.infoLine}>No interests added yet.</Text>
        )}
      </InfoCard>

      <InfoCard title="Joined Communities">
        {joinedCommunities.length > 0 ? (
          joinedCommunities.map((community) => (
            <Pressable
              key={community.id}
              style={styles.communityItem}
              onPress={() =>
                navigation.navigate("CommunityDetail", {
                  communityId: community.id,
                  name: community.name,
                  description: community.description,
                  type: community.type,
                  category: community.category,
                  memberCount: community.memberCount,
                })
              }
            >
              <View>
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityType}>
                  {community.type} • {community.category}
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.textLight}
              />
            </Pressable>
          ))
        ) : (
          <Text style={styles.infoLine}>You have not joined any communities yet.</Text>
        )}
      </InfoCard>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate("Communities")}
      >
        <Text style={styles.primaryButtonText}>Browse Communities</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoCard({ title, children }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      {children}
    </View>
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
  container: {
    padding: SPACING.padding,
    paddingBottom: 40,
  },
  logoutBtn: {
    marginRight: 12,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitial: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primary,
    textAlign: "center",
  },
  profileUsername: {
    color: COLORS.textLight,
    marginTop: 4,
    fontSize: 14,
  },
  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.background,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  accountBadgeText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  bioText: {
    color: COLORS.text,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 16,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
  },
  statNumber: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 22,
  },
  statLabel: {
    color: COLORS.textLight,
    fontWeight: "700",
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 26,
    width: "100%",
    alignItems: "center",
  },
  editBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 12,
  },
  infoLine: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: 7,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.background,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  requestCard: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },
  requestUser: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  requestAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  requestAvatarImage: {
    width: "100%",
    height: "100%",
  },
  requestAvatarText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    textTransform: "uppercase",
  },
  requestName: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 15,
  },
  requestMeta: {
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 2,
  },
  requestButtons: {
    flexDirection: "row",
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFF",
    fontWeight: "900",
  },
  denyButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  denyButtonText: {
    color: COLORS.text,
    fontWeight: "900",
  },
  communityItem: {
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  communityName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  communityType: {
    color: COLORS.textLight,
    fontSize: 13,
    marginTop: 3,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 15,
  },
});