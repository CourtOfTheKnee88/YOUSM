import FeedScreen from "./screens/feed";
import PostScreen from "./screens/PostScreen";
import InboxScreen from "./screens/InboxScreen";
import MessageScreen from "./screens/MessageScreen";
import LoginScreen from "./screens/Login";
import HomeScreen, { HeaderLogo } from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen.js";
import EditProfileScreen from "./screens/EditProfileScreen.js";
import CommunitiesScreen from "./screens/CommunitiesScreen.jsx";
import CommunityDetailScreen from "./screens/CommunityDetailScreen.jsx";
import CreateCommunityScreen from "./screens/CreateCommunityScreen.jsx";
import SignUpScreen from "./screens/SignUp";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "./theme";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useReducer,
} from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator(); // Used for nested stacks and auth
const Tab = createBottomTabNavigator();

// Auth Context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Dashboard Stack
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
    </Stack.Navigator>
  );
}

// Community Stack
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
        name="CreateCommunity"
        component={CreateCommunityScreen}
        options={{ title: "Start a Group" }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack
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
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={({ route }) => ({ title: route.params?.name || "Community" })}
      />
      <Stack.Screen
        name="Communities"
        component={CommunityStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Home Stack
function FeedStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FeedHome"
        component={FeedScreen}
        options={{ title: "Feed", headerShown: true }}
      />
    </Stack.Navigator>
  );
}

// Post Stack
function PostStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CreatePost"
        component={PostScreen}
        options={{ title: "Create Post", headerShown: true }}
      />
    </Stack.Navigator>
  );
}

// Messaging Stack
function InboxStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InboxHome"
        component={InboxScreen}
        options={{ title: "Messages", headerShown: true }}
      />
      <Stack.Screen
        name="Message"
        component={MessageScreen}
        options={({ route }) => ({ title: route.params?.threadName || "Chat" })}
      />
    </Stack.Navigator>
  );
}

// Auth Stack (Login & SignUp)
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

// Main App Stack (Tab Navigator)
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

// Reducer for auth state
const authReducer = (state, action) => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        userToken: action.token,
        userId: action.userId,
        userRole: action.userRole,
        isLoading: false,
      };
    case "SIGN_IN":
      return {
        ...state,
        isSignout: false,
        userToken: action.token,
        userId: action.userId,
        userRole: action.userRole,
      };
    case "SIGN_OUT":
      return {
        ...state,
        isSignout: true,
        userToken: null,
        userId: null,
        userRole: null,
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

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    isSignout: false,
    userToken: null,
    userId: null,
    userRole: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Try to restore token from storage
        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");
        const userRole = await AsyncStorage.getItem("userRole");

        if (token) {
          dispatch({
            type: "RESTORE_TOKEN",
            token,
            userId,
            userRole,
          });
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
        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");
        const userRole = await AsyncStorage.getItem("userRole");
        dispatch({
          type: "SIGN_IN",
          token,
          userId,
          userRole,
        });
        return true;
      } catch (error) {
        console.log("Sign in error:", error);
        return false;
      }
    },

    signUp: async (username, email) => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");
        const userRole = await AsyncStorage.getItem("userRole");
        dispatch({
          type: "SIGN_IN",
          token,
          userId,
          userRole,
        });
        return true;
      } catch (error) {
        console.log("Sign up error:", error);
        return false;
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
        // Loading screen while checking auth state
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
        // User is not logged in - show Auth Stack (Login/SignUp)
        <AuthStack />
      ) : (
        // User is logged in - show App Stack (Main App)
        <AppStack />
      )}
    </NavigationContainer>
  );
};
