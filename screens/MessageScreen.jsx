import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { io } from "socket.io-client";

const SERVER_URL = "http://192.168.50.37:3001"; 

export default function MessageScreen({ route }) {
  // Extract the users from navigation, or default to our test names if they aren't passed yet
  const currentUser = route?.params?.currentUser || "Gage";
  const targetUser = route?.params?.targetUser || "JohnDoe";
  const targetDisplayName = route?.params?.targetDisplayName || "John Doe";

  const [socket, setSocket] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {

    const newSocket = io(SERVER_URL);
    setSocket(newSocket);
    // 1. Fetch Chat History via HTTP
    const fetchChatHistory = async () => {
      try {
        // Get or Create the thread between Gage and John Doe
        const threadRes = await fetch(`${SERVER_URL}/threads/direct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantIds: [currentUser, targetUser] })
        });

        const threadData = await threadRes.json();
        const threadId = threadData.thread.id;
        setActiveThreadId(threadId);

        //Tell the server to put this phone into the specific chat room
        newSocket.emit("join_thread", threadId);

        // Fetch the messages for that thread
        const msgRes = await fetch(`${SERVER_URL}/threads/${threadId}/messages`);
        const msgData = await msgRes.json();
        
        // Load them into the UI
        if (msgData.messages) {
          setMessages(msgData.messages);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchChatHistory();

    // // 2. Connect to the Live Socket
    // const newSocket = io(SERVER_URL);
    // setSocket(newSocket);

    newSocket.on("receive_message", (data) => {
      // Normalize the data so both REST API and SQLite formats work
      const normalizedMessage = {
        ...data,
        // Fallback to sender_id if senderId is undefined
        senderId: data.senderId || data.sender_id, 
      };
      
      // Add incoming live message to the list
      setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
    });

    return () => newSocket.disconnect();
  }, [currentUser, targetUser]);

  const sendMessage = () => {
    if (messageInput.trim() === "" || !socket || !activeThreadId) return;
    
    // We match the exact structure CoPilot's serializeMessage function uses
    const messageData = { 
      threadId: activeThreadId,
      senderId: currentUser,
      content: messageInput 
    };
    
    // Shoot it over to the server
    socket.emit("send_message", messageData);
    
    // Clear the input box
    setMessageInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Wrap the content in KeyboardAvoidingView */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25} // Adds a tiny buffer so it doesn't hug the text too tightly
      >
        <LinearGradient
          colors={["#082348", "#1355AE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerContainer}
        >
          <Pressable>
            <Text style={{ fontSize: 16, color: "white" }}>Back</Text>
          </Pressable>
          <Text style={styles.header}>{targetDisplayName}</Text>
          <Pressable>
            <Text style={{ fontSize: 16, color: "white" }}>Settings</Text>
          </Pressable>
        </LinearGradient>

        {/* Attach the ref and add the onContentSizeChange event */}
        <ScrollView 
          style={styles.chatFeed}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            <View 
              key={index} 
              style={[
                styles.messageBubble, 
                msg.senderId === currentUser ? styles.myMessage : styles.theirMessage
              ]}
            >
              <Text style={styles.senderName}>{msg.senderId}:</Text>
              <Text>{msg.content}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={messageInput}
            onChangeText={setMessageInput}
          />
          <Pressable style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", color: "#b18424" },
  chatFeed: { flex: 1, padding: 20 },
  messageBubble: { padding: 15, borderRadius: 10, marginBottom: 10, maxWidth: "80%" },
  myMessage: { backgroundColor: "#E6F4FE", alignSelf: "flex-end", borderBottomRightRadius: 0 },
  theirMessage: { backgroundColor: "#f1f0f0", alignSelf: "flex-start", borderBottomLeftRadius: 0 },
  senderName: { fontWeight: "bold", fontSize: 12, marginBottom: 4, color: "#666" },
  inputContainer: { flexDirection: "row", padding: 20, borderTopWidth: 1, borderColor: "#ccc", paddingBottom: 30 },
  textInput: { flex: 1, backgroundColor: "#DADCDF", borderRadius: 15, paddingHorizontal: 20, height: 50 },
  sendButton: { backgroundColor: "#082348", borderRadius: 15, paddingHorizontal: 20, justifyContent: "center", marginLeft: 10 },
  sendButtonText: { color: "white", fontWeight: "bold" }
});