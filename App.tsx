import React, { useEffect } from 'react';
import 'react-native-url-polyfill/auto';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, LogBox, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from './src/types/navigation';
import { ErrorBoundary } from 'react-error-boundary';

import LoginScreen from './src/screens/LoginScreen';
import SignInScreen from './src/screens/SignInScreen';
import EmailSignUpScreen from './src/screens/EmailSignUpScreen';
import PhotoUploadScreen from './src/screens/PhotoUploadScreen';
// import DateSpotSearchScreen from './src/screens/DateSpotSearchScreen'; // Not implemented yet
import UploadSelectionScreen from './src/screens/UploadSelectionScreen';
import TextToneAdjustmentScreen from './src/screens/TextToneAdjustmentScreen';
import GeneratedMessagesScreen from './src/screens/GeneratedMessagesScreen';
import CopyCompletedScreen from './src/screens/CopyCompletedScreen';
import TextEditScreen from './src/screens/TextEditScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ChatScreen from './src/screens/ChatScreen';
import ChatBotScreen from './src/screens/ChatBotScreen';
// import SpotDetailScreen from './src/screens/SpotDetailScreen'; // Not implemented yet
import LanguageSettingsScreen from './src/screens/LanguageSettingsScreen';
import AboutUsScreen from './src/screens/AboutUsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import HowToUseScreen from './src/screens/HowToUseScreen';

// Placeholder components for other tabs
const NotificationsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Notifications</Text>
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
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home-outline" size={24} color={color} />
          ),
          tabBarLabel: 'ホーム',
          headerShown: false,
        }}
      />
      {/* DateSpotSearchScreen temporarily hidden
      <Tab.Screen
        name="Search"
        component={DateSpotSearchScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="search-outline" size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
      */}
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
                marginTop: -25,
                marginBottom: Platform.OS === 'ios' ? -5 : 5,
              }}>
              <Icon name="add" size={30} color="#FFF" />
            </View>
          ),
          tabBarLabel: 'アップロード',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="settings-outline" size={24} color={color} />
          ),
          tabBarLabel: '設定',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  useEffect(() => {
    console.log('App mounted'); 
    return () => {
      console.log('App unmounted');
    };
  }, []);

  console.log('App is rendering');

  // Using React Native's built-in Linking instead of expo-linking
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['aimatch://', 'https://aimatch.app'],
    config: {
      screens: {
        Login: 'login-callback',
        SignIn: 'signin',
        EmailSignUp: 'email-signup',
        MainTabs: 'main',
        Chat: 'chat',
        ChatBot: 'chatbot',
        UploadSelection: 'upload-selection',
        TextToneAdjustment: 'text-tone-adjustment',
        GeneratedMessages: 'generated-messages',
        CopyCompleted: 'copy-completed',
        TextEdit: 'text-edit',
        // SpotDetail: 'spot-detail' // Not implemented yet
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
          screenOptions={{ headerShown: false }}
        >
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
          <Stack.Screen name="EmailSignUp" component={EmailSignUpScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ChatBot" component={ChatBotScreen} />
          <Stack.Screen name="UploadSelection" component={UploadSelectionScreen} />
          <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
          <Stack.Screen name="TextToneAdjustment" component={TextToneAdjustmentScreen} />
          <Stack.Screen name="GeneratedMessages" component={GeneratedMessagesScreen} />
          <Stack.Screen name="CopyCompleted" component={CopyCompletedScreen} />
          <Stack.Screen name="TextEdit" component={TextEditScreen} />
          {/* SpotDetail screen not implemented yet
          <Stack.Screen
            name="SpotDetail"
            component={SpotDetailScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          */}
          <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
          <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="HowToUse" component={HowToUseScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

export default App;
