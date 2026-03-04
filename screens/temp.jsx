import { StyleSheet, Text, View } from 'react-native';

export default function TempScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temp Screen</Text>
      <Text>This is where code can be written</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
