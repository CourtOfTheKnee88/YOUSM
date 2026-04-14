import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { currentUser } from "../data/mockData";

export default function EditProfileScreen() {
  const [name, setName] = useState(currentUser.name);
  const [pronouns, setPronouns] = useState(currentUser.pronouns);
  const [bio, setBio] = useState(currentUser.bio);
  const [major, setMajor] = useState(currentUser.major || "");
  const [gradYear, setGradYear] = useState(currentUser.gradYear || "");
  const [department, setDepartment] = useState(currentUser.department || "");
  const [officeHours, setOfficeHours] = useState(currentUser.officeHours || "");
  const [employer, setEmployer] = useState(currentUser.employer || "");
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle || "");
  const [moderationLevel, setModerationLevel] = useState(
    currentUser.moderationLevel || ""
  );
  const [interests, setInterests] = useState(currentUser.interests.join(", "));

  const handleSave = () => {
    Alert.alert("Profile Saved", "Your profile changes were saved locally.");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Your Profile</Text>
      <Text style={styles.subtitle}>
        Update your information and personalize your profile.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Preferred Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

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

        {(currentUser.role === "Student" || currentUser.role === "Alumni") && (
          <>
            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              value={major}
              onChangeText={setMajor}
            />
          </>
        )}

        {currentUser.role === "Student" && (
          <>
            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
              style={styles.input}
              value={gradYear}
              onChangeText={setGradYear}
            />
          </>
        )}

        {(currentUser.role === "Faculty" || currentUser.role === "Moderator") && (
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

        {currentUser.role === "Alumni" && (
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

        {currentUser.role === "Moderator" && (
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

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </Pressable>
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#042752",
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