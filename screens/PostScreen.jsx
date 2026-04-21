import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';

const SERVER_URL = 'http://192.168.68.83:3001';
const CURRENT_USER_ID = 1; // Hardcoded James (id: 1)

export default function PostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setSelectedVideo(null); // Can't have both
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedVideo(result.assets[0]);
      setSelectedImage(null); // Can't have both
    }
  };

  const uploadFile = async (file, type) => {
    try {
      const formData = new FormData();
      const filename = file.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';

      formData.append('file', {
        uri: file.uri,
        name: filename,
        type: type === 'image' ? `image/${ext}` : `video/${ext}`
      });

      // For now, return a placeholder URL
      // In production, you'd upload to a service like AWS S3
      return file.uri;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const createPost = async () => {
    if (!content.trim() && !selectedImage && !selectedVideo) {
      Alert.alert('Error', 'Please add content, an image, or a video');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      let videoUrl = null;

      if (selectedImage) {
        imageUrl = await uploadFile(selectedImage, 'image');
      }

      if (selectedVideo) {
        videoUrl = await uploadFile(selectedVideo, 'video');
      }

      const res = await fetch(`${SERVER_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: CURRENT_USER_ID,
          content: content.trim() || null,
          imageUrl,
          videoUrl
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create post');
      }

      // Clear form
      setContent('');
      setSelectedImage(null);
      setSelectedVideo(null);

      Alert.alert('Success', 'Post created!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Text Input */}
        <View style={styles.section}>
          <Text style={styles.label}>What's on your mind?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your thoughts..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            value={content}
            onChangeText={setContent}
            editable={!loading}
          />
        </View>

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.section}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Image Selected</Text>
              <Pressable
                onPress={() => setSelectedImage(null)}
                disabled={loading}
              >
                <Ionicons name="close" size={24} color="#E74C3C" />
              </Pressable>
            </View>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.imagePreview}
            />
          </View>
        )}

        {/* Selected Video Preview */}
        {selectedVideo && (
          <View style={styles.section}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Video Selected</Text>
              <Pressable
                onPress={() => setSelectedVideo(null)}
                disabled={loading}
              >
                <Ionicons name="close" size={24} color="#E74C3C" />
              </Pressable>
            </View>
            <View style={styles.videoPreview}>
              <Ionicons name="play-circle" size={60} color="#082348" />
              <Text style={styles.videoPreviewText}>
                {selectedVideo.uri.split('/').pop()}
              </Text>
            </View>
          </View>
        )}

        {/* Media Selection Buttons */}
        <View style={styles.section}>
          <Text style={styles.label}>Add Media</Text>
          <View style={styles.mediaButtons}>
            <Pressable
              style={[
                styles.mediaButton,
                selectedImage && styles.mediaButtonDisabled
              ]}
              onPress={pickImage}
              disabled={loading || !!selectedVideo}
            >
              <Ionicons
                name="image"
                size={24}
                color={selectedImage || selectedVideo ? '#CCC' : '#082348'}
              />
              <Text
                style={[
                  styles.mediaButtonText,
                  (selectedImage || selectedVideo) &&
                    styles.mediaButtonTextDisabled
                ]}
              >
                Photo
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.mediaButton,
                selectedVideo && styles.mediaButtonDisabled
              ]}
              onPress={pickVideo}
              disabled={loading || !!selectedImage}
            >
              <Ionicons
                name="videocam"
                size={24}
                color={selectedVideo || selectedImage ? '#CCC' : '#082348'}
              />
              <Text
                style={[
                  styles.mediaButtonText,
                  (selectedVideo || selectedImage) &&
                    styles.mediaButtonTextDisabled
                ]}
              >
                Video
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Post Button */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.postButton,
            (loading || (!content.trim() && !selectedImage && !selectedVideo)) &&
              styles.postButtonDisabled
          ]}
          onPress={createPost}
          disabled={
            loading || (!content.trim() && !selectedImage && !selectedVideo)
          }
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFF" />
              <Text style={styles.postButtonText}>Post</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top'
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#082348'
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  videoPreview: {
    height: 250,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoPreviewText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  mediaButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 8,
    backgroundColor: '#F9F9F9'
  },
  mediaButtonDisabled: {
    opacity: 0.5
  },
  mediaButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#082348'
  },
  mediaButtonTextDisabled: {
    color: '#CCC'
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE'
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: '#082348',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  postButtonDisabled: {
    backgroundColor: '#B0BEC5',
    opacity: 0.6
  },
  postButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  }
});
