export type ButtonPosition = {
  right: number;
  bottom: number;
};

export type ButtonPositionMessage = {
  type: 'twitter-scroll-to-top:update-position';
  position: ButtonPosition;
};

export const defaultButtonPosition: ButtonPosition = {
  right: 80,
  bottom: 80,
};

const minOffset = 0;
const maxOffset = 1000;
const storageKey = 'button-position';

export async function getButtonPosition(): Promise<ButtonPosition> {
  const extensionStorage = getExtensionStorage();

  if (extensionStorage) {
    const storedValue = await getFromExtensionStorage(extensionStorage, storageKey);
    const storedPosition = storedValue[storageKey] as ButtonPosition | undefined;

    return normalizeButtonPosition(storedPosition ?? defaultButtonPosition);
  }

  const storedPosition = readLocalStoragePosition();

  return normalizeButtonPosition(storedPosition ?? defaultButtonPosition);
}

export async function setButtonPosition(position: ButtonPosition): Promise<void> {
  const normalizedPosition = normalizeButtonPosition(position);
  const extensionStorage = getExtensionStorage();

  if (extensionStorage) {
    await setToExtensionStorage(extensionStorage, { [storageKey]: normalizedPosition });
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(normalizedPosition));
}

export function normalizeButtonPosition(position: ButtonPosition): ButtonPosition {
  return {
    right: normalizeOffset(position.right, defaultButtonPosition.right),
    bottom: normalizeOffset(position.bottom, defaultButtonPosition.bottom),
  };
}

function normalizeOffset(value: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(maxOffset, Math.max(minOffset, Math.round(value)));
}

function readLocalStoragePosition(): ButtonPosition | undefined {
  const rawValue = localStorage.getItem(storageKey);

  if (!rawValue) {
    return undefined;
  }

  try {
    return JSON.parse(rawValue) as ButtonPosition;
  } catch {
    return undefined;
  }
}

function getExtensionStorage() {
  const runtime = getExtensionRuntime();

  return runtime?.storage?.local;
}

function getFromExtensionStorage(
  storageArea: ExtensionStorageArea,
  key: string,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    try {
      const maybePromise = storageArea.get(key, (result) => {
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

function setToExtensionStorage(
  storageArea: ExtensionStorageArea,
  items: Record<string, unknown>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const maybePromise = storageArea.set(items, () => {
        resolve();
      });

      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(resolve, reject);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function getExtensionRuntime() {
  const globalScope = globalThis as typeof globalThis & {
    browser?: ExtensionRuntime;
    chrome?: ExtensionRuntime;
  };

  return globalScope.browser?.storage?.local
    ? globalScope.browser
    : globalScope.chrome?.storage?.local
      ? globalScope.chrome
      : undefined;
}

type ExtensionRuntime = {
  storage?: {
    local?: ExtensionStorageArea;
  };
};

type ExtensionStorageArea = {
  get: (
    key: string,
    callback?: (result: Record<string, unknown>) => void,
  ) => Promise<Record<string, unknown>> | void;
  set: (items: Record<string, unknown>, callback?: () => void) => Promise<void> | void;
};
