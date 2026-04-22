import FeedScreen from "./screens/feed";
import PostScreen from "./screens/PostScreen";
import InboxScreen from "./screens/InboxScreen";
import MessageScreen from "./screens/MessageScreen";
import LoginScreen from "./screens/Login";
import HomeScreen from "./screens/home";
import TempScreen from "./screens/temp";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";

const Stack = createNativeStackNavigator(); // Used for nested stacks and auth
const Tab = createBottomTabNavigator();

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

            if (route.name === 'Feed') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            } else if (route.name === 'Post') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Inbox') {
              iconName = focused ? 'mail' : 'mail-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#082348',
          tabBarInactiveTintColor: '#999',
        })}
      >
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
