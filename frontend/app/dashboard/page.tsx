'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  balance_ntg: number;
}

interface Character {
  id: string;
  name: string;
  style: string;
  avatarUrl: string;
  prompt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка авторизации
    const isAuth = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');

    if (!isAuth || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    
    // Загрузка персонажей
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
    
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <span className="text-xl font-bold text-white">
                Neuro<span className="text-purple-500">Tamagotchi</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-2xl">💰</span>
                <span className="text-white font-semibold">{user?.balance_ntg || 0}</span>
                <span className="text-slate-400 text-sm">NTG</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Привет, {user?.username}! 👋
          </h1>
          <p className="text-slate-400 text-lg">
            {characters.length > 0 
              ? `У вас ${characters.length} ${characters.length === 1 ? 'персонаж' : 'персонажа'}`
              : 'Готов создать своего уникального AI-компаньона?'
            }
          </p>
        </div>

        {/* Characters Section */}
        {characters.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Ваши персонажи</h2>
              <Link
                href="/create"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                + Создать ещё
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-purple-500 transition-colors group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={character.avatarUrl}
                      alt={character.name}
                      className="w-20 h-20 rounded-xl border-2 border-purple-500"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">{character.name}</h3>
                      <p className="text-slate-400 text-sm capitalize">{character.style}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Энергия:</span>
                      <span className="text-white">100/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <Link
                    href={`/chat/${character.id}`}
                    className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-center"
                  >
                    Открыть чат
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Ваш баланс</h3>
              <span className="text-4xl">💎</span>
            </div>
            <div className="mb-2">
              <span className="text-white text-3xl font-bold">{user?.balance_ntg}</span>
              <span className="text-purple-200 ml-2">NTG</span>
            </div>
            <p className="text-purple-200 text-sm">
              Используйте токены для создания и развития персонажа
            </p>
            <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
              Пополнить баланс
            </button>
          </div>

          {/* Create Character Card */}
          {characters.length === 0 && (
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-purple-500 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Создать персонажа</h3>
                <span className="text-4xl">✨</span>
              </div>
              <p className="text-slate-400 mb-6">
                Создайте уникального AI-компаньона за 3 простых шага
              </p>
              <Link
                href="/create"
                className="block w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all text-center"
              >
                Начать создание
              </Link>
            </div>
          )}

          {/* Stats Card */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Статистика</h3>
              <span className="text-4xl">📊</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Персонажи:</span>
                <span className="text-white font-semibold">{characters.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Сообщения:</span>
                <span className="text-white font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Выполнено заданий:</span>
                <span className="text-white font-semibold">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/create"
              className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-left group"
            >
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-white font-semibold mb-1">Avatar Studio</div>
              <div className="text-slate-400 text-sm">Создайте персонажа</div>
            </Link>
            
            <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-left group">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-white font-semibold mb-1">Чат</div>
              <div className="text-slate-400 text-sm">Общайтесь с AI</div>
            </button>
            
            <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-left group">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-white font-semibold mb-1">Задания</div>
              <div className="text-slate-400 text-sm">Зарабатывайте награды</div>
            </button>
            
            <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-left group">
              <div className="text-3xl mb-2">⚙️</div>
              <div className="text-white font-semibold mb-1">Настройки</div>
              <div className="text-slate-400 text-sm">Профиль и параметры</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
