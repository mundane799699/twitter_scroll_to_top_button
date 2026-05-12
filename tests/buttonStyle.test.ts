import assert from 'node:assert/strict';
import test from 'node:test';

import { scrollToTopButtonStyle, scrollToTopIconStyle } from '../utils/buttonStyle.ts';

test('scroll-to-top button matches the native x.com floating action style', () => {
  assert.equal(scrollToTopButtonStyle.background, '#ffffff');
  assert.equal(scrollToTopButtonStyle.border, '1px solid rgb(207, 217, 222)');
  assert.equal(scrollToTopButtonStyle.borderRadius, '16px');
  assert.equal(scrollToTopButtonStyle.boxShadow, 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px');
  assert.equal(scrollToTopButtonStyle.color, 'rgb(15, 20, 25)');
  assert.equal(scrollToTopButtonStyle.height, '56px');
  assert.equal(scrollToTopButtonStyle.width, '56px');
});

test('scroll-to-top icon is sized like the native x.com action icons', () => {
  assert.equal(scrollToTopIconStyle.height, '32px');
  assert.equal(scrollToTopIconStyle.width, '32px');
});
