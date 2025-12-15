'use client';

import Link from 'next/link';

export default function LandingPage() {
  const features = [
    {
      icon: '🤖',
      title: 'AI Companion',
      description: 'Create your unique virtual companion with distinct personality and style.',
      color: 'text-purple-600',
      bg: 'bg-purple-600/10',
    },
    {
      icon: '💬',
      title: 'Chat & Bond',
      description: 'Have meaningful conversations and build a strong connection over time.',
      color: 'text-green-600',
      bg: 'bg-green-600/10',
    },
    {
      icon: '🎨',
      title: 'Style & Customize',
      description: 'Choose from anime, cyberpunk, or fantasy styles. Make it truly yours.',
      color: 'text-amber-600',
      bg: 'bg-amber-600/10',
    },
    {
      icon: '🏆',
      title: 'Complete Missions',
      description: 'Feed, style, and care for your companion. Earn rewards and level up.',
      color: 'text-pink-600',
      bg: 'bg-pink-600/10',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Companions' },
    { value: '1M+', label: 'Messages Sent' },
    { value: '50K+', label: 'Missions Completed' },
    { value: '4.9', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <span className="text-xl font-bold text-white">
                Neuro<span className="text-purple-500">Tamagotchi</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-40 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-60 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-600/30 rounded-full text-purple-300 text-sm mb-6">
                <span>✨</span>
                Your AI companion awaits
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Meet Your
                <span className="block bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
                  AI Companion
                </span>
              </h1>

              <p className="text-xl text-slate-400 mb-8 max-w-lg">
                Create, nurture, and bond with your unique virtual pet. 
                Chat, play, and grow together in this next-gen tamagotchi experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/25"
                >
                  Start Your Journey
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="#features"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 rounded-full blur-3xl opacity-30 scale-75" />
                
                <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-purple-600 to-green-500 p-1 animate-float">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-9xl">🐱</span>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30 animate-float" style={{ animationDelay: '0.5s' }}>
                  <span className="text-3xl">❤️</span>
                </div>

                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 animate-float" style={{ animationDelay: '0.2s' }}>
                  <span className="text-3xl">⚡</span>
                </div>

                <div className="absolute top-1/2 -right-8 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30 animate-float">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-700/50 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A complete companion experience with all the features you love.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:border-purple-600/50 transition-all group"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 bg-gradient-to-r from-purple-600/20 to-green-500/20 border border-purple-600/30 rounded-3xl text-center overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-2xl">🪙</span>
                <span className="text-amber-500 font-medium">
                  Start with 100 FREE NTG tokens!
                </span>
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Meet Your Companion?
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                Create your account now and start building an amazing bond with your AI companion.
              </p>

              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/25"
              >
                Create Free Account
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <span className="font-bold text-white">NeuroTamagotchi</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 NeuroTamagotchi. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
