import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, FlatList, SafeAreaView } from "react-native";

const SERVER_URL = "http://192.168.50.37:3001";
const CURRENT_USER = "Gage"; // Hardcoded for testing until login is built

export default function InboxScreen({ navigation }) {
  const [inboxChats, setInboxChats] = useState([]);

  useEffect(() => {
    // Fetch the list of chats when the screen loads
    const fetchInbox = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/threads/inbox/${CURRENT_USER}`);
        const data = await res.json();
        if (data.inbox) {
          setInboxChats(data.inbox);
        }
      } catch (error) {
        console.error("Failed to load inbox:", error);
      }
    };

    // We use a React Navigation listener to refresh the list every time you come back to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      fetchInbox();
    });

    return unsubscribe;
  }, [navigation]);

  // How each individual chat row should look
  const renderChatItem = ({ item }) => (
    <Pressable 
      style={styles.chatRow}
      onPress={() => navigation.navigate("Message", { 
        currentUser: CURRENT_USER, 
        targetUser: item.targetUser,
        targetDisplayName: item.targetUser 
      })}
    >
      <View style={styles.avatarPlaceholder}></View>
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.targetUser}</Text>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.lastMessage || "No messages yet..."}
        </Text>
      </View>
    </Pressable>
  );

return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={inboxChats}
        keyExtractor={(item) => item.threadId.toString()}
        renderItem={renderChatItem}
        contentContainerStyle={{ paddingBottom: 100 }} 
      />

      <Pressable style={styles.fab} onPress={() => console.log("Open New Chat Modal")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E5EDF4" }, // Light blue background matching wireframe
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: 15, 
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#ccc"
  },
  backButton: { 
    width: 35, 
    height: 35, 
    borderRadius: 20, 
    backgroundColor: "#D0E1F9", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  backButtonText: { fontSize: 18, color: "#333" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  chatRow: { 
    flexDirection: "row", 
    padding: 15, 
    backgroundColor: "white", 
    borderBottomWidth: 1, 
    borderColor: "#ccc",
    alignItems: "center"
  },
  avatarPlaceholder: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: "#D0E1F9", // Blue circle matching wireframe
    marginRight: 15 
  },
  chatDetails: { flex: 1, justifyContent: "center" },
  chatName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  chatPreview: { fontSize: 14, color: "#666" },
  fab: { 
    position: "absolute", 
    bottom: 30, 
    right: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: "white", 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: { fontSize: 30, color: "#333", bottom: 2 }
});