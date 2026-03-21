import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { ScrollArea } from '@/components/UI/ScrollArea';
import { Bot, Send, User, X, Sparkles, Crown, Lock } from 'lucide-react';
import { AIService } from '@/services/aiService';
import { useUserStore } from '@/store/userStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UpgradeModal } from '../UI/UpgradeModal';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function AIAssistant() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [canSendMessage, setCanSendMessage] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useUserStore();
    const { isPremium, canUseAI, decrementQueries, aiQueriesRemaining } = useSubscriptionStore();

    // Check if user can send messages
    useEffect(() => {
        const checkAIUsage = async () => {
            if (isPremium) {
                setCanSendMessage(true);
                return;
            }
            const canUse = await canUseAI();
            setCanSendMessage(canUse);
        };
        
        if (isOpen) {
            checkAIUsage();
        }
    }, [isOpen, isPremium, canUseAI, aiQueriesRemaining]);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Add initial greeting when chat opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'greeting',
                    role: 'assistant',
                    content: t('ai.greeting'),
                },
            ]);
        }
    }, [isOpen, t, messages.length]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Final check before sending
        if (!isPremium) {
            const canUse = await canUseAI();
            if (!canUse) {
                setShowUpgradeModal(true);
                return;
            }
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Decrement query count for free users
        if (!isPremium) {
            decrementQueries();
        }

        try {
            const response = await AIService.chat(input, user?.id || '');
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: t('ai.error'),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

            {/* Chat Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className={cn(
                            "fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50 h-14 w-14 md:h-16 md:w-16 rounded-2xl md:rounded-[1.5rem]",
                            "bg-[#1D1D1F] text-white",
                            "shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1",
                            "flex items-center justify-center transition-all group overflow-hidden"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Sparkles className="h-6 w-6 md:h-7 md:w-7 relative z-10" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className={cn(
                            "fixed z-50",
                            "bottom-0 right-0 left-0 md:bottom-8 md:right-8 md:left-auto",
                            "w-full md:w-[420px]",
                            "h-[75vh] md:h-[600px]",
                            "bg-white border border-gray-100 rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]",
                            "flex flex-col overflow-hidden backdrop-blur-3xl"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-[#F5F5F7]/30">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm">{t('ai.name')}</h3>
                                        {isPremium && (
                                            <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-1.5 py-0.5 text-[9px] font-semibold text-yellow-900">
                                                <Crown className="h-2.5 w-2.5" />
                                                PRO
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">{t('ai.role')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isPremium && (
                                    <span className={cn(
                                        "text-[10px] font-medium px-2 py-1 rounded-full",
                                        aiQueriesRemaining > 0
                                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    )}>
                                        {aiQueriesRemaining} {t('ai.queriesLeft')}
                                    </span>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "")}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "px-4 py-3 rounded-2xl text-sm max-w-[85%] font-medium leading-relaxed shadow-sm",
                                            msg.role === 'user'
                                                ? "bg-[#1D1D1F] text-white rounded-br-none"
                                                : "bg-[#F5F5F7] text-[#1D1D1F] border border-gray-100 rounded-bl-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-3"
                                    >
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="px-3 py-2 rounded-2xl rounded-bl-none bg-muted">
                                            <div className="flex gap-1.5">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                                                    className="h-2 w-2 rounded-full bg-violet-500"
                                                />
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                                                    className="h-2 w-2 rounded-full bg-violet-500"
                                                />
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                                                    className="h-2 w-2 rounded-full bg-violet-500"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Daily Limit Warning */}
                        {!isPremium && !canSendMessage && (
                            <div className="px-4 py-3 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-t">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                        <Lock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium">{t('ai.dailyLimitReached')}</p>
                                        <p className="text-[10px] text-muted-foreground">{t('ai.dailyLimitDesc')}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs"
                                    >
                                        {t('ai.upgradeNow')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t bg-card/50">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={canSendMessage ? t('ai.placeholder') : t('ai.placeholderUpgrade')}
                                    disabled={isLoading || (!isPremium && !canSendMessage)}
                                    className="flex-1 h-10 rounded-full bg-muted/50 border-0 text-sm px-4"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !input.trim() || (!isPremium && !canSendMessage)}
                                    className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
