import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/UI/Button';
import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { PieChart, ShieldCheck, Zap, Layout, Globe, ArrowRight, Check, X, Crown, Sparkles, Brain, TrendingUp, Target, Star, ChevronDown } from 'lucide-react';
import MouseParticles from '@/components/UI/MouseParticles';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { LogoIcon } from '@/components/UI/Logo';

export default function LandingPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Pricing state
    const [isYearly, setIsYearly] = useState(true);

    const monthlyPrice = 9.99;
    const yearlyPrice = 79.99;
    const yearlyMonthly = (yearlyPrice / 12).toFixed(2);
    const savings = ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0);

    // FAQ state
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const features = [
        { icon: Layout, key: 'focus' },
        { icon: PieChart, key: 'analysis' },
        { icon: Globe, key: 'global' },
        { icon: Brain, key: 'aiPowered' },
        { icon: TrendingUp, key: 'predictions' },
        { icon: ShieldCheck, key: 'security' },
    ];

    return (
        <div className="relative min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            <MouseParticles />

            {/* Navbar - Apple Style */}
            <header className="fixed top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200 transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <LogoIcon size="sm" />
                        <span className="font-semibold text-lg tracking-tight">Monex</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-600">
                        <a href="#features" className="hover:text-black transition-colors">{t('landing.nav.features')}</a>
                        <a href="#pricing" className="hover:text-black transition-colors">{t('landing.nav.pricing')}</a>
                        <a href="#testimonials" className="hover:text-black transition-colors">{t('landing.nav.testimonials')}</a>
                        <a href="#faq" className="hover:text-black transition-colors">{t('landing.nav.faq')}</a>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <LanguageSwitcher variant="minimal" className="text-gray-600" />
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-gray-100/50 rounded-full text-xs font-medium hidden sm:flex" onClick={() => navigate('/auth/login')}>
                            {t('landing.nav.login')}
                        </Button>
                        <Button size="sm" className="bg-black text-white hover:bg-gray-800 rounded-full text-xs px-3 sm:px-4 font-medium shadow-sm" onClick={() => navigate('/auth/register')}>
                            {t('landing.nav.getStarted')}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="pt-24 sm:pt-32 pb-20">
                {/* Hero Section */}
                <section className="container mx-auto px-4 sm:px-6 flex flex-col items-center text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1 shadow-sm"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">{t('landing.hero.badge')}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[1.1] mb-4 sm:mb-6 text-[#1D1D1F]"
                    >
                        {t('landing.hero.title')} <br />
                        <span className="text-gray-400">{t('landing.hero.titleHighlight')}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-xl text-base sm:text-xl text-gray-500 font-medium leading-relaxed mb-6 sm:mb-10 px-4"
                    >
                        {t('landing.hero.description')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 sm:mb-16 w-full sm:w-auto px-4 sm:px-0"
                    >
                        <Button className="h-12 px-6 sm:px-8 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm sm:text-base font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105 w-full sm:w-auto" onClick={() => navigate('/auth/register')}>
                            {t('landing.hero.startTrial')}
                        </Button>
                        <Button variant="outline" className="h-12 px-6 sm:px-8 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base font-medium flex items-center justify-center gap-2 transition-all hover:border-gray-400 w-full sm:w-auto">
                            {t('landing.hero.learnMore')} <ArrowRight className="h-4 w-4" />
                        </Button>
                    </motion.div>

                    {/* Dashboard Preview - Fixed visibility */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, type: "spring" }}
                        className="relative w-full max-w-5xl px-4 sm:px-0"
                    >
                        <div className="relative rounded-xl sm:rounded-2xl bg-white shadow-2xl border border-gray-200/50 overflow-hidden ring-1 ring-gray-900/5">
                            {/* Window UI Header */}
                            <div className="h-8 sm:h-10 bg-[#F5F5F7] border-b border-gray-200 flex items-center px-3 sm:px-4 gap-2">
                                <div className="flex gap-1 sm:gap-1.5">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]"></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
                                </div>
                                <div className="mx-auto text-[10px] sm:text-xs font-medium text-gray-400">Dashboard — Monex</div>
                            </div>

                            {/* Window Content */}
                            <div className="p-4 sm:p-6 lg:p-8 bg-white">
                                <div className="grid grid-cols-12 gap-4 sm:gap-6">
                                    {/* Sidebar - Desktop only */}
                                    <div className="hidden lg:block col-span-2 space-y-4">
                                        <div className="space-y-2">
                                            <div className="h-8 w-full bg-blue-50 rounded-lg flex items-center px-3">
                                                <div className="h-4 w-4 bg-blue-500 rounded mr-2"></div>
                                                <div className="h-2 w-16 bg-blue-200 rounded"></div>
                                            </div>
                                            <div className="h-8 w-full bg-gray-50 rounded-lg"></div>
                                            <div className="h-8 w-full bg-gray-50 rounded-lg"></div>
                                            <div className="h-8 w-full bg-gray-50 rounded-lg"></div>
                                        </div>
                                        <div className="space-y-2 pt-4 border-t border-gray-100">
                                            <div className="h-2 w-20 bg-gray-100 rounded"></div>
                                            <div className="h-2 w-16 bg-gray-100 rounded"></div>
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="col-span-12 lg:col-span-10">
                                        {/* Stats Row */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                            {[
                                                { label: 'Total Balance', value: '$24,580', color: 'blue' },
                                                { label: 'Income', value: '+$8,240', color: 'green' },
                                                { label: 'Expenses', value: '-$3,120', color: 'red' },
                                                { label: 'Savings', value: '$5,120', color: 'purple' },
                                            ].map((stat, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6 + (i * 0.1) }}
                                                    className="bg-[#F5F5F7] rounded-xl p-3 sm:p-4"
                                                >
                                                    <div className="text-[10px] sm:text-xs text-gray-400 mb-1">{stat.label}</div>
                                                    <div className={`text-sm sm:text-lg font-bold ${stat.color === 'green' ? 'text-green-600' :
                                                        stat.color === 'red' ? 'text-red-600' :
                                                            stat.color === 'purple' ? 'text-purple-600' :
                                                                'text-gray-900'
                                                        }`}>
                                                        {stat.value}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Chart and Side Panel */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                            {/* Big Chart Card */}
                                            <div className="lg:col-span-2 bg-[#F5F5F7] rounded-xl p-4 sm:p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded"></div>
                                                    <div className="flex gap-2">
                                                        <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
                                                        <div className="h-6 w-12 bg-blue-100 rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="h-32 sm:h-40 w-full flex items-end gap-1 sm:gap-2">
                                                    {[40, 60, 45, 70, 50, 80, 65, 75, 55, 85, 60, 70].map((h, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${h}%` }}
                                                            transition={{ delay: 0.8 + (i * 0.05), duration: 0.5 }}
                                                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm"
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Side Panel */}
                                            <div className="space-y-3 sm:space-y-4">
                                                <motion.div
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1 }}
                                                    className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-200 rounded-xl p-4"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                                            <Sparkles className="h-3 w-3 text-white" />
                                                        </div>
                                                        <span className="text-xs font-medium">AI Insights</span>
                                                        <span className="ml-auto text-[8px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">PRO</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="h-2 w-full bg-violet-100 rounded"></div>
                                                        <div className="h-2 w-3/4 bg-violet-100 rounded"></div>
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1.1 }}
                                                    className="bg-[#F5F5F7] rounded-xl p-4"
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                                            <Zap className="h-3 w-3 text-green-600" />
                                                        </div>
                                                        <span className="text-xs font-medium">Health Score</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl font-bold text-green-600">78</div>
                                                        <div className="text-[10px] text-gray-400">out of 100</div>
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1.2 }}
                                                    className="bg-[#F5F5F7] rounded-xl p-4"
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <Target className="h-3 w-3 text-blue-600" />
                                                        </div>
                                                        <span className="text-xs font-medium">Goals</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-200 rounded-full">
                                                        <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1">65% complete</div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating ambient elements behind */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/50 via-purple-100/30 to-white blur-3xl opacity-60"></div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="bg-[#F5F5F7] py-20 sm:py-32 mt-16 sm:mt-24" id="features">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                                {t('landing.features.title')}
                            </h2>
                            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                                {t('landing.features.subtitle')}
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 group"
                                >
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-black">
                                        {t(`landing.features.items.${feature.key}.title`)}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                                        {t(`landing.features.items.${feature.key}.desc`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-20 sm:py-32 bg-white" id="pricing">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12 sm:mb-16">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600 mb-4"
                            >
                                <Sparkles className="h-3 w-3" /> {t('landing.pricing.badge')}
                            </motion.span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                                {t('landing.pricing.title')}
                            </h2>
                            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                                {t('landing.pricing.subtitle')}
                            </p>

                            {/* Billing Toggle */}
                            <div className="flex items-center justify-center gap-3">
                                <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{t('landing.pricing.monthly')}</span>
                                <button
                                    onClick={() => setIsYearly(!isYearly)}
                                    className={`relative h-7 w-14 rounded-full transition-colors ${isYearly ? 'bg-violet-600' : 'bg-gray-300'}`}
                                >
                                    <motion.div
                                        animate={{ x: isYearly ? 28 : 4 }}
                                        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
                                    />
                                </button>
                                <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {t('landing.pricing.yearly')}
                                    <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                        {t('landing.pricing.save')} {savings}%
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Pricing Cards */}
                        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                            {/* Free Plan */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 hover:shadow-lg transition-shadow"
                            >
                                <div className="mb-6">
                                    <h3 className="text-xl sm:text-2xl font-semibold mb-2">{t('landing.pricing.free.name')}</h3>
                                    <p className="text-sm text-gray-500">{t('landing.pricing.free.description')}</p>
                                </div>
                                <div className="mb-6">
                                    <span className="text-4xl sm:text-5xl font-bold">{t('landing.pricing.free.price')}</span>
                                    <span className="text-gray-500">{t('landing.pricing.free.perMonth')}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl mb-8 text-base font-medium"
                                    onClick={() => navigate('/auth/register')}
                                >
                                    {t('landing.pricing.free.cta')}
                                </Button>
                                <div className="space-y-3 sm:space-y-4">
                                    {(t('landing.pricing.free.features', { returnObjects: true }) as string[]).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                    {(t('landing.pricing.notIncluded', { returnObjects: true }) as string[]).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                                                <X className="h-3 w-3 text-gray-400" />
                                            </div>
                                            <span className="text-sm text-gray-400">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Pro Plan */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 sm:p-8 text-white overflow-hidden hover:shadow-2xl transition-shadow"
                            >
                                {/* Popular Badge */}
                                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-medium">
                                    <Crown className="h-3 w-3" /> {t('landing.pricing.pro.popular')}
                                </div>

                                {/* Glow Effect */}
                                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>

                                <div className="relative">
                                    <div className="mb-6">
                                        <h3 className="text-xl sm:text-2xl font-semibold mb-2">{t('landing.pricing.pro.name')}</h3>
                                        <p className="text-sm text-white/70">{t('landing.pricing.pro.description')}</p>
                                    </div>
                                    <div className="mb-6">
                                        <span className="text-4xl sm:text-5xl font-bold">${isYearly ? yearlyMonthly : monthlyPrice}</span>
                                        <span className="text-white/70">/month</span>
                                        {isYearly && (
                                            <p className="text-xs text-white/60 mt-1">
                                                {t('upgrade.billedAnnually')} ${yearlyPrice}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        className="w-full h-12 rounded-xl mb-8 text-base font-medium bg-white text-violet-700 hover:bg-white/90"
                                        onClick={() => navigate('/auth/register')}
                                    >
                                        <Crown className="h-4 w-4 mr-2" /> {t('landing.pricing.pro.cta')}
                                    </Button>
                                    <div className="space-y-3 sm:space-y-4">
                                        {(t('landing.pricing.pro.features', { returnObjects: true }) as string[]).map((feature, i) => {
                                            const isAI = feature.toLowerCase().includes('ai') || feature.toLowerCase().includes('prediction') || feature.toLowerCase().includes('health') || feature.toLowerCase().includes('tahmin') || feature.toLowerCase().includes('sağlık');
                                            return (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${isAI ? 'bg-yellow-400' : 'bg-white/20'}`}>
                                                        <Check className={`h-3 w-3 ${isAI ? 'text-yellow-900' : 'text-white'}`} />
                                                    </div>
                                                    <span className={`text-sm ${isAI ? 'text-white font-medium' : 'text-white/80'}`}>
                                                        {feature}
                                                    </span>
                                                    {isAI && (
                                                        <span className="ml-auto text-[10px] font-medium bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full">
                                                            AI
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 sm:py-32 bg-[#F5F5F7]" id="testimonials">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                                {t('landing.testimonials.title')}
                            </h2>
                            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                                {t('landing.testimonials.subtitle')}
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                            {(t('landing.testimonials.items', { returnObjects: true }) as Array<{ name: string; role: string; text: string }>).map((testimonial, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                                        "{testimonial.text}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                                            {testimonial.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{testimonial.name}</p>
                                            <p className="text-xs text-gray-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 sm:py-32 bg-white" id="faq">
                    <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                                {t('landing.faq.title')}
                            </h2>
                            <p className="text-base sm:text-lg text-gray-500">
                                {t('landing.faq.subtitle')}
                            </p>
                        </div>
                        <div className="space-y-4">
                            {(t('landing.faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>).map((faq, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-medium text-sm sm:text-base pr-4">{faq.q}</span>
                                        <motion.div
                                            animate={{ rotate: openFaq === i ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-gray-600 leading-relaxed">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 sm:py-32 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                    <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="container mx-auto px-4 sm:px-6 relative">
                        <div className="text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-white"
                            >
                                {t('landing.cta.title')}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8"
                            >
                                {t('landing.cta.subtitle')}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <Button
                                    className="h-12 px-8 rounded-full bg-white text-violet-700 hover:bg-white/90 text-base font-medium shadow-lg"
                                    onClick={() => navigate('/auth/register')}
                                >
                                    {t('landing.cta.startTrial')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 px-8 rounded-full border-white/30 text-white hover:bg-white/10 text-base font-medium"
                                    onClick={() => navigate('/auth/login')}
                                >
                                    {t('landing.cta.signIn')}
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-[#1D1D1F] py-12 sm:py-16 text-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <LogoIcon size="sm" className="invert" />
                                <span className="font-semibold text-lg">Monex</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {t('landing.footer.description')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-sm">{t('landing.footer.product')}</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#features" className="hover:text-white transition-colors">{t('landing.footer.features')}</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">{t('landing.footer.pricing')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.security')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-sm">{t('landing.footer.company')}</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.about')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.blog')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.careers')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-sm">{t('landing.footer.legal')}</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.privacy')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.terms')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.cookies')}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">© 2024 Monex Inc. {t('landing.footer.rights')}</p>
                        <div className="flex items-center gap-4">
                            <LanguageSwitcher className="text-gray-400" />
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
