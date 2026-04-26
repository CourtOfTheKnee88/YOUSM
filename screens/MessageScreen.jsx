import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Modal, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io } from "socket.io-client";
import { Ionicons } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video'; // SDK 55 Standard
import { SERVER_URL } from '../config';
import { COLORS, SPACING } from '../theme';


export default function MessageScreen({ route, navigation }) {
  const { currentUser, targetUser, targetDisplayName, threadId } = route.params;

  const [socket, setSocket] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(threadId || null);
  const scrollViewRef = useRef();

  const [chatTitle, setChatTitle] = useState(targetDisplayName);

  // Modal States
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState(""); 
  
  // Media States
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null); 

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    const initializeChat = async () => {
      try {
        let currentId = threadId;

        if (!currentId) {
          const threadRes = await fetch(`${SERVER_URL}/threads/direct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantIds: [currentUser, targetUser] })
          });
          const threadData = await threadRes.json();
          currentId = threadData.thread.id;
        }

        setActiveThreadId(currentId);
        newSocket.emit("join_thread", currentId);

        const msgRes = await fetch(`${SERVER_URL}/threads/${currentId}/messages`);
        const msgData = await msgRes.json();
        if (msgData.messages) setMessages(msgData.messages);

      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();

    newSocket.on("receive_message", (data) => {
      if (data.threadId === activeThreadId || data.thread_id === activeThreadId || !activeThreadId) {
        const normalizedMessage = { ...data, senderId: data.senderId || data.sender_id };
        setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
      }
    });

    return () => newSocket.disconnect();
  }, [currentUser, targetUser, threadId]);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.7, 
    });

    if (!result.canceled) {
        setSelectedMedia(result.assets[0]);
    }
  };

  const sendMessage = async () => {
    if ((messageInput.trim() === "" && !selectedMedia) || !socket || !activeThreadId) return;

    if (selectedMedia) {
        const formData = new FormData();
        formData.append('senderId', currentUser);
        if (messageInput.trim()) formData.append('content', messageInput.trim());

        const localUri = selectedMedia.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        
        const fileType = selectedMedia.type === 'video' ? 'video' : 'image';
        const extension = match ? match[1] : (fileType === 'video' ? 'mp4' : 'jpeg');
        const mimeType = `${fileType}/${extension}`;

        formData.append('media', { uri: localUri, name: filename, type: mimeType });

        try {
            const res = await fetch(`${SERVER_URL}/threads/${activeThreadId}/messages`, {
                method: 'POST',
                body: formData, 
            });
            const data = await res.json();
            
            if (res.ok) {
               setMessages(prev => [...prev, data.message]);
            }
        } catch (error) {
            console.error("Upload failed", error);
            Alert.alert("Upload Failed", "Could not send the media.");
        }
    } else {
        const messageData = { threadId: activeThreadId, senderId: currentUser, content: messageInput };
        socket.emit("send_message", messageData);
    }

    setMessageInput("");
    setSelectedMedia(null);
  };

  // --- Group Management ---
  const openSettings = async () => {
    if (!activeThreadId) return;
    try {
      const res = await fetch(`${SERVER_URL}/threads/${activeThreadId}`);
      const data = await res.json();
      if (data.thread && data.thread.participantIds) {
        setParticipants(data.thread.participantIds);
        setSettingsVisible(true);
      }
    } catch (error) {
      console.error("Failed to fetch participants", error);
    }
  };

  const handleAddUser = async () => {
    if (!newParticipant.trim()) return;
    try {
      const res = await fetch(`${SERVER_URL}/threads/${activeThreadId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newParticipant.trim() })
      });
      if (res.ok) {
        setParticipants([...participants, newParticipant.trim()]);
        setNewParticipant("");
      }
    } catch (error) { console.error(error); }
  };

  const handleRemoveUser = async (userToRemove) => {
    try {
      const res = await fetch(`${SERVER_URL}/threads/${activeThreadId}/participants/${userToRemove}`, { method: 'DELETE' });
      if (res.ok) setParticipants(participants.filter(p => p !== userToRemove));
    } catch (error) { console.error(error); }
  };

  const handleDeleteMessage = (messageId) => {
    Alert.alert("Delete Message", "Remove this message?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await fetch(`${SERVER_URL}/threads/message/${messageId}`, { method: 'DELETE' });
          setMessages(prev => prev.filter(m => m.id !== messageId));
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* Full Screen Image Modal */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade">
        <View style={styles.fullScreenOverlay}>
          <Pressable style={styles.closeFullScreenBtn} onPress={() => setFullScreenImage(null)}>
            <Ionicons name="close" size={30} color="white" />
          </Pressable>
          <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} resizeMode="contain" />
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={settingsVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Group Details</Text>
            <View style={styles.addUserInputRow}>
              <TextInput style={styles.addUserText} placeholder="Username" value={newParticipant} onChangeText={setNewParticipant} />
              <Pressable style={styles.addUserBtn} onPress={handleAddUser}><Text style={styles.addUserBtnText}>Add</Text></Pressable>
            </View>
            <ScrollView style={styles.participantList}>
              {participants.map(p => (
                <View key={p} style={styles.participantRow}>
                  <Text>{p}</Text>
                  {p !== currentUser && (
                    <Pressable onPress={() => handleRemoveUser(p)} style={styles.removeBtn}><Text style={styles.removeBtnText}>Remove</Text></Pressable>
                  )}
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.closeBtn} onPress={() => setSettingsVisible(false)}><Text style={styles.closeBtnText}>Done</Text></Pressable>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.headerContainer}>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate("InboxHome")}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{chatTitle}</Text>
          <Pressable style={styles.iconButton} onPress={openSettings}><Ionicons name="settings-outline" size={24} color="white" /></Pressable>
        </View>

<ScrollView style={styles.chatFeed} ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
  {messages.map((msg, index) => {
    const isMe = msg.senderId === currentUser;
    const isVideo = msg.mediaUrl && msg.mediaType === 'video';

    return (
      <View 
        key={index} 
        style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}
      >
        {/* 1. Sender Name & Text: Wrapped in Pressable for Long Press deletion */}
        <Pressable 
          onLongPress={() => isMe ? handleDeleteMessage(msg.id) : null}
          onPress={() => {
            if (msg.mediaUrl && !isVideo) {
              setFullScreenImage(`${SERVER_URL}${msg.mediaUrl}`);
            }
          }}
        >
          <Text style={[styles.senderName, isMe ? styles.mySenderName : styles.theirSenderName]}>
            {msg.senderId}
          </Text>

          {/* Image: Stays inside Pressable for full-screen tap */}
          {msg.mediaUrl && !isVideo && (
            <Image 
              source={{ uri: `${SERVER_URL}${msg.mediaUrl}` }} 
              style={styles.chatMedia} 
              resizeMode="cover" 
            />
          )}

          {msg.content ? <Text style={isMe ? styles.myMessageText : styles.theirMessageText}>{msg.content}</Text> : null}
        </Pressable>

        {/* 2. Video: Stays OUTSIDE the Pressable so native controls are 100% responsive */}
        {isVideo && (
          <View style={{ marginTop: 5 }}>
             <VideoMessage source={`${SERVER_URL}${msg.mediaUrl}`} content={msg.content} />
             
             {/* Optional: Tiny invisible deletion area under the video if needed */}
             {isMe && (
               <Pressable 
                 onLongPress={() => handleDeleteMessage(msg.id)}
                 style={{ height: 20, width: '100%' }}
               />
             )}
          </View>
        )}
      </View>
    );
  })}
</ScrollView>

        {selectedMedia && (
            <View style={styles.mediaPreviewContainer}>
                <Image source={{ uri: selectedMedia.uri }} style={styles.mediaPreviewImage} />
                <Pressable onPress={() => setSelectedMedia(null)} style={styles.removeMediaBtn}><Ionicons name="close-circle" size={24} color="#D32F2F" /></Pressable>
            </View>
        )}

        <View style={styles.inputContainer}>
          <Pressable onPress={pickMedia} style={styles.attachButton}><Ionicons name="image-outline" size={24} color="#082348" /></Pressable>
          <TextInput style={styles.textInput} placeholder="Message..." value={messageInput} onChangeText={setMessageInput} />
          <Pressable style={styles.sendButton} onPress={sendMessage}><Ionicons name="send" size={20} color="white" /></Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 🛑 Helper Component for SDK 55 Video
function VideoMessage({ source, content }) {
  const player = useVideoPlayer(source, (player) => {
    player.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={{ width: 220, height: 220, borderRadius: SPACING.borderRadius, marginBottom: content ? 8 : 0, backgroundColor: '#000' }}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15, backgroundColor: COLORS.primary },
  iconButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.surface, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  chatFeed: { flex: 1, padding: 15 },
  messageBubble: { padding: 12, borderRadius: SPACING.borderRadius + 3, marginBottom: 10, maxWidth: "80%" },
  myMessage: { backgroundColor: COLORS.primary, alignSelf: "flex-end", borderBottomRightRadius: 2 },
  theirMessage: { backgroundColor: COLORS.background, alignSelf: "flex-start", borderBottomLeftRadius: 2 },
  senderName: { fontWeight: "bold", fontSize: 11, marginBottom: 2 },
  mySenderName: { color: COLORS.textAccent }, 
  theirSenderName: { color: COLORS.textLight }, 
  myMessageText: { color: COLORS.surface, fontSize: 15 }, 
  theirMessageText: { color: COLORS.text, fontSize: 15 },
  
  // 🛑 ADDED: Missing chatMedia Style
  chatMedia: { width: 220, height: 220, borderRadius: 10, marginBottom: 8, backgroundColor: '#ddd' },

  mediaPreviewContainer: { padding: 10, backgroundColor: COLORS.background, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: COLORS.border },
  mediaPreviewImage: { width: 60, height: 60, borderRadius: 8 },
  removeMediaBtn: { marginLeft: 10 },

  inputContainer: { flexDirection: "row", padding: 15, borderTopWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  attachButton: { marginRight: 10, padding: 5 },
  textInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 15, height: 45, color: COLORS.text },
  sendButton: { backgroundColor: COLORS.primary, borderRadius: 25, width: 45, height: 45, justifyContent: "center", alignItems: 'center', marginLeft: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: COLORS.surface, padding: 25, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  addUserInputRow: { flexDirection: 'row', marginBottom: 15 },
  addUserText: { flex: 1, backgroundColor: COLORS.background, padding: 10, borderRadius: 8, marginRight: 10, color: COLORS.text },
  addUserBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 15, justifyContent: 'center', borderRadius: 8 },
  addUserBtnText: { color: 'white', fontWeight: 'bold' },
  participantList: { maxHeight: 180, marginBottom: 20 },
  participantRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  removeBtn: { backgroundColor: '#FFEBEB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  removeBtnText: { color: COLORS.error, fontWeight: 'bold', fontSize: 12 },
  closeBtn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 10, alignItems: 'center' },
  closeBtnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 16 },

  fullScreenOverlay: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '100%' },
  closeFullScreenBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
});