export const defaultPopupLanguage = 'zh-CN';

export type PopupLanguage = 'zh-CN' | 'en';

export const popupLanguageOptions: Array<{ code: PopupLanguage; label: string }> = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en', label: 'English' },
];

const popupCopy = {
  'zh-CN': {
    title: '回到顶部按钮',
    description: '自定义按钮在页面右下角的位置。',
    languageLabel: '界面语言',
    rightLabel: '距右侧',
    bottomLabel: '距底部',
    resetButton: '重置',
    savingStatus: '保存中...',
    errorStatus: '保存失败',
    savedStatus: '已保存',
    unsavedStatus: '未保存',
  },
  en: {
    title: 'Back to Top Button',
    description: 'Customize the button position in the lower-right corner.',
    languageLabel: 'Interface language',
    rightLabel: 'Right offset',
    bottomLabel: 'Bottom offset',
    resetButton: 'Reset',
    savingStatus: 'Saving...',
    errorStatus: 'Save failed',
    savedStatus: 'Saved',
    unsavedStatus: 'Unsaved',
  },
} as const;

export function normalizePopupLanguage(value: string | null): PopupLanguage {
  return popupLanguageOptions.some((option) => option.code === value)
    ? (value as PopupLanguage)
    : defaultPopupLanguage;
}

export function getPopupCopy(language: PopupLanguage) {
  return popupCopy[language];
}
