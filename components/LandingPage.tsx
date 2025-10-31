//landing page 
import React, { useState, useEffect } from 'react';
import { CreateIcon, SupportIcon, GrowIcon } from './icons';

// Logo SVG Component
const LiftUpLogo = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="url(#liftUpGradient)" />
    <defs>
      <linearGradient id="liftUpGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF4A6F" />
        <stop offset="1" stopColor="#FF8B40" />
      </linearGradient>
    </defs>
  </svg>
);

interface LandingPageProps {
  onGetStarted: () => void;
}

const Card = ({ PlaceholderContent }: { PlaceholderContent: string }) => (
  <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition">
    <div className="w-10 h-10 bg-white/5 rounded-full mx-auto mb-3"></div>
    <p className="text-sm text-slate-400 text-center">{PlaceholderContent}</p>
    <p className="text-xs text-slate-500 text-center mt-1">Lorem ipsum dolor sit amet.</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for sticky navbar effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      icon: <CreateIcon className="w-8 h-8 text-lift-violet" />,
      title: '1. Create Project',
      text: 'Bring your vision to life. Describe your project, set your funding goal, and share your story with the world.',
      color: 'lift-violet/20',
    },
    {
      icon: <SupportIcon className="w-8 h-8 text-lift-pink" />,
      title: '2. Get Support',
      text: 'Engage with a community of investors who believe in your idea. Watch your funding grow in real-time.',
      color: 'lift-pink/20',
    },
    {
      icon: <GrowIcon className="w-8 h-8 text-lift-mint" />,
      title: '3. Lift Others',
      text: 'Achieve your goals and deliver on your promises. Your success inspires and empowers the next wave of creators.',
      color: 'lift-mint/20',
    },
  ];

  const stories = [
    {
      name: 'Jane Doe, Creator',
      role: 'Eco-Friendly Packaging',
      img: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: '"LiftUp gave me the platform to not only fund my sustainable packaging startup but also to connect with a community that shares my passion for the environment. It was more than funding; it was a partnership."',
    },
    {
      name: 'John Smith, Investor',
      role: 'Invested in 5 Projects',
      img: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: '"As a micro-investor, I love seeing the direct impact of my contributions. LiftUp makes it easy and transparent to support innovative projects I believe in, no matter how small my investment."',
    },
  ];

  return (
    <div className="font-nunito text-slate-300 relative bg-[#090514] min-h-screen">
      {/* Sticky Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all ${
          scrolled ? 'bg-black/70 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-4'
        }`}
      >
        <nav className="container mx-auto px-6 flex justify-between items-center transition-all">
          <LiftUpLogo className="w-12 h-12" />

          {/* Start / Invest buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto text-white font-bold px-8 py-3 rounded-full bg-gradient-to-r from-lift-orange to-lift-pink hover:opacity-90 transition-opacity"
            >
              Start a Project
            </button>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto text-white font-bold px-8 py-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition"
            >
              Invest Now
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-40 flex flex-col items-center justify-start text-center overflow-hidden px-4">
        {/* Background gradient and glows */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-lift-pink to-lift-orange opacity-15 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tl from-lift-violet to-lift-pink opacity-10 blur-3xl"></div>

        <div className="relative z-10 max-w-4xl">
          <LiftUpLogo className="w-24 h-24 mx-auto" />
          <h1 className="text-7xl md:text-8xl font-poppins font-bold text-white mt-6">
            LiftUp
          </h1>
          <p className="mt-4 text-3xl md:text-4xl font-medium text-white/90 italic">
            Hand by hand, Heart by heart, Shoulder by shoulder
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 container mx-auto text-center">
        <h3 className="text-3xl font-poppins font-bold text-white">How It Works</h3>
        <p className="text-slate-400 mt-2 mb-12">Empowering dreams in three simple steps.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-lg hover:scale-[1.02] transform transition shadow-xl">
              <div className={`w-16 h-16 ${step.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                {step.icon}
              </div>
              <h4 className="text-xl font-poppins font-bold text-white">{step.title}</h4>
              <p className="text-slate-400 mt-2">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Stories */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-poppins font-bold text-white">Community Stories</h3>
          <p className="text-slate-400 mt-2 mb-12">Real stories from creators and investors on LiftUp.</p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {stories.map((story, idx) => (
              <div key={idx} className="bg-white/5 p-8 rounded-2xl backdrop-blur-md border border-white/10 hover:shadow-2xl transition hover:scale-[1.02]">
                <div className="flex items-center mb-4">
                  <img src={story.img} alt={story.name} className="w-12 h-12 rounded-full mr-4 border-2 border-lift-pink" />
                  <div>
                    <h5 className="font-bold text-white">{story.name}</h5>
                    <p className="text-sm text-slate-400">{story.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 italic">{story.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 mt-20 py-10 px-4 border-t border-white/10">
        <div className="container mx-auto text-center text-slate-400">
          <h4 className="text-lg font-poppins font-bold text-white mb-2">Join the Movement</h4>
          <p className="max-w-md mx-auto mb-6">Stay updated with the latest projects and success stories from the LiftUp community.</p>
          <form className="flex justify-center max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-white/10 text-white px-4 py-2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-lift-pink border border-white/10"
            />
            <button
              type="submit"
              className="text-white font-bold px-6 py-2 rounded-r-full bg-gradient-to-r from-lift-orange to-lift-pink hover:opacity-90 transition-opacity shadow-lg"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-8 text-sm">&copy; {new Date().getFullYear()} LiftUp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
