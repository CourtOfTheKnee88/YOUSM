import React from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Image, SafeAreaView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { COLORS, SPACING } from "../theme";
import { currentUser } from "../data/mockData"; // Assuming this file exists from Esther's branch

export default function HomeScreen({ navigation }) {
  const firstName = currentUser?.name?.split(" ")[0] || "Student";
  const isModerator = currentUser?.role === "Moderator";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.greeting}>Welcome back, {firstName}</Text>
              <Text style={styles.heroTitle}>Find your campus community</Text>
            </View>
            <View style={styles.heroLogoWrap}>
              <Image source={require("../assets/paw2.png")} style={styles.heroLogo} />
            </View>
          </View>

          <Text style={styles.heroSubtitle}>
            Discover clubs, explore people, and build your YOUSM profile in one place.
          </Text>

          <Pressable style={styles.searchMock} onPress={() => navigation.navigate("Feed")}>
            <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textLight} />
            <Text style={styles.searchMockText}>Search people, groups, and interests</Text>
            <View style={styles.searchFilterButton}>
              <MaterialCommunityIcons name="tune-variant" size={18} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        <View style={styles.featuredCard}>
          <View style={styles.featuredImageArea}>
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredBadge}>Featured</Text>
              <Text style={styles.featuredTitle}>Women in Computing</Text>
              <Text style={styles.featuredMeta}>Academic Club • 84 members</Text>
            </View>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredDescription}>
              Connect with students in tech, explore events, and find your place in the campus computing community.
            </Text>
            <View style={styles.featuredButtonRow}>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Explore Groups</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick access</Text>
        <View style={styles.quickGrid}>
          <QuickCard 
            title="Feed" 
            icon="newspaper-variant-outline" 
            onPress={() => navigation.navigate("Feed")} 
          />
          <QuickCard 
            title="Post" 
            icon="plus" 
            onPress={() => navigation.navigate("Post")} 
          />
          <QuickCard 
            title="Messages" 
            icon="message-outline" 
            onPress={() => navigation.navigate("Inbox")} 
          />
          <QuickCard 
            title="Profile" 
            icon="account-outline" 
            onPress={() => {}} 
          />
        </View>

        <StatusBar style="light" />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickCard({ title, icon, onPress }) {
  return (
    <Pressable style={styles.quickCard} onPress={onPress}>
      <View style={styles.quickIconCircle}>
        <MaterialCommunityIcons name={icon} size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.quickCardTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1 },
  scrollContent: { padding: SPACING.padding, paddingBottom: 100 },
  heroSection: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.hugeRadius,
    padding: 20,
    marginBottom: 18,
  },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  heroTextWrap: { flex: 1, paddingRight: 12 },
  greeting: { color: COLORS.textAccent, fontSize: 14, marginBottom: 4 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", lineHeight: 34 },
  heroLogoWrap: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  heroLogo: { width: 40, height: 40, resizeMode: "contain" },
  heroSubtitle: { color: COLORS.textAccent, fontSize: 15, lineHeight: 22, marginBottom: 18 },
  searchMock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  searchMockText: { flex: 1, color: COLORS.textLight, fontSize: 14, marginLeft: 8 },
  searchFilterButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  featuredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: SPACING.largeRadius,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  featuredImageArea: { height: 160, backgroundColor: "#123D7A", justifyContent: "flex-end", padding: 18 },
  featuredOverlay: { backgroundColor: "rgba(4,39,82,0.6)", borderRadius: 18, padding: 14 },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.secondary,
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  featuredTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  featuredMeta: { color: COLORS.textAccent, fontSize: 12 },
  featuredContent: { padding: 18 },
  featuredDescription: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 12, alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  sectionTitle: { color: COLORS.primary, fontSize: 21, fontWeight: "800", marginBottom: 14 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  quickIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.secondary, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  quickCardTitle: { color: COLORS.primary, fontSize: 16, fontWeight: "800" },
});

export function HeaderLogo() {
  return (
    <Image
      source={require("../assets/paw.png")}
      style={{ width: 35, height: 35 }}
      resizeMode="contain"
    />
  );
}