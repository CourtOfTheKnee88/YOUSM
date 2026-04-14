import { StyleSheet, Text, View, Pressable } from "react-native";

export default function ProfileHeader({ user, onEditPress }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </Text>
      </View>

      <Text style={styles.name}>{user.name}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>{user.role}</Text>
      </View>
      <Text style={styles.meta}>{user.pronouns}</Text>
      <Text style={styles.meta}>{user.university}</Text>
      <Text style={styles.bio}>{user.bio}</Text>

      <Pressable style={styles.button} onPress={onEditPress}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F5A841",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 18,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#042752",
  },
  avatarText: {
    color: "#042752",
    fontSize: 30,
    fontWeight: "800",
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#042752",
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "#042752",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 10,
    marginBottom: 8,
  },
  roleBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  meta: {
    color: "#000000",
    fontSize: 14,
    marginBottom: 4,
  },
  bio: {
    color: "#000000",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#042752",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});