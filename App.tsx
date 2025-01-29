import React, { useEffect } from 'react';
import 'react-native-url-polyfill/auto';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, LogBox, YellowBox } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from './src/types/navigation';
import { ErrorBoundary } from 'react-error-boundary';

import LoginScreen from './src/screens/LoginScreen';
import SignInScreen from './src/screens/SignInScreen';
import PhotoUploadScreen from './src/screens/PhotoUploadScreen';
import DateSpotSearchScreen from './src/screens/DateSpotSearchScreen';
import UploadSelectionScreen from './src/screens/UploadSelectionScreen';
import TextToneAdjustmentScreen from './src/screens/TextToneAdjustmentScreen';
import GeneratedMessagesScreen from './src/screens/GeneratedMessagesScreen';
import CopyCompletedScreen from './src/screens/CopyCompletedScreen';
import TextEditScreen from './src/screens/TextEditScreen';

// Placeholder components for other tabs
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Home</Text>
  </View>
);

const NotificationsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Notifications</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Settings</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// 開発時のデバッグ用
if (__DEV__) {
  const ignoreWarns = [
    'Non-serializable values were found in the navigation state',
  ];

  const warn = console.warn;
  console.warn = (...arg) => {
    for (const warning of ignoreWarns) {
      if (arg[0].startsWith(warning)) {
        return;
      }
    }
    warn(...arg);
  };

  LogBox.ignoreLogs(ignoreWarns);

  // デバッグ用のグローバルエラーハンドラー
  const errorHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.log('Global Error:', error);
    errorHandler(error, isFatal);
  });

  // デバッグ用のコンソールオーバーライド
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog('DEBUG:', ...args);
  };
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 5,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
        tabBarActiveTintColor: '#E94C89',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={DateSpotSearchScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="search-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Upload"
        component={PhotoUploadScreen}
        options={{
          tabBarIcon: () => (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#E94C89',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -20,
              }}>
              <Icon name="add" size={24} color="#fff" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="notifications-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  useEffect(() => {
    console.log('App mounted');  // このログが表示されるはず
    return () => {
      console.log('App unmounted');
    };
  }, []);

  console.log('App is rendering');

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['aimatch://'],
    config: {
      screens: {
        Login: 'login-callback',
        SignIn: 'signin',
        MainTabs: 'main',
        UploadSelection: 'upload-selection',
        TextToneAdjustment: 'text-tone-adjustment',
        GeneratedMessages: 'generated-messages',
        CopyCompleted: 'copy-completed',
        TextEdit: 'text-edit'
      }
    }
  };

  // エラーバウンダリーのフォールバックコンポーネントを追加
  const ErrorFallback = ({error}: {error: Error}) => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Something went wrong:</Text>
      <Text>{error.message}</Text>
    </View>
  );

  useEffect(() => {
    // デバッグ確認用
    setInterval(() => {
      console.log('Debug test:', new Date().toISOString());
    }, 5000);
  }, []);

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, stackTrace) => {
        console.error('App Error:', error);
        console.log('Stack Trace:', stackTrace);
      }}
    >
      <NavigationContainer 
        linking={linking}
        onStateChange={(state) => {
          console.log('Navigation State:', state);
        }}
      >
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            listeners={{
              focus: () => {
                console.log('Login screen focused');
              },
            }}
          />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="UploadSelection" component={UploadSelectionScreen} />
          <Stack.Screen name="TextToneAdjustment" component={TextToneAdjustmentScreen} />
          <Stack.Screen name="GeneratedMessages" component={GeneratedMessagesScreen} />
          <Stack.Screen name="CopyCompleted" component={CopyCompletedScreen} />
          <Stack.Screen name="TextEdit" component={TextEditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

export default App;
