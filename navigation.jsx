import FeedScreen from "./screens/feed";
import PostScreen from "./screens/PostScreen";
import InboxScreen from "./screens/InboxScreen";
import MessageScreen from "./screens/MessageScreen";
import LoginScreen from "./screens/Login";
import HomeScreen, { HeaderLogo } from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen.js";
import EditProfileScreen from "./screens/EditProfileScreen.js";
import OtherUserProfileScreen from "./screens/OtherUserProfileScreen.jsx";
import CommunitiesScreen from "./screens/CommunitiesScreen.jsx";
import DiscoverScreen from "./screens/DiscoverScreen.jsx";
import CommunityDetailScreen from "./screens/CommunityDetailScreen.jsx";
import CreateCommunityScreen from "./screens/CreateCommunityScreen.jsx";
import CommunityFeedScreen from "./screens/CommunityFeedScreen.jsx";
import CreateCommunityPostScreen from "./screens/CreateCommunityPostScreen.jsx";
import CommunityAdminScreen from "./screens/CommunityAdminScreen.jsx";
import SignUpScreen from "./screens/SignUp";
import FollowList from "./screens/FollowList.jsx";

import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "./theme";
import { useEffect, createContext, useContext, useReducer } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
        }}
      />

      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{ title: "Profile" }}
      />

      <Stack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: "Search", headerBackTitle: "Back" }}
      />

      <Stack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={({ route }) => ({ title: route.params?.name || "Community" })}
      />
    </Stack.Navigator>
  );
}

function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Stack.Screen
        name="CommunitiesHome"
        component={CommunitiesScreen}
        options={{ title: "Communities" }}
      />

      <Stack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={({ route }) => ({ title: route.params?.name || "Community" })}
      />

      <Stack.Screen
        name="CommunityFeed"
        component={CommunityFeedScreen}
        options={({ route }) => ({
          title: route.params?.name
            ? `${route.params.name} Feed`
            : "Community Feed",
        })}
      />

      <Stack.Screen
        name="CreateCommunityPost"
        component={CreateCommunityPostScreen}
        options={({ route }) => ({
          title:
            route.params?.postType === "announcement"
              ? "Create Announcement"
              : "Create Community Post",
        })}
      />

      <Stack.Screen
        name="CommunityAdmin"
        component={CommunityAdminScreen}
        options={({ route }) => ({
          title: route.params?.name
            ? `${route.params.name} Admin`
            : "Community Admin",
        })}
      />

      <Stack.Screen
        name="CreateCommunity"
        component={CreateCommunityScreen}
        options={{ title: "Start a Group" }}
      />

      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: "My Profile" }}
      />

      <Stack.Screen
        name="FollowList"
        component={FollowList}
        options={{ title: "Follow List", headerBackTitle: "Back" }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />

      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{ title: "Profile" }}
      />

      <Stack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={({ route }) => ({ title: route.params?.name || "Community" })}
      />

      <Stack.Screen
        name="CommunityFeed"
        component={CommunityFeedScreen}
        options={({ route }) => ({
          title: route.params?.name
            ? `${route.params.name} Feed`
            : "Community Feed",
        })}
      />

      <Stack.Screen
        name="CreateCommunityPost"
        component={CreateCommunityPostScreen}
        options={({ route }) => ({
          title:
            route.params?.postType === "announcement"
              ? "Create Announcement"
              : "Create Community Post",
        })}
      />

      <Stack.Screen
        name="CommunityAdmin"
        component={CommunityAdminScreen}
        options={({ route }) => ({
          title: route.params?.name
            ? `${route.params.name} Admin`
            : "Community Admin",
        })}
      />

      <Stack.Screen
        name="Communities"
        component={CommunityStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#FFFFFF",
        headerTitleAlign: "left",
      }}
    >
      <Stack.Screen
        name="FeedHome"
        component={FeedScreen}
        options={{ title: "Feed", headerShown: true }}
      />

      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
}

function PostStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#FFFFFF",
        headerTitleAlign: "left",
      }}
    >
      <Stack.Screen
        name="CreatePost"
        component={PostScreen}
        options={{ title: "Create Post", headerShown: true }}
      />

      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
}

function InboxStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Stack.Screen
        name="InboxHome"
        component={InboxScreen}
        options={{ title: "Messages", headerShown: false }}
      />

      <Stack.Screen
        name="Message"
        component={MessageScreen}
        options={({ route }) => ({
          title: route.params?.threadName || "Chat",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Feed") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "Post") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Communities") {
            return (
              <MaterialCommunityIcons
                name={focused ? "account-group" : "account-group-outline"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Inbox") {
            iconName = focused ? "mail" : "mail-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#999",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedStack}
        options={{ title: "Feed" }}
      />
      <Tab.Screen
        name="Post"
        component={PostStack}
        options={{ title: "Post" }}
      />
      <Tab.Screen
        name="Communities"
        component={CommunityStack}
        options={{ title: "Clubs" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: "Profile" }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxStack}
        options={{ title: "Messages" }}
      />
    </Tab.Navigator>
  );
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        userToken: action.token,
        userId: action.userId,
        userRole: action.userRole,
        username: action.username,
        userData: action.userData || null,
        isLoading: false,
      };

    case "SIGN_IN":
      return {
        ...state,
        isSignout: false,
        userToken: action.token,
        userId: action.userId,
        userRole: action.userRole,
        username: action.username,
        userData: action.userData || null,
        isLoading: false,
      };

    case "SET_USER_DATA":
      return {
        ...state,
        userData: action.userData,
      };

    case "SIGN_OUT":
      return {
        ...state,
        isSignout: true,
        userToken: null,
        userId: null,
        userRole: null,
        username: null,
        userData: null,
        isLoading: false,
      };

    case "REST":
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    isSignout: false,
    userToken: null,
    userId: null,
    userRole: null,
    username: null,
    userData: null,
  });

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(
        `${require("./config").SERVER_URL}/users/${userId}`,
      );
      const data = await response.json();

      if (response.ok && data.user) {
        dispatch({
          type: "SET_USER_DATA",
          userData: data.user,
        });
        return data.user;
      }
    } catch (error) {
      console.log("Failed to fetch user data:", error);
    }
    return null;
  };

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");
        const userRole = await AsyncStorage.getItem("userRole");
        const username = await AsyncStorage.getItem("username");

        if (token && userId) {
          dispatch({
            type: "RESTORE_TOKEN",
            token,
            userId,
            userRole,
            username,
          });
          // Fetch full user data from backend
          await fetchUserData(userId);
        } else {
          dispatch({ type: "REST" });
        }
      } catch (e) {
        console.log("Failed to restore token:", e);
        dispatch({ type: "REST" });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: async (username, password) => {
      try {
        const response = await fetch(
          `${require("./config").SERVER_URL}/users/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        const token = `token_${data.user.id}`;

        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userId", data.user.id.toString());
        await AsyncStorage.setItem("userRole", data.user.role);
        await AsyncStorage.setItem("username", data.user.username);

        dispatch({
          type: "SIGN_IN",
          token,
          userId: data.user.id.toString(),
          userRole: data.user.role,
          username: data.user.username,
          userData: data.user,
        });

        // Fetch full user data from backend
        await fetchUserData(data.user.id.toString());

        return true;
      } catch (error) {
        console.log("Sign in error:", error);
        throw error;
      }
    },

    signUp: async (
      username,
      email,
      password,
      role,
      securityQuestion,
      securityAnswer,
    ) => {
      try {
        const response = await fetch(
          `${require("./config").SERVER_URL}/users`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username,
              email,
              password,
              role,
              securityQuestion,
              securityAnswer,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Sign up failed");
        }

        const token = `token_${data.user.id}`;

        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userId", data.user.id.toString());
        await AsyncStorage.setItem("userRole", data.user.role);
        await AsyncStorage.setItem("username", data.user.username);

        dispatch({
          type: "SIGN_IN",
          token,
          userId: data.user.id.toString(),
          userRole: data.user.role,
          username: data.user.username,
          userData: data.user,
        });

        // Fetch full user data from backend
        await fetchUserData(data.user.id.toString());

        return true;
      } catch (error) {
        console.log("Sign up error:", error);
        throw error;
      }
    },

    signOut: async () => {
      try {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("userId");
        await AsyncStorage.removeItem("userRole");
        await AsyncStorage.removeItem("username");

        dispatch({ type: "SIGN_OUT" });
      } catch (error) {
        console.log("Sign out error:", error);
      }
    },
  };

  return (
    <AuthContext.Provider value={{ ...state, ...authContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const NavigationStack = () => {
  const state = useAuth();

  return (
    <NavigationContainer>
      <StatusBar style="auto" />

      {state.isLoading ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Splash"
            options={{ headerShown: false }}
            children={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>Loading...</Text>
              </View>
            )}
          />
        </Stack.Navigator>
      ) : state.userToken == null ? (
        <AuthStack />
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
};
