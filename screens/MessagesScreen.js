import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function MessagesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="message-text-outline"
            size={32}
            color="#042752"
          />
        </View>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          Direct messaging will live here. Placeholder.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming Soon</Text>
        <Text style={styles.cardText}>
          Text...
        </Text>
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
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
    textAlign: "center",
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
  },
  cardTitle: {
    color: "#042752",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardText: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 22,
  },
});