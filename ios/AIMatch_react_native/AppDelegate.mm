#import "AppDelegate.h"
#import <GoogleSignIn/GoogleSignIn.h>
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

// 新アーキテクチャ (RCTAppDelegate) で必須: bundleURL
- (NSURL *)bundleURL
{
#if DEBUG
  // デバッグビルド → Metro Bundler 経由
  // fallbackResourceパラメータは不要になったので引数1つだけ
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
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

// Google Sign-In のコールバック (オプション、GID を使うなら必須)
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [[GIDSignIn sharedInstance] handleURL:url];
}

// 旧アーキテクチャ用メソッドは削除 or コメントアウト
// - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge { ... }

@end
