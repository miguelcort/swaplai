import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Shield, Zap, Users, Brain, Sparkles, Clock, Globe } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useEffect, useState, useRef } from 'react'
import { useTranslation, Trans } from 'react-i18next'

// Inject custom animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes float-medium {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }
  @keyframes grid-move {
    0% { transform: translateY(0); }
    100% { transform: translateY(40px); }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
  .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
  .bg-grid-pattern {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, var(--text-secondary) 1px, transparent 1px),
                      linear-gradient(to bottom, var(--text-secondary) 1px, transparent 1px);
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }
  .text-glow {
    text-shadow: 0 0 20px var(--primary-light);
  }
  .reveal-on-scroll {
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal-visible {
    opacity: 1;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(styleSheet);

export default function LandingPage() {
    const { t, i18n } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('es') ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        // Intersection Observer for scroll animations
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observerRef.current?.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observerRef.current?.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-bg-dark text-text-primary font-sans selection:bg-primary/30 overflow-x-hidden">
            
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-bg-dark/80 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="font-serif font-bold text-white text-xl">S</span>
                        </div>
                        <span className="font-sans font-bold text-xl tracking-tight text-text-primary">Swaplai</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={toggleLanguage}
                            className="p-2 rounded-full hover:bg-bg-card transition-colors text-text-secondary hover:text-text-primary"
                            aria-label="Toggle language"
                        >
                            <Globe className="h-5 w-5" />
                        </button>
                        <Link to="/login" className="hidden sm:block text-sm text-text-secondary hover:text-text-primary transition-colors">{t('landing.nav.login')}</Link>
                        <Link to="/register">
                            <Button className="bg-text-primary text-bg-dark hover:bg-text-primary/90 rounded-full px-6 font-medium shadow-lg hover:shadow-xl transition-all">
                                {t('landing.nav.getStarted')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-48 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 reveal-on-scroll translate-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-card border border-border backdrop-blur-sm shadow-sm">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary tracking-wider uppercase">{t('landing.hero.badge')}</span>
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-text-primary">
                            <span className="font-serif italic text-text-secondary block mb-2">{t('landing.hero.titlePre')}</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-text-primary to-text-secondary">
                                {t('landing.hero.titleMain')}
                            </span>
                        </h1>
                        
                        <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
                            <Trans i18nKey="landing.hero.description">
                                The first project management tool designed for the neurodivergent brain. 
                                We combine <span className="text-text-primary font-medium">empathetic AI</span> with 
                                <span className="text-text-primary font-medium"> rigid accountability</span> to turn chaos into completion.
                            </Trans>
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto h-14 px-8 bg-primary hover:bg-primary-hover text-white font-bold rounded-full text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300">
                                    {t('landing.hero.startBuilding')} <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto h-14 px-8 border-border hover:bg-bg-card text-text-primary rounded-full text-lg backdrop-blur-sm">
                                    {t('landing.hero.getStarted')}
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-8 flex items-center gap-4 text-sm text-text-secondary">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-800 border-2 border-bg-dark" />
                                ))}
                            </div>
                            <p>
                                <Trans i18nKey="landing.hero.trustedBy">
                                    Trusted by <span className="text-text-primary font-medium">2,000+ creators</span>
                                </Trans>
                            </p>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="relative lg:h-[600px] flex items-center justify-center reveal-on-scroll translate-y-8" style={{ transitionDelay: '200ms' }}>
                        <div className="relative w-full max-w-md aspect-[4/5] perspective-1000">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-[40px] blur-3xl animate-pulse-glow" />
                            
                            {/* Main App Interface Card */}
                            <div className="relative h-full w-full bg-bg-card border border-border rounded-[32px] overflow-hidden shadow-2xl animate-float-slow" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-10deg) rotateX(5deg)' }}>
                                {/* Header */}
                                <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-bg-card/50">
                                    <div className="flex gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500/50" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                                        <div className="h-3 w-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <div className="h-2 w-20 bg-border rounded-full" />
                                </div>
                                
                                {/* UI Body */}
                                <div className="p-6 space-y-6 bg-bg-dark/50 h-full">
                                    {/* AI Chat Bubble */}
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <Brain className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="bg-bg-card rounded-2xl rounded-tl-none p-4 text-sm text-text-secondary border border-border shadow-sm">
                                            <p>I noticed you've been avoiding the "Marketing Plan" task. Is it the scale? Let's break it down into 3 tiny steps.</p>
                                        </div>
                                    </div>

                                    {/* Task List */}
                                    <div className="space-y-3 pt-4">
                                        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Suggested Steps</p>
                                        {[
                                            { t: "Draft 3 headlines", time: "5m" },
                                            { t: "Find 1 reference image", time: "2m" },
                                            { t: "Open editor", time: "1m" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer group shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-5 w-5 rounded-full border-2 ${i === 0 ? 'border-primary bg-primary/20' : 'border-border group-hover:border-primary/50'}`} />
                                                    <span className="text-sm text-text-primary">{item.t}</span>
                                                </div>
                                                <span className="text-xs text-text-secondary bg-bg-dark/10 dark:bg-white/10 px-2 py-1 rounded-md">{item.time}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Streak Widget */}
                                    <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-primary">CURRENT STREAK</span>
                                            <Zap className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex items-end gap-1 h-12">
                                            {[40, 60, 30, 80, 50, 90, 100].map((h, i) => (
                                                <div key={i} className={`flex-1 rounded-sm ${i === 6 ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badges */}
                            <div className="absolute top-20 -right-12 bg-bg-card border border-border p-4 rounded-2xl animate-float-medium flex items-center gap-3 z-20 shadow-xl">
                                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Status</p>
                                    <p className="font-bold text-text-primary">Flow State</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Props - Bento Grid */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 reveal-on-scroll translate-y-8">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-text-primary">
                            Technology that <span className="text-primary">understands</span> you
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                            Most tools assume you function like a machine. Swaplai assumes you're human.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Feature 1 - Large */}
                        <div className="md:col-span-2 bg-bg-card/50 backdrop-blur-md border border-border p-8 rounded-3xl relative overflow-hidden group reveal-on-scroll translate-y-8 shadow-sm">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-500" />
                            <div className="relative z-10">
                                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                                    <Brain className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-text-primary">Adaptive AI Coaching</h3>
                                <p className="text-text-secondary max-w-md">
                                    Our AI doesn't just list tasks. It detects when you're overwhelmed and actively negotiates your workload, breaking mountains into molehills.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-bg-card/50 backdrop-blur-md border border-border p-8 rounded-3xl reveal-on-scroll translate-y-8 hover:bg-bg-card transition-colors duration-300 shadow-sm">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                                <Clock className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-text-primary">Smart Rescheduling</h3>
                            <p className="text-text-secondary">
                                Missed a deadline? No shame. One-click rescheduling based on your actual energy levels.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-bg-card/50 backdrop-blur-md border border-border p-8 rounded-3xl reveal-on-scroll translate-y-8 hover:bg-bg-card transition-colors duration-300 shadow-sm">
                            <div className="h-12 w-12 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-text-primary">Tough Love Mode</h3>
                            <p className="text-text-secondary">
                                Need a push? Activate strict mode where the AI holds you accountable with zero excuses allowed.
                            </p>
                        </div>

                        {/* Feature 4 - Large */}
                        <div className="md:col-span-2 bg-bg-card/50 backdrop-blur-md border border-border p-8 rounded-3xl relative overflow-hidden group reveal-on-scroll translate-y-8 shadow-sm">
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-all duration-500" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1">
                                    <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                                        <Users className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-text-primary">Collaborative Momentum</h3>
                                    <p className="text-text-secondary">
                                        Swap tasks with community members. Hate writing but love designing? Swap with a writer who needs design work.
                                    </p>
                                </div>
                                <div className="flex -space-x-4">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className="h-12 w-12 rounded-full border-4 border-bg-card bg-gray-300 dark:bg-gray-800 shadow-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section className="py-24 border-y border-border bg-bg-card/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center reveal-on-scroll translate-y-8">
                        {[
                            { label: "Tasks Completed", value: "1.2M+" },
                            { label: "Active Users", value: "2,400+" },
                            { label: "Projects Finished", value: "85%" },
                            { label: "Focus Hours", value: "120k+" }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-4xl lg:text-5xl font-bold text-text-primary mb-2 font-serif">{stat.value}</div>
                                <div className="text-sm text-text-secondary uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#C9A962]/5" />
                <div className="max-w-4xl mx-auto text-center relative z-10 reveal-on-scroll translate-y-8">
                    <h2 className="text-4xl lg:text-6xl font-bold mb-8">
                        Ready to stop <span className="font-serif italic text-[#C9A962]">dreaming</span> and start <span className="font-serif italic text-[#C9A962]">doing</span>?
                    </h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Join the community of creators who have found their rhythm with Swaplai.
                    </p>
                    <Link to="/register">
                        <Button className="h-16 px-12 bg-white text-black text-xl font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                            Get Started Now
                        </Button>
                    </Link>
                    <p className="mt-6 text-sm text-gray-500">No credit card required • Free plan available</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-[#C9A962] rounded-md flex items-center justify-center">
                            <span className="font-serif font-bold text-black text-xs">S</span>
                        </div>
                        <span className="font-bold text-gray-300">Swaplai</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-[#C9A962] transition-colors">Privacy</a>
                        <a href="#" className="hover:text-[#C9A962] transition-colors">Terms</a>
                        <a href="#" className="hover:text-[#C9A962] transition-colors">Twitter</a>
                    </div>
                    <p className="text-sm text-gray-600">© 2026 Swaplai Inc.</p>
                </div>
            </footer>
        </div>
    )
}