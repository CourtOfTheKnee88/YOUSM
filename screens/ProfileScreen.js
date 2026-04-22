import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import ProfileHeader from "../components/ProfileHeader";
import InfoCard from "../components/InfoCard";
import { currentUser, communities } from "../data/mockData";

export default function ProfileScreen({ navigation }) {
  const joinedCommunities = communities.filter((community) =>
    currentUser.joinedCommunityIds.includes(community.id)
  );

  const renderRoleSection = () => {
    if (currentUser.role === "Student") {
      return (
        <InfoCard title="Academic Information">
          <Text style={styles.infoLine}>Major: {currentUser.major}</Text>
          <Text style={styles.infoLine}>Degree: {currentUser.degree}</Text>
          <Text style={styles.infoLine}>
            Graduation Year: {currentUser.gradYear}
          </Text>
        </InfoCard>
      );
    }

    if (currentUser.role === "Faculty") {
      return (
        <InfoCard title="Faculty Information">
          <Text style={styles.infoLine}>Department: {currentUser.department}</Text>
          <Text style={styles.infoLine}>Degree: {currentUser.degree}</Text>
          <Text style={styles.infoLine}>Office Hours: {currentUser.officeHours}</Text>
          <Text style={styles.infoSubheading}>Courses Teaching</Text>
          {currentUser.coursesTeaching.map((course) => (
            <Text key={course} style={styles.bulletLine}>
              • {course}
            </Text>
          ))}
        </InfoCard>
      );
    }

    if (currentUser.role === "Alumni") {
      return (
        <InfoCard title="Alumni Information">
          <Text style={styles.infoLine}>Degree: {currentUser.degree}</Text>
          <Text style={styles.infoLine}>Major: {currentUser.major}</Text>
          <Text style={styles.infoLine}>
            Alumni Class Year: {currentUser.alumniClassYear}
          </Text>
          <Text style={styles.infoLine}>Employer: {currentUser.employer}</Text>
          <Text style={styles.infoLine}>Job Title: {currentUser.jobTitle}</Text>
        </InfoCard>
      );
    }

    if (currentUser.role === "Moderator") {
      return (
        <InfoCard title="Moderator Information">
          <Text style={styles.infoLine}>
            Moderation Level: {currentUser.moderationLevel}
          </Text>
          <Text style={styles.infoLine}>Department: {currentUser.department}</Text>
          <Text style={styles.infoLine}>Office Hours: {currentUser.officeHours}</Text>
          <Text style={styles.infoSubheading}>Managed Areas</Text>
          {currentUser.managedAreas.map((area) => (
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
        user={currentUser}
        onEditPress={() => navigation.navigate("EditProfile")}
      />

      {renderRoleSection()}

      <InfoCard title="Interests">
        <View style={styles.tagWrap}>
          {currentUser.interests.map((interest) => (
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

        {currentUser.role === "Moderator" && (
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