import {
  getButtonPosition,
  normalizeButtonPosition,
  type ButtonPositionMessage,
  type ButtonPosition,
} from '@/utils/buttonPosition';
import {
  scrollToTopButtonHoverStyle,
  scrollToTopButtonStyle,
  scrollToTopIconStyle,
} from '@/utils/buttonStyle';

export default defineContentScript({
  matches: ['*://twitter.com/*', '*://x.com/*'],
  async main() {
    const buttonId = 'twitter-scroll-to-top-button';

    if (document.getElementById(buttonId)) {
      return;
    }

    const button = document.createElement('button');
    button.id = buttonId;
    button.type = 'button';
    button.title = 'Scroll to top';
    button.setAttribute('aria-label', 'Scroll to top');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 19V5m0 0 7 7m-7-7-7 7"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.25"
        />
      </svg>
    `;

    Object.assign(button.style, scrollToTopButtonStyle);

    const applyButtonPosition = (position: ButtonPosition) => {
      const normalizedPosition = normalizeButtonPosition(position);
      button.style.right = `${normalizedPosition.right}px`;
      button.style.bottom = `${normalizedPosition.bottom}px`;
    };

    const icon = button.querySelector('svg');
    if (icon) {
      Object.assign(icon.style, scrollToTopIconStyle);
    }

    button.addEventListener('mouseenter', () => {
      Object.assign(button.style, scrollToTopButtonHoverStyle);
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = scrollToTopButtonStyle.background;
    });

    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });

    document.body.appendChild(button);
    try {
      applyButtonPosition(await getButtonPosition());
    } catch (error) {
      console.error('Failed to load button position.', error);
    }

    browser.runtime.onMessage.addListener((message: ButtonPositionMessage) => {
      if (message.type === 'twitter-scroll-to-top:update-position') {
        applyButtonPosition(message.position);
      }
    });
  },
});
