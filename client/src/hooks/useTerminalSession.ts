import { useState, useCallback, useRef, useEffect } from 'react';

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'streaming';
  content: string;
  timestamp: Date;
}

export interface LoopContext {
  loopId: string;
  loopName: string;
  mode?: string;
  goal?: string;
  status?: string;
  iterationCount?: number;
  interventionReason?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseTerminalSessionOptions {
  loopId?: string;
  loopName?: string;
  loopContext?: LoopContext;
  onCommand?: (command: string) => Promise<string | void>;
  initialLines?: TerminalLine[];
}

const API_KEY_STORAGE_KEY = 'loom_anthropic_api_key';

export function useTerminalSession(options: UseTerminalSessionOptions = {}) {
  const { loopId, loopName, loopContext, onCommand, initialLines = [] } = options;
  
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => !!localStorage.getItem(API_KEY_STORAGE_KEY));
  const lineIdCounter = useRef(0);
  const messagesRef = useRef<Message[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const checkApiKey = () => {
      setHasApiKey(!!localStorage.getItem(API_KEY_STORAGE_KEY));
    };
    
    window.addEventListener('storage', checkApiKey);
    const interval = setInterval(checkApiKey, 1000);
    
    return () => {
      window.removeEventListener('storage', checkApiKey);
      clearInterval(interval);
    };
  }, []);

  const generateLineId = useCallback(() => {
    lineIdCounter.current += 1;
    return `line-${loopId || 'global'}-${lineIdCounter.current}-${Date.now()}`;
  }, [loopId]);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: generateLineId(),
      type,
      content,
      timestamp: new Date(),
    };
    setLines(prev => [...prev, newLine]);
    return newLine;
  }, [generateLineId]);

  const updateStreamingLine = useCallback((lineId: string, content: string) => {
    setLines(prev => prev.map(line => 
      line.id === lineId ? { ...line, content } : line
    ));
  }, []);

  const finalizeStreamingLine = useCallback((lineId: string) => {
    setLines(prev => prev.map(line => 
      line.id === lineId ? { ...line, type: 'output' as const } : line
    ));
  }, []);

  const getApiKey = useCallback((): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }, []);

  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim() || isProcessing) return;

    const trimmedCommand = command.trim();
    
    setCommandHistory(prev => [...prev.filter(c => c !== trimmedCommand), trimmedCommand]);
    setHistoryIndex(-1);
    
    addLine('input', trimmedCommand);

    if (trimmedCommand.toLowerCase() === 'clear') {
      setLines([]);
      messagesRef.current = [];
      return;
    }

    if (trimmedCommand.toLowerCase() === 'help') {
      addLine('system', `Loom Terminal - Claude Code Interface

Commands:
  help     - Show this help message
  clear    - Clear terminal history
  status   - Show current loop status
  context  - Display loop context
  
Or type any message to chat with Claude about this loop.

${!getApiKey() ? '⚠️  No API key configured. Go to Settings to add your Anthropic API key.' : '✓ API key configured - Ready to chat with Claude'}`);
      return;
    }

    if (trimmedCommand.toLowerCase() === 'status') {
      addLine('system', `Loop: ${loopName || loopId || 'unknown'}
Status: ${loopContext?.status || 'unknown'}
Mode: ${loopContext?.mode || 'unknown'}
Iterations: ${loopContext?.iterationCount || 0}`);
      return;
    }

    if (trimmedCommand.toLowerCase() === 'context') {
      addLine('system', `Loop Context:
  ID: ${loopId || 'N/A'}
  Name: ${loopName || 'N/A'}
  Mode: ${loopContext?.mode || 'N/A'}
  Goal: ${loopContext?.goal || 'N/A'}
  Status: ${loopContext?.status || 'N/A'}
  Iterations: ${loopContext?.iterationCount || 0}
  ${loopContext?.interventionReason ? `Intervention: ${loopContext.interventionReason}` : ''}`);
      return;
    }

    if (onCommand) {
      setIsProcessing(true);
      try {
        const response = await onCommand(trimmedCommand);
        if (response) {
          addLine('output', response);
        }
      } catch (error) {
        addLine('error', error instanceof Error ? error.message : 'Command failed');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      addLine('error', 'No API key configured. Open Settings (gear icon in top bar) to add your Anthropic API key.');
      return;
    }

    setIsProcessing(true);
    
    messagesRef.current.push({ role: 'user', content: trimmedCommand });
    
    const streamingLine = addLine('streaming', '');
    let streamedContent = '';

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          messages: messagesRef.current,
          loopContext: loopContext || { loopId, loopName },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                streamedContent += data.text;
                updateStreamingLine(streamingLine.id, streamedContent);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
      
      if (buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          if (data.text) {
            streamedContent += data.text;
            updateStreamingLine(streamingLine.id, streamedContent);
          }
        } catch (e) {
        }
      }

      finalizeStreamingLine(streamingLine.id);
      messagesRef.current.push({ role: 'assistant', content: streamedContent });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        updateStreamingLine(streamingLine.id, streamedContent + '\n[Cancelled]');
        finalizeStreamingLine(streamingLine.id);
      } else {
        setLines(prev => prev.filter(l => l.id !== streamingLine.id));
        addLine('error', error.message || 'Failed to get response');
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [loopId, loopName, loopContext, onCommand, isProcessing, addLine, updateStreamingLine, finalizeStreamingLine, getApiKey]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return '';

    let newIndex: number;
    if (direction === 'up') {
      newIndex = historyIndex === -1 
        ? commandHistory.length - 1 
        : Math.max(0, historyIndex - 1);
    } else {
      newIndex = historyIndex === -1 
        ? -1 
        : Math.min(commandHistory.length - 1, historyIndex + 1);
    }

    setHistoryIndex(newIndex);
    return newIndex === -1 ? '' : commandHistory[newIndex];
  }, [commandHistory, historyIndex]);

  const clearTerminal = useCallback(() => {
    setLines([]);
    messagesRef.current = [];
  }, []);

  const addSystemMessage = useCallback((message: string) => {
    addLine('system', message);
  }, [addLine]);

  return {
    lines,
    isProcessing,
    commandHistory,
    executeCommand,
    cancelRequest,
    navigateHistory,
    clearTerminal,
    addSystemMessage,
    addLine,
    hasApiKey,
  };
}
