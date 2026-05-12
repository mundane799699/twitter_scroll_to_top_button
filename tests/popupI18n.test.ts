import assert from 'node:assert/strict';
import test from 'node:test';

import {
  defaultPopupLanguage,
  getPopupCopy,
  normalizePopupLanguage,
  popupLanguageOptions,
} from '../utils/popupI18n.ts';

test('popup language options expose Chinese and English labels', () => {
  assert.deepEqual(popupLanguageOptions, [
    { code: 'zh-CN', label: '中文' },
    { code: 'en', label: 'English' },
  ]);
});

test('popup copy switches between Chinese and English', () => {
  assert.equal(getPopupCopy('zh-CN').title, '回到顶部按钮');
  assert.equal(getPopupCopy('zh-CN').rightLabel, '距右侧');
  assert.equal(getPopupCopy('zh-CN').savedStatus, '已保存');

  assert.equal(getPopupCopy('en').title, 'Back to Top Button');
  assert.equal(getPopupCopy('en').rightLabel, 'Right offset');
  assert.equal(getPopupCopy('en').savedStatus, 'Saved');
});

test('popup language falls back to Chinese for unsupported values', () => {
  assert.equal(defaultPopupLanguage, 'zh-CN');
  assert.equal(normalizePopupLanguage('en'), 'en');
  assert.equal(normalizePopupLanguage('ja'), 'zh-CN');
  assert.equal(normalizePopupLanguage(null), 'zh-CN');
});
