import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import SearchBar from "../components/SearchBar";
import FilterChip from "../components/FilterChip";
import { communities, people } from "../data/mockData";

export default function DiscoverScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchesQuery =
        person.name.toLowerCase().includes(query.toLowerCase()) ||
        person.subtitle.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || person.role === activeFilter;

      return matchesQuery && matchesFilter;
    });
  }, [query, activeFilter]);

  const filteredCommunities = useMemo(() => {
    return communities.filter((community) => {
      return (
        community.name.toLowerCase().includes(query.toLowerCase()) ||
        community.description.toLowerCase().includes(query.toLowerCase()) ||
        community.category.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [query]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>
        Search for people, clubs, courses, and campus communities.
      </Text>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search people or communities..."
      />

      <View style={styles.filterRow}>
        <FilterChip
          label="All"
          active={activeFilter === "All"}
          onPress={() => setActiveFilter("All")}
        />
        <FilterChip
          label="Student"
          active={activeFilter === "Student"}
          onPress={() => setActiveFilter("Student")}
        />
        <FilterChip
          label="Faculty"
          active={activeFilter === "Faculty"}
          onPress={() => setActiveFilter("Faculty")}
        />
        <FilterChip
          label="Alumni"
          active={activeFilter === "Alumni"}
          onPress={() => setActiveFilter("Alumni")}
        />
      </View>

      <Text style={styles.sectionTitle}>People</Text>
      {filteredPeople.map((person) => (
        <View key={person.id} style={styles.personCard}>
          <View style={styles.personAvatar}>
            <Text style={styles.personAvatarText}>
              {person.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personRole}>{person.role}</Text>
            <Text style={styles.personSubtitle}>{person.subtitle}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Communities</Text>
      {filteredCommunities.map((community) => (
        <Pressable
          key={community.id}
          style={styles.communityCard}
          onPress={() => navigation.navigate("CommunityDetail", { community })}
        >
          <Text style={styles.communityName}>{community.name}</Text>
          <Text style={styles.communityMeta}>
            {community.type} • {community.category}
          </Text>
          <Text style={styles.communityDescription}>{community.description}</Text>
        </Pressable>
      ))}
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#042752",
    marginTop: 8,
    marginBottom: 12,
  },
  personCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F5A841",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  personAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#042752",
  },
  personAvatarText: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 18,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#042752",
  },
  personRole: {
    color: "#F5A841",
    fontWeight: "700",
    marginTop: 2,
  },
  personSubtitle: {
    color: "#000000",
    marginTop: 2,
  },
  communityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F5A841",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  communityName: {
    color: "#042752",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  communityMeta: {
    color: "#F5A841",
    fontWeight: "700",
    marginBottom: 8,
  },
  communityDescription: {
    color: "#000000",
    lineHeight: 20,
  },
});