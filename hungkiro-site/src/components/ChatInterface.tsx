'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ChatInterface.module.css';

interface Message {
  id: number;
  role: 'user' | 'kiro';
  content: string;
  time: string;
  streaming?: boolean;
}

interface OAIMessage {
  role: 'user' | 'assistant';
  content: string;
}

let _id = 1;
const uid = () => _id++;

function now() {
  const d = new Date();
  const p = (v: number) => String(v).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([{
    id: uid(),
    role: 'kiro',
    content: '// session initialized\nWelcome. I am KIRO.\nYour terminal AI is online.\nHow can I assist you?',
    time: now(),
  }]);
  const [input, setInput]   = useState('');
  const [busy, setBusy]     = useState(false);

  /* OpenAI conversation history — kept server-side format */
  const history = useRef<OAIMessage[]>([]);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    /* 1 — add user bubble */
    setMessages(prev => [...prev, { id: uid(), role: 'user', content: text, time: now() }]);
    setInput('');
    setBusy(true);

    /* 2 — push to history */
    history.current.push({ role: 'user', content: text });

    /* 3 — placeholder streaming bubble */
    const kiroId = uid();
    setMessages(prev => [...prev, {
      id: kiroId, role: 'kiro', content: '', time: now(), streaming: true,
    }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.current }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error('No response stream');

      /* 4 — stream chunks into the bubble */
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map(m => m.id === kiroId ? { ...m, content: full } : m)
        );
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      /* 5 — finalise */
      history.current.push({ role: 'assistant', content: full });
      setMessages(prev =>
        prev.map(m => m.id === kiroId ? { ...m, streaming: false } : m)
      );

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev =>
        prev.map(m => m.id === kiroId ? {
          ...m,
          content: `// error detected\n${msg}\n\nCheck OPENAI_API_KEY in .env.local`,
          streaming: false,
        } : m)
      );
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [input, busy]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className={styles.wrap}>

      {/* ── thread ── */}
      <div className={styles.thread}>
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.msg} ${styles[msg.role]}`}>

            <div className={styles.msgMeta}>
              <span className={styles.msgRole}>
                {msg.role === 'kiro' ? '> KIRO' : '> YOU'}
              </span>
              <span className={styles.msgTime}>{msg.time}</span>
              {msg.streaming && <span className={styles.streamingBadge}>streaming</span>}
            </div>

            <div className={styles.msgBody}>
              {/* empty streaming placeholder */}
              {msg.streaming && msg.content === '' ? (
                <span className={styles.typingDots}>
                  <span /><span /><span />
                </span>
              ) : (
                <>
                  {msg.content.split('\n').map((line, i) => (
                    <div key={i} className={line.startsWith('//') ? styles.commentLine : styles.textLine}>
                      {line || ' '}
                    </div>
                  ))}
                  {/* blinking caret while streaming */}
                  {msg.streaming && <span className={styles.streamCaret} />}
                </>
              )}
            </div>

          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── input bar ── */}
      <div className={styles.inputBar}>
        <span className={styles.inputPrompt}>
          [<span className={styles.inputUser}>hungkiro</span>@terminal&nbsp;~]$
        </span>
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={busy ? '// KIRO is thinking...' : 'type your message...'}
          disabled={busy}
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
        <button
          className={styles.sendBtn}
          onClick={send}
          disabled={busy || !input.trim()}
          aria-label="Send"
        >↵</button>
      </div>
    </div>
  );
}
