import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessageScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Message */}
      <LinearGradient
        colors={["#082348", "#1355AE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerContainer}
      >
        <Pressable>
          <Text style={{ fontSize: 16 }}>
            Back
            <Image></Image>
          </Text>
        </Pressable>
        <Text style={styles.header}>Messages</Text>
        <Pressable>
          <Text style={{ fontSize: 16 }}>
            Settings
            <Image></Image>
          </Text>
        </Pressable>
      </LinearGradient>
      {/* Content */}
      <View style={styles.contentContainer}>
        <Pressable
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          <Image
            source={require("../assets/PFP.png")}
            style={{ width: 50, height: 50, borderRadius: 30 }}
          />
          <View style={{ paddingRight: 60 }}>
            <Text>John Doe</Text>
            <Text>
              Do you want to meet up at the Portland Library at 4:00pm to study
              for the Computer Science 430 exam?
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#b18424",
  },
  messagePreview: {
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 20,
  },
  contentContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    flexDirection: "column",
  },
});

// colors={["#082348", "#1355AE"]}
