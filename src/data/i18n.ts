export type Language = 'ja' | 'en';

export interface Translations {
  header: {
    title: string;
    badge: string;
    subtitle: string;
    streakDays: (days: number) => string;
    streakTitle: string;
    review: string;
    reviewTitle: string;
    statsTitle: string;
    settingsTitle: string;
    themeDark: string;
    themeLight: string;
    langSwitch: string;
  };
  levelSelector: {
    title: string;
    subtitle: string;
    levelSubtitles: Record<number, string>;
    levelDescriptions: Record<number, string>;
    target: (range: string) => string;
    practiced: (count: number) => string;
    avgScore: (score: number) => string;
  };
  controls: {
    shuffleOn: string;
    shuffleOff: string;
    shuffleTitle: string;
    skip: string;
    skipTitle: string;
    totalCount: (count: number) => string;
    questionsUnit: string;
  };
  audioPlayer: {
    questionCount: (current: number, total: number) => string;
    femaleVoice: string;
    femaleVoiceTitle: string;
    maleVoice: string;
    maleVoiceTitle: string;
    playing: string;
    playAudio: string;
    playAgain: (count: number) => string;
    waveformHint: string;
    speedLabel: string;
    speedDefault: string;
    shortcutHint: string;
  };
  modeTabs: {
    dictation: string;
    shadowing: string;
  };
  dictationInput: {
    label: string;
    hintHide: string;
    hintShow: string;
    hintTitle: string;
    hintPrefix: string;
    placeholder: string;
    clear: string;
    wordCount: string;
    wordsUnit: string;
    giveUp: string;
    giveUpTitle: string;
    submit: string;
  };
  shadowingInput: {
    label: string;
    startRecording: string;
    stopRecording: string;
    listeningStatus: string;
    clickToRecord: string;
    recognizedLabel: string;
    emptyTranscript: string;
    clear: string;
    giveUp: string;
    submit: string;
    micNotSupported: string;
    micPermissionDenied: string;
    autoSubmitHint: string;
    playModelAudio: string;
    listeningTooltip: string;
    clickToSpeakTooltip: string;
  };
  resultFeedback: {
    accuracy: string;
    badgePerfect: string;
    badgeGreat: string;
    badgeGood: string;
    badgePractice: string;
    bookmarkSaved: string;
    bookmarkSave: string;
    next: string;
    diffTitle: string;
    diffCorrect: string;
    diffWrong: string;
    diffMissing: string;
    diffExpectedPrefix: string;
    modelSentenceTitle: string;
    speedNormal: string;
    speedSlow: string;
    vocabTitle: string;
    tipsTitle: string;
    grammarLabel: string;
    linkingLabel: string;
    meaningLabel: string;
  };
  statsModal: {
    title: string;
    totalAnswered: string;
    overallAccuracy: string;
    perfectCount: string;
    streakDays: string;
    questionsUnit: string;
    daysUnit: string;
    levelBreakdownTitle: string;
    practicedLabel: (count: number) => string;
    perfectLabel: (count: number) => string;
    avgScoreLabel: (avg: number) => string;
    recentHistoryTitle: string;
    notSubmitted: string;
    resetStats: string;
    resetConfirm: string;
    close: string;
  };
  reviewModal: {
    title: (count: number) => string;
    emptyTitle: string;
    emptyDesc: string;
    playPreview: string;
    remove: string;
    practiceThis: string;
    close: string;
  };
  settingsModal: {
    title: string;
    voiceGenderTitle: string;
    femaleVoice: string;
    femaleVoiceSub: string;
    maleVoice: string;
    maleVoiceSub: string;
    testVoice: string;
    learningOptionsTitle: string;
    autoPlayTitle: string;
    autoPlayDesc: string;
    strictModeTitle: string;
    strictModeDesc: string;
    showHintsTitle: string;
    showHintsDesc: string;
    languageTitle: string;
    languageDesc: string;
    langJa: string;
    langEn: string;
    close: string;
  };
  licenseModal: {
    title: string;
    subtitle: string;
    repo: string;
    close: string;
  };
  footer: {
    copyright: string;
    subtitle: string;
    licenseLink: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ja: {
    header: {
      title: 'NativeEar',
      badge: 'TOEIC Listening',
      subtitle: '米語ネイティブ発音・ディクテーション特訓',
      streakDays: (d) => `${d}日`,
      streakTitle: '連続学習日数',
      review: '復習',
      reviewTitle: '復習・ブックマーク',
      statsTitle: '学習データ・成績',
      settingsTitle: '設定',
      themeDark: 'ライトモードに切替',
      themeLight: 'ダークモードに切替',
      langSwitch: 'English',
    },
    levelSelector: {
      title: 'TOEIC 目標スコアレベル',
      subtitle: '発話速度・難易度が自動調整されます',
      levelSubtitles: {
        300: '入門・超短文',
        400: '初級・基礎短文',
        500: '基礎・クリア発音',
        600: '日常業務・標準速度',
        700: '実務討議・イディオム',
        800: '高度実務・複文構造',
        900: '最速・ネイティブ',
      },
      levelDescriptions: {
        300: '3〜5語の基礎日常・オフィス表現。シャドーイング入門に最適な超短文。',
        400: '5〜7語の基本業務表現。短くクリアで聞き取りやすいネイティブ基礎英語。',
        500: '写真描写・質問応答・日常オフィスの短い一文。明瞭で聞き取りやすいスピード。',
        600: '社内連絡・メール・旅行・接客など実務で頻出の表現。標準的なネイティブ速度。',
        700: 'プレゼン、会議、交渉、定型表現や連結音（リンキング）を含む実践的な英文。',
        800: '長めの複文、経営・市場・分析など一段上のビジネス語彙と自然な速さ。',
        900: '倒置や高度な語彙、音の脱落（リダクション）を含むハイレベルな実戦英語。',
      },
      target: (range) => range,
      practiced: (count) => `演習: ${count}問`,
      avgScore: (score) => `${score}%`,
    },
    controls: {
      shuffleOn: 'ランダム出題: ON',
      shuffleOff: '順番通り出題',
      shuffleTitle: '問題のランダム出題',
      skip: '別の問題',
      skipTitle: '別の問題を引く',
      totalCount: (count) => `(全 ${count.toLocaleString()} 問)`,
      questionsUnit: '問',
    },
    audioPlayer: {
      questionCount: (current, total) => `問題 ${current} / ${total}`,
      femaleVoice: '女声 (Female)',
      femaleVoiceTitle: '女性ネイティブ音声 (Female Voice)',
      maleVoice: '男声 (Male)',
      maleVoiceTitle: '男性ネイティブ音声 (Male Voice)',
      playing: '再生中...',
      playAudio: '音声を聴く (Play Audio)',
      playAgain: (count) => `もう一度聴く (${count}回目)`,
      waveformHint: 'Space / クリックで再生',
      speedLabel: '速度 (Speed):',
      speedDefault: '標準',
      shortcutHint: 'ショートカット: Space 再生 / Enter 判定',
    },
    modeTabs: {
      dictation: 'ディクテーション (タイピング)',
      shadowing: 'シャドーイング (音声入力)',
    },
    dictationInput: {
      label: '聴こえた英文を入力 (Type what you heard)',
      hintHide: 'ヒントを隠す',
      hintShow: '頭文字ヒント',
      hintTitle: '頭文字ヒントの表示/非表示',
      hintPrefix: 'ヒント:',
      placeholder: '聴こえた英語をタイプしてください... (例: The meeting will start...)',
      clear: 'クリア',
      wordCount: '単語数:',
      wordsUnit: 'words',
      giveUp: '解答を見る',
      giveUpTitle: '正解を確認する',
      submit: '判定する (Submit)',
    },
    shadowingInput: {
      label: '音声を聴きながら声に出してスピーキング (Shadowing)',
      startRecording: '音声を吹き込む (Start Speaking)',
      stopRecording: '録音を停止 (Stop Recording)',
      listeningStatus: 'マイクで音声を認識中... 英語を発音してください 🎙️',
      clickToRecord: '「音声を吹き込む」を押して、英文をマイクに向かって発音してください',
      recognizedLabel: '認識された英文:',
      emptyTranscript: '(ここに発音した英語がリアルタイムに文字起こしされます)',
      clear: 'やり直す',
      giveUp: '解答を見る',
      submit: '音声で判定する (Submit Voice)',
      micNotSupported: 'お使いのブラウザは音声認識 (Web Speech API) に未対応です。Google Chrome、Microsoft Edge、またはSafariをご利用ください。',
      micPermissionDenied: 'マイクへのアクセスが拒否されました。ブラウザの設定でマイクを許可してください。',
      autoSubmitHint: '発音後、「音声で判定する」を押して結果を確認できます',
      playModelAudio: '模範音声を聴く',
      listeningTooltip: '音声認識中...',
      clickToSpeakTooltip: 'クリックして発音',
    },
    resultFeedback: {
      accuracy: '一致率:',
      badgePerfect: 'Perfect! 完全正解 ✨',
      badgeGreat: 'Great Job! 高精度 🎯',
      badgeGood: 'Good Effort! おしい 💡',
      badgePractice: 'Keep Practicing! 要復習 💪',
      bookmarkSaved: '苦手保存中',
      bookmarkSave: '苦手保存',
      next: '次の問題へ (Next)',
      diffTitle: '単語判定 (Word-by-Word Diff)',
      diffCorrect: '正解',
      diffWrong: '誤り',
      diffMissing: '脱落',
      diffExpectedPrefix: '正:',
      modelSentenceTitle: '模範英文 & 発音復習',
      speedNormal: '等速',
      speedSlow: '0.8x',
      vocabTitle: '重要語彙・頻出フレーズ',
      tipsTitle: 'TOEIC リスニング攻略ポイント',
      grammarLabel: '文法・構造:',
      linkingLabel: '音の連結 (Linking):',
      meaningLabel: '日本語訳:',
    },
    statsModal: {
      title: '学習データ・成績レポート',
      totalAnswered: '総演習数',
      overallAccuracy: '平均一致率',
      perfectCount: '完全正解数',
      streakDays: '継続日数',
      questionsUnit: '問',
      daysUnit: '日',
      levelBreakdownTitle: 'TOEIC スコアレベル別 実績',
      practicedLabel: (count) => `演習: ${count}問`,
      perfectLabel: (count) => `正解: ${count}問`,
      avgScoreLabel: (avg) => `平均: ${avg}%`,
      recentHistoryTitle: '直近の回答履歴 (最新10件)',
      notSubmitted: '(未入力)',
      resetStats: 'データを初期化',
      resetConfirm: 'これまでの学習データをすべてリセットしますか？この操作は取り消せません。',
      close: '閉じる',
    },
    reviewModal: {
      title: (count) => `復習・苦手リスト (${count}件)`,
      emptyTitle: '現在ブックマークされた苦手問題はありません',
      emptyDesc: '問題演習後の判定画面にある「苦手保存」ボタンを押すと、ここにストックされます。',
      playPreview: '音声を再生',
      remove: 'リストから削除',
      practiceThis: 'この問題をディクテーション特訓',
      close: '閉じる',
    },
    settingsModal: {
      title: 'アプリ・音声設定',
      voiceGenderTitle: '標準ネイティブ発話者 (Native Voice)',
      femaleVoice: '女性ネイティブ',
      femaleVoiceSub: 'US Female Voice',
      maleVoice: '男性ネイティブ',
      maleVoiceSub: 'US Male Voice',
      testVoice: 'テスト音声を再生',
      learningOptionsTitle: '学習オプション',
      autoPlayTitle: '問題切り替え時に自動再生',
      autoPlayDesc: '次の問題へ進んだ際、自動的に音声を流します',
      strictModeTitle: '厳格判定モード (Strict Mode)',
      strictModeDesc: 'ピリオド、カンマ、大文字・小文字も厳密に判定します',
      showHintsTitle: '頭文字ヒントを初期表示',
      showHintsDesc: '各単語の先頭文字のヒントを表示します',
      languageTitle: '表示言語 (Language)',
      languageDesc: 'ブラウザ設定または手動で切り替えられます',
      langJa: '日本語 (Japanese)',
      langEn: 'English (英語)',
      close: '設定を完了',
    },
    licenseModal: {
      title: 'オープンソースライセンス (OSS Licenses)',
      subtitle: '本アプリケーションで使用しているオープンソースソフトウェアの著作権および許諾表示',
      repo: 'リポジトリ:',
      close: '閉じる',
    },
    footer: {
      copyright: 'NativeEar © cuio.net',
      subtitle: 'アメリカ英語ネイティブ音声 / 300〜900点レベル別対応',
      licenseLink: 'OSSライセンス・著作権表記',
    },
  },
  en: {
    header: {
      title: 'NativeEar',
      badge: 'TOEIC Listening',
      subtitle: 'US Native Audio Dictation Training',
      streakDays: (d) => `${d}d streak`,
      streakTitle: 'Daily Practice Streak',
      review: 'Review',
      reviewTitle: 'Review Bookmarks',
      statsTitle: 'Learning Stats & Score Report',
      settingsTitle: 'Settings',
      themeDark: 'Switch to Light Mode',
      themeLight: 'Switch to Dark Mode',
      langSwitch: '日本語',
    },
    levelSelector: {
      title: 'TOEIC Target Score Level',
      subtitle: 'Speech rate and difficulty automatically adapt to each level',
      levelSubtitles: {
        300: 'Starter & Short Phrases',
        400: 'Elementary Short Sentences',
        500: 'Basic, Short & Clear Speech',
        600: 'Daily Business & Standard Speed',
        700: 'Business Discussions & Idioms',
        800: 'Advanced Business & Complex Clauses',
        900: 'Fastest Native & Advanced Vocab',
      },
      levelDescriptions: {
        300: '3-5 words of essential daily and office expressions. Ideal for beginner shadowing.',
        400: '5-7 words of clear fundamental business expressions with crisp pronunciation.',
        500: 'Photo descriptions, Q&A, and short daily office sentences with clear speed.',
        600: 'Internal memos, emails, travel, and customer service at standard speed.',
        700: 'Presentations, meetings, negotiations, idioms, and connected speech.',
        800: 'Complex sentences, executive management, market analysis, and natural speed.',
        900: 'Inversions, high-level vocabulary, and reductions for top-tier listening mastery.',
      },
      target: (range) => range,
      practiced: (count) => `Practiced: ${count}`,
      avgScore: (score) => `${score}%`,
    },
    controls: {
      shuffleOn: 'Shuffle Mode: ON',
      shuffleOff: 'Sequential Order',
      shuffleTitle: 'Toggle random question order',
      skip: 'Next Sentence',
      skipTitle: 'Draw another question',
      totalCount: (count) => `(${count.toLocaleString()} total)`,
      questionsUnit: 'questions',
    },
    audioPlayer: {
      questionCount: (current, total) => `Sentence ${current} / ${total}`,
      femaleVoice: 'Female Voice',
      femaleVoiceTitle: 'US Female Native Voice',
      maleVoice: 'Male Voice',
      maleVoiceTitle: 'US Male Native Voice',
      playing: 'Playing Audio...',
      playAudio: 'Play Audio',
      playAgain: (count) => `Play Again (${count}x)`,
      waveformHint: 'Press Space or click to play',
      speedLabel: 'Speed:',
      speedDefault: 'Default',
      shortcutHint: 'Shortcuts: Space Play / Enter Submit',
    },
    modeTabs: {
      dictation: 'Dictation (Typing)',
      shadowing: 'Shadowing (Voice)',
    },
    dictationInput: {
      label: 'Type what you heard (Dictation Practice)',
      hintHide: 'Hide Hints',
      hintShow: 'Letter Hints',
      hintTitle: 'Toggle first letter hints',
      hintPrefix: 'Hint:',
      placeholder: 'Type the English sentence you hear... (e.g. The meeting will start...)',
      clear: 'Clear',
      wordCount: 'Words:',
      wordsUnit: 'words',
      giveUp: 'Show Answer',
      giveUpTitle: 'Reveal the correct sentence',
      submit: 'Submit Answer',
    },
    shadowingInput: {
      label: 'Speak the English sentence out loud (Shadowing Practice)',
      startRecording: 'Start Voice Input',
      stopRecording: 'Stop Recording',
      listeningStatus: 'Listening to your voice... Speak in English now 🎙️',
      clickToRecord: 'Click "Start Voice Input" and speak into your microphone',
      recognizedLabel: 'Recognized Speech:',
      emptyTranscript: '(Your spoken English will appear here in real-time)',
      clear: 'Clear / Retry',
      giveUp: 'Show Answer',
      submit: 'Check Spoken Sentence',
      micNotSupported: 'Web Speech API is not supported in this browser. Please use Google Chrome, Edge, or Safari.',
      micPermissionDenied: 'Microphone access was denied. Please allow microphone permission in your browser settings.',
      autoSubmitHint: 'When finished speaking, click "Check Spoken Sentence" to evaluate',
      playModelAudio: 'Play Model Audio',
      listeningTooltip: 'Listening...',
      clickToSpeakTooltip: 'Click to speak',
    },
    resultFeedback: {
      accuracy: 'Accuracy:',
      badgePerfect: 'Perfect! 100% Match ✨',
      badgeGreat: 'Great Job! High Accuracy 🎯',
      badgeGood: 'Good Effort! Keep Going 💡',
      badgePractice: 'Needs Review! Keep Practicing 💪',
      bookmarkSaved: 'Bookmarked',
      bookmarkSave: 'Bookmark',
      next: 'Next Sentence',
      diffTitle: 'Word-by-Word Diff Analysis',
      diffCorrect: 'Correct',
      diffWrong: 'Incorrect',
      diffMissing: 'Missing',
      diffExpectedPrefix: 'Exp:',
      modelSentenceTitle: 'Model Sentence & Pronunciation Review',
      speedNormal: '1.0x',
      speedSlow: '0.8x',
      vocabTitle: 'Key Vocabulary & Phrases',
      tipsTitle: 'TOEIC Listening Tips & Analysis',
      grammarLabel: 'Grammar & Structure:',
      linkingLabel: 'Connected Speech (Linking):',
      meaningLabel: 'Translation / Meaning:',
    },
    statsModal: {
      title: 'Learning Stats & Score Report',
      totalAnswered: 'Total Questions',
      overallAccuracy: 'Avg Accuracy',
      perfectCount: 'Perfect Scores',
      streakDays: 'Active Streak',
      questionsUnit: 'questions',
      daysUnit: 'days',
      levelBreakdownTitle: 'Performance by TOEIC Level',
      practicedLabel: (count) => `Practiced: ${count}`,
      perfectLabel: (count) => `Perfect: ${count}`,
      avgScoreLabel: (avg) => `Avg: ${avg}%`,
      recentHistoryTitle: 'Recent Practice History (Last 10)',
      notSubmitted: '(empty)',
      resetStats: 'Reset All Stats',
      resetConfirm: 'Are you sure you want to reset all learning statistics? This action cannot be undone.',
      close: 'Close',
    },
    reviewModal: {
      title: (count) => `Review & Bookmark List (${count})`,
      emptyTitle: 'No bookmarked questions yet',
      emptyDesc: 'Click the "Bookmark" button on any evaluation screen to save challenging questions here for review.',
      playPreview: 'Play Audio',
      remove: 'Remove from list',
      practiceThis: 'Practice this sentence',
      close: 'Close',
    },
    settingsModal: {
      title: 'App & Voice Settings',
      voiceGenderTitle: 'Default Native Voice',
      femaleVoice: 'US Female Voice',
      femaleVoiceSub: 'Natural American Accent',
      maleVoice: 'US Male Voice',
      maleVoiceSub: 'Natural American Accent',
      testVoice: 'Play Sample Audio',
      learningOptionsTitle: 'Learning Options',
      autoPlayTitle: 'Auto-play on next question',
      autoPlayDesc: 'Automatically speaks the sentence when advancing to a new question',
      strictModeTitle: 'Strict Mode',
      strictModeDesc: 'Strictly check punctuation (periods, commas) and capitalization',
      showHintsTitle: 'Show letter hints by default',
      showHintsDesc: 'Display initial letter of each word as a clue',
      languageTitle: 'Language (表示言語)',
      languageDesc: 'Auto-detected from browser or selected manually',
      langJa: '日本語 (Japanese)',
      langEn: 'English',
      close: 'Save & Close',
    },
    licenseModal: {
      title: 'Open Source Software Licenses',
      subtitle: 'Copyright notices and licenses for open source software used in NativeEar',
      repo: 'Repository:',
      close: 'Close',
    },
    footer: {
      copyright: 'NativeEar © cuio.net',
      subtitle: 'US Native English Speech / TOEIC Levels 300 - 900',
      licenseLink: 'Open Source Licenses & Copyright',
    },
  },
};

/**
 * Detect browser default language: returns 'ja' if browser is set to Japanese, otherwise 'en'
 */
export function detectBrowserLanguage(): Language {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('native_ear_lang') as Language;
    if (saved === 'ja' || saved === 'en') {
      return saved;
    }
  }

  if (typeof navigator !== 'undefined') {
    const navLangs = navigator.languages || [navigator.language || ''];
    for (const lang of navLangs) {
      if (lang && lang.toLowerCase().startsWith('ja')) {
        return 'ja';
      }
    }
  }

  return 'en';
}
