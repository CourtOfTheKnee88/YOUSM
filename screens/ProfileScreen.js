import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import ProfileHeader from "../components/ProfileHeader";
import InfoCard from "../components/InfoCard";

export default function ProfileScreen({ navigation, communities, user }) {
  const joinedCommunities = communities.filter((community) =>
    user.joinedCommunityIds.includes(community.id)
  );

  const renderRoleSection = () => {
    if (user.role === "Student") {
      return (
        <InfoCard title="Academic Information">
          <Text style={styles.infoLine}>Major: {user.major}</Text>
          <Text style={styles.infoLine}>Degree: {user.degree}</Text>
          <Text style={styles.infoLine}>
            Graduation Year: {user.gradYear}
          </Text>
        </InfoCard>
      );
    }

    if (user.role === "Faculty") {
      return (
        <InfoCard title="Faculty Information">
          <Text style={styles.infoLine}>Department: {user.department}</Text>
          <Text style={styles.infoLine}>Degree: {user.degree}</Text>
          <Text style={styles.infoLine}>Office Hours: {user.officeHours}</Text>
          <Text style={styles.infoSubheading}>Courses Teaching</Text>
          {user.coursesTeaching.map((course) => (
            <Text key={course} style={styles.bulletLine}>
              • {course}
            </Text>
          ))}
        </InfoCard>
      );
    }

    if (user.role === "Alumni") {
      return (
        <InfoCard title="Alumni Information">
          <Text style={styles.infoLine}>Degree: {user.degree}</Text>
          <Text style={styles.infoLine}>Major: {user.major}</Text>
          <Text style={styles.infoLine}>
            Alumni Class Year: {user.alumniClassYear}
          </Text>
          <Text style={styles.infoLine}>Employer: {user.employer}</Text>
          <Text style={styles.infoLine}>Job Title: {user.jobTitle}</Text>
        </InfoCard>
      );
    }

    if (user.role === "Moderator") {
      return (
        <InfoCard title="Moderator Information">
          <Text style={styles.infoLine}>
            Moderation Level: {user.moderationLevel}
          </Text>
          <Text style={styles.infoLine}>Department: {user.department}</Text>
          <Text style={styles.infoLine}>Office Hours: {user.officeHours}</Text>
          <Text style={styles.infoSubheading}>Managed Areas</Text>
          {user.managedAreas.map((area) => (
            <Text key={area} style={styles.bulletLine}>
              • {area}
            </Text>
          ))}
        </InfoCard>
      );
    }

    return null;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <ProfileHeader
        user={user}
        onEditPress={() => navigation.navigate("EditProfile")}
      />

      {renderRoleSection()}

      <InfoCard title="Interests">
        <View style={styles.tagWrap}>
          {user.interests.map((interest) => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </InfoCard>

      <InfoCard title="Joined Communities">
        {joinedCommunities.map((community) => (
          <Pressable
            key={community.id}
            style={styles.communityItem}
            onPress={() =>
              navigation.navigate("CommunityDetail", { community })
            }
          >
            <Text style={styles.communityName}>{community.name}</Text>
            <Text style={styles.communityType}>{community.type}</Text>
          </Pressable>
        ))}
      </InfoCard>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Communities")}
        >
          <Text style={styles.primaryButtonText}>Browse Communities</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Discover")}
        >
          <Text style={styles.secondaryButtonText}>Discover</Text>
        </Pressable>

        {user.role === "Moderator" && (
          <Pressable
            style={styles.moderatorButton}
            onPress={() => navigation.navigate("Moderator")}
          >
            <Text style={styles.moderatorButtonText}>Open Moderator View</Text>
          </Pressable>
        )}
      </View>
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
  infoLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 8,
  },
  infoSubheading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#042752",
    marginTop: 6,
    marginBottom: 8,
  },
  bulletLine: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 8,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    backgroundColor: "#F5A841",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagText: {
    color: "#042752",
    fontWeight: "700",
  },
  communityItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#F5A841",
  },
  communityName: {
    color: "#042752",
    fontWeight: "700",
    fontSize: 15,
  },
  communityType: {
    color: "#000000",
    marginTop: 4,
  },
  actionRow: {
    marginTop: 4,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#042752",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: "#F5A841",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#042752",
  },
  secondaryButtonText: {
    color: "#042752",
    fontWeight: "700",
    fontSize: 15,
  },
  moderatorButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#042752",
  },
  moderatorButtonText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 15,
  },
});