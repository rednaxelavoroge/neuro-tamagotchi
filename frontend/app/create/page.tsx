'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Style = 'anime' | 'cyberpunk' | 'fantasy' | null;

interface Character {
  id: string;
  name: string;
  style: Style;
  avatarUrl: string;
  prompt: string;
}

export default function CreateCharacterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState<Style>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = [
    {
      id: 'anime' as const,
      name: 'Аниме',
      emoji: '🎌',
      description: 'Яркие цвета, большие глаза, стиль японской анимации',
      gradient: 'from-pink-500 to-purple-600'
    },
    {
      id: 'cyberpunk' as const,
      name: 'Киберпанк',
      emoji: '🤖',
      description: 'Неоновые акценты, футуристичный tech-стиль',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'fantasy' as const,
      name: 'Фэнтези',
      emoji: '🧙‍♂️',
      description: 'Магия, эльфы, драконы, средневековая эстетика',
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
  };

  const handleNextFromStyle = () => {
    if (selectedStyle) {
      setStep(2);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    // Симуляция генерации (пока заглушки)
    setTimeout(() => {
      const placeholders = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=4'
      ];
      setGeneratedImages(placeholders);
      setLoading(false);
    }, 2000);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
  };

  const handleNextFromGeneration = () => {
    if (selectedImage !== null) {
      setStep(3);
    }
  };

  const handleCreateCharacter = () => {
    if (!characterName.trim()) return;

    const character: Character = {
      id: Math.random().toString(36).substr(2, 9),
      name: characterName,
      style: selectedStyle,
      avatarUrl: generatedImages[selectedImage!],
      prompt: prompt
    };

    // Сохраняем персонажа в localStorage
    const existingCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
    existingCharacters.push(character);
    localStorage.setItem('characters', JSON.stringify(existingCharacters));

    // Редирект на дашборд
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <span className="text-xl font-bold text-white">
                Neuro<span className="text-purple-500">Tamagotchi</span>
              </span>
            </Link>

            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              ← Назад к дашборду
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > s ? 'bg-purple-600' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-slate-400">
              Шаг {step} из 3: {
                step === 1 ? 'Выбор стиля' :
                step === 2 ? 'Генерация внешности' :
                'Именование персонажа'
              }
            </p>
          </div>
        </div>

        {/* Step 1: Style Selection */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold text-white text-center mb-4">
              Выберите стиль персонажа
            </h1>
            <p className="text-slate-400 text-center mb-12">
              Это определит визуальную эстетику вашего AI-компаньона
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedStyle === style.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="text-6xl mb-4">{style.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{style.name}</h3>
                  <p className="text-slate-400">{style.description}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNextFromStyle}
                disabled={!selectedStyle}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generation */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold text-white text-center mb-4">
              Опишите внешность
            </h1>
            <p className="text-slate-400 text-center mb-12">
              Напишите, как должен выглядеть ваш персонаж
            </p>

            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 mb-8">
              <label className="block text-white font-semibold mb-4">
                Промпт для генерации:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Например: рыжие волосы, зеленые глаза, веснушки, улыбка..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                rows={4}
              />
              
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Генерируем...' : 'Сгенерировать варианты'}
              </button>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="text-white text-xl">Генерация изображений...</div>
              </div>
            )}

            {generatedImages.length > 0 && !loading && (
              <>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {generatedImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                        selectedImage === index
                          ? 'border-purple-500 scale-105'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <img src={img} alt={`Вариант ${index + 1}`} className="w-full h-full object-cover" />
                      {selectedImage === index && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all border border-slate-700"
                  >
                    ← Назад
                  </button>
                  <button
                    onClick={handleNextFromGeneration}
                    disabled={selectedImage === null}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Далее →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Naming */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold text-white text-center mb-4">
              Дайте имя персонажу
            </h1>
            <p className="text-slate-400 text-center mb-12">
              Последний штрих перед оживлением вашего компаньона
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 mb-8">
                {selectedImage !== null && (
                  <div className="flex justify-center mb-8">
                    <img 
                      src={generatedImages[selectedImage]} 
                      alt="Выбранный персонаж" 
                      className="w-48 h-48 rounded-2xl border-4 border-purple-500"
                    />
                  </div>
                )}

                <label className="block text-white font-semibold mb-4">
                  Имя персонажа:
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Введите уникальное имя..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />

                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-300 text-sm">
                    💡 <strong>Подсказка:</strong> Выберите имя, которое отражает личность вашего компаньона
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all border border-slate-700"
                >
                  ← Назад
                </button>
                <button
                  onClick={handleCreateCharacter}
                  disabled={!characterName.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎉 Оживить персонажа!
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
