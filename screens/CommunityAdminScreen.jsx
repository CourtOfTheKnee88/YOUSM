import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SERVER_URL, CURRENT_USER_ID } from "../config";
import { COLORS, SPACING } from "../theme";

export default function CommunityAdminScreen({ route }) {
  const { communityId, name } = route.params;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banReasons, setBanReasons] = useState({});

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/communities/${communityId}/members`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load members.");
      }

      setMembers(data.members || []);
    } catch (error) {
      console.error("Admin members error:", error);
      Alert.alert("Error", error.message || "Could not load members.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
    }, [communityId])
  );

  const promoteToAdmin = async (targetUserId) => {
    Alert.alert("Make Admin", "Promote this member to community admin?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Promote",
        onPress: async () => {
          try {
            const res = await fetch(`${SERVER_URL}/communities/${communityId}/admins`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                adminUserId: CURRENT_USER_ID,
                targetUserId,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.error || "Failed to promote member.");
            }

            Alert.alert("Success", "Member promoted to admin.");
            fetchMembers();
          } catch (error) {
            Alert.alert("Error", error.message || "Could not promote member.");
          }
        },
      },
    ]);
  };

  const banMember = async (targetUserId) => {
    const reason = banReasons[targetUserId] || "";

    Alert.alert(
      "Temporary Posting Ban",
      "Ban this member from posting in this community for 10 minutes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Ban",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${SERVER_URL}/communities/${communityId}/bans`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  adminUserId: CURRENT_USER_ID,
                  targetUserId,
                  durationMinutes: 10,
                  reason: reason.trim() || null,
                }),
              });

              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.error || "Failed to ban member.");
              }

              Alert.alert("Success", "Member is banned from posting for 10 minutes.");
              setBanReasons((prev) => ({ ...prev, [targetUserId]: "" }));
            } catch (error) {
              Alert.alert("Error", error.message || "Could not ban member.");
            }
          },
        },
      ]
    );
  };

  const renderMember = (member) => {
    const isCurrentUser = Number(member.userId) === Number(CURRENT_USER_ID);
    const isAdmin = member.role === "admin";

    return (
      <View key={member.userId} style={styles.memberCard}>
        <View style={styles.memberTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(member.displayName || member.username || "U")
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {member.displayName || member.username || `User ${member.userId}`}
            </Text>
            <Text style={styles.memberMeta}>
              @{member.username || "unknown"} • {member.role}
            </Text>
          </View>

          {isAdmin && (
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons
                name="shield-account"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.roleBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {!isCurrentUser && (
          <View style={styles.actions}>
            {!isAdmin && (
              <Pressable
                style={styles.promoteButton}
                onPress={() => promoteToAdmin(member.userId)}
              >
                <Ionicons name="arrow-up-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.promoteButtonText}>Make Admin</Text>
              </Pressable>
            )}

            {!isAdmin && (
              <>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Optional ban reason"
                  placeholderTextColor={COLORS.textLight}
                  value={banReasons[member.userId] || ""}
                  onChangeText={(text) =>
                    setBanReasons((prev) => ({
                      ...prev,
                      [member.userId]: text,
                    }))
                  }
                />

                <Pressable
                  style={styles.banButton}
                  onPress={() => banMember(member.userId)}
                >
                  <Ionicons name="ban-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.banButtonText}>Ban 10 min</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const admins = members.filter((member) => member.role === "admin");
  const regularMembers = members.filter((member) => member.role !== "admin");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons
              name="shield-account"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.heroBadgeText}>Community Admin</Text>
          </View>

          <Text style={styles.title}>{name || "Community"} Admin Panel</Text>

          <Text style={styles.subtitle}>
            Promote trusted members to community admin or temporarily ban members
            from posting for 10 minutes.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Admin Rules</Text>
          <Text style={styles.infoLine}>
            • Community admins are only admins for this community.
          </Text>
          <Text style={styles.infoLine}>
            • They are not app-wide admins.
          </Text>
          <Text style={styles.infoLine}>
            • Temporary bans only stop posting in this community.
          </Text>
          <Text style={styles.infoLine}>
            • Banned members can still view the community feed.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Admins</Text>
        {admins.length > 0 ? (
          admins.map(renderMember)
        ) : (
          <Text style={styles.emptyText}>No admins found.</Text>
        )}

        <Text style={styles.sectionTitle}>Members</Text>
        {regularMembers.length > 0 ? (
          regularMembers.map(renderMember)
        ) : (
          <Text style={styles.emptyText}>No regular members yet.</Text>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
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
  heroBadge: {
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
  heroBadgeText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textAccent,
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },
  infoLine: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 6,
  },
  memberCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  memberTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 17,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 16,
  },
  memberMeta: {
    color: COLORS.textLight,
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF7E8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  actions: {
    marginTop: 14,
  },
  promoteButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  promoteButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  reasonInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    marginBottom: 10,
  },
  banButton: {
    backgroundColor: COLORS.error,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  banButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 16,
  },
});