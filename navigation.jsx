import FeedScreen from "./screens/feed";
import PostScreen from "./screens/PostScreen";
import InboxScreen from "./screens/InboxScreen";
import MessageScreen from "./screens/MessageScreen";
import LoginScreen from "./screens/Login";
import HomeScreen, { HeaderLogo } from "./screens/HomeScreen";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import { COLORS } from "./theme";

const Stack = createNativeStackNavigator(); // Used for nested stacks and auth
const Tab = createBottomTabNavigator();

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
        options={{ headerTitle: () => <HeaderLogo />, headerTitleAlign: 'center' }}
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
        options={{ title: "YOUSM", headerShown: true }}
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

export const NavigationStack = () => {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
            } else if (route.name === 'Feed') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            } else if (route.name === 'Post') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Inbox') {
              iconName = focused ? 'mail' : 'mail-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: '#999',
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="Feed"
          component={FeedStack}
          options={{ title: 'Feed' }}
        />
        <Tab.Screen
          name="Post"
          component={PostStack}
          options={{ title: 'Post' }}
        />
        <Tab.Screen
          name="Inbox"
          component={InboxStack}
          options={{ title: 'Messages' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
