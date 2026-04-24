import { useState, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator, SafeAreaView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SERVER_URL } from "../config";
import { COLORS, SPACING } from "../theme";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../navigation";

export default function ProfileScreen({ navigation }) {
  const { userId, signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const [userRes, commRes] = await Promise.all([
        fetch(`${SERVER_URL}/users/${userId}`),
        fetch(`${SERVER_URL}/communities/user/${userId}`)
      ]);
      
      const userData = await userRes.json();
      const commData = await commRes.json();

      if (userData.user) setUser(userData.user);
      if (commData.communities) setJoinedCommunities(commData.communities);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
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
      <SafeAreaView style={[styles.screen, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const renderRoleSection = () => {
    if (user.role === "Student") {
      return (
        <InfoCard title="Academic Information">
          <Text style={styles.infoLine}>Major: {user.major || "Not set"}</Text>
          <Text style={styles.infoLine}>Degree: {user.degree || "Not set"}</Text>
          <Text style={styles.infoLine}>
            Graduation Year: {user.gradYear || "Not set"}
          </Text>
        </InfoCard>
      );
    }

    if (user.role === "Faculty") {
      return (
        <InfoCard title="Faculty Information">
          <Text style={styles.infoLine}>Department: {user.department || "Not set"}</Text>
          <Text style={styles.infoLine}>Degree: {user.degree || "Not set"}</Text>
          <Text style={styles.infoLine}>Office Hours: {user.officeHours || "Not set"}</Text>
        </InfoCard>
      );
    }

    if (user.role === "Alumni") {
      return (
        <InfoCard title="Alumni Information">
          <Text style={styles.infoLine}>Degree: {user.degree || "Not set"}</Text>
          <Text style={styles.infoLine}>Major: {user.major || "Not set"}</Text>
          <Text style={styles.infoLine}>
            Alumni Class Year: {user.alumniClassYear || "Not set"}
          </Text>
          <Text style={styles.infoLine}>Employer: {user.employer || "Not set"}</Text>
          <Text style={styles.infoLine}>Job Title: {user.jobTitle || "Not set"}</Text>
        </InfoCard>
      );
    }

    if (user.role === "Moderator") {
      return (
        <InfoCard title="Moderator Information">
          <Text style={styles.infoLine}>
            Moderation Level: {user.moderationLevel || "Not set"}
          </Text>
          <Text style={styles.infoLine}>Department: {user.department || "Not set"}</Text>
          <Text style={styles.infoLine}>Office Hours: {user.officeHours || "Not set"}</Text>
        </InfoCard>
      );
    }

    return null;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
         <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{user.displayName?.charAt(0) || "U"}</Text>
         </View>
         <Text style={styles.profileName}>{user.displayName}</Text>
         <Text style={styles.profileUsername}>@{user.username} • {user.role}</Text>
         <Text style={styles.bioText}>{user.bio || "No bio yet."}</Text>
         <Pressable style={styles.editBtn} onPress={() => navigation.navigate("EditProfile", { user })}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
         </Pressable>
      </View>

      {renderRoleSection()}

      <InfoCard title="Interests">
        <View style={styles.tagWrap}>
          {(user.interests || "").split(',').filter(Boolean).map((interest) => (
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
            onPress={() =>
              navigation.navigate("CommunityDetail", { 
                communityId: community.id, 
                name: community.name,
                description: community.description,
                type: community.type,
                category: community.category,
                memberCount: community.memberCount
              })
            }
          >
            <Text style={styles.communityName}>{community.name}</Text>
            <Text style={styles.communityType}>{community.type}</Text>
          </Pressable>
        ))}
      </InfoCard>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Communities")}
        >
          <Text style={styles.primaryButtonText}>Browse Communities</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Discover")}
        >
          <Text style={styles.secondaryButtonText}>Discover</Text>
        </Pressable>
      </View>
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
  container: {
    padding: SPACING.padding,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarInitial: { color: "#FFF", fontSize: 32, fontWeight: '800' },
  profileName: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  profileUsername: { color: COLORS.secondary, fontWeight: '700', marginBottom: 12 },
  bioText: { textAlign: 'center', color: COLORS.text, fontSize: 15, lineHeight: 20, marginBottom: 16 },
  editBtn: { backgroundColor: COLORS.background, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary },
  editBtnText: { color: COLORS.primary, fontWeight: '700' },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  infoLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 8,
  },
  infoSubheading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#042752",
    marginTop: 6,
    marginBottom: 8,
  },
  bulletLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 8,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    backgroundColor: "#F5A841",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagText: {
    color: "#042752",
    fontWeight: "700",
  },
  communityItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#F5A841",
  },
  communityName: {
    color: "#042752",
    fontWeight: "700",
    fontSize: 15,
  },
  communityType: {
    color: "#000000",
    marginTop: 4,
  },
  actionRow: {
    marginTop: 4,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#042752",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: "#F5A841",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#042752",
  },
  secondaryButtonText: {
    color: "#042752",
    fontWeight: "700",
    fontSize: 15,
  },
  moderatorButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#042752",
  },
  moderatorButtonText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 15,
  },
  logoutBtn: {
    marginRight: 16,
    padding: 8,
  },
});