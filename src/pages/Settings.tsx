import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Camera,
    Moon,
    Sun,
    Laptop,
    Save,
    CreditCard,
    HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Switch } from '../components/ui/Switch'
import { Avatar, AvatarFallback } from '../components/ui/Avatar'
import { Header } from '../components/layout/Header'
import { cn } from '../lib/utils'

import { useSettingsStore } from '../stores/settingsStore'
import { useProfileStore } from '../stores/profileStore'
import { toast } from '../hooks/useToast'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { useTour } from '../hooks/useTour'

type Tab = 'general' | 'profile' | 'appearance' | 'notifications' | 'security' | 'credits' | 'help'

export default function Settings() {
    const [searchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    const { credits, fetchCredits } = useAuthStore()
    const { startTour } = useTour()
    
    // Profile store
    const { profile, fetchProfile, updateProfile, isLoading } = useProfileStore()
    
    // Local state for form
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        preferences: '',
        avatar_url: '',
        is_searchable: false
    })

    // Local state for credit card
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    })

    const creditPackages = [
        { id: 'small', credits: 100, price: 10, label: '100 Credits', desc: 'Perfect for small projects.' },
        { id: 'medium', credits: 500, price: 45, label: '500 Credits', desc: 'Best value for active users.', popular: true },
        { id: 'large', credits: 1000, price: 80, label: '1000 Credits', desc: 'For power users and teams.' }
    ]
    const [selectedPackage, setSelectedPackage] = useState(creditPackages[1])

    const fillTestCard = () => {
        setCardData({
            number: '4242 4242 4242 4242',
            expiry: '12/30',
            cvc: '123',
            name: 'Test User'
        })
        toast({
            title: "Test card applied",
            description: "Test credit card details have been filled.",
            type: "success"
        })
    }

    const handlePayment = async () => {
        // Basic validation
        const cleanNumber = cardData.number.replace(/\s/g, '')
        const cleanCvc = cardData.cvc.replace(/\s/g, '')
        
        if (!cleanNumber || cleanNumber.length < 15) {
            toast({
                title: "Invalid Card Number",
                description: "Please enter a valid credit card number.",
                type: "error"
            })
            return
        }

        if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
             toast({
                title: "Invalid Expiry Date",
                description: "Please enter expiry date in MM/YY format.",
                type: "error"
            })
            return
        }

        if (!cleanCvc || cleanCvc.length < 3) {
             toast({
                title: "Invalid CVC",
                description: "Please enter a valid CVC code.",
                type: "error"
            })
            return
        }

        if (!cardData.name) {
             toast({
                title: "Invalid Name",
                description: "Please enter the cardholder name.",
                type: "error"
            })
            return
        }
        
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                // Try to call RPC
                const { error } = await supabase.rpc('purchase_credits', {
                    user_id_input: user.id,
                    amount_credits: selectedPackage.credits
                })

                if (error) {
                    console.error('RPC Error:', error)
                    throw error
                }
            }

            toast({
                title: "Payment Successful",
                description: `${selectedPackage.credits} Credits have been added to your account.`,
                type: "success"
            })
            
            fetchCredits()
        } catch (error) {
            console.error('Payment error:', error)
            // Fallback: show success but warn about persistence if it was an RPC error
            toast({
                title: "Payment Processed",
                description: "Payment validated (Simulation). Backend update failed.",
                type: "warning"
            })
        }
    }

    // Load profile on mount
    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    // Sync profile to form
    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                bio: profile.bio || '',
                preferences: profile.preferences || '',
                avatar_url: profile.avatar_url || '',
                is_searchable: profile.is_searchable || false
            })
        }
    }, [profile])

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && ['general', 'profile', 'appearance', 'notifications', 'security', 'credits'].includes(tab)) {
            setActiveTab(tab as Tab)
        }
    }, [searchParams])

    const handleSaveProfile = async () => {
        try {
            await updateProfile({
                first_name: formData.first_name,
                last_name: formData.last_name,
                bio: formData.bio,
                preferences: formData.preferences,
                avatar_url: formData.avatar_url,
                is_searchable: formData.is_searchable
            })
            toast({
                title: "Profile updated",
                description: "Your profile information has been saved successfully.",
                type: "success"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                type: "error"
            })
        }
    }

    // Get state and actions from settings store
    const {
        notifications,
        theme,
        language,
        customColors,
        toggleNotification,
        setTheme,
        setLanguage,
        setCustomColors
    } = useSettingsStore()

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'credits', label: 'Credits & Billing', icon: CreditCard },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'help', label: 'Help & Tour', icon: HelpCircle },
    ]

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system' | 'custom') => {
        setTheme(newTheme)
        toast({
            title: "Theme updated",
            description: `Appearance set to ${newTheme} mode.`,
            type: "success"
        })
    }

    const handleNotificationToggle = (key: keyof typeof notifications, label: string) => {
        toggleNotification(key)
        const newState = !notifications[key]
        toast({
            title: newState ? "Notification enabled" : "Notification disabled",
            description: `${label} turned ${newState ? 'on' : 'off'}.`,
            type: newState ? "success" : "info"
        })
    }

    return (
        <div className="flex flex-col min-h-full bg-bg-dark font-sans transition-colors duration-300">
            <Header title="Settings" />
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                activeTab === tab.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-text-secondary hover:bg-bg-light hover:text-text-primary"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your photo and personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group cursor-pointer">
                                            <Avatar className="h-24 w-24 border-4 border-border rounded-none">
                                                <AvatarFallback className="text-3xl font-bold bg-bg-card text-text-primary font-mono rounded-none">
                                                    {formData.first_name ? formData.first_name.substring(0, 2).toUpperCase() : 'SU'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-lg text-text-primary">Profile Photo</h3>
                                            <p className="text-sm text-text-secondary mb-3">
                                                This will be displayed on your profile.
                                            </p>
                                            <div className="flex gap-3">
                                                <Input 
                                                    placeholder="Avatar URL" 
                                                    value={formData.avatar_url}
                                                    onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                                                    className="max-w-md"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Input 
                                            label="First Name" 
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        />
                                        <Input 
                                            label="Last Name" 
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        />
                                    </div>
                                    <Input 
                                        label="Email" 
                                        type="email" 
                                        value={formData.email}
                                        disabled
                                        className="bg-bg-card text-text-secondary border-border"
                                    />
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary font-mono">Bio</label>
                                        <textarea 
                                            className="flex min-h-[80px] w-full rounded-none border border-border bg-bg-dark px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                            placeholder="Tell us a little about yourself"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary font-mono">AI Agent Preferences (Gustos)</label>
                                        <p className="text-xs text-text-secondary font-mono">
                                            Information provided here will be used to personalize your AI agent's responses.
                                            This is transparently used for model context.
                                        </p>
                                        <textarea 
                                            className="flex min-h-[100px] w-full rounded-none border border-border bg-bg-dark px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                            placeholder="e.g. I prefer concise answers, I'm a React developer, I like dark mode examples..."
                                            value={formData.preferences}
                                            onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <label className="text-sm font-medium text-text-primary font-mono">Community Help (Ayuda a la Comunidad)</label>
                                                <p className="text-xs text-text-secondary font-mono">
                                                    Allow others to find you based on your skills to ask for help.
                                                    (Permitir que otros te encuentren por tus habilidades para pedir ayuda).
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.is_searchable}
                                                onCheckedChange={(checked) => setFormData({...formData, is_searchable: checked})}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSaveProfile} disabled={isLoading} className="gap-2 bg-primary text-bg-dark hover:bg-primary/90 rounded-none font-bold uppercase tracking-wider">
                                            <Save className="h-4 w-4" />
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>General Preferences</CardTitle>
                                <CardDescription>Customize your regional and language settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border border-border p-4 bg-bg-dark">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-text-primary font-sans uppercase tracking-wide">Language</div>
                                            <div className="text-xs text-text-secondary font-mono">Select your preferred language for the interface.</div>
                                        </div>
                                        <select
                                            className="h-9 w-[150px] rounded-none border border-border bg-bg-dark px-3 text-sm text-text-primary focus:outline-none focus:border-primary font-mono"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value as any)}
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between border border-border p-4 bg-bg-dark">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-text-primary font-sans uppercase tracking-wide">Timezone</div>
                                            <div className="text-xs text-text-secondary font-mono">Set your local timezone.</div>
                                        </div>
                                        <select className="h-9 w-[150px] rounded-none border border-border bg-bg-dark px-3 text-sm text-text-primary focus:outline-none focus:border-primary font-mono">
                                            <option value="utc">UTC</option>
                                            <option value="est">EST (UTC-5)</option>
                                            <option value="pst">PST (UTC-8)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'credits' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Credits & Billing</CardTitle>
                                    <CardDescription>Manage your credits and payment methods.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Current Balance */}
                                    <div className="p-6 bg-bg-dark border border-border flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-text-secondary font-mono uppercase tracking-wider mb-1">Current Balance</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-bold text-text-primary font-mono">{credits}</span>
                                                <span className="text-sm text-primary font-bold font-mono uppercase">Credits</span>
                                            </div>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <CreditCard className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>

                                    {/* Add Credits Form */}
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <h3 className="text-lg font-bold text-text-primary">Add Credits</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                {creditPackages.map((pkg) => (
                                                    <div 
                                                        key={pkg.id}
                                                        onClick={() => setSelectedPackage(pkg)}
                                                        className={cn(
                                                            "p-4 border cursor-pointer transition-colors relative",
                                                            selectedPackage.id === pkg.id 
                                                                ? "border-primary bg-primary/5" 
                                                                : "border-border bg-bg-dark hover:border-primary"
                                                        )}
                                                    >
                                                        {pkg.popular && (
                                                            <div className="absolute -top-2 right-4 bg-primary text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                                                                Popular
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-lg font-bold text-text-primary">{pkg.label}</span>
                                                            <span className="text-primary font-mono font-bold">${pkg.price.toFixed(2)}</span>
                                                        </div>
                                                        <p className="text-xs text-text-secondary">{pkg.desc}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-bg-dark border border-border p-6 space-y-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Card Details</span>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={fillTestCard}
                                                            className="text-xs text-primary hover:text-primary-hover h-auto py-1"
                                                        >
                                                            Use Test Card
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-xs text-text-secondary font-mono uppercase mb-1 block">Card Number</label>
                                                            <Input 
                                                                placeholder="4242 4242 4242 4242" 
                                                                className="font-mono"
                                                                value={cardData.number}
                                                                onChange={(e) => setCardData({...cardData, number: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-xs text-text-secondary font-mono uppercase mb-1 block">Expiry</label>
                                                                <Input 
                                                                    placeholder="MM/YY" 
                                                                    className="font-mono"
                                                                    value={cardData.expiry}
                                                                    onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-text-secondary font-mono uppercase mb-1 block">CVC</label>
                                                                <Input 
                                                                    placeholder="123" 
                                                                    className="font-mono"
                                                                    value={cardData.cvc}
                                                                    onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-text-secondary font-mono uppercase mb-1 block">Cardholder Name</label>
                                                            <Input 
                                                                placeholder="John Doe" 
                                                                value={cardData.name}
                                                                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>

                                                    <Button 
                                                        className="w-full mt-4 bg-primary text-black hover:bg-primary-hover font-bold"
                                                        onClick={handlePayment}
                                                    >
                                                        Pay ${selectedPackage.price.toFixed(2)}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-center text-text-secondary">
                                                    Secure payment processing powered by Stripe.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of the application.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-none border p-4 transition-all hover:bg-primary/5",
                                            theme === 'light' ? "border-primary bg-primary/10" : "border-border bg-bg-dark"
                                        )}
                                    >
                                        <div className="rounded-none bg-white p-2 shadow-none border border-gray-200">
                                            <Sun className="h-6 w-6 text-black" />
                                        </div>
                                        <span className="text-sm font-bold text-text-primary font-mono uppercase tracking-wide">Light</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-none border p-4 transition-all hover:bg-primary/5",
                                            theme === 'dark' ? "border-primary bg-primary/10" : "border-border bg-bg-dark"
                                        )}
                                    >
                                        <div className="rounded-none bg-[#0A0A0A] p-2 shadow-none border border-border">
                                            <Moon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-text-primary font-mono uppercase tracking-wide">Dark</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('system')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-none border p-4 transition-all hover:bg-primary/5",
                                            theme === 'system' ? "border-primary bg-primary/10" : "border-border bg-bg-dark"
                                        )}
                                    >
                                        <div className="rounded-none bg-bg-card p-2 shadow-none border border-border">
                                            <Laptop className="h-6 w-6 text-text-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-text-primary font-mono uppercase tracking-wide">System</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('custom')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-none border p-4 transition-all hover:bg-primary/5",
                                            theme === 'custom' ? "border-primary bg-primary/10" : "border-border bg-bg-dark"
                                        )}
                                    >
                                        <div className="rounded-none bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-none border border-border">
                                            <Palette className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-text-primary font-mono uppercase tracking-wide">Custom</span>
                                    </button>
                                </div>

                                {theme === 'custom' && (
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Custom Colors</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs text-text-secondary font-mono uppercase mb-2 block">Background Color</label>
                                                <div className="flex gap-3">
                                                    <div className="h-10 w-10 rounded border border-border" style={{ backgroundColor: customColors?.background }}></div>
                                                    <Input 
                                                        value={customColors?.background} 
                                                        onChange={(e) => setCustomColors({...customColors!, background: e.target.value})}
                                                        className="font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-text-secondary font-mono uppercase mb-2 block">Primary Color</label>
                                                <div className="flex gap-3">
                                                    <div className="h-10 w-10 rounded border border-border" style={{ backgroundColor: customColors?.primary }}></div>
                                                    <Input 
                                                        value={customColors?.primary} 
                                                        onChange={(e) => setCustomColors({...customColors!, primary: e.target.value})}
                                                        className="font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-text-secondary font-mono uppercase mb-2 block">Text Color</label>
                                                <div className="flex gap-3">
                                                    <div className="h-10 w-10 rounded border border-border" style={{ backgroundColor: customColors?.text || '#FFFFFF' }}></div>
                                                    <Input 
                                                        value={customColors?.text || '#FFFFFF'} 
                                                        onChange={(e) => setCustomColors({...customColors!, text: e.target.value})}
                                                        className="font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                    
                    {activeTab === 'notifications' && (
                         <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Manage how you receive notifications.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border border-border p-4 bg-bg-dark">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-text-primary font-sans uppercase tracking-wide">Email Notifications</div>
                                            <div className="text-xs text-text-secondary font-mono">Receive daily digests and important updates.</div>
                                        </div>
                                        <Switch 
                                            checked={notifications.email} 
                                            onCheckedChange={() => handleNotificationToggle('email', 'Email notifications')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border border-border p-4 bg-bg-dark">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-text-primary font-sans uppercase tracking-wide">Desktop Notifications</div>
                                            <div className="text-xs text-text-secondary font-mono">Get real-time alerts on your desktop.</div>
                                        </div>
                                        <Switch 
                                            checked={notifications.push} 
                                            onCheckedChange={() => handleNotificationToggle('push', 'Desktop notifications')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border border-border p-4 bg-bg-dark">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-text-primary font-sans uppercase tracking-wide">Marketing Updates</div>
                                            <div className="text-xs text-text-secondary font-mono">Notifications about new features and offers.</div>
                                        </div>
                                        <Switch 
                                            checked={notifications.marketing} 
                                            onCheckedChange={() => handleNotificationToggle('marketing', 'Marketing updates')}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {activeTab === 'security' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>Manage your password and security preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        Change Password
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        Two-Factor Authentication
                                    </Button>
                                    <div className="pt-4 border-t border-border">
                                        <Button variant="ghost" className="w-full justify-start text-left font-normal text-red-600 hover:text-red-700 hover:bg-red-50">
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'help' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Help & Support</CardTitle>
                                <CardDescription>Get help with using Swaplai.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="p-6 border border-border rounded-lg bg-bg-card flex flex-col items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-text-primary mb-2">Guided Tour</h3>
                                            <p className="text-text-secondary mb-4">
                                                Take a quick tour of the application to learn how to manage projects, tasks, and use the AI chat.
                                            </p>
                                        </div>
                                        <Button onClick={startTour} className="bg-primary text-bg-dark hover:bg-primary/90">
                                            Start Product Tour
                                        </Button>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-border">
                                        <h4 className="font-bold text-sm text-text-primary mb-2">Need more help?</h4>
                                        <p className="text-sm text-text-secondary">
                                            Contact support at <a href="mailto:support@swaplai.com" className="text-primary hover:underline">support@swaplai.com</a>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            </div>
            </div>
        </div>
    )
}