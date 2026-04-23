import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator
} from "react-native";
import { SERVER_URL, CURRENT_USER_ID } from "../config";
import { COLORS, SPACING } from "../theme";

export default function EditProfileScreen({ route, navigation }) {
  const { user } = route.params;

  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [pronouns, setPronouns] = useState(user.pronouns || "");
  const [bio, setBio] = useState(user.bio || "");
  const [major, setMajor] = useState(user.major || "");
  const [gradYear, setGradYear] = useState(user.gradYear || "");
  const [department, setDepartment] = useState(user.department || "");
  const [officeHours, setOfficeHours] = useState(user.officeHours || "");
  const [employer, setEmployer] = useState(user.employer || "");
  const [jobTitle, setJobTitle] = useState(user.jobTitle || "");
  const [moderationLevel, setModerationLevel] = useState(
    user.moderationLevel || ""
  );
  const [interests, setInterests] = useState(user.interests || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/users/${CURRENT_USER_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName, pronouns, bio, major, gradYear, 
          department, officeHours, employer, jobTitle, 
          moderationLevel, interests, role: user.role
        })
      });

      if (res.ok) {
        Alert.alert("Success", "Profile updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Your Profile</Text>
      <Text style={styles.subtitle}>
        Update your information and personalize your profile.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Preferred Name</Text>
        <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />

        <Text style={styles.label}>Pronouns</Text>
        <TextInput
          style={styles.input}
          value={pronouns}
          onChangeText={setPronouns}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={bio}
          onChangeText={setBio}
          multiline
        />

        {(user.role === "Student" || user.role === "Alumni") && (
          <>
            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              value={major}
              onChangeText={setMajor}
            />
          </>
        )}

        {user.role === "Student" && (
          <>
            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
              style={styles.input}
              value={gradYear}
              onChangeText={setGradYear}
            />
          </>
        )}

        {(user.role === "Faculty" || user.role === "Moderator") && (
          <>
            <Text style={styles.label}>Department</Text>
            <TextInput
              style={styles.input}
              value={department}
              onChangeText={setDepartment}
            />

            <Text style={styles.label}>Office Hours</Text>
            <TextInput
              style={styles.input}
              value={officeHours}
              onChangeText={setOfficeHours}
            />
          </>
        )}

        {user.role === "Alumni" && (
          <>
            <Text style={styles.label}>Employer</Text>
            <TextInput
              style={styles.input}
              value={employer}
              onChangeText={setEmployer}
            />

            <Text style={styles.label}>Job Title</Text>
            <TextInput
              style={styles.input}
              value={jobTitle}
              onChangeText={setJobTitle}
            />
          </>
        )}

        {user.role === "Moderator" && (
          <>
            <Text style={styles.label}>Moderation Level</Text>
            <TextInput
              style={styles.input}
              value={moderationLevel}
              onChangeText={setModerationLevel}
            />
          </>
        )}

        <Text style={styles.label}>Interests</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={interests}
          onChangeText={setInterests}
          multiline
        />
      </View>

      <Pressable style={[styles.saveButton, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.padding,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 6,
  },
  subtitle: {
    color: "#000000",
    fontSize: 15,
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: "#F5A841",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  label: {
    fontWeight: "700",
    color: "#042752",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F5A841",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#042752",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#042752",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});