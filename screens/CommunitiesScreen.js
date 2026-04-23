import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import CommunityCard from "../components/CommunityCard";

export default function CommunitiesScreen({
  navigation,
  communities,
  user,
  setUser,
}) {
  const joinedIds = user.joinedCommunityIds;

  const toggleJoin = (communityId) => {
    const alreadyJoined = joinedIds.includes(communityId);

    const updatedJoinedIds = alreadyJoined
      ? joinedIds.filter((id) => id !== communityId)
      : [...joinedIds, communityId];

    setUser({
      ...user,
      joinedCommunityIds: updatedJoinedIds,
    });
  };

  const joinedCommunities = communities.filter((community) =>
    joinedIds.includes(community.id)
  );

  const discoverCommunities = communities.filter(
    (community) => !joinedIds.includes(community.id)
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
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#042752",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
});