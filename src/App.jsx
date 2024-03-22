import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

const ROOMS = [
  { id: 'general', name: 'General', icon: '💬', desc: 'General discussion' },
  { id: 'tech', name: 'Tech', icon: '💻', desc: 'Technology & programming' },
  { id: 'random', name: 'Random', icon: '🎲', desc: 'Off-topic fun' },
];

const BOT_USERS = [
  { name: 'Alice', color: '#ef4444' },
  { name: 'Bob', color: '#22c55e' },
  { name: 'Charlie', color: '#eab308' },
  { name: 'Diana', color: '#a855f7' },
  { name: 'Eve', color: '#f97316' },
];

const BOT_MESSAGES = {
  general: [
    'Hey everyone! How\'s it going?',
    'Has anyone tried the new update?',
    'Good morning! ☀️',
    'That\'s a great point!',
    'I totally agree with that.',
    'Anyone up for a game later?',
    'Just had the best coffee ☕',
    'Happy to be here!',
    'What\'s everyone working on today?',
    'That\'s hilarious 😂',
  ],
  tech: [
    'React hooks are amazing!',
    'Has anyone used Rust for web dev?',
    'TypeScript > JavaScript, change my mind.',
    'Just deployed my first Docker container!',
    'What\'s your favorite VS Code extension?',
    'GraphQL or REST? 🤔',
    'Just learned about WebAssembly, mind blown!',
    'Anyone using Bun instead of Node?',
    'Vim or Emacs? (just kidding, use whatever works)',
    'AI-assisted coding is the future.',
  ],
  random: [
    'What\'s for lunch? 🍕',
    'Just saw the funniest meme',
    'Anyone watching the game tonight?',
    'My cat just walked across my keyboard',
    'It\'s raining here ☔',
    'Best movie you\'ve seen recently?',
    'I need a vacation 🏖️',
    'Just finished a great book!',
    'Pizza or tacos? 🌮',
    'Monday vibes... 😴',
  ],
};

const EMOJIS = [
  '😀', '😂', '😍', '🤔', '😎', '🥳', '😢', '😡',
  '👍', '👎', '❤️', '🔥', '⭐', '🎉', '💯', '🙏',
  '👋', '🤝', '💪', '🧠', '☕', '🍕', '🎮', '🚀',
];

const CURRENT_USER = { name: 'You', color: '#3b82f6' };

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase();
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let msgIdCounter = 0;

export default function App() {
  const [activeRoom, setActiveRoom] = useState('general');
  const [messages, setMessages] = useState({ general: [], tech: [], random: [] });
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const timeoutsRef = useRef([]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeRoom, scrollToBottom]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const addBotMessage = useCallback((room) => {
    const bot = BOT_USERS[Math.floor(Math.random() * BOT_USERS.length)];
    const pool = BOT_MESSAGES[room];
    const text = pool[Math.floor(Math.random() * pool.length)];

    setTypingUser(bot.name);

    const typingDuration = 1000 + Math.random() * 1500;
    const t = setTimeout(() => {
      setTypingUser(null);
      setMessages((prev) => ({
        ...prev,
        [room]: [
          ...prev[room],
          {
            id: ++msgIdCounter,
            user: bot,
            text,
            timestamp: new Date(),
            isOwn: false,
          },
        ],
      }));
    }, typingDuration);
    timeoutsRef.current.push(t);
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => ({
      ...prev,
      [activeRoom]: [
        ...prev[activeRoom],
        {
          id: ++msgIdCounter,
          user: CURRENT_USER,
          text,
          timestamp: new Date(),
          isOwn: true,
        },
      ],
    }));
    setInput('');
    setShowEmoji(false);

    const botCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < botCount; i++) {
      const delay = (i + 1) * (2000 + Math.random() * 3000);
      const t = setTimeout(() => addBotMessage(activeRoom), delay);
      timeoutsRef.current.push(t);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const room = ROOMS.find((r) => r.id === activeRoom);
  const roomMessages = messages[activeRoom];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ChatVite</h1>
        </div>
        <div className="rooms-title">Rooms</div>
        <ul className="room-list">
          {ROOMS.map((r) => (
            <li
              key={r.id}
              className={`room-item ${activeRoom === r.id ? 'active' : ''}`}
              onClick={() => { setActiveRoom(r.id); setShowEmoji(false); }}
            >
              <span className="room-icon">{r.icon}</span>
              {r.name}
            </li>
          ))}
        </ul>
        <div className="online-section">
          <div className="online-title">Online — {BOT_USERS.length + 1}</div>
          <div className="online-user">
            <span className="online-dot" />
            You
          </div>
          {BOT_USERS.map((u) => (
            <div key={u.name} className="online-user">
              <span className="online-dot" />
              {u.name}
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-area">
        <div className="chat-header">
          <h2>{room.icon} {room.name}</h2>
          <p>{room.desc}</p>
        </div>

        <div className="messages">
          {roomMessages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>
              No messages yet. Say something!
            </div>
          )}
          {roomMessages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isOwn ? 'own' : ''}`}>
              <div className="avatar" style={{ background: msg.user.color }}>
                {getInitials(msg.user.name)}
              </div>
              <div className="message-body">
                <div className="message-meta">
                  <span className="message-name">{msg.user.name}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="typing-indicator">
          {typingUser && `${typingUser} is typing...`}
        </div>

        <div className="input-area">
          {showEmoji && (
            <div className="emoji-picker">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="emoji-btn"
                  onClick={() => setInput((prev) => prev + emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <button className="emoji-toggle" onClick={() => setShowEmoji(!showEmoji)}>
            😊
          </button>
          <input
            className="message-input"
            placeholder={`Message #${room.name.toLowerCase()}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
