import React, { useState } from 'react';
import { Smartphone, Send } from 'lucide-react';

export const FieldAssistant: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: 'System', text: 'Field Assistant Log initialized. Ready for real-time block status updates.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'Engineering Lead', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      <div className="formal-panel" style={{ padding: '24px', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={18} color="var(--text-primary)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>FIELD ASSISTANT LOG</h2>
          </div>
          <span className="badge badge-clear">BLOCK: B104</span>
        </div>

        <div style={{ height: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', background: 'var(--bg-dark)', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ background: msg.sender === 'System' ? 'var(--bg-card-secondary)' : '#000000', padding: '10px 14px', borderRadius: '4px', borderLeft: msg.sender === 'System' ? '3px solid var(--text-primary)' : '3px solid #ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: msg.sender === 'System' ? 'var(--text-primary)' : '#ffffff' }}>{msg.sender}</span>
                <span>{msg.time}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: msg.sender === 'System' ? 'var(--text-primary)' : '#ffffff' }}>{msg.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Log block status update..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: '4px', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button onClick={handleSend} className="btn-formal" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
};
