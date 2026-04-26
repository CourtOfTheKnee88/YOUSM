import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, FlatList, Pressable, SafeAreaView, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../theme";
import { SERVER_URL } from "../config";

export default function DiscoverScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/users/search/all?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item }) => {
    const isPerson = item.resultType === 'person';
    
    return (
      <Pressable 
        style={styles.resultCard}
        onPress={() => {
          if (isPerson) {
            // Navigates to the Profile tab and passes the specific user ID
            navigation.navigate("Profile", { screen: 'ProfileHome', params: { userId: item.id } });
          } else {
            navigation.navigate("CommunityDetail", { communityId: item.id });
          }
        }}
      >
        <View style={[styles.iconCircle, !isPerson && { backgroundColor: COLORS.secondary }]}>
          <MaterialCommunityIcons 
            name={isPerson ? "account" : "account-group"} 
            size={24} 
            color={isPerson ? COLORS.surface : COLORS.primary} 
          />
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle}>{isPerson ? item.displayName : item.name}</Text>
          <Text style={styles.resultSubtitle}>
            {isPerson ? `@${item.username} • ${item.role}` : `${item.category} • ${item.memberCount} members`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Search people or communities..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => item.resultType + item.id + index}
        renderItem={renderResult}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query.trim() && !loading ? <Text style={styles.emptyText}>No results found for "{query}"</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchHeader: { padding: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 12, height: 50 },
  input: { flex: 1, fontSize: 16, color: COLORS.text },
  list: { padding: 16 },
  resultCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.surface, 
    padding: 12, 
    borderRadius: 16, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginRight: 12 },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  resultSubtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  emptyText: { textAlign: "center", marginTop: 40, color: COLORS.textLight, fontSize: 15 }
});