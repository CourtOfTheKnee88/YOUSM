import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable, SafeAreaView, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../theme";
import { SERVER_URL, CURRENT_USER_ID } from "../config";


export default function CommunitiesScreen({ navigation }) {
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        fetch(`${SERVER_URL}/communities`),
        fetch(`${SERVER_URL}/communities/user/${CURRENT_USER_ID}`)
      ]);
      
      const allData = await allRes.json();
      const myData = await myRes.json();
      
      setCommunities(allData.communities || []);
      setMyCommunities(myData.communities || []);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const myIds = new Set(myCommunities.map(c => c.id));
  const discoverCommunities = communities.filter(c => !myIds.has(c.id));

  const renderItem = ({ item }) => (
    <Pressable 
      style={styles.card} 
      onPress={() => navigation.navigate("CommunityDetail", { 
        communityId: item.id, 
        name: item.name,
        description: item.description,
        type: item.type,
        category: item.category,
        memberCount: item.memberCount
      })}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="account-group" size={30} color={COLORS.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.type} • {item.category}</Text>
        <Text style={styles.memberText}>{item.memberCount} members</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textLight} />
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.hero}>
          <Text style={styles.badge}>Communities</Text>
          <Text style={styles.title}>Find your people</Text>
          <Text style={styles.subtitle}>
            Join clubs, explore course groups, and build your campus network in one place.
          </Text>
          <Pressable style={styles.createButton} onPress={() => navigation.navigate("CreateCommunity")}>
            <Text style={styles.createButtonText}>Start a Group</Text>
          </Pressable>
        </View>

        {myCommunities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Communities</Text>
            {myCommunities.map(item => <View key={item.id}>{renderItem({ item })}</View>)}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover More</Text>
          {discoverCommunities.map(item => <View key={item.id}>{renderItem({ item })}</View>)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.padding, paddingBottom: 40 },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.secondary,
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { color: COLORS.textAccent, fontSize: 15, lineHeight: 22, marginBottom: 18 },
  createButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  createButtonText: { color: COLORS.primary, fontWeight: "800", fontSize: 15 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 21, fontWeight: "800", color: COLORS.primary, marginBottom: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "bold", color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.secondary, fontWeight: "700", marginTop: 2 },
  memberText: { fontSize: 12, color: COLORS.textLight, marginTop: 2 }
});