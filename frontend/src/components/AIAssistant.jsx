import { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import api from '../api';
import ReactMarkdown from 'react-markdown';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your Gemini-powered Venue Assistant. How can I help you manage your ground today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage.content });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server. Please verify the Gemini API key.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={28} />
      </button>

      <div className={`fixed bottom-8 right-8 w-96 glass bg-[var(--bg-color)]/95 flex flex-col shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`} style={{ height: '550px' }}>
        <div className="p-5 border-b border-[var(--border-color)] bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex justify-between items-center backdrop-blur-md">
          <h3 className="font-bold text-lg flex items-center gap-2 m-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            <Sparkles size={20} className="text-blue-500" /> Venue AI
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-4 rounded-2xl text-sm max-w-[85%] leading-relaxed ${msg.role === 'assistant' ? 'bg-black/5 dark:bg-white/10 text-[var(--text-primary)] rounded-tl-sm' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-sm shadow-md'}`}>
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl text-sm bg-black/5 dark:bg-white/10 rounded-tl-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-[var(--border-color)] bg-black/5 dark:bg-white/5 flex gap-3 backdrop-blur-md">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..." 
            className="flex-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)] shadow-inner"
          />
          <button type="submit" disabled={loading || !input.trim()} className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center disabled:opacity-50 transition-opacity shadow-md">
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </>
  );
};
