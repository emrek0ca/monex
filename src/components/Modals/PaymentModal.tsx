import { useState, useEffect } from 'react';
import { LiquidModal } from '@/components/UI/LiquidModal';
import { Button } from '@/components/UI/Button';
import { PaymentService, getPaymentConfig, PaymentRequest } from '@/services/paymentService';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
    CreditCard,
    Copy,
    Check,
    Upload,
    Clock,
    CheckCircle,
    Loader2,
    Crown,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'select' | 'payment' | 'upload' | 'pending' | 'success';

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
    const config = getPaymentConfig();
    const { refreshSubscription } = useSubscriptionStore();

    const [step, setStep] = useState<Step>('select');
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [currentPayment, setCurrentPayment] = useState<PaymentRequest | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check for pending payment on open
    useEffect(() => {
        if (isOpen) {
            checkPendingPayment();
        }
    }, [isOpen]);

    const checkPendingPayment = async () => {
        setLoading(true);
        const pending = await PaymentService.getPendingPayment();
        if (pending) {
            setCurrentPayment(pending);
            if (pending.receipt_url) {
                setStep('pending');
            } else {
                setStep('payment');
            }
        } else {
            setStep('select');
        }
        setLoading(false);
    };

    const handleSelectPlan = async () => {
        setLoading(true);
        try {
            const payment = await PaymentService.createPaymentRequest(selectedPlan);
            setCurrentPayment(payment);
            setStep('payment');
        } catch (error) {
            toast.error('Ödeme talebi oluşturulamadı');
        }
        setLoading(false);
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success('Kopyalandı!');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentPayment) return;

        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Sadece JPG, PNG, WebP veya PDF dosyaları yükleyebilirsiniz');
            return;
        }

        setUploading(true);
        try {
            await PaymentService.uploadReceipt(currentPayment.id, file);
            setStep('pending');
            toast.success('Dekont başarıyla yüklendi!');
        } catch (error) {
            toast.error('Dekont yüklenemedi');
        }
        setUploading(false);
    };

    const handleCancelPayment = async () => {
        if (!currentPayment) return;

        try {
            await PaymentService.cancelPayment(currentPayment.id);
            setCurrentPayment(null);
            setStep('select');
            toast.success('Ödeme talebi iptal edildi');
        } catch {
            toast.error('İptal edilemedi');
        }
    };

    const handleClose = () => {
        onClose();
        // Don't reset state if there's a pending payment
        if (!currentPayment) {
            setStep('select');
        }
    };

    const price = selectedPlan === 'monthly' ? config.monthlyPrice : config.yearlyPrice;
    const savings = selectedPlan === 'yearly'
        ? Math.round(((config.monthlyPrice * 12 - config.yearlyPrice) / (config.monthlyPrice * 12)) * 100)
        : 0;

    if (loading) {
        return (
            <LiquidModal isOpen={isOpen} onClose={handleClose} title="Yükleniyor..." size="md">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </LiquidModal>
        );
    }

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={handleClose}
            title={step === 'pending' ? 'Ödeme Beklemede' : step === 'success' ? 'Abonelik Aktif!' : 'Pro\'ya Yükselt'}
            size="md"
        >
            <AnimatePresence mode="wait">
                {/* Step 1: Plan Selection */}
                {step === 'select' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        <div className="text-center mb-6">
                            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
                                <Crown className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Tüm premium özelliklerin kilidini açın
                            </p>
                        </div>

                        {/* Plan Options */}
                        <div className="grid gap-3">
                            <button
                                onClick={() => setSelectedPlan('yearly')}
                                className={cn(
                                    "relative p-4 rounded-xl border-2 text-left transition-all",
                                    selectedPlan === 'yearly'
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                {savings > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                        %{savings} Tasarruf
                                    </span>
                                )}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">Yıllık Plan</p>
                                        <p className="text-xs text-muted-foreground">12 ay erişim</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{PaymentService.formatPrice(config.yearlyPrice / 12, config.currency)}</p>
                                        <p className="text-xs text-muted-foreground">/ay</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedPlan('monthly')}
                                className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all",
                                    selectedPlan === 'monthly'
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">Aylık Plan</p>
                                        <p className="text-xs text-muted-foreground">1 ay erişim</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{PaymentService.formatPrice(config.monthlyPrice, config.currency)}</p>
                                        <p className="text-xs text-muted-foreground">/ay</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Features */}
                        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground mb-3">Pro ile neler kazanırsınız:</p>
                            {[
                                'Sınırsız AI Asistan sorgusu',
                                'Akıllı harcama tahminleri',
                                'Finansal sağlık skoru',
                                'Gelişmiş analizler ve raporlar',
                                'Öncelikli destek'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            onClick={handleSelectPlan}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Devam Et • {PaymentService.formatPrice(price, config.currency)}
                        </Button>
                    </motion.div>
                )}

                {/* Step 2: Payment Details */}
                {step === 'payment' && currentPayment && (
                    <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                            <div className="flex items-center gap-2 mb-3">
                                <CreditCard className="h-5 w-5 text-indigo-600" />
                                <span className="font-semibold">Havale/EFT Bilgileri</span>
                            </div>

                            <div className="space-y-3">
                                {/* IBAN */}
                                <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">IBAN</p>
                                        <p className="font-mono text-sm font-medium">{config.iban}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(config.iban.replace(/\s/g, ''), 'iban')}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                    >
                                        {copiedField === 'iban' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>

                                {/* Account Holder */}
                                <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Alıcı Adı</p>
                                        <p className="font-medium text-sm">{config.accountHolder}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(config.accountHolder, 'holder')}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                    >
                                        {copiedField === 'holder' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>

                                {/* Bank Name */}
                                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground">Banka</p>
                                    <p className="font-medium text-sm">{config.bankName}</p>
                                </div>

                                {/* Amount */}
                                <div className="flex items-center justify-between bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
                                    <div>
                                        <p className="text-xs text-amber-700 dark:text-amber-400">Tutar</p>
                                        <p className="font-bold text-lg text-amber-700 dark:text-amber-300">{PaymentService.formatPrice(currentPayment.amount, config.currency)}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(currentPayment.amount.toString(), 'amount')}
                                        className="p-2 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-lg transition-colors"
                                    >
                                        {copiedField === 'amount' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>

                                {/* Reference Code */}
                                <div className="flex items-center justify-between bg-red-100 dark:bg-red-900/30 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                    <div>
                                        <p className="text-xs text-red-700 dark:text-red-400">Açıklama (Zorunlu)</p>
                                        <p className="font-mono font-bold text-red-700 dark:text-red-300">{currentPayment.reference_code}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(currentPayment.reference_code, 'ref')}
                                        className="p-2 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors"
                                    >
                                        {copiedField === 'ref' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                ⚠️ <strong>Önemli:</strong> Havale açıklamasına yukarıdaki referans kodunu yazmayı unutmayın!
                            </p>
                        </div>

                        {/* Upload Receipt */}
                        <div>
                            <p className="text-sm font-medium mb-2">Dekont Yükle</p>
                            <label className={cn(
                                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                                "hover:bg-muted/50 border-muted-foreground/30"
                            )}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {uploading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {uploading ? 'Yükleniyor...' : 'Dekont dosyasını seçin'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP veya PDF (max 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancelPayment}
                            >
                                İptal Et
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStep('upload')}
                            >
                                Daha Sonra Yükle
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Pending Verification */}
                {step === 'pending' && (
                    <motion.div
                        key="pending"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="text-center py-6"
                    >
                        <div className="h-20 w-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                            <Clock className="h-10 w-10 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Ödemeniz İnceleniyor</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Dekontunuz yüklendi ve inceleme bekliyor. Onaylandığında size bildirim göndereceğiz.
                        </p>

                        {currentPayment && (
                            <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Referans:</span>
                                    <span className="font-mono font-medium">{currentPayment.reference_code}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Tutar:</span>
                                    <span className="font-medium">{PaymentService.formatPrice(currentPayment.amount, config.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Plan:</span>
                                    <span className="font-medium">{currentPayment.plan === 'yearly' ? 'Yıllık' : 'Aylık'}</span>
                                </div>
                            </div>
                        )}

                        <Button variant="outline" onClick={handleClose} className="w-full">
                            Tamam
                        </Button>
                    </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="h-20 w-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Hoş Geldiniz, Pro Üye! 🎉</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Aboneliğiniz aktifleştirildi. Tüm premium özelliklere erişebilirsiniz.
                        </p>
                        <Button
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
                            onClick={() => {
                                refreshSubscription();
                                handleClose();
                            }}
                        >
                            <Crown className="h-4 w-4 mr-2" />
                            Keşfetmeye Başla
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </LiquidModal>
    );
}
