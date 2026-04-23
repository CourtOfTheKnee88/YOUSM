import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import InfoCard from "../components/InfoCard";

export default function CommunityDetailScreen({ route, user, setUser, navigation }) {
  const { community } = route.params;

  const joined = user.joinedCommunityIds.includes(community.id);

  const toggleJoin = () => {
    const updatedJoinedIds = joined
      ? user.joinedCommunityIds.filter((id) => id !== community.id)
      : [...user.joinedCommunityIds, community.id];

    setUser({
      ...user,
      joinedCommunityIds: updatedJoinedIds,
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{community.type}</Text>
        </View>
        <Text style={styles.name}>{community.name}</Text>
        <Text style={styles.category}>{community.category}</Text>
        <Text style={styles.description}>{community.description}</Text>

        <Pressable
          style={[styles.joinButton, joined && styles.joinedButton]}
          onPress={toggleJoin}
        >
          <Text
            style={[styles.joinButtonText, joined && styles.joinedButtonText]}
          >
            {joined ? "Joined Community" : "Join Community"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.feedButton}
          onPress={() => navigation.navigate("CommunityFeed", { community })}
        >
          <Text style={styles.feedButtonText}>Open Community Feed</Text>
        </Pressable>
      </View>

      <InfoCard title="Community Details">
        <Text style={styles.infoLine}>Members: {community.members}</Text>
        <Text style={styles.infoLine}>Category: {community.category}</Text>
        <Text style={styles.infoLine}>Type: {community.type}</Text>
      </InfoCard>

      <InfoCard title="Sample Members">
        <Text style={styles.memberLine}>• Esther Greene</Text>
        <Text style={styles.memberLine}>• Jordan Lee</Text>
        <Text style={styles.memberLine}>• Nina Brooks</Text>
        <Text style={styles.memberLine}>• Dr. Maya Thompson</Text>
      </InfoCard>
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
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#F5A841",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  typeBadge: {
    backgroundColor: "#042752",
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  name: {
    color: "#042752",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  category: {
    color: "#F5A841",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
  },
  description: {
    color: "#000000",
    lineHeight: 22,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: "#042752",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  joinedButton: {
    backgroundColor: "#F5A841",
    borderWidth: 2,
    borderColor: "#042752",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  joinedButtonText: {
    color: "#042752",
  },
  feedButton: {
    backgroundColor: "#F5A841",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#042752",
  },
  feedButtonText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 15,
  },
  infoLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 8,
  },
  memberLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 8,
  },
});