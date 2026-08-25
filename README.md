# NativeEar 🎧 - TOEIC 英語リスニング・ディクテーション & シャドーイングWebアプリ

TOEICリスニングスコアアップ（**300〜900点**）を目指すための、高機能ディクテーション＆シャドーイングWebアプリケーションです。

---

## 🌟 主な機能と特徴

### 1. 2つの特訓モード（タイピング ⇄ スピーキング）
- ⌨️ **ディクテーションモード（タイピング）**
  - ネイティブ音声を聴きながら同時にキーボード入力可能なリアルタイム書き取り特訓。
  - 先頭文字ヒント機能（Letter Hints）で初心者でも挫折せず学習可能。
- 🎙️ **シャドーイングモード（音声認識スピーキング）**
  - Web Speech API（`SpeechRecognition`）による**リアルタイム音声認識＆自動文字起こし**。
  - マイクに向かって英語を発音するだけで、単語単位の正誤判定（Word-by-Word Diff）と発音一致率スコアを即座に算出。
  - マイク入力欄からいつでも「模範音声を聴く」ボタンでお手本を確認可能。

### 2. TOEIC 7段階レベル別学習（全1,500問以上収録）
超入門から最上級まで、自分の実力と目的に合わせて段階的に学習できます。

| レベル | 対象目安 | 特徴・センテンス構成 | 基本速度 |
| :--- | :--- | :--- | :--- |
| **300点クラス** | TOEIC 200〜400 | **入門・超短文（3〜5語）**：シャドーイング入門に最適な超短文フレーズ | 0.75x |
| **400点クラス** | TOEIC 350〜500 | **初級・基礎短文（5〜7語）**：日常業務・接客・案内の基礎表現 | 0.88x |
| **500点クラス** | TOEIC 450〜550 | **基礎・短文・クリア発音（7〜10語）**：写真描写・質問応答 | 0.88x |
| **600点クラス** | TOEIC 550〜650 | **日常業務・標準スピード（9〜14語）**：社内連絡・メール・旅行 | 1.00x |
| **700点クラス** | TOEIC 650〜750 | **実務討議・重要イディオム（12〜16語）**：会議・プレゼン・連結音 | 1.00x |
| **800点クラス** | TOEIC 750〜850 | **高度ビジネス・複文構造（15〜20語）**：経営・市場分析・長めの複文 | 1.10x |
| **900点クラス** | TOEIC 850〜990 | **ネイティブ最速・難関語彙（18〜25語以上）**：倒置・リダクション | 1.25x |

### 3. Web Speech API ネイティブ発音 & 音声切替
- **男女ボイスの明瞭な切り替え**:
  - 米国英語（en-US）の女性ネイティブ（Female）/ 男性ネイティブ（Male）音声を瞬時に切替可能。
  - 音声エンジン検索の強化および音響ピッチ（Pitch）自動変調により、全OS・ブラウザで明確に区別可能な男声・女声を実現。
- **再生速度の自在な調整**:
  - レベル別推奨速度 ＋ ワンクリック微調整（0.75x, 0.88x, 1.0x, 1.1x, 1.25x）
- **Web Audio API による効果音**:
  - 正解時のアルペジオファンファーレや不正解時のフィードバック音をリアルタイム合成。

### 4. リアルタイム Word-by-Word Diff 判定エンジン
- 🟩 **正解単語（Match）**
- 🟥 **誤り・スペルミス単語（Mismatch）**: `入力` → `模範解答`
- 🟨 **脱落単語（Missing）**: `[単語]`
- 🟦 **余剰単語（Extra）**: `~~単語~~`
- 句読点（ピリオド・カンマ等）や大文字小文字の柔軟な正規化（設定で厳格モードへの切替も可能）。

### 5. 多言語自動判別 & 手動切替（i18n）
- 日本語ブラウザからのアクセス時は **日本語表示**、それ以外のブラウザ環境では **英語（English）表示** に自動判別。
- ヘッダー右上または設定画面から、いつでもワンクリックで言語を切り替え可能（`localStorage` に保存）。

### 6. 学習サポート・解説 & 苦手復習システム
- 全問に **日本語全訳**、**重要語彙・イディオム解説**、**TOEIC文法Tips**、**音の連結（リンキング・リダクション）解説** を掲載。
- 苦手問題のワンクリックブックマーク ＆ 専用復習モード。
- レベル別正答率・平均一致率・完全正解数・連続練習日数（Streak）トラッキング。

### 7. 1画面完結のレスポンシブUI & ショートカット
- **縦スクロール不要のスリム設計**:
  - 音声再生、マイク録音、文字起こし、判定ボタンがノートPCやモバイルでも1画面内に収まるコンパクトレイアウト。
- **デフォルト・ダークモード**:
  - 視認性に優れたダークモード（ライトモードとのコントラスト切り替え対応）。
- **キーボードショートカット**:
  - `Space` / `Ctrl+P`: 音声再生・もう一度聴く
  - `Enter` / `Tab`: 判定 / 次の問題へ進む

---

## 🚀 起動・開発・ビルド方法

### Web版
```bash
# 依存関係のインストール
npm install

# 開発サーバー起動 (http://localhost:3000)
npm run dev

# Web版プロダクションビルド
npm run build

# ビルドプレビュー
npm run preview
```

### 🖥️ デスクトップアプリ版（Tauri / Windows・macOS・Linux）

Tauri v2 を使用して Windows (.exe / .msi)、macOS (.app / .dmg / Universal Binary)、Linux (.deb / .AppImage) 向けのネイティブデスクトップアプリをビルド・実行できます。

#### 必要環境
- **Node.js**: 20+
- **Rust / Cargo**: 1.77.2+ (`rustc --version`)
- **OS固有の依存ライブラリ**:
  - **Windows**: Microsoft C++ Build Tools, WebView2 (Windows 10/11には標準搭載)
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux (Ubuntu/Debian)**: `sudo apt-get install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf`

#### デスクトップ版の実行コマンド
```bash
# デスクトップ開発モード起動（ホットリロード付きでネイティブウィンドウが起動）
npm run tauri:dev

# デスクトップアプリのプロダクションビルド
npm run tauri:build
```

ビルド完了後、`src-tauri/target/release/`（または bundle ディレクトリ）に各OS向けのバイナリおよびインストーラーが生成されます。

#### 📦 GitHub Actions による自動マルチプラットフォームリリース
`.github/workflows/release-native.yml` が設定されており、GitHub 上で `v*` タグ（例: `v2.0.1`）をプッシュするか、GitHub Actions の **workflow_dispatch** を手動実行することで、以下のネイティブアプリが自動ビルドされ GitHub Releases にアセットとして登録されます：
- 🍏 **macOS**: Apple Silicon & Intel 共通の Universal Binary (`.dmg`, `.app`)
- 🪟 **Windows**: x64 インストーラー (`.msi`, `.exe`)
- 🐧 **Linux**: `.deb` パッケージ & `.AppImage`

#### 📥 配布バイナリのインストール・初回起動方法（セキュリティ警告の解除）

GitHub Releases からダウンロードしたバイナリは個人開発による自己ビルド（コード署名未購入）のため、各 OS のセキュリティ保護機能によって初回起動時に警告が表示される場合があります。以下の手順で許可して実行してください。

##### 🍏 macOS の場合（Gatekeeper / Quarantine 属性の解除）
1. ダウンロードした `.dmg` を開き、`NativeEar.app` を `/Applications`（アプリケーションフォルダ）へ配置します。
2. 初回起動時に **「開発元を検証できないため開けません」** または **「悪質なソフトウェアかどうかを検証できないため開けません」** と表示された場合、**ターミナル**を開いて以下のコマンドを実行し、Apple の隔離属性（quarantine）を解除してください：
   ```bash
   xattr -cr /Applications/NativeEar.app
   ```
   *(個別の属性削除コマンド: `xattr -d com.apple.quarantine /Applications/NativeEar.app`)*
3. **GUI から起動する場合**:
   - Finder で `NativeEar.app` を **Control キーを押しながらクリック（または右クリック） ➜「開く」** を選択し、表示される確認ダイアログで **「開く」** をクリックします。
   - または、macOS の **「システム設定」➜「プライバシーとセキュリティ」** を開き、セキュリティ項目に表示される「NativeEar は開発元を検証できないため…」の横にある **「このまま開く」** をクリックします。

##### 🪟 Windows の場合（SmartScreen の解除）
1. ダウンロードした `.msi`（または `.exe`）を実行します。
2. **「Windows によって PC が保護されました」**（Microsoft Defender SmartScreen）という青い画面が表示された場合：
   - 画面左側にある **「詳細情報」** をクリックします。
   - 右下に現れる **「実行」** ボタンをクリックします。

##### 🐧 Linux の場合
- **AppImage**:
  ```bash
  chmod +x NativeEar_2.0.1_amd64.AppImage
  ./NativeEar_2.0.1_amd64.AppImage
  ```
- **.deb パッケージ**:
  ```bash
  sudo apt install ./native-ear_2.0.1_amd64.deb
  # または
  sudo dpkg -i native-ear_2.0.1_amd64.deb
  ```

---

## 🛠 技術スタック
- **Frontend**: React 18, TypeScript, Vite
- **Desktop Framework**: Tauri v2, Rust
- **Styling**: Tailwind CSS, Lucide React Icons, Canvas Confetti
- **Speech & Audio**:
  - Web Speech API (`SpeechSynthesis` - 音声合成 / `SpeechRecognition` - 音声認識)
  - Web Audio API (`AudioContext` - シンセサイザー効果音)
- **Algorithms**: Dynamic Programming LCS (Longest Common Subsequence) Word Alignment Token Diff
- **Persistence**: Browser LocalStorage / Desktop Storage
- **CI/CD**: GitHub Actions (GitHub Pages / Multi-platform Desktop Release)
