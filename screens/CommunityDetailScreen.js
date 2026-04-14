import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import InfoCard from "../components/InfoCard";

export default function CommunityDetailScreen({ route }) {
  const { community } = route.params;
  const [joined, setJoined] = useState(false);

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
          onPress={() => setJoined(!joined)}
        >
          <Text
            style={[styles.joinButtonText, joined && styles.joinedButtonText]}
          >
            {joined ? "Joined Community" : "Join Community"}
          </Text>
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
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#042752",
    marginBottom: 6,
  },
  category: {
    color: "#F5A841",
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    color: "#000000",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  joinButton: {
    backgroundColor: "#042752",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
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
  infoLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 8,
  },
  memberLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 10,
  },
});