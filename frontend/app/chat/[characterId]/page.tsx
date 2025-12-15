'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  style: string;
  avatarUrl: string;
  prompt: string;
  energy?: number;
  mood?: number;
  bond?: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'character';
  timestamp: Date;
  emotion?: 'neutral' | 'happy' | 'sad';
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const characterId = params.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // Проверка авторизации
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/auth/login');
      return;
    }

    // Загрузка персонажа
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
      const characters: Character[] = JSON.parse(savedCharacters);
      const foundCharacter = characters.find(c => c.id === characterId);
      
      if (foundCharacter) {
        setCharacter({
          ...foundCharacter,
          energy: foundCharacter.energy || 100,
          mood: foundCharacter.mood || 100,
          bond: foundCharacter.bond || 0
        });

        // Приветственное сообщение
        setMessages([{
          id: '1',
          text: `Привет! Я ${foundCharacter.name}. Рад познакомиться! 😊`,
          sender: 'character',
          timestamp: new Date(),
          emotion: 'happy'
        }]);
      } else {
        router.push('/dashboard');
      }
    }
    
    setLoading(false);
  }, [characterId, router]);

  const getAIResponse = (userMessage: string): string => {
    const responses = [
      "Интересно! Расскажи мне больше об этом.",
      "Я понимаю тебя. Это действительно важно!",
      "Хм, дай мне подумать... Я считаю, что это отличная идея!",
      "Знаешь, я тоже об этом думал! Какое совпадение 😄",
      "Это напоминает мне о том времени, когда... впрочем, это другая история!",
      "Я всегда рад тебя слышать! Что ещё у тебя нового?",
      "Вау! Звучит потрясающе! 🌟",
      "Я здесь, чтобы поддержать тебя. Всегда.",
      "А давай поговорим о чём-то ещё? Например, о твоих планах на сегодня?",
      "Это очень интересная мысль! Я записал её себе 📝"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !character) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setTyping(true);

    // Симуляция задержки ответа AI
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputMessage),
        sender: 'character',
        timestamp: new Date(),
        emotion: Math.random() > 0.7 ? 'happy' : 'neutral'
      };

      setMessages(prev => [...prev, aiResponse]);
      setTyping(false);

      // Обновляем параметры персонажа
      setCharacter(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          bond: Math.min((prev.bond || 0) + 1, 100),
          mood: Math.min((prev.mood || 0) + 2, 100)
        };

        // Сохраняем в localStorage
        const savedCharacters = localStorage.getItem('characters');
        if (savedCharacters) {
          const characters: Character[] = JSON.parse(savedCharacters);
          const index = characters.findIndex(c => c.id === characterId);
          if (index !== -1) {
            characters[index] = updated;
            localStorage.setItem('characters', JSON.stringify(characters));
          }
        }

        return updated;
      });
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <span className="text-slate-400 group-hover:text-white transition-colors">←</span>
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="w-10 h-10 rounded-xl border-2 border-purple-500"
              />
              <div>
                <h1 className="text-white font-semibold">{character.name}</h1>
                <p className="text-slate-400 text-xs capitalize">{character.style}</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">⚡</span>
                  <span className="text-white">{character.energy}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">😊</span>
                  <span className="text-white">{character.mood}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-400">❤️</span>
                  <span className="text-white">{character.bond}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-white border border-slate-700'
                  }`}
                >
                  {message.sender === 'character' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400">{character.name}</span>
                      {message.emotion === 'happy' && <span className="text-sm">😊</span>}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Напишите сообщение ${character.name}...`}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отправить
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Character Info (Desktop) */}
        <div className="hidden lg:block w-80 border-l border-slate-800 bg-slate-900/50 p-6">
          <div className="space-y-6">
            <div className="text-center">
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="w-32 h-32 rounded-2xl border-4 border-purple-500 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-white">{character.name}</h2>
              <p className="text-slate-400 capitalize">{character.style}</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Энергия</span>
                  <span className="text-white">{character.energy}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${character.energy}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Настроение</span>
                  <span className="text-white">{character.mood}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${character.mood}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Близость</span>
                  <span className="text-white">{character.bond}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${character.bond}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm">
                🍕 Покормить
              </button>
              <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm">
                🎨 Сменить стиль
              </button>
              <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm">
                📸 Сделать селфи
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
