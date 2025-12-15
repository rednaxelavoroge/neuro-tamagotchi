'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Top bar */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-500 to-emerald-400 flex items-center justify-center text-xl">
            🤖
          </div>
          <span className="font-semibold text-lg">NeuroTamagotchi</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm text-slate-200 hover:text-white"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push('/auth/register')}
            className="text-sm bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold px-4 py-2 rounded-full"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300 mb-6 border border-slate-800">
              <span className="text-violet-400">★</span>
              <span>Your AI companion awaits</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Meet Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-emerald-400">
                AI Companion
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-lg">
              Create, nurture, and bond with your unique virtual pet. Chat, play,
              and grow together in this next‑gen tamagotchi experience.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={() => router.push('/auth/register')}
                className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold px-6 py-3 rounded-full text-base"
              >
                Start Your Journey →
              </button>
              <button className="border border-slate-700 hover:border-slate-500 text-slate-200 px-6 py-3 rounded-full text-base">
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-4 gap-6 text-sm">
              <div>
                <div className="font-semibold text-lg">10K+</div>
                <div className="text-slate-400">Happy Companions</div>
              </div>
              <div>
                <div className="font-semibold text-lg">1M+</div>
                <div className="text-slate-400">Messages Sent</div>
              </div>
              <div>
                <div className="font-semibold text-lg">50K+</div>
                <div className="text-slate-400">Missions Completed</div>
              </div>
              <div>
                <div className="font-semibold text-lg">4.9</div>
                <div className="text-slate-400">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right: Avatar with orbit */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Внешнее кольцо с медленной анимацией вращения */}
              <div
                className="absolute inset-0 rounded-full border-4 border-fuchsia-500/30"
                style={{
                  boxShadow: '0 0 80px rgba(168,85,247,0.5)',
                  animation: 'spin 20s linear infinite',
                }}
              >
                {/* Маленькие иконки на орбите с пульсацией */}
                <div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl"
                  style={{ animation: 'pulse 3s ease-in-out infinite' }}
                >
                  💬
                </div>
                <div 
                  className="absolute top-1/2 -right-4 -translate-y-1/2 text-xl"
                  style={{ animation: 'pulse 3s ease-in-out 0.75s infinite' }}
                >
                  ⭐️
                </div>
                <div 
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-lg"
                  style={{ animation: 'pulse 3s ease-in-out 1.5s infinite' }}
                >
                  ⚡️
                </div>
                <div 
                  className="absolute top-1/2 -left-4 -translate-y-1/2 text-2xl"
                  style={{ animation: 'pulse 3s ease-in-out 2.25s infinite' }}
                >
                  ❤️
                </div>
              </div>

              {/* Градиентный диск */}
              <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-2xl">
                {/* Внутренний круг с котом */}
                <div className="w-48 h-48 rounded-full bg-slate-950 flex items-center justify-center text-7xl">
                  🐱
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold mb-4">Everything You Need</h2>
        <p className="text-slate-300 text-base mb-8 max-w-xl">
          A complete companion experience with all the features you love.
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="mb-3 text-2xl">🤖</div>
            <div className="font-semibold mb-2">AI Companion</div>
            <p className="text-slate-300 text-sm">
              Create your unique virtual companion with distinct personality and
              style.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="mb-3 text-2xl">💬</div>
            <div className="font-semibold mb-2">Chat &amp; Bond</div>
            <p className="text-slate-300 text-sm">
              Have meaningful conversations and build a strong connection over
              time.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="mb-3 text-2xl">🎨</div>
            <div className="font-semibold mb-2">Style &amp; Customize</div>
            <p className="text-slate-300 text-sm">
              Choose from anime, cyberpunk, or fantasy styles. Make it truly
              yours.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="mb-3 text-2xl">🏆</div>
            <div className="font-semibold mb-2">Complete Missions</div>
            <p className="text-slate-300 text-sm">
              Feed, style, and care for your companion. Earn rewards and level
              up.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-emerald-500 p-[1px]">
          <div className="bg-slate-950 rounded-3xl px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="text-sm text-fuchsia-300 mb-2">
                Start with 100 FREE NTG tokens!
              </div>
              <h3 className="text-3xl font-semibold mb-3">
                Ready to Meet Your Companion?
              </h3>
              <p className="text-slate-300 text-base max-w-lg">
                Create your account now and start building an amazing bond with
                your AI companion.
              </p>
            </div>
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold px-8 py-4 rounded-full text-base whitespace-nowrap"
            >
              Create Free Account →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-400">
          <span>© 2024 NeuroTamagotchi. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center">
              🤖
            </span>
            <span>NeuroTamagotchi</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
