import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, FlatList, SafeAreaView, Modal, ScrollView, TextInput, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const SERVER_URL = "http://192.168.50.37:3001";
const CURRENT_USER = "Gage"; 
const MOCK_CONTACTS = ["James", "Courtney", "Esther", "JohnDoe"];

export default function InboxScreen({ navigation }) {
  const [inboxChats, setInboxChats] = useState([]);
  
  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // States
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState(""); 
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [tempRename, setTempRename] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);

  const fetchInbox = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/threads/inbox/${CURRENT_USER}`);
      const data = await res.json();
      if (data.inbox) setInboxChats(data.inbox);
    } catch (error) { console.error("Failed to load inbox:", error); }
  };

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/threads/blocks/${CURRENT_USER}`);
      const data = await res.json();
      if (data.blockedUsers) setBlockedUsers(data.blockedUsers);
    } catch (error) { console.error("Failed to load blocks:", error); }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchInbox);
    return unsubscribe;
  }, [navigation]);

  // 🛑 UPDATED: Group Menu now includes "Leave Group"
  const showChatOptions = (item) => {
    if (item.threadType === 'group') {
      Alert.alert("Group Options", `What would you like to do?`, [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Rename Group", 
          onPress: () => {
            setEditingThreadId(item.threadId);
            setTempRename(item.targetUser || "");
            setRenameModalVisible(true);
          }
        },
        { 
          text: "Leave Group", 
          style: "destructive", 
          onPress: () => confirmLeaveGroup(item.threadId) 
        }
      ]);
    } else {
      Alert.alert("Chat Options", `Options for ${item.targetUser}`, [
        { text: "Cancel", style: "cancel" },
        { text: "Block User", style: "destructive", onPress: () => confirmBlock(item.targetUser) },
        { text: "Delete Chat", style: "destructive", onPress: () => confirmDelete(item.threadId) }
      ]);
    }
  };

  // 🛑 NEW: Leave Group Logic
  const confirmLeaveGroup = (threadId) => {
    Alert.alert("Leave Group", "Are you sure you want to leave this group chat?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Leave", 
        style: "destructive", 
        onPress: async () => {
          try {
            const res = await fetch(`${SERVER_URL}/threads/${threadId}/participants/${CURRENT_USER}`, { method: 'DELETE' });
            if (res.ok) fetchInbox();
          } catch (error) { console.error("Leave failed", error); }
        } 
      }
    ]);
  };

  const confirmBlock = (targetUser) => {
    if (targetUser === 'group') return Alert.alert("Wait", "You can only block individuals.");
    Alert.alert("Block User", `Are you sure you want to block ${targetUser}?`, [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Block", style: "destructive", 
        onPress: async () => {
          try {
            await fetch(`${SERVER_URL}/threads/block`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ blocker: CURRENT_USER, blocked: targetUser })
            });
            fetchInbox(); 
          } catch (error) { console.error("Block failed", error); }
        } 
      }
    ]);
  };

  // 🛑 NEW: Unblock Logic
  const handleUnblock = async (blockedUser) => {
    try {
      const res = await fetch(`${SERVER_URL}/threads/unblock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocker: CURRENT_USER, blocked: blockedUser })
      });
      if (res.ok) {
        fetchBlockedUsers(); // Refresh the modal list
        fetchInbox(); // Refresh the inbox so their chat reappears!
      }
    } catch (error) { console.error("Unblock failed", error); }
  };

  const confirmDelete = async (threadId) => {
    Alert.alert("Delete", "Are you sure? This is permanent.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", style: "destructive", 
        onPress: async () => {
          try {
            const res = await fetch(`${SERVER_URL}/threads/${threadId}`, { method: 'DELETE' });
            if (res.ok) fetchInbox();
          } catch (error) { console.error("Delete failed", error); }
        }
      }
    ]);
  };

  const handleRenameSubmit = async () => {
    if (!tempRename.trim()) return;
    try {
      const res = await fetch(`${SERVER_URL}/threads/${editingThreadId}/name`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempRename })
      });
      if (res.ok) { setRenameModalVisible(false); fetchInbox(); }
    } catch (error) { console.error("Rename failed", error); }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;
    try {
      const isGroup = selectedUsers.length > 1;
      const endpoint = isGroup ? '/threads/group' : '/threads/direct';
      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            participantIds: isGroup ? [CURRENT_USER, ...selectedUsers] : [CURRENT_USER, selectedUsers[0]], 
            name: isGroup ? groupName : null 
        })
      });
      const data = await res.json();
      if (data.thread) {
        setModalVisible(false); setSelectedUsers([]); setGroupName("");
        navigation.navigate("Message", { 
          currentUser: CURRENT_USER, 
          targetUser: isGroup ? "group" : selectedUsers[0],
          targetDisplayName: data.thread.name || (isGroup ? "Group Chat" : selectedUsers[0]),
          threadId: data.thread.id
        });
      }
    } catch (error) { console.error(error); }
  };

  const renderChatItem = ({ item }) => {
    const safeName = item.targetUser || "Unknown";
    const displayInitial = item.threadType === 'group' ? 'G' : safeName.charAt(0).toUpperCase();

    return (
      <Pressable 
        style={styles.chatRow}
        onPress={() => navigation.navigate("Message", { currentUser: CURRENT_USER, targetUser: item.threadType === 'group' ? 'group' : item.targetUser, targetDisplayName: safeName, threadId: item.threadId })}
        onLongPress={() => showChatOptions(item)}
      >
        <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitial}>{displayInitial}</Text></View>
        <View style={styles.chatDetails}>
          <Text style={styles.chatName} numberOfLines={1}>{safeName}</Text>
          <Text style={styles.chatPreview} numberOfLines={1}>{item.lastMessage || "No messages yet..."}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Settings Modal (Blocked Users) */}
      <Modal visible={settingsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.subHeader}>Blocked Users</Text>
            
            {blockedUsers.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#999', marginBottom: 20 }}>No blocked users.</Text>
            ) : (
              <ScrollView style={styles.contactList}>
                {blockedUsers.map((user) => (
                  <View key={user} style={styles.contactRow}>
                    <Text style={styles.contactName}>{user}</Text>
                    <Pressable onPress={() => handleUnblock(user)} style={{ padding: 5 }}>
                      <Text style={{ color: 'red', fontWeight: 'bold' }}>Unblock</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <Pressable style={styles.startButton} onPress={() => setSettingsModalVisible(false)}>
                <Text style={styles.startButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Chat Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start a Conversation</Text>
            {selectedUsers.length > 1 && (
                <TextInput style={styles.modalInput} placeholder="Group Name (Optional)" value={groupName} onChangeText={setGroupName} />
            )}
            <Text style={styles.subHeader}>Select Contacts:</Text>
            <ScrollView style={styles.contactList}>
              {MOCK_CONTACTS.map((contact) => (
                <Pressable key={contact} style={[styles.contactRow, selectedUsers.includes(contact) && styles.contactRowSelected]} onPress={() => setSelectedUsers(prev => prev.includes(contact) ? prev.filter(u => u !== contact) : [...prev, contact])}>
                  <Text style={[styles.contactName, selectedUsers.includes(contact) && styles.contactNameSelected]}>{contact}</Text>
                  {selectedUsers.includes(contact) && <Ionicons name="checkmark-circle" size={18} color="#082348" />}
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => { setModalVisible(false); setSelectedUsers([]); setGroupName(""); }}><Text>Cancel</Text></Pressable>
              <Pressable style={[styles.startButton, selectedUsers.length === 0 && styles.startButtonDisabled]} onPress={handleCreateChat} disabled={selectedUsers.length === 0}><Text style={styles.startButtonText}>{selectedUsers.length > 1 ? "Start Group Chat" : "Start Chat"}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Group</Text>
            <TextInput style={styles.modalInput} value={tempRename} onChangeText={setTempRename} autoFocus selectTextOnFocus />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setRenameModalVisible(false)}><Text>Cancel</Text></Pressable>
              <Pressable style={styles.startButton} onPress={handleRenameSubmit}><Text style={styles.startButtonText}>Save</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Pressable style={styles.backButtonContainer} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={24} color="#FFF" /></Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        
        {/* 🛑 NEW: Settings Icon in the Header */}
        <Pressable 
          style={styles.settingsButton} 
          onPress={() => {
            fetchBlockedUsers();
            setSettingsModalVisible(true);
          }}
        >
          <Ionicons name="settings-outline" size={24} color="#FFF" />
        </Pressable>
      </View>

      <FlatList data={inboxChats} keyExtractor={(item) => item.threadId.toString()} renderItem={renderChatItem} contentContainerStyle={styles.listContent} />

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}><Ionicons name="add" size={30} color="#FFF" /></Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, backgroundColor: "#082348" },
  backButtonContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#0F2D59", alignItems: "center", justifyContent: "center" },
  settingsButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  listContent: { paddingVertical: 10 },
  chatRow: { flexDirection: "row", padding: 15, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#F0F0F0", alignItems: "center" },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F2F2F2", marginRight: 15, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 20, color: '#082348', fontWeight: 'bold' },
  chatDetails: { flex: 1, justifyContent: "center" },
  chatName: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  chatPreview: { fontSize: 14, color: "#666" },
  fab: { position: "absolute", bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: "#082348", alignItems: "center", justifyContent: "center", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 25, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: "#333" },
  subHeader: { fontSize: 14, color: '#666', marginBottom: 15 },
  contactList: { maxHeight: 200, marginBottom: 20 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  contactRowSelected: { backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 10 },
  contactName: { fontSize: 16, color: '#333' },
  contactNameSelected: { fontWeight: 'bold', color: '#082348' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 10 },
  cancelButton: { marginRight: 25, padding: 10 },
  startButton: { backgroundColor: '#082348', padding: 14, borderRadius: 10, minWidth: 100, alignItems: 'center' },
  startButtonDisabled: { backgroundColor: '#B0BEC5' },
  startButtonText: { color: 'white', fontWeight: 'bold' },
  modalInput: { backgroundColor: '#F2F2F2', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 16, color: '#333' },
});