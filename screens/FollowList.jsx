import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { SERVER_URL } from "../config";
import { useAuth } from "../navigation";
import { COLORS } from "../theme";

export default function FollowList({ navigation }) {
  const { userId } = useAuth(); // Get userId from useAuth
  const [Followers, setFollowers] = useState([]);
  const [Following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`${SERVER_URL}/users/${userId}/followers`),
        fetch(`${SERVER_URL}/users/${userId}/following`),
      ]);

      const followersData = await followersRes.json();
      const followingData = await followingRes.json();

      setFollowers(followersData.followers || []);
      setFollowing(followingData.following || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetId) => {
    Alert.alert("Unfollow", "Are you sure you want to unfollow this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unfollow",
        style: "destructive",
        onPress: async () => {
          try {
            // Following logic: targetId is the person we follow, userId is the follower
            const res = await fetch(
              `${SERVER_URL}/users/${targetId}/follow/${userId}`,
              {
                method: "DELETE",
              },
            );
            if (res.ok) {
              setFollowing((prev) => prev.filter((p) => p.id !== targetId));
            } else {
              Alert.alert("Error", "Failed to unfollow user.");
            }
          } catch (error) {
            console.error("Unfollow error:", error);
          }
        },
      },
    ]);
  };

  const handleRemoveFollower = async (targetId) => {
    Alert.alert(
      "Remove Follower",
      "Are you sure you want to remove this follower?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // Follower logic: targetId is the follower, userId is the person followed
              const res = await fetch(
                `${SERVER_URL}/users/${userId}/follow/${targetId}`,
                {
                  method: "DELETE",
                },
              );
              if (res.ok) {
                setFollowers((prev) => prev.filter((p) => p.id !== targetId));
              } else {
                Alert.alert("Error", "Failed to remove follower.");
              }
            } catch (error) {
              console.error("Remove follower error:", error);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    fetchFollowData();
  }, [userId]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Followers</Text>
      {Followers.map((person) => (
        <View key={person.id} style={styles.personCard}>
          <Pressable
            style={styles.personCardMain}
            onPress={() =>
              navigation.navigate("OtherUserProfile", { userId: person.id })
            }
          >
            <View style={styles.personAvatar}>
              <Text style={styles.personAvatarText}>
                {(person.displayName || person.username)
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </Text>
            </View>
            <View style={styles.personInfo}>
              <Text style={styles.personName}>
                {person.displayName || person.username}
              </Text>
              <Text style={styles.personRole}>{person.role}</Text>
              <Text style={styles.personSubtitle}>
                {person.major || `@${person.username}`}
              </Text>
            </View>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveFollower(person.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Following</Text>
      {Following.map((person) => (
        <View key={person.id} style={styles.personCard}>
          <Pressable
            style={styles.personCardMain}
            onPress={() =>
              navigation.navigate("OtherUserProfile", { userId: person.id })
            }
          >
            <View style={styles.personAvatar}>
              <Text style={styles.personAvatarText}>
                {(person.displayName || person.username)
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </Text>
            </View>
            <View style={styles.personInfo}>
              <Text style={styles.personName}>
                {person.displayName || person.username}
              </Text>
              <Text style={styles.personRole}>{person.role}</Text>
              <Text style={styles.personSubtitle}>
                {person.major || `@${person.username}`}
              </Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleUnfollow(person.id)}
          >
            <Text style={styles.actionButtonText}>Unfollow</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#042752",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#042752",
    marginTop: 8,
    marginBottom: 12,
  },
  personCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F5A841",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  personCardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  personAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#042752",
  },
  personAvatarText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 18,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#042752",
  },
  personRole: {
    color: "#F5A841",
    fontWeight: "700",
    marginTop: 2,
  },
  personSubtitle: {
    color: "#000000",
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: "#042752",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  removeButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#042752",
  },
  removeButtonText: {
    color: "#042752",
    fontSize: 12,
    fontWeight: "700",
  },
});
