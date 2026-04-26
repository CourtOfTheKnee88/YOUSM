import { useState, useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SERVER_URL } from "../config";
import { COLORS, SPACING } from "../theme";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../navigation";

export default function UserProfileScreen({ route, navigation }) {
  const { userId: targetUserId } = route.params;
  const { userId: loggedInUserId, username: loggedInUsername } = useAuth();

  const [user, setUser] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  const fetchProfile = async () => {
    try {
      const [userRes, commRes, followRes] = await Promise.all([
        fetch(`${SERVER_URL}/users/${targetUserId}`),
        fetch(`${SERVER_URL}/communities/user/${targetUserId}`),
        fetch(`${SERVER_URL}/users/${loggedInUserId}/following`)
      ]);

      const userData = await userRes.json();
      const commData = await commRes.json();
      const followData = await followRes.json();

      if (userData.user) setUser(userData.user);
      if (commData.communities) setJoinedCommunities(commData.communities);
      
      const isFollowing = followData.following?.some(f => f.id.toString() === targetUserId.toString());
      setFollowing(!!isFollowing);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProfile();
    }, [targetUserId])
  );

  const toggleFollow = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: loggedInUserId })
      });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.following);
      }
    } catch (error) {
      Alert.alert("Error", "Could not update follow status");
    }
  };

  const handleMessage = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/threads/direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: loggedInUserId, 
          otherUserId: targetUserId 
        })
      });
      const data = await res.json();
      if (res.ok) {
        navigation.navigate("Inbox", {
          screen: 'Message',
          params: {
            currentUser: loggedInUsername,
            targetUser: user.username,
            targetDisplayName: user.displayName,
            threadId: data.thread.id
          }
        });
      }
    } catch (error) {
      Alert.alert("Error", "Could not start chat");
    }
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{user.displayName?.charAt(0) || "U"}</Text>
        </View>
        <Text style={styles.profileName}>{user.displayName}</Text>
        <Text style={styles.profileUsername}>@{user.username} • {user.role}</Text>
        <Text style={styles.bioText}>{user.bio || "No bio yet."}</Text>

        <View style={styles.actionRow}>
          <Pressable 
            style={[styles.followBtn, following && styles.followingBtn]} 
            onPress={toggleFollow}
          >
            <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
              {following ? "Following" : "Follow"}
            </Text>
          </Pressable>
          <Pressable style={styles.messageBtn} onPress={handleMessage}>
             <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          </Pressable>
        </View>
      </View>

      <InfoCard title="Academic Information">
         <Text style={styles.infoLine}>Major: {user.major || "N/A"}</Text>
         <Text style={styles.infoLine}>Year: {user.gradYear || "N/A"}</Text>
      </InfoCard>

      <InfoCard title="Interests">
        <View style={styles.tagWrap}>
          {(user.interests || "").split(",").filter(Boolean).map((interest) => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </InfoCard>

      <InfoCard title="Joined Communities">
        {joinedCommunities.map((community) => (
          <Pressable
            key={community.id}
            style={styles.communityItem}
            onPress={() => navigation.navigate("CommunityDetail", { communityId: community.id })}
          >
            <Text style={styles.communityName}>{community.name}</Text>
          </Pressable>
        ))}
      </InfoCard>
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
  screen: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  container: { padding: SPACING.padding, paddingBottom: 40 },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    elevation: 4,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarInitial: { color: "#FFF", fontSize: 32, fontWeight: "800" },
  profileName: { fontSize: 24, fontWeight: "800", color: COLORS.primary, marginBottom: 4 },
  profileUsername: { color: COLORS.secondary, fontWeight: "700", marginBottom: 12 },
  bioText: { textAlign: "center", color: COLORS.text, fontSize: 15, lineHeight: 20, marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followingBtn: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  followBtnText: { color: "#FFF", fontWeight: "700" },
  followingBtnText: { color: COLORS.primary },
  messageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: { fontSize: 17, fontWeight: "800", color: COLORS.primary, marginBottom: 12 },
  infoLine: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagText: { color: COLORS.primary, fontWeight: "700" },
  communityItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  communityName: { color: COLORS.primary, fontWeight: "700", fontSize: 15 },
});
