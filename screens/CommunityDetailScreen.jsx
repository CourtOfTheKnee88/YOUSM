import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native";
import { COLORS, SPACING } from "../theme";
import { SERVER_URL, CURRENT_USER_ID } from "../config";

export default function CommunityDetailScreen({ route }) {
  const { communityId } = route.params;
  const [community, setCommunity] = useState(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/communities/${communityId}?userId=${CURRENT_USER_ID}`);
        const data = await res.json();
        if (data.community) {
          setCommunity(data.community);
          setJoined(data.community.isMember);
        }
      } catch (error) {
        console.error("Failed to load community details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [communityId]);

  const handleJoin = async () => {
    const currentlyJoined = joined;
    try {
      const method = currentlyJoined ? 'DELETE' : 'POST';
      const url = currentlyJoined 
        ? `${SERVER_URL}/communities/${communityId}/leave/${CURRENT_USER_ID}`
        : `${SERVER_URL}/communities/${communityId}/join`;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: currentlyJoined ? null : JSON.stringify({ userId: CURRENT_USER_ID })
      });

      if (res.ok) {
        const nextJoinedStatus = !currentlyJoined;
        setJoined(nextJoinedStatus);
        
        setCommunity(prev => ({
          ...prev,
          memberCount: nextJoinedStatus ? prev.memberCount + 1 : Math.max(0, prev.memberCount - 1),
          isMember: nextJoinedStatus
        }));
        Alert.alert("Success", nextJoinedStatus ? `Joined ${community.name}!` : `Left ${community.name}`);
      } else {
        Alert.alert("Error", "Could not update membership status.");
      }
    } catch (error) {
      console.error("Error toggling join:", error);
    }
  };

  if (loading || !community) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{community.type || "CLUB"}</Text>
          </View>
          
          <Text style={styles.title}>{community.name}</Text>
          <Text style={styles.category}>{community.category}</Text>
          
          <Text style={styles.description}>
            {community.description || `Connect with students interested in ${community.name}. Explore events and find your place in the campus community.`}
          </Text>

          <Pressable 
            style={[styles.joinButton, joined && styles.joinedButton]} 
            onPress={handleJoin}
          >
            <Text style={[styles.joinButtonText, joined && styles.joinedButtonText]}>
              {joined ? "Joined Community" : "Join Community"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Community Details</Text>
          <Text style={styles.infoLine}>Members: {community.memberCount}</Text>
          <Text style={styles.infoLine}>Category: {community.category}</Text>
          <Text style={styles.infoLine}>Visibility: Public</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  typeBadge: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  typeBadgeText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.primary, marginBottom: 6 },
  category: { color: COLORS.secondary, fontWeight: "700", marginBottom: 12, fontSize: 14 },
  description: { color: "#1F2937", fontSize: 15, lineHeight: 22, marginBottom: 18 },
  joinButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  joinedButton: { backgroundColor: COLORS.secondary, borderWidth: 2, borderColor: COLORS.primary },
  joinButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  joinedButtonText: { color: COLORS.primary },
  infoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: { fontSize: 17, fontWeight: "800", color: COLORS.primary, marginBottom: 12 },
  infoLine: { fontSize: 15, color: "#4B5563", marginBottom: 8 },
});