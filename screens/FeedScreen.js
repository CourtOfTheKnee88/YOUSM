import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function FeedScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>Feed</Text>
        <Text style={styles.title}>Campus feed coming soon</Text>
        <Text style={styles.subtitle}>
          This tab is ready for your team’s social feed. Posts, likes, comments,
          and scrolling content can plug in here later.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="post-outline" size={28} color="#042752" />
        </View>
        <Text style={styles.cardTitle}>Future feed features</Text>
        <Text style={styles.cardText}>• Post timeline</Text>
        <Text style={styles.cardText}>• Likes and comments</Text>
        <Text style={styles.cardText}>• Media posts</Text>
        <Text style={styles.cardText}>• Share interactions</Text>
      </View>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Feed Placeholder Ready</Text>
      </Pressable>
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
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 16,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: {
    color: "#042752",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  cardText: {
    color: "#374151",
    fontSize: 15,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#042752",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});