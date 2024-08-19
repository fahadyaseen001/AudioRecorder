import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MemosScreen from './src/screens/Memos';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView edges={['bottom', 'top']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <MemosScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
