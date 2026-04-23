import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const announcements = [
  {
    id: "a1",
    title: "Spring Career Fair",
    category: "Events",
    type: "Official",
    date: "April 30, 2026",
    summary:
      "Join employers in the student union from 1 PM to 4 PM. Bring copies of your resume and dress professionally.",
  },
  {
    id: "a2",
    title: "Library Extended Hours",
    category: "Academic",
    type: "Official",
    date: "May 1, 2026",
    summary:
      "The library will remain open until midnight during finals week to support student study schedules.",
  },
  {
    id: "a3",
    title: "Campus Parking Update",
    category: "Administration",
    type: "Official",
    date: "May 3, 2026",
    summary:
      "Lot C will be temporarily closed for maintenance. Students should use Lots A and D during this period.",
  },
  {
    id: "a4",
    title: "Wellness Workshop Series",
    category: "Student Life",
    type: "Official",
    date: "May 5, 2026",
    summary:
      "Counseling services is hosting a wellness workshop on stress management and healthy routines before finals.",
  },
];

const canPostCampusAnnouncement = (user) => {
  return (
    user.role === "Moderator" ||
    user.role === "Admin" ||
    user.role === "Faculty"
  );
};

export default function AnnouncementsScreen({ user }) {
  const canPost = canPostCampusAnnouncement(user);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="bullhorn-outline"
            size={32}
            color="#042752"
          />
        </View>
        <Text style={styles.title}>Campus Announcements</Text>
        <Text style={styles.subtitle}>
          Stay up to date with important campus updates, events, and notices.
        </Text>
      </View>

      {canPost && (
        <Pressable
          style={styles.createButton}
          onPress={() =>
            Alert.alert(
              "Post Campus Announcement",
              "Only approved roles can create campus-wide announcements. This form can be added next."
            )
          }
        >
          <Text style={styles.createButtonText}>Post Campus Announcement</Text>
        </Pressable>
      )}

      {!canPost && (
        <View style={styles.infoNotice}>
          <Text style={styles.infoNoticeText}>
            Campus-wide announcements can only be posted by approved roles such
            as moderators, admins, or faculty.
          </Text>
        </View>
      )}

      {announcements.map((announcement) => (
        <View key={announcement.id} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{announcement.type}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {announcement.category}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>{announcement.date}</Text>
          </View>

          <Text style={styles.cardTitle}>{announcement.title}</Text>
          <Text style={styles.cardText}>{announcement.summary}</Text>
        </View>
      ))}
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
  createButton: {
    backgroundColor: "#042752",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  infoNotice: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#F5A841",
  },
  infoNoticeText: {
    color: "#374151",
    lineHeight: 21,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
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
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: "#042752",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 6,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  categoryBadge: {
    backgroundColor: "#F5A841",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 6,
  },
  categoryBadgeText: {
    color: "#042752",
    fontWeight: "700",
    fontSize: 12,
  },
  date: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
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