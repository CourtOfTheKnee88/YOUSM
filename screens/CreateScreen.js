import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CreateScreen({ navigation }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>Create</Text>
        <Text style={styles.title}>Choose what you want to build</Text>
        <Text style={styles.subtitle}>
          This space is for creating posts, communities, and future content tools
          in YOUSM.
        </Text>
      </View>

      <View style={styles.optionCard}>
        <View style={styles.optionIconWrap}>
          <MaterialCommunityIcons
            name="post-outline"
            size={28}
            color="#042752"
          />
        </View>
        <Text style={styles.optionTitle}>Create a Post</Text>
        <Text style={styles.optionText}>
          This area is reserved for text posts, media uploads, previews, and
          publishing tools.
        </Text>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Post Tools Coming Soon</Text>
        </Pressable>
      </View>

      <View style={styles.optionCard}>
        <View style={styles.optionIconWrap}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={28}
            color="#042752"
          />
        </View>
        <Text style={styles.optionTitle}>Create a Community</Text>
        <Text style={styles.optionText}>
          Start a new club, course, organization, or moderated campus group.
        </Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("CreateCommunity")}
        >
          <Text style={styles.secondaryButtonText}>Open Community Creator</Text>
        </Pressable>
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
  },
  optionCard: {
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
  optionIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  optionTitle: {
    color: "#042752",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  optionText: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#042752",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#F5A841",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#042752",
  },
  secondaryButtonText: {
    color: "#042752",
    fontSize: 15,
    fontWeight: "800",
  },
});