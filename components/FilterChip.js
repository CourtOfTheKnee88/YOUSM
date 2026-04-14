import { StyleSheet, Text, Pressable } from "react-native";

export default function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      style={[styles.chip, active ? styles.activeChip : styles.inactiveChip]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          active ? styles.activeChipText : styles.inactiveChipText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
    marginBottom: 10,
  },
  activeChip: {
    backgroundColor: "#042752",
  },
  inactiveChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F5A841",
  },
  chipText: {
    fontWeight: "700",
    fontSize: 13,
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  inactiveChipText: {
    color: "#042752",
  },
});