#import "AppDelegate.h"
#import <GoogleSignIn/GoogleSignIn.h>
#import <React/RCTBundleURLProvider.h>
#import <AuthenticationServices/AuthenticationServices.h>

@implementation AppDelegate

// 新アーキテクチャ (RCTAppDelegate) で必須: bundleURL
- (NSURL *)bundleURL
{
#if DEBUG
  // デバッグビルド → Metro Bundler 経由
  // fallbackResourceパラメータは不要になったので引数1つだけ
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  // リリースビルド → 埋め込み済みの main.jsbundle を読み込む
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// アプリ起動時のメソッド
- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // RCTAppDelegate が使う設定
  self.moduleName = @"AIMatch_react_native";
  self.initialProps = @{};

  // Google Sign-In の設定 (必要に応じて変更)
  GIDConfiguration *config = [[GIDConfiguration alloc] initWithClientID:@"330759708062-s247dk4b4j0ej0kr2e85d4vh2ipd12uh.apps.googleusercontent.com"];
  [GIDSignIn.sharedInstance setConfiguration:config];

  // 親クラス（RCTAppDelegate）の起動処理を呼ぶ
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// Google Sign-In と Apple Sign-In のコールバック
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  // Google Sign-In のコールバック処理
  BOOL handled = [[GIDSignIn sharedInstance] handleURL:url];
  if (handled) {
    return YES;
  }
  
  // 他のURLスキームの処理があればここに追加
  
  return NO;
}

// Universal Links のサポート (Apple Sign-In で使用)
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
    NSURL *url = userActivity.webpageURL;
    // ここでUniversal Linkの処理を行う
    return YES;
  }
  return NO;
}

// 旧アーキテクチャ用メソッドは削除 or コメントアウト
// - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge { ... }

@end
