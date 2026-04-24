import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../theme";
import { SERVER_URL, CURRENT_USER_ID } from "../config";

export default function CommunityDetailScreen({ route, navigation }) {
  const { communityId } = route.params;

  const [community, setCommunity] = useState(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const res = await fetch(
        `${SERVER_URL}/communities/${communityId}?userId=${CURRENT_USER_ID}`
      );
      const data = await res.json();

      if (data.community) {
        setCommunity(data.community);
        setJoined(data.community.isMember);
      }
    } catch (error) {
      console.error("Failed to load community details:", error);
      Alert.alert("Error", "Could not load community details.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [communityId])
  );

  const handleJoin = async () => {
    const currentlyJoined = joined;

    try {
      const method = currentlyJoined ? "DELETE" : "POST";
      const url = currentlyJoined
        ? `${SERVER_URL}/communities/${communityId}/leave/${CURRENT_USER_ID}`
        : `${SERVER_URL}/communities/${communityId}/join`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: currentlyJoined
          ? null
          : JSON.stringify({ userId: CURRENT_USER_ID }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not update membership status.");
      }

      const nextJoinedStatus = !currentlyJoined;

      setJoined(nextJoinedStatus);
      setCommunity((prev) => ({
        ...prev,
        memberCount: nextJoinedStatus
          ? (prev.memberCount || 0) + 1
          : Math.max(0, (prev.memberCount || 0) - 1),
        isMember: nextJoinedStatus,
        memberRole: nextJoinedStatus ? "member" : null,
        isAdmin: false,
      }));

      Alert.alert(
        "Success",
        nextJoinedStatus
          ? `Joined ${community.name}!`
          : `Left ${community.name}.`
      );
    } catch (error) {
      console.error("Error toggling join:", error);
      Alert.alert("Error", error.message || "Could not update membership.");
    }
  };

  const openFeed = () => {
    if (!community?.isMember && !joined) {
      Alert.alert(
        "Join Required",
        "You need to join this community before viewing the feed."
      );
      return;
    }

    navigation.navigate("CommunityFeed", {
      communityId: community.id,
      name: community.name,
      isAdmin: community.isAdmin,
      memberRole: community.memberRole,
    });
  };

  const openAdminPanel = () => {
    navigation.navigate("CommunityAdmin", {
      communityId: community.id,
      name: community.name,
    });
  };

  if (loading || !community) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const isAdmin = community.isAdmin || community.memberRole === "admin";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {community.type || "CLUB"}
            </Text>
          </View>

          <Text style={styles.title}>{community.name}</Text>
          <Text style={styles.category}>{community.category}</Text>

          {isAdmin && (
            <View style={styles.adminBadge}>
              <MaterialCommunityIcons
                name="shield-account"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.adminBadgeText}>Community Admin</Text>
            </View>
          )}

          <Text style={styles.description}>
            {community.description ||
              `Connect with students interested in ${community.name}. Explore events and find your place in the campus community.`}
          </Text>

          <Pressable
            style={[styles.joinButton, joined && styles.joinedButton]}
            onPress={handleJoin}
          >
            <Text
              style={[
                styles.joinButtonText,
                joined && styles.joinedButtonText,
              ]}
            >
              {joined ? "Joined Community" : "Join Community"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.feedButton,
              !joined && !isAdmin && styles.disabledButton,
            ]}
            onPress={openFeed}
          >
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.feedButtonText}>Open Community Feed</Text>
          </Pressable>

          {isAdmin && (
            <Pressable style={styles.adminButton} onPress={openAdminPanel}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.adminButtonText}>Community Admin Panel</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Community Details</Text>
          <Text style={styles.infoLine}>
            Members: {community.memberCount || 0}
          </Text>
          <Text style={styles.infoLine}>
            Category: {community.category || "N/A"}
          </Text>
          <Text style={styles.infoLine}>
            Type: {community.type || "N/A"}
          </Text>
          <Text style={styles.infoLine}>Visibility: Public</Text>

          {!joined && !isAdmin && (
            <Text style={styles.privateFeedNote}>
              Join this community to view its posts, announcements, and member
              feed.
            </Text>
          )}
        </View>
      </ScrollView>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.padding,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  typeBadge: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 6,
  },
  category: {
    color: COLORS.secondary,
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 14,
  },
  adminBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7E8",
    borderColor: COLORS.secondary,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    gap: 6,
  },
  adminBadgeText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  description: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  joinedButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  joinedButtonText: {
    color: COLORS.primary,
  },
  feedButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  feedButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  adminButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  adminButtonText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 12,
  },
  infoLine: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 8,
  },
  privateFeedNote: {
    marginTop: 10,
    color: COLORS.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
});