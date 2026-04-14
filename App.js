import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TempScreen from "./screens/temp";
import FeedScreen from "./screens/FeedScreen";
import CreateScreen from "./screens/CreateScreen";
import CreateCommunityScreen from "./screens/CreateCommunityScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import CommunitiesScreen from "./screens/CommunitiesScreen";
import CommunityDetailScreen from "./screens/CommunityDetailScreen";
import DiscoverScreen from "./screens/DiscoverScreen";
import ModeratorScreen from "./screens/ModeratorScreen";

import { currentUser } from "./data/mockData";

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const CommunityStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const CreateStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const isModerator = currentUser.role === "Moderator";

function HeaderLogo() {
  return (
    <Image
      source={require("./assets/paw.png")}
      style={styles.headerLogo}
      resizeMode="contain"
    />
  );
}

function HomeScreen({ navigation }) {
  const firstName = currentUser.name.split(" ")[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        bounces={true}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.greeting}>Welcome back, {firstName}</Text>
              <Text style={styles.heroTitle}>Find your campus community</Text>
            </View>

            <View style={styles.heroLogoWrap}>
              <Image
                source={require("./assets/paw2.png")}
                style={styles.heroLogo}
              />
            </View>
          </View>

          <Text style={styles.heroSubtitle}>
            Discover clubs, explore people, and build your YOUSM profile in one
            place.
          </Text>

          <Pressable
            style={styles.searchMock}
            onPress={() => navigation.navigate("Discover")}
          >
            <MaterialCommunityIcons name="magnify" size={20} color="#6B7280" />
            <Text style={styles.searchMockText}>
              Search people, groups, and interests
            </Text>
            <View style={styles.searchFilterButton}>
              <MaterialCommunityIcons
                name="tune-variant"
                size={18}
                color="#FFFFFF"
              />
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
              Connect with students in tech, explore events, and find your place
              in the campus computing community.
            </Text>

            <View style={styles.featuredButtonRow}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => navigation.navigate("Communities")}
              >
                <Text style={styles.primaryButtonText}>Explore Groups</Text>
              </Pressable>

              <Pressable
                style={styles.iconActionButton}
                onPress={() => navigation.navigate("Discover")}
              >
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="#042752"
                />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick access</Text>
          <Text style={styles.sectionLink}>YOUSM</Text>
        </View>

        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickCard}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={styles.quickIconCircle}>
              <MaterialCommunityIcons
                name="account-outline"
                size={28}
                color="#042752"
              />
            </View>
            <Text style={styles.quickCardTitle}>Profile</Text>
            <Text style={styles.quickCardText}>View your role-based profile</Text>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => navigation.navigate("Feed")}
          >
            <View style={styles.quickIconCircle}>
              <MaterialCommunityIcons
                name="newspaper-variant-outline"
                size={28}
                color="#042752"
              />
            </View>
            <Text style={styles.quickCardTitle}>Feed</Text>
            <Text style={styles.quickCardText}>Open the social feed area</Text>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => navigation.navigate("Communities")}
          >
            <View style={styles.quickIconCircle}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={28}
                color="#042752"
              />
            </View>
            <Text style={styles.quickCardTitle}>Communities</Text>
            <Text style={styles.quickCardText}>Join courses, clubs, and groups</Text>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => navigation.navigate("Create")}
          >
            <View style={styles.quickIconCircle}>
              <MaterialCommunityIcons name="plus" size={28} color="#042752" />
            </View>
            <Text style={styles.quickCardTitle}>Create</Text>
            <Text style={styles.quickCardText}>Future posting and media tools</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>For you</Text>
          <Text style={styles.sectionLink}>Campus</Text>
        </View>

        <View style={styles.recommendationCard}>
          <View style={styles.recommendationIcon}>
            <MaterialCommunityIcons
              name="school-outline"
              size={28}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.recommendationTextWrap}>
            <Text style={styles.recommendationTitle}>Build your student network</Text>
            <Text style={styles.recommendationText}>
              Explore classmates, faculty, alumni, and communities tailored to
              your academic interests.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>More tools</Text>
          <Text style={styles.sectionLink}>Demo</Text>
        </View>

        <View style={styles.extraCardsWrap}>
          <Pressable
            style={styles.extraCard}
            onPress={() => navigation.navigate("Communities")}
          >
            <MaterialCommunityIcons
              name="star-four-points-outline"
              size={24}
              color="#042752"
            />
            <Text style={styles.extraCardTitle}>Featured groups</Text>
            <Text style={styles.extraCardText}>
              Browse clubs and course communities curated for students.
            </Text>
          </Pressable>

          <Pressable
            style={styles.extraCard}
            onPress={() => navigation.navigate("Discover")}
          >
            <MaterialCommunityIcons
              name="map-search-outline"
              size={24}
              color="#042752"
            />
            <Text style={styles.extraCardTitle}>Discovery tools</Text>
            <Text style={styles.extraCardText}>
              Search by people, communities, and interests.
            </Text>
          </Pressable>
        </View>

        {isModerator && (
          <Pressable
            style={styles.bottomAction}
            onPress={() => navigation.navigate("Moderator")}
          >
            <MaterialCommunityIcons
              name="shield-account-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.bottomActionText}>Open Moderator View</Text>
          </Pressable>
        )}

        <StatusBar style="light" />
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
        }}
      />
      <HomeStack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: "Discover" }}
      />
      {isModerator && (
        <HomeStack.Screen
          name="Moderator"
          component={ModeratorScreen}
          options={{ title: "Moderator" }}
        />
      )}
    </HomeStack.Navigator>
  );
}

function CreateStackNavigator() {
  return (
    <CreateStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
      }}
    >
      <CreateStack.Screen
        name="CreateMain"
        component={CreateScreen}
        options={{ title: "Create" }}
      />
      <CreateStack.Screen
        name="CreateCommunity"
        component={CreateCommunityScreen}
        options={{ title: "Create Community" }}
      />
    </CreateStack.Navigator>
  );
}

function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
      }}
    >
      <CommunityStack.Screen
        name="CommunitiesMain"
        component={CommunitiesScreen}
        options={{ title: "Communities" }}
      />
      <CommunityStack.Screen
        name="CreateCommunity"
        component={CreateCommunityScreen}
        options={{ title: "Create Community" }}
      />
      <CommunityStack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={{ title: "Community Details" }}
      />
    </CommunityStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      {isModerator && (
        <ProfileStack.Screen
          name="Moderator"
          component={ModeratorScreen}
          options={{ title: "Moderator" }}
        />
      )}
      <ProfileStack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={{ title: "Community Details" }}
      />
      <ProfileStack.Screen
        name="Communities"
        component={CommunitiesScreen}
        options={{ title: "Communities" }}
      />
      <ProfileStack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: "Discover" }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#042752",
        tabBarInactiveTintColor: "#7A8596",
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarIcon: ({ color, focused, size }) => {
          let iconName = "circle-outline";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Feed") {
            iconName = focused
              ? "newspaper-variant"
              : "newspaper-variant-outline";
          } else if (route.name === "Create") {
            iconName = "plus";
          } else if (route.name === "Communities") {
            iconName = focused
              ? "account-group"
              : "account-group-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline";
          }

          const customSize = route.name === "Create" ? 30 : size;

          if (route.name === "Create") {
            return (
              <View style={styles.createTabCircle}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={customSize}
                  color="#042752"
                />
              </View>
            );
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={customSize}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Create" component={CreateStackNavigator} />
      <Tab.Screen name="Communities" component={CommunityStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen name="Temp" component={TempScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 90,
  },
  headerLogo: {
    width: 42,
    height: 42,
  },
  heroSection: {
    backgroundColor: "#042752",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    color: "#D7E4FF",
    fontSize: 14,
    marginBottom: 4,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  heroLogoWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogo: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  heroSubtitle: {
    color: "#D7E4FF",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  searchMock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  searchMockText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 14,
    marginLeft: 8,
  },
  searchFilterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#042752",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featuredImageArea: {
    height: 200,
    backgroundColor: "#123D7A",
    justifyContent: "flex-end",
    padding: 18,
  },
  featuredOverlay: {
    backgroundColor: "rgba(4,39,82,0.55)",
    borderRadius: 18,
    padding: 14,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5A841",
    color: "#042752",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  featuredMeta: {
    color: "#E8EEF9",
    fontSize: 13,
  },
  featuredContent: {
    padding: 18,
  },
  featuredDescription: {
    color: "#1F2937",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  featuredButtonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#042752",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  iconActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#042752",
    fontSize: 21,
    fontWeight: "800",
  },
  sectionLink: {
    color: "#F5A841",
    fontWeight: "700",
    fontSize: 14,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  quickIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  quickCardTitle: {
    color: "#042752",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  quickCardText: {
    color: "#374151",
    fontSize: 13,
    lineHeight: 19,
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  recommendationIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#042752",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  recommendationTextWrap: {
    flex: 1,
  },
  recommendationTitle: {
    color: "#042752",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  recommendationText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 21,
  },
  extraCardsWrap: {
    marginBottom: 20,
  },
  extraCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  extraCardTitle: {
    color: "#042752",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 6,
  },
  extraCardText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
  },
  bottomAction: {
    backgroundColor: "#042752",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  bottomActionText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 8,
  },
  createTabCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
});