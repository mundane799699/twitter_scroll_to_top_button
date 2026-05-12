import { useEffect, useRef, useState } from 'react';
import {
  defaultButtonPosition,
  getButtonPosition,
  normalizeButtonPosition,
  setButtonPosition,
  type ButtonPosition,
  type ButtonPositionMessage,
} from '@/utils/buttonPosition';
import {
  defaultPopupLanguage,
  getPopupCopy,
  normalizePopupLanguage,
  popupLanguageOptions,
  type PopupLanguage,
} from '@/utils/popupI18n';
import './App.css';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const languageStorageKey = 'twitter-scroll-to-top:popup-language';

function App() {
  const [position, setPosition] = useState<ButtonPosition>(defaultButtonPosition);
  const [language, setLanguage] = useState<PopupLanguage>(() => loadPopupLanguage());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveRequestId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasLoadedInitialPosition = useRef(false);
  const shouldSkipNextAutoSave = useRef(false);
  const copy = getPopupCopy(language);

  useEffect(() => {
    let isMounted = true;

    getButtonPosition()
      .then((storedPosition) => {
        if (isMounted) {
          shouldSkipNextAutoSave.current = true;
          setPosition(storedPosition);
          setSaveStatus('saved');
          hasLoadedInitialPosition.current = true;
        }
      })
      .catch((error) => {
        console.error('Failed to load button position.', error);
        if (isMounted) {
          setSaveStatus('error');
          hasLoadedInitialPosition.current = true;
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedInitialPosition.current) {
      return;
    }

    if (shouldSkipNextAutoSave.current) {
      shouldSkipNextAutoSave.current = false;
      return;
    }

    setSaveStatus('idle');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      void savePosition(position);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [position]);

  const savePosition = async (nextPosition: ButtonPosition) => {
    const normalizedPosition = normalizeButtonPosition(nextPosition);
    const requestId = saveRequestId.current + 1;
    saveRequestId.current = requestId;
    setSaveStatus('saving');

    try {
      await setButtonPosition(normalizedPosition);
      await notifyActiveTab(normalizedPosition);
      if (saveRequestId.current === requestId) {
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Failed to save button position.', error);
      if (saveRequestId.current === requestId) {
        setSaveStatus('error');
      }
    }
  };

  const updatePosition = (key: keyof ButtonPosition, value: string) => {
    const nextPosition = normalizeButtonPosition({
      ...position,
      [key]: Number(value),
    });

    setPosition(nextPosition);
  };

  const resetPosition = () => {
    setPosition(defaultButtonPosition);
  };

  const updateLanguage = (nextLanguage: string) => {
    const normalizedLanguage = normalizePopupLanguage(nextLanguage);
    setLanguage(normalizedLanguage);
    savePopupLanguage(normalizedLanguage);
  };

  return (
    <main className="popup">
      <div className="popup__top-bar">
        <div className="popup__header">
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>

        <label className="language-select">
          <span>{copy.languageLabel}</span>
          <select value={language} onChange={(event) => updateLanguage(event.target.value)}>
            {popupLanguageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field">
        <label htmlFor="button-right">{copy.rightLabel}</label>
        <div className="number-input">
          <input
            id="button-right"
            min="0"
            max="1000"
            step="1"
            type="number"
            value={position.right}
            onChange={(event) => updatePosition('right', event.target.value)}
          />
          <span>px</span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="button-bottom">{copy.bottomLabel}</label>
        <div className="number-input">
          <input
            id="button-bottom"
            min="0"
            max="1000"
            step="1"
            type="number"
            value={position.bottom}
            onChange={(event) => updatePosition('bottom', event.target.value)}
          />
          <span>px</span>
        </div>
      </div>

      <div className="preview" aria-hidden="true">
        <div
          className="preview__button"
          style={{
            right: `${Math.min(position.right / 4, 64)}px`,
            bottom: `${Math.min(position.bottom / 4, 64)}px`,
          }}
        />
      </div>

      <div className="actions">
        <div className="actions__buttons">
          <button type="button" className="button button--secondary" onClick={resetPosition}>
            {copy.resetButton}
          </button>
        </div>
        <span aria-live="polite">
          {saveStatus === 'saving'
            ? copy.savingStatus
            : saveStatus === 'error'
              ? copy.errorStatus
              : saveStatus === 'saved'
                ? copy.savedStatus
                : copy.unsavedStatus}
        </span>
      </div>
    </main>
  );
}

function loadPopupLanguage(): PopupLanguage {
  try {
    return normalizePopupLanguage(localStorage.getItem(languageStorageKey));
  } catch {
    return defaultPopupLanguage;
  }
}

function savePopupLanguage(language: PopupLanguage) {
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // The popup still works if extension storage is unavailable.
  }
}

async function notifyActiveTab(position: ButtonPosition) {
  const extensionTabs = getExtensionTabs();

  if (!extensionTabs) {
    return;
  }

  const [activeTab] = await queryExtensionTabs(extensionTabs, {
    active: true,
    currentWindow: true,
  });

  if (!activeTab?.id) {
    return;
  }

  const message: ButtonPositionMessage = {
    type: 'twitter-scroll-to-top:update-position',
    position,
  };

  try {
    await sendExtensionTabMessage(extensionTabs, activeTab.id, message);
  } catch (error) {
    console.debug('No scroll-to-top content script found in the active tab.', error);
  }
}

function queryExtensionTabs(
  tabs: ExtensionTabs,
  queryInfo: Record<string, unknown>,
): Promise<Array<{ id?: number }>> {
  return new Promise((resolve, reject) => {
    try {
      const maybePromise = tabs.query(queryInfo, (result) => {
        resolve(result);
      });

      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(resolve, reject);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function sendExtensionTabMessage(
  tabs: ExtensionTabs,
  tabId: number,
  message: ButtonPositionMessage,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const maybePromise = tabs.sendMessage(tabId, message, () => {
        resolve();
      });

      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(() => resolve(), reject);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function getExtensionTabs() {
  const globalScope = globalThis as typeof globalThis & {
    browser?: ExtensionRuntime;
    chrome?: ExtensionRuntime;
  };

  return globalScope.browser?.tabs ?? globalScope.chrome?.tabs;
}

type ExtensionRuntime = {
  tabs?: ExtensionTabs;
};

type ExtensionTabs = {
  query: (
    queryInfo: Record<string, unknown>,
    callback?: (result: Array<{ id?: number }>) => void,
  ) => Promise<Array<{ id?: number }>> | void;
  sendMessage: (
    tabId: number,
    message: ButtonPositionMessage,
    callback?: () => void,
  ) => Promise<void> | void;
};

export default App;
