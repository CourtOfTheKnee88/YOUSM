import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import CommunityCard from "../components/CommunityCard";
import { useAuth } from "../navigation";
import { SERVER_URL } from "../config";

export default function CommunitiesScreen({ navigation }) {
  const { userData } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, [userData]);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/communities`);
      const data = await response.json();
      if (data.communities) {
        setCommunities(data.communities);
        // Fetch user's joined communities if user data is available
        if (userData?.id) {
          const userCommunitiesResponse = await fetch(
            `${SERVER_URL}/users/${userData.id}/communities`,
          );
          const userCommunitiesData = await userCommunitiesResponse.json();
          if (userCommunitiesData.communities) {
            setJoinedIds(userCommunitiesData.communities.map((c) => c.id));
          }
        }
      }
    } catch (error) {
      console.log("Failed to fetch communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleJoin = (communityId) => {
    setJoinedIds((prev) =>
      prev.includes(communityId)
        ? prev.filter((id) => id !== communityId)
        : [...prev, communityId],
    );
  };

  const joinedCommunities = communities.filter((community) =>
    joinedIds.includes(community.id),
  );

  const discoverCommunities = communities.filter(
    (community) => !joinedIds.includes(community.id),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>Communities</Text>
        <Text style={styles.title}>Find your people</Text>
        <Text style={styles.subtitle}>
          Join clubs, courses, and organizations across campus. You can also
          start a new community.
        </Text>

        <Pressable
          style={styles.createButton}
          onPress={() => navigation.navigate("CreateCommunity")}
        >
          <Text style={styles.createButtonText}>Create a Community</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Communities</Text>
        {joinedCommunities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            joined={true}
            onPress={() =>
              navigation.navigate("CommunityDetail", { community })
            }
            onToggleJoin={() => toggleJoin(community.id)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discover More</Text>
        {discoverCommunities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            joined={false}
            onPress={() =>
              navigation.navigate("CommunityDetail", { community })
            }
            onToggleJoin={() => toggleJoin(community.id)}
          />
        ))}
      </View>
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
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: "#F5A841",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  createButtonText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 15,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#042752",
    marginBottom: 12,
  },
});
