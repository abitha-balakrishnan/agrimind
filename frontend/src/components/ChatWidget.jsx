import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2 } from 'lucide-react';
import api, { getErrorMessage } from '../api';

const LANGUAGES = [
  { code: 'en', label: 'English', speech: 'en-IN', synth: 'en-IN' },
  { code: 'ta', label: 'தமிழ்', speech: 'ta-IN', synth: 'ta-IN' },
  { code: 'hi', label: 'हिंदी', speech: 'hi-IN', synth: 'hi-IN' },
];

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hello! I am AgriMind. Ask me about crops, fertilizer, weather, or irrigation.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const langConfig = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const greeting =
      language === 'ta'
        ? 'வணக்கம்! நான் AgriMind. பயிர்கள், உரம், வானிலை, பாசனம் பற்றி கேளுங்கள்.'
        : language === 'hi'
          ? 'नमस्ते! मैं AgriMind हूँ। फसल, उर्वरक, मौसम या सिंचाई के बारे में पूछें।'
          : 'Hello! I am AgriMind. Ask me about crops, fertilizer, weather, or irrigation.';
    setMessages([{ role: 'bot', text: greeting }]);
  }, [language]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/agent/chat', {
        message: trimmed,
        language,
        context: {},
      });
      const reply = res.data.reply;
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
      if (autoSpeak && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.lang = langConfig.synth;
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg = language === 'ta'
        ? 'பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
        : language === 'hi'
          ? 'त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Something went wrong. Please try again.';
      const errMsg = getErrorMessage(err, fallbackMsg);
      setMessages((prev) => [...prev, { role: 'bot', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  }, [language, autoSpeak, langConfig.synth]);

  const toggleListening = () => {
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langConfig.speech;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] card-surface flex flex-col z-50 shadow-soft border border-sage/30 overflow-hidden">
          <div className="bg-sage-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="w-7 h-7 rounded-full" />
              <span className="font-serif font-semibold">AgriMind Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs bg-sage-800 text-white border border-sage-500 rounded px-2 py-1 outline-none"
                aria-label="Chat language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setAutoSpeak((v) => !v)}
                className={`p-1 rounded transition-all duration-150 ${autoSpeak ? 'bg-sage-500' : 'bg-sage-800 hover:bg-sage-500'}`}
                title={autoSpeak ? 'Auto-speak on' : 'Auto-speak off'}
                aria-label="Toggle auto-speak"
              >
                <Volume2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded bg-sage-800 hover:bg-sage-500 transition-all duration-150"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream/40">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-organic text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-terracotta-700 text-white'
                      : 'bg-white border border-sage/20 text-charcoal'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-sage/20 px-3 py-2 rounded-organic text-sm text-charcoal/60 animate-pulse">
                  {language === 'ta' ? 'பதில் தயாராகிறது...' : language === 'hi' ? 'जवाब तैयार हो रहा है...' : 'Thinking...'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-sage/20 bg-white flex gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`chat-mic p-2.5 shrink-0 ${listening ? 'chat-mic-active' : ''}`}
              aria-label={listening ? 'Stop listening' : 'Start voice input'}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்...'
                  : language === 'hi'
                    ? 'अपना प्रश्न लिखें...'
                    : 'Type your question...'
              }
              className="input-field flex-1 text-sm py-2"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="chat-send p-2.5 shrink-0">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="chat-toggle fixed bottom-6 right-4 md:right-6 w-14 h-14 flex items-center justify-center z-50"
        aria-label={open ? 'Close AgriMind chat' : 'Open AgriMind chat'}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
