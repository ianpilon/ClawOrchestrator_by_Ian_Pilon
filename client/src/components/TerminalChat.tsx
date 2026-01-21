import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus, Send, Clock, Pencil, Terminal } from 'lucide-react';

interface TerminalChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockConversations = [
  { id: '1', title: 'Debug convoy orchestration', date: 'Today' },
  { id: '2', title: 'Implement bead handoff logic', date: 'Yesterday' },
  { id: '3', title: 'Fix Mayor coordination issue', date: '2 days ago' },
];

export function TerminalChat({ isOpen, onClose }: TerminalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [askBeforeEdits, setAskBeforeEdits] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "I'll analyze the convoy orchestration patterns and identify any bottlenecks in the handoff chain.",
        "Looking at the current bead assignments... I see 3 Polecats are waiting on upstream dependencies.",
        "The Mayor has queued this task. I'll coordinate with the assigned agents to optimize the workflow.",
        "Scanning the rig for potential conflicts... All agents are properly synchronized.",
        "I've identified the issue. The hook state wasn't being persisted correctly between handoffs.",
      ];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-14 right-0 w-[420px] bg-[#0d0d0d] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col" 
      style={{ height: 'calc(100vh - 56px - 16px)' }}
      data-testid="terminal-chat"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-orange-400 text-lg">❋</span>
            <span className="font-semibold text-white">Gas Town Code</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors ml-1"
            data-testid="close-terminal"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-orange-400 text-sm">❋</span>
          </div>
          <button className="p-1 hover:bg-gray-800 rounded transition-colors" data-testid="new-chat">
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-gray-800/30">
        <button 
          onClick={() => setShowConversations(!showConversations)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          data-testid="past-conversations-toggle"
        >
          <span>Past Conversations</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showConversations ? 'rotate-180' : ''}`} />
        </button>
        
        {showConversations && (
          <div className="mt-2 space-y-1" data-testid="conversation-list">
            {mockConversations.map(conv => (
              <button 
                key={conv.id}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                data-testid={`conversation-${conv.id}`}
              >
                <div className="text-sm text-gray-300">{conv.title}</div>
                <div className="text-xs text-gray-500">{conv.date}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <div className="mb-6">
              <div className="text-orange-400 text-4xl mb-2 font-mono">
                <span className="inline-block animate-pulse">❋</span>
                <span className="text-3xl ml-1">Gas Town Code</span>
              </div>
              <div className="w-20 h-20 mx-auto my-6 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <rect x="12" y="20" width="24" height="16" rx="2" fill="#d97706" />
                  <rect x="8" y="14" width="8" height="10" rx="1" fill="#d97706" />
                  <rect x="32" y="14" width="8" height="10" rx="1" fill="#d97706" />
                  <circle cx="18" cy="28" r="3" fill="#0d0d0d" />
                  <circle cx="30" cy="28" r="3" fill="#0d0d0d" />
                  <rect x="16" y="36" width="4" height="4" fill="#d97706" />
                  <rect x="28" y="36" width="4" height="4" fill="#d97706" />
                </svg>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-1">
              Create a <span className="text-orange-400 font-mono">GASTOWN.md</span> file for instructions
            </p>
            <p className="text-gray-500 text-sm">
              The Mayor will read every single time.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${msg.id}`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-orange-600/20 text-orange-100 border border-orange-600/30' 
                      : 'bg-gray-800/50 text-gray-200 border border-gray-700/50'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-orange-400 text-xs">
                      <span>❋</span>
                      <span className="font-medium">Gas Town</span>
                    </div>
                  )}
                  <p className="text-sm font-mono leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start" data-testid="typing-indicator">
                <div className="bg-gray-800/50 text-gray-400 px-4 py-3 rounded-2xl border border-gray-700/50">
                  <div className="flex items-center gap-1.5 mb-1.5 text-orange-400 text-xs">
                    <span>❋</span>
                    <span className="font-medium">Gas Town</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-800/50 bg-[#0d0d0d]">
        <div className="px-3 py-2 text-xs text-gray-500 flex items-center gap-2 border-b border-gray-800/30">
          <span className="text-gray-600">⎋</span>
          <span>Esc to focus or unfocus Gas Town</span>
          <button 
            className="ml-auto flex items-center gap-1 hover:text-gray-400 transition-colors"
            onClick={() => {}}
            data-testid="command-history"
          >
            <Clock className="w-3 h-3" />
          </button>
          <span className="text-gray-600">/</span>
        </div>
        
        <div className="p-3">
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-orange-500/50 transition-colors">
            <button 
              onClick={() => setAskBeforeEdits(!askBeforeEdits)}
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
                askBeforeEdits ? 'bg-gray-700 text-gray-300' : 'text-gray-500 hover:text-gray-400'
              }`}
              data-testid="ask-before-edits"
            >
              <Pencil className="w-3 h-3" />
              <span>Ask before edits</span>
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Gas Town..."
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-gray-500 font-mono"
              data-testid="chat-input"
            />
            
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`p-2 rounded-lg transition-colors ${
                inputValue.trim() 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              data-testid="send-message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
