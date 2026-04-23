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
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import FeedScreen from "./screens/FeedScreen";
import CreateScreen from "./screens/CreateScreen";
import CreateCommunityScreen from "./screens/CreateCommunityScreen";
import CreateCommunityAnnouncementScreen from "./screens/CreateCommunityAnnouncementScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import CommunitiesScreen from "./screens/CommunitiesScreen";
import CommunityDetailScreen from "./screens/CommunityDetailScreen";
import CommunityFeedScreen from "./screens/CommunityFeedScreen";
import DiscoverScreen from "./screens/DiscoverScreen";
import ModeratorScreen from "./screens/ModeratorScreen";
import MessagesScreen from "./screens/MessagesScreen";
import AnnouncementsScreen from "./screens/AnnouncementsScreen";

import {
  currentUser,
  communities as initialCommunities,
} from "./data/mockData";

const HomeStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const CommunityStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const CreateStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HeaderLogo() {
  return (
    <Image
      source={require("./assets/paw.png")}
      style={styles.headerLogo}
      resizeMode="contain"
    />
  );
}

function HeaderMessagesButton({ navigation }) {
  return (
    <Pressable
      onPress={() => navigation.navigate("Messages")}
      style={styles.headerMessageButton}
    >
      <MaterialCommunityIcons name="message-text-outline" size={22} color="#FFFFFF" />
    </Pressable>
  );
}

function HomeScreen({ navigation, user }) {
  const firstName = user.name.split(" ")[0];
  const isModerator = user.role === "Moderator";

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

        <Pressable
          style={styles.announcementCard}
          onPress={() => navigation.navigate("Announcements")}
        >
          <View style={styles.announcementIconWrap}>
            <MaterialCommunityIcons
              name="bullhorn-outline"
              size={24}
              color="#042752"
            />
          </View>

          <View style={styles.announcementTextWrap}>
            <Text style={styles.announcementEyebrow}>Campus Announcements</Text>
            <Text style={styles.announcementTitle}>
              Library hours extended during finals week
            </Text>
            <Text style={styles.announcementText}>
              Tap to view all campus announcements, updates, and upcoming notices.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color="#042752"
          />
        </Pressable>

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

function HomeStackNavigator({
  communities,
  user,
  setUser,
  communityAnnouncements,
  setCommunityAnnouncements,
}) {
  const isModerator = user.role === "Moderator";

  return (
    <HomeStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
        headerRight: () => <HeaderMessagesButton navigation={navigation} />,
      })}
    >
      <HomeStack.Screen
        name="HomeMain"
        options={{
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
        }}
      >
        {(props) => <HomeScreen {...props} user={user} />}
      </HomeStack.Screen>

      <HomeStack.Screen name="Discover">
        {(props) => <DiscoverScreen {...props} communities={communities} />}
      </HomeStack.Screen>

      <HomeStack.Screen name="Announcements" options={{ title: "Announcements" }}>
        {(props) => <AnnouncementsScreen {...props} user={user} />}
      </HomeStack.Screen>

      {isModerator && (
        <HomeStack.Screen
          name="Moderator"
          component={ModeratorScreen}
          options={{ title: "Moderator" }}
        />
      )}

      <HomeStack.Screen name="CommunityDetail" options={{ title: "Community Details" }}>
        {(props) => (
          <CommunityDetailScreen {...props} user={user} setUser={setUser} />
        )}
      </HomeStack.Screen>

      <HomeStack.Screen name="CommunityFeed" options={{ title: "Community Feed" }}>
        {(props) => (
          <CommunityFeedScreen
            {...props}
            user={user}
            communityAnnouncements={communityAnnouncements}
          />
        )}
      </HomeStack.Screen>

      <HomeStack.Screen
        name="CreateCommunityAnnouncement"
        options={{ title: "Post Announcement" }}
      >
        {(props) => (
          <CreateCommunityAnnouncementScreen
            {...props}
            user={user}
            communityAnnouncements={communityAnnouncements}
            setCommunityAnnouncements={setCommunityAnnouncements}
          />
        )}
      </HomeStack.Screen>

      <HomeStack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: "Messages" }}
      />
    </HomeStack.Navigator>
  );
}

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
        headerRight: () => <HeaderMessagesButton navigation={navigation} />,
      })}
    >
      <FeedStack.Screen
        name="FeedMain"
        component={FeedScreen}
        options={{ title: "Feed" }}
      />

      <FeedStack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: "Messages" }}
      />
    </FeedStack.Navigator>
  );
}

function CreateStackNavigator({ communities, setCommunities, user, setUser }) {
  return (
    <CreateStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
        headerRight: () => <HeaderMessagesButton navigation={navigation} />,
      })}
    >
      <CreateStack.Screen
        name="CreateMain"
        component={CreateScreen}
        options={{ title: "Create" }}
      />

      <CreateStack.Screen name="CreateCommunity" options={{ title: "Create Community" }}>
        {(props) => (
          <CreateCommunityScreen
            {...props}
            communities={communities}
            setCommunities={setCommunities}
            user={user}
            setUser={setUser}
          />
        )}
      </CreateStack.Screen>

      <CreateStack.Screen name="Announcements" options={{ title: "Announcements" }}>
        {(props) => <AnnouncementsScreen {...props} user={user} />}
      </CreateStack.Screen>

      <CreateStack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: "Messages" }}
      />
    </CreateStack.Navigator>
  );
}

function CommunityStackNavigator({
  communities,
  setCommunities,
  user,
  setUser,
  communityAnnouncements,
  setCommunityAnnouncements,
}) {
  return (
    <CommunityStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
        headerRight: () => <HeaderMessagesButton navigation={navigation} />,
      })}
    >
      <CommunityStack.Screen name="CommunitiesMain" options={{ title: "Communities" }}>
        {(props) => (
          <CommunitiesScreen
            {...props}
            communities={communities}
            user={user}
            setUser={setUser}
          />
        )}
      </CommunityStack.Screen>

      <CommunityStack.Screen name="CreateCommunity" options={{ title: "Create Community" }}>
        {(props) => (
          <CreateCommunityScreen
            {...props}
            communities={communities}
            setCommunities={setCommunities}
            user={user}
            setUser={setUser}
          />
        )}
      </CommunityStack.Screen>

      <CommunityStack.Screen name="CommunityDetail" options={{ title: "Community Details" }}>
        {(props) => (
          <CommunityDetailScreen {...props} user={user} setUser={setUser} />
        )}
      </CommunityStack.Screen>

      <CommunityStack.Screen name="CommunityFeed" options={{ title: "Community Feed" }}>
        {(props) => (
          <CommunityFeedScreen
            {...props}
            user={user}
            communityAnnouncements={communityAnnouncements}
          />
        )}
      </CommunityStack.Screen>

      <CommunityStack.Screen
        name="CreateCommunityAnnouncement"
        options={{ title: "Post Announcement" }}
      >
        {(props) => (
          <CreateCommunityAnnouncementScreen
            {...props}
            user={user}
            communityAnnouncements={communityAnnouncements}
            setCommunityAnnouncements={setCommunityAnnouncements}
          />
        )}
      </CommunityStack.Screen>

      <CommunityStack.Screen name="Announcements" options={{ title: "Announcements" }}>
        {(props) => <AnnouncementsScreen {...props} user={user} />}
      </CommunityStack.Screen>

      <CommunityStack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: "Messages" }}
      />
    </CommunityStack.Navigator>
  );
}

function ProfileStackNavigator({
  communities,
  user,
  setUser,
  communityAnnouncements,
  setCommunityAnnouncements,
}) {
  const isModerator = user.role === "Moderator";

  return (
    <ProfileStack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: "#042752" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F7F9FC" },
        headerRight: () => <HeaderMessagesButton navigation={navigation} />,
      })}
    >
      <ProfileStack.Screen name="ProfileMain" options={{ title: "Profile" }}>
        {(props) => (
          <ProfileScreen {...props} communities={communities} user={user} />
        )}
      </ProfileStack.Screen>

      <ProfileStack.Screen name="EditProfile" options={{ title: "Edit Profile" }}>
        {(props) => (
          <EditProfileScreen {...props} user={user} setUser={setUser} />
        )}
      </ProfileStack.Screen>

      {isModerator && (
        <ProfileStack.Screen
          name="Moderator"
          component={ModeratorScreen}
          options={{ title: "Moderator" }}
        />
      )}

      <ProfileStack.Screen name="CommunityDetail" options={{ title: "Community Details" }}>
        {(props) => (
          <CommunityDetailScreen {...props} user={user} setUser={setUser} />
        )}
      </ProfileStack.Screen>

      <ProfileStack.Screen name="CommunityFeed" options={{ title: "Community Feed" }}>
        {(props) => (
          <CommunityFeedScreen
            {...props}
            user={user}
            communityAnnouncements={communityAnnouncements}
          />
        )}
      </ProfileStack.Screen>

      <ProfileStack.Screen
        name="CreateCommunityAnnouncement"
        options={{ title: "Post Announcement" }}
      >
        {(props) => (
          <CreateCommunityAnnouncementScreen
            {...props}
            user={user}
            communityAnnouncements={communityAnnouncements}
            setCommunityAnnouncements={setCommunityAnnouncements}
          />
        )}
      </ProfileStack.Screen>

      <ProfileStack.Screen name="Communities" options={{ title: "Communities" }}>
        {(props) => (
          <CommunitiesScreen
            {...props}
            communities={communities}
            user={user}
            setUser={setUser}
          />
        )}
      </ProfileStack.Screen>

      <ProfileStack.Screen name="Discover" options={{ title: "Discover" }}>
        {(props) => <DiscoverScreen {...props} communities={communities} />}
      </ProfileStack.Screen>

      <ProfileStack.Screen name="Announcements" options={{ title: "Announcements" }}>
        {(props) => <AnnouncementsScreen {...props} user={user} />}
      </ProfileStack.Screen>

      <ProfileStack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: "Messages" }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabs({
  communities,
  setCommunities,
  user,
  setUser,
  communityAnnouncements,
  setCommunityAnnouncements,
}) {
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
          } else if (route.name === "Communities") {
            iconName = focused ? "account-group" : "account-group-outline";
          } else if (route.name === "Create") {
            iconName = focused ? "plus-box" : "plus-box-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" options={{ title: "Home" }}>
        {(props) => (
          <HomeStackNavigator
            {...props}
            communities={communities}
            user={user}
            setUser={setUser}
            communityAnnouncements={communityAnnouncements}
            setCommunityAnnouncements={setCommunityAnnouncements}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Feed" options={{ title: "Feed" }}>
        {(props) => <FeedStackNavigator {...props} />}
      </Tab.Screen>

      <Tab.Screen name="Communities" options={{ title: "Communities" }}>
        {(props) => (
          <CommunityStackNavigator
            {...props}
            communities={communities}
            setCommunities={setCommunities}
            user={user}
            setUser={setUser}
            communityAnnouncements={communityAnnouncements}
            setCommunityAnnouncements={setCommunityAnnouncements}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Create" options={{ title: "Create" }}>
        {(props) => (
          <CreateStackNavigator
            {...props}
            communities={communities}
            setCommunities={setCommunities}
            user={user}
            setUser={setUser}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile" options={{ title: "Profile" }}>
        {(props) => (
          <ProfileStackNavigator
            {...props}
            communities={communities}
            user={user}
            setUser={setUser}
            communityAnnouncements={communityAnnouncements}
            setCommunityAnnouncements={setCommunityAnnouncements}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [communities, setCommunities] = useState(initialCommunities);
  const [user, setUser] = useState(currentUser);
  const [communityAnnouncements, setCommunityAnnouncements] = useState({});

  return (
    <NavigationContainer>
      <MainTabs
        communities={communities}
        setCommunities={setCommunities}
        user={user}
        setUser={setUser}
        communityAnnouncements={communityAnnouncements}
        setCommunityAnnouncements={setCommunityAnnouncements}
      />
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
    padding: 16,
    paddingBottom: 30,
  },
  headerLogo: {
    width: 42,
    height: 42,
  },
  headerMessageButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 20,
  },
  heroSection: {
    backgroundColor: "#042752",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    color: "#F5A841",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  heroLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  heroSubtitle: {
    color: "#D7E4FF",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    marginBottom: 18,
  },
  searchMock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  searchMockText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 14,
    marginLeft: 10,
  },
  searchFilterButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#042752",
    alignItems: "center",
    justifyContent: "center",
  },
  announcementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#F5A841",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  announcementIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  announcementTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  announcementEyebrow: {
    color: "#042752",
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  announcementTitle: {
    color: "#042752",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  announcementText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
  },
  featuredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featuredImageArea: {
    height: 190,
    backgroundColor: "#042752",
    justifyContent: "flex-end",
  },
  featuredOverlay: {
    padding: 18,
    backgroundColor: "rgba(4, 39, 82, 0.72)",
  },
  featuredBadge: {
    color: "#042752",
    backgroundColor: "#F5A841",
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    color: "#D7E4FF",
    fontSize: 14,
  },
  featuredContent: {
    padding: 18,
  },
  featuredDescription: {
    color: "#000000",
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
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  iconActionButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#042752",
    fontSize: 20,
    fontWeight: "800",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  quickCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  quickIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    color: "#000000",
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: "#042752",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  recommendationIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F5A841",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  recommendationTextWrap: {
    flex: 1,
  },
  recommendationTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  recommendationText: {
    color: "#D7E4FF",
    fontSize: 14,
    lineHeight: 20,
  },
  extraCardsWrap: {
    marginBottom: 18,
  },
  extraCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
    color: "#000000",
    fontSize: 14,
    lineHeight: 20,
  },
  bottomAction: {
    backgroundColor: "#0B5FFF",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
});