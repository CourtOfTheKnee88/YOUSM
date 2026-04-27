import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import InfoCard from "../components/InfoCard";
import { useAuth } from "../navigation";

export default function ModeratorScreen() {
  const { userData } = useAuth();
  const currentUser = userData;
  const managedAreas = currentUser?.managedAreas || [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Moderator View</Text>
        </View>
        <Text style={styles.title}>Community Moderation</Text>
        <Text style={styles.subtitle}>
          Review requests, oversee communities, and support a respectful campus
          space.
        </Text>
      </View>

      <InfoCard title="Moderator Details">
        <Text style={styles.infoLine}>
          Name: {currentUser?.displayName || currentUser?.username}
        </Text>
        <Text style={styles.infoLine}>
          Level: {currentUser?.moderationLevel || "Moderator"}
        </Text>
        <Text style={styles.infoLine}>
          Department: {currentUser?.department || "Student Engagement"}
        </Text>
        <Text style={styles.infoLine}>
          Office Hours: {currentUser?.officeHours || "N/A"}
        </Text>
      </InfoCard>

      <InfoCard title="Managed Areas">
        {managedAreas.map((area) => (
          <View key={area} style={styles.tag}>
            <Text style={styles.tagText}>{area}</Text>
          </View>
        ))}
      </InfoCard>

      <InfoCard title="Queue Overview">
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Open Reports</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Event Requests</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>14</Text>
            <Text style={styles.statLabel}>Pending Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Urgent Flags</Text>
          </View>
        </View>
      </InfoCard>

      <InfoCard title="Moderator Actions">
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Reports</Text>
        </Pressable>
        <Pressable style={styles.actionButtonSecondary}>
          <Text style={styles.actionButtonSecondaryText}>
            Review Event Requests
          </Text>
        </Pressable>
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
    backgroundColor: "#042752",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5A841",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 12,
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
  infoLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#F5A841",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  tagText: {
    color: "#042752",
    fontWeight: "700",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#F5A841",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#042752",
    marginBottom: 6,
  },
  statLabel: {
    color: "#374151",
    fontSize: 13,
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "#042752",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  actionButtonSecondary: {
    backgroundColor: "#F5A841",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#042752",
  },
  actionButtonSecondaryText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 15,
  },
});
