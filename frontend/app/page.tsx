'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Top bar */}
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
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
      <section className="max-w-5xl mx-auto px-6 pt-4 pb-12 grid gap-10 md:grid-cols-[1.2fr,1fr] items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300 mb-4 border border-slate-800">
            <span className="text-violet-400">★</span>
            <span>Your AI companion awaits</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Meet Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-emerald-400">
              AI Companion
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base mb-6 max-w-xl">
            Create, nurture, and bond with your unique virtual pet. Chat, play,
            and grow together in this next‑gen tamagotchi experience.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm"
            >
              Start Your Journey →
            </button>
            <button className="border border-slate-700 hover:border-slate-500 text-slate-200 px-5 py-2.5 rounded-full text-sm">
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 text-xs md:text-sm">
            <div>
              <div className="font-semibold">10K+</div>
              <div className="text-slate-400">Happy Companions</div>
            </div>
            <div>
              <div className="font-semibold">1M+</div>
              <div className="text-slate-400">Messages Sent</div>
            </div>
            <div>
              <div className="font-semibold">50K+</div>
              <div className="text-slate-400">Missions Completed</div>
            </div>
            <div>
              <div className="font-semibold">4.9</div>
              <div className="text-slate-400">User Rating</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative h-64 w-64 rounded-full bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.6)]">
            <div className="h-40 w-40 rounded-full bg-slate-950 flex items-center justify-center text-6xl">
              🐱
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-semibold mb-4">Everything You Need</h2>
        <p className="text-slate-300 text-sm mb-6 max-w-xl">
          A complete companion experience with all the features you love.
        </p>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="mb-2 text-lg">🤖</div>
            <div className="font-semibold mb-1">AI Companion</div>
            <p className="text-slate-300 text-xs">
              Create your unique virtual companion with distinct personality and
              style.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="mb-2 text-lg">💬</div>
            <div className="font-semibold mb-1">Chat &amp; Bond</div>
            <p className="text-slate-300 text-xs">
              Have meaningful conversations and build a strong connection over
              time.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="mb-2 text-lg">🎨</div>
            <div className="font-semibold mb-1">Style &amp; Customize</div>
            <p className="text-slate-300 text-xs">
              Choose from anime, cyberpunk, or fantasy styles. Make it truly
              yours.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="mb-2 text-lg">🏆</div>
            <div className="font-semibold mb-1">Complete Missions</div>
            <p className="text-slate-300 text-xs">
              Feed, style, and care for your companion. Earn rewards and level
              up.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-emerald-500 p-[1px]">
          <div className="bg-slate-950 rounded-3xl px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs text-fuchsia-300 mb-2">
                Start with 100 FREE NTG tokens!
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">
                Ready to Meet Your Companion?
              </h3>
              <p className="text-slate-300 text-sm max-w-md">
                Create your account now and start building an amazing bond with
                your AI companion.
              </p>
            </div>
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold px-6 py-3 rounded-full text-sm"
            >
              Create Free Account →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
          <span>© 2024 NeuroTamagotchi. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <span className="h-5 w-5 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
              🤖
            </span>
            <span>NeuroTamagotchi</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
