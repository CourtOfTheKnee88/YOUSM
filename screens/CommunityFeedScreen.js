import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const sampleCommunityPosts = {
  c1: [
    {
      id: "c1p1",
      author: "Women in Computing Admin",
      time: "2h ago",
      content:
        "Reminder: our mentorship mixer is this Friday at 5 PM in the CS lounge. Bring a friend!",
      likes: 24,
      comments: 6,
      type: "Community Update",
      title: "",
    },
    {
      id: "c1p2",
      author: "Ava R.",
      time: "1d ago",
      content:
        "Just wanted to say thank you to everyone who came to the resume workshop. The feedback was super helpful.",
      likes: 18,
      comments: 4,
      type: "Post",
      title: "",
    },
  ],
  c2: [
    {
      id: "c2p1",
      author: "Software Engineering Instructor",
      time: "3h ago",
      content:
        "Project milestone 2 is due Sunday night. Please make sure your branch is pushed before submission.",
      likes: 15,
      comments: 8,
      type: "Academic Update",
      title: "",
    },
    {
      id: "c2p2",
      author: "Jordan L.",
      time: "9h ago",
      content:
        "Anyone want to review user stories together before class tomorrow?",
      likes: 9,
      comments: 5,
      type: "Post",
      title: "",
    },
  ],
  c3: [
    {
      id: "c3p1",
      author: "Cybersecurity Society",
      time: "5h ago",
      content:
        "CTF practice tonight at 7 PM. We’ll be walking through beginner web exploitation challenges.",
      likes: 31,
      comments: 10,
      type: "Community Update",
      title: "",
    },
  ],
};

const canPostCommunityAnnouncement = (user, community) => {
  return (
    user.role === "Moderator" ||
    user.id === community.adminId ||
    (community.moderators || []).includes(user.id)
  );
};

export default function CommunityFeedScreen({
  route,
  navigation,
  user,
  communityAnnouncements,
}) {
  const { community } = route.params;

  const joined = user.joinedCommunityIds.includes(community.id);
  const customAnnouncements = communityAnnouncements?.[community.id] || [];
  const defaultPosts = sampleCommunityPosts[community.id] || [
    {
      id: "default1",
      author: `${community.name} Admin`,
      time: "Just now",
      content:
        "Welcome to the community feed. Posts, updates, and discussions will appear here.",
      likes: 0,
      comments: 0,
      type: "Community Update",
      title: "",
    },
  ];

  const posts = [...customAnnouncements, ...defaultPosts];
  const canPost = canPostCommunityAnnouncement(user, community);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{community.type}</Text>
          </View>

          <Pressable
            style={styles.infoButton}
            onPress={() => navigation.navigate("CommunityDetail", { community })}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#042752"
            />
          </Pressable>
        </View>

        <Text style={styles.name}>{community.name}</Text>
        <Text style={styles.category}>{community.category}</Text>
        <Text style={styles.description}>{community.description}</Text>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{community.members}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{joined ? "Yes" : "No"}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
      </View>

      {canPost && (
        <Pressable
          style={styles.createPostButton}
          onPress={() =>
            navigation.navigate("CreateCommunityAnnouncement", { community })
          }
        >
          <Text style={styles.createPostButtonText}>
            Post Community Announcement
          </Text>
        </Pressable>
      )}

      {!canPost && (
        <View style={styles.infoNotice}>
          <Text style={styles.infoNoticeText}>
            Community announcements can be posted by that community’s admin,
            approved moderators, or platform moderators.
          </Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Feed</Text>
        <Text style={styles.sectionSubtitle}>
          Updates, posts, and conversations from this group.
        </Text>
      </View>

      {posts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {post.author
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </Text>
            </View>

            <View style={styles.postHeaderText}>
              <Text style={styles.postAuthor}>{post.author}</Text>
              <Text style={styles.postTime}>{post.time}</Text>
            </View>

            <View style={styles.postTypeBadge}>
              <Text style={styles.postTypeBadgeText}>{post.type}</Text>
            </View>
          </View>

          {!!post.title && (
            <Text style={styles.postTitle}>{post.title}</Text>
          )}

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.postActions}>
            <View style={styles.actionItem}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={18}
                color="#042752"
              />
              <Text style={styles.actionText}>{post.likes}</Text>
            </View>

            <View style={styles.actionItem}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={18}
                color="#042752"
              />
              <Text style={styles.actionText}>{post.comments}</Text>
            </View>

            <View style={styles.actionItem}>
              <MaterialCommunityIcons
                name="share-outline"
                size={18}
                color="#042752"
              />
              <Text style={styles.actionText}>Share</Text>
            </View>
          </View>
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
    marginBottom: 18,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5A841",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 12,
  },
  infoButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: {
    color: "#FFFFFF",
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
    color: "#D7E4FF",
    lineHeight: 22,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  statNumber: {
    color: "#042752",
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  createPostButton: {
    backgroundColor: "#F5A841",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#042752",
  },
  createPostButtonText: {
    color: "#042752",
    fontWeight: "800",
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
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#042752",
    fontSize: 22,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#374151",
    marginTop: 4,
    lineHeight: 20,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#F5A841",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 16,
  },
  postHeaderText: {
    flex: 1,
  },
  postAuthor: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 15,
  },
  postTime: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  postTypeBadge: {
    backgroundColor: "#042752",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  postTypeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },
  postTitle: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 17,
    marginBottom: 8,
  },
  postContent: {
    color: "#000000",
    lineHeight: 22,
    marginBottom: 14,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: "#042752",
    fontWeight: "700",
    marginLeft: 6,
  },
});