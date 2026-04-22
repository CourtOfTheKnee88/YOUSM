import { StyleSheet, Text, View, Pressable } from "react-native";

export default function CommunityCard({
  community,
  joined,
  onPress,
  onToggleJoin,
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{community.type}</Text>
        </View>
        <Text style={styles.members}>{community.members} members</Text>
      </View>

      <Text style={styles.name}>{community.name}</Text>
      <Text style={styles.category}>{community.category}</Text>
      <Text style={styles.description}>{community.description}</Text>

      <Pressable
        style={[styles.button, joined ? styles.buttonJoined : styles.buttonJoin]}
        onPress={onToggleJoin}
      >
        <Text
          style={[
            styles.buttonText,
            joined ? styles.buttonTextJoined : styles.buttonTextJoin,
          ]}
        >
          {joined ? "Joined" : "Join Community"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#F5A841",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#042752",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  members: {
    color: "#000000",
    fontSize: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#042752",
    marginBottom: 4,
  },
  category: {
    color: "#F5A841",
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    color: "#000000",
    lineHeight: 20,
    marginBottom: 14,
  },
  button: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonJoin: {
    backgroundColor: "#042752",
  },
  buttonJoined: {
    backgroundColor: "#F5A841",
    borderWidth: 2,
    borderColor: "#042752",
  },
  buttonText: {
    fontWeight: "700",
  },
  buttonTextJoin: {
    color: "#FFFFFF",
  },
  buttonTextJoined: {
    color: "#042752",
  },
});