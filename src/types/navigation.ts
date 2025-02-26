export type RootStackParamList = {
  Login: undefined;
  SignIn: undefined;
  EmailSignUp: undefined;
  MainTabs: undefined;
  Home: undefined;  // HomeScreen用
  Chat: {  // ChatScreen用
    partnerId: string;
    partnerName: string;
  };
  ChatBot: {  // ChatBotScreen用
    partnerId: string;
  };
  Search: undefined;  // 検索画面
  AddPartner: undefined;  // パートナー追加画面
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PaymentMethod: undefined;
  AboutUs: undefined;
  PrivacyPolicy: undefined;
  HowToUse: undefined;
  LanguageSettings: {
    currentLanguage: string;
    onSelect: (language: string) => void;
  };
  UploadSelection: { type: 'newProfile' | 'newChat' | 'existingChat' };
  PhotoUpload: { type: 'newProfile' | 'newChat' | 'existingChat' };
  TextToneAdjustment: {
    type: string;
    images: string[];
  };
  GeneratedMessages: {
    type: string;
    images: string[];
    adjustedTone?: {
      formalityLevel: number;
      friendlinessLevel: number;
      humorLevel: number;
    };
  };
  CopyCompleted: undefined;
  TextEdit: {
    message: string;
  };
  // SpotDetail screen not implemented yet
  /*
  SpotDetail: {
    spot: {
      name: string;
      description: string;
      address?: string;
      category?: string;
    };
  };
  */
};