import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Android 에뮬레이터는 호스트 머신을 10.0.2.2로 접근한다.
// 실기기에서 테스트할 때는 개발 머신의 LAN IP로 바꿔야 한다.
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const WEB_URL = __DEV__
  ? `http://${DEV_HOST}:3000`
  : 'https://saju.example.com'; // TODO: 프로덕션 배포 URL

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        source={{ uri: WEB_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
