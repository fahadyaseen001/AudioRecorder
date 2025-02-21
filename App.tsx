import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import MemosScreen from './src/screens/Memos';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['bottom', 'top']} style={{ flex: 1 }}>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <MemosScreen />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
