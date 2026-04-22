import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVER_URL, CURRENT_USER_ID } from '../config';
import { COLORS, SPACING } from '../theme';


export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchFeed = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/posts/feed/${CURRENT_USER_ID}`);
      const data = await res.json();

      if (data.posts) {
        setLiked(prev => {
          const newMap = { ...prev };
          data.posts.forEach(post => {
            newMap[post.id] = post.isLiked > 0;
          });
          return newMap;
        });
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const toggleLike = async (postId) => {
    try {
      const res = await fetch(`${SERVER_URL}/posts/${postId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          type: 'like'
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setLiked(prev => ({
          ...prev,
          [postId]: data.liked === true
        }));
        // Update the post list locally to reflect new count without full reload
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likeCount: data.liked ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1) }
            : p
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId) => {
    setActivePostId(postId);
    setCommentText('');
    setComments([]);
    setCommentModalVisible(true);
    setLoadingComments(true);

    try {
      const res = await fetch(`${SERVER_URL}/posts/${postId}`);
      const data = await res.json();
      // Filter interactions to only show comments
      const postComments = data.interactions.filter(i => i.type === 'comment');
      setComments(postComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !activePostId) return;
    try {
      const res = await fetch(`${SERVER_URL}/posts/${activePostId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          type: 'comment',
          content: commentText.trim()
        })
      });

      if (res.ok) {
        setCommentText('');
        // Re-fetch comments to show the one just added
        const commentsRes = await fetch(`${SERVER_URL}/posts/${activePostId}`);
        const data = await commentsRes.json();
        setComments(data.interactions.filter(i => i.type === 'comment'));
      }
      fetchFeed(); // Refresh to update the comment count
    } catch (error) {
      console.error('Failed to post comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const handleShare = async (post) => {
    try {
      const result = await Share.share({
        message: post.content || 'Check out this post on YOUSM!',
      });

      if (result.action === Share.sharedAction) {
        // Log the share interaction in the database
        const res = await fetch(`${SERVER_URL}/posts/${post.id}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: CURRENT_USER_ID,
            type: 'share'
          })
        });

        if (res.ok) {
          // Optimistically update the UI count
          setPosts(prev => prev.map(p => 
            p.id === post.id 
              ? { ...p, shareCount: (p.shareCount || 0) + 1 }
              : p
          ));
        }
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const renderPost = ({ item }) => {
    const isLiked = liked[item.id] || false;

    return (
      <View style={styles.postContainer}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{item.displayName || "Unknown"}</Text>
              <Text style={styles.postTime}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          {item.authorId === CURRENT_USER_ID && (
            <Pressable>
              <Ionicons name="ellipsis-vertical" size={24} color={COLORS.primary} />
            </Pressable>
          )}
        </View>

        {/* Post Content */}
        {item.content && (
          <Text style={styles.postContent}>{item.content}</Text>
        )}

        {/* Post Image */}
        {item.imageUrl && (
          <Image
            source={{ uri: `${SERVER_URL}${item.imageUrl}` }}
            style={styles.postImage}
          />
        )}

        {/* Post Video Placeholder */}
        {item.videoUrl && (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={60} color={COLORS.primary} />
            <Text style={styles.videoText}>Video Post</Text>
          </View>
        )}

        {/* Post Stats */}
        <View style={styles.postStats}>
          <Text style={styles.statText}>{item.likeCount || 0} Likes</Text>
          <Text style={styles.statText}>{item.commentCount || 0} Comments</Text>
          <Text style={styles.statText}>{item.shareCount || 0} Shares</Text>
        </View>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <Pressable
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? COLORS.error : COLORS.textLight}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              Like
            </Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => handleComment(item.id)}>
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.textLight} />
            <Text style={styles.actionText}>Comment</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={() => handleShare(item)}>
            <Ionicons name="share-social-outline" size={24} color={COLORS.textLight} />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Start by following people to see their posts
            </Text>
          </View>
        }
      />

      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <Pressable onPress={() => setCommentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            {loadingComments ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{item.displayName || "User"}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyComments}>No comments yet. Be the first!</Text>
                }
                style={styles.commentsList}
              />
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Write your comment..."
                multiline
                value={commentText}
                onChangeText={setCommentText}
              />
            </View>

            <Pressable style={styles.submitButton} onPress={submitComment}>
              <Text style={styles.submitButtonText}>Post Comment</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  listContent: {
    paddingBottom: 20
  },
  postContainer: {
    backgroundColor: COLORS.surface,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  avatarText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 16
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text
  },
  postTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2
  },
  postContent: {
    fontSize: 16,
    color: COLORS.text,
    padding: 12,
    lineHeight: 24
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover'
  },
  videoPlaceholder: {
    height: 300,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500'
  },
  postStats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  statText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginRight: 15
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8
  },
  actionButtonActive: {
    backgroundColor: '#FEF0F0'
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500'
  },
  actionTextActive: {
    color: COLORS.error
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  commentsList: {
    flex: 1,
    marginBottom: 10
  },
  commentItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2
  },
  commentText: {
    fontSize: 14,
    color: COLORS.textLight
  },
  emptyComments: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 20
  },
  inputContainer: {
    marginBottom: 10
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
