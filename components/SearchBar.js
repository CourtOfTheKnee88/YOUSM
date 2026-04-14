import { StyleSheet, TextInput, View } from "react-native";

export default function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#042752"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F5A841",
    marginBottom: 16,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#042752",
  },
});