export type RootStackParamList = {
  Login: undefined;
  SignIn: undefined;
  MainTabs: undefined;
  UploadSelection: { type: 'newProfile' | 'newChat' | 'existingChat' };
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
};