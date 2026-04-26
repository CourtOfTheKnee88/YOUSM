import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { SERVER_URL } from "../config";
import { COLORS, SPACING } from "../theme";
import { useAuth } from "../navigation";

export default function EditProfileScreen({ route, navigation }) {
  const { userId } = useAuth();
  const { user } = route.params;

  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [pronouns, setPronouns] = useState(user.pronouns || "");
  const [bio, setBio] = useState(user.bio || "");
  const [major, setMajor] = useState(user.major || "");
  const [gradYear, setGradYear] = useState(user.gradYear || "");
  const [degree, setDegree] = useState(user.degree || "");
  const [department, setDepartment] = useState(user.department || "");
  const [officeHours, setOfficeHours] = useState(user.officeHours || "");
  const [employer, setEmployer] = useState(user.employer || "");
  const [jobTitle, setJobTitle] = useState(user.jobTitle || "");
  const [moderationLevel, setModerationLevel] = useState(
    user.moderationLevel || ""
  );
  const [interests, setInterests] = useState(user.interests || "");
  const [isPrivate, setIsPrivate] = useState(
    user.isPrivate === 1 || user.isPrivate === true
  );
  const [profileImage, setProfileImage] = useState(user.profileImage || null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${SERVER_URL}${imagePath}`;
  };

  const pickProfileImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow photo access to choose a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Could not choose profile picture.");
    }
  };

  const uploadProfileImage = async () => {
    if (!selectedImage || !userId) return profileImage;

    const formData = new FormData();

    const localUri = selectedImage.uri;
    const filename = localUri.split("/").pop() || "profile.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1] : "jpg";

    formData.append("profileImage", {
      uri: localUri,
      name: filename,
      type: `image/${ext}`,
    });

    const res = await fetch(`${SERVER_URL}/users/${userId}/profile-image`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to upload profile picture");
    }

    setProfileImage(data.profileImage);
    setSelectedImage(null);

    return data.profileImage;
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Error", "User session not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const uploadedImage = await uploadProfileImage();

      const res = await fetch(`${SERVER_URL}/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          pronouns,
          bio,
          major,
          gradYear,
          degree,
          department,
          officeHours,
          employer,
          jobTitle,
          moderationLevel,
          interests,
          role: user.role,
          isPrivate: isPrivate ? 1 : 0,
          profileImage: uploadedImage || profileImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Error", error.message || "Network request failed.");
    } finally {
      setLoading(false);
    }
  };

  const previewImageUri = selectedImage
    ? selectedImage.uri
    : getFullImageUrl(profileImage);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Your Profile</Text>
      <Text style={styles.subtitle}>
        Update your information, privacy, and profile picture.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile Picture</Text>

        <View style={styles.imageSection}>
          <View style={styles.avatarCircle}>
            {previewImageUri ? (
              <Image source={{ uri: previewImageUri }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarInitial}>
                {(displayName || user.username || "U").charAt(0)}
              </Text>
            )}
          </View>

          <Pressable
            style={styles.imageButton}
            onPress={pickProfileImage}
            disabled={loading}
          >
            <Ionicons name="image" size={20} color="#FFFFFF" />
            <Text style={styles.imageButtonText}>Choose from Gallery</Text>
          </Pressable>
        </View>

        <View style={styles.privacyBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Private Account</Text>
            <Text style={styles.privacyText}>
              Private accounts require approval before someone can follow you
              and see your posts.
            </Text>
          </View>

          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            disabled={loading}
          />
        </View>

        <Text style={styles.label}>Preferred Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          editable={!loading}
        />

        <Text style={styles.label}>Pronouns</Text>
        <TextInput
          style={styles.input}
          value={pronouns}
          onChangeText={setPronouns}
          editable={!loading}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={bio}
          onChangeText={setBio}
          multiline
          editable={!loading}
          placeholder="Tell people a little about yourself..."
          placeholderTextColor={COLORS.textLight}
        />

        {(user.role === "Student" || user.role === "Alumni") && (
          <>
            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              value={major}
              onChangeText={setMajor}
              editable={!loading}
            />
          </>
        )}

        {(user.role === "Student" ||
          user.role === "Faculty" ||
          user.role === "Alumni") && (
          <>
            <Text style={styles.label}>Degree</Text>
            <TextInput
              style={styles.input}
              value={degree}
              onChangeText={setDegree}
              editable={!loading}
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
              editable={!loading}
              keyboardType="numeric"
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
              editable={!loading}
            />

            <Text style={styles.label}>Office Hours</Text>
            <TextInput
              style={styles.input}
              value={officeHours}
              onChangeText={setOfficeHours}
              editable={!loading}
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
              editable={!loading}
            />

            <Text style={styles.label}>Job Title</Text>
            <TextInput
              style={styles.input}
              value={jobTitle}
              onChangeText={setJobTitle}
              editable={!loading}
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
              editable={!loading}
            />
          </>
        )}

        <Text style={styles.label}>Interests</Text>
        <TextInput
          style={styles.input}
          value={interests}
          onChangeText={setInterests}
          editable={!loading}
          placeholder="Example: coding, hiking, gaming"
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      <Pressable
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
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
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 18,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 12,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  imageButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  privacyBox: {
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  privacyTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  privacyText: {
    color: COLORS.textLight,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
});