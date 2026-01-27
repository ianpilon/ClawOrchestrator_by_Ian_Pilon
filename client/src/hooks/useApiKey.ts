import { useState, useEffect, useCallback } from 'react';

const API_KEY_STORAGE_KEY = 'loom_anthropic_api_key';

interface ApiKeyState {
  apiKey: string | null;
  isConfigured: boolean;
  isValidating: boolean;
  validationError: string | null;
  lastValidated: Date | null;
}

export function useApiKey() {
  const [state, setState] = useState<ApiKeyState>({
    apiKey: null,
    isConfigured: false,
    isValidating: false,
    validationError: null,
    lastValidated: null,
  });

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setState(prev => ({
        ...prev,
        apiKey: storedKey,
        isConfigured: true,
      }));
    }
  }, []);

  const validateAndSaveKey = useCallback(async (key: string): Promise<boolean> => {
    if (!key.trim()) {
      setState(prev => ({
        ...prev,
        validationError: 'API key cannot be empty',
      }));
      return false;
    }

    if (!key.startsWith('sk-ant-')) {
      setState(prev => ({
        ...prev,
        validationError: 'Invalid API key format. Should start with sk-ant-',
      }));
      return false;
    }

    setState(prev => ({
      ...prev,
      isValidating: true,
      validationError: null,
    }));

    try {
      const response = await fetch('/api/claude/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });

      const data = await response.json();

      if (data.valid) {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
        setState({
          apiKey: key,
          isConfigured: true,
          isValidating: false,
          validationError: null,
          lastValidated: new Date(),
        });
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isValidating: false,
          validationError: data.error || 'Invalid API key',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isValidating: false,
        validationError: 'Failed to validate API key. Please try again.',
      }));
      return false;
    }
  }, []);

  const clearKey = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setState({
      apiKey: null,
      isConfigured: false,
      isValidating: false,
      validationError: null,
      lastValidated: null,
    });
  }, []);

  const getKey = useCallback((): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }, []);

  return {
    ...state,
    validateAndSaveKey,
    clearKey,
    getKey,
  };
}
