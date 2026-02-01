import { useState, useEffect } from 'react'
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
    Save
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

type Tab = 'general' | 'profile' | 'appearance' | 'notifications' | 'security'

export default function Settings() {
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    
    // Profile store
    const { profile, fetchProfile, updateProfile, isLoading } = useProfileStore()
    
    // Local state for form
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        preferences: '',
        avatar_url: ''
    })

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
                avatar_url: profile.avatar_url || ''
            })
        }
    }, [profile])

    const handleSaveProfile = async () => {
        try {
            await updateProfile({
                first_name: formData.first_name,
                last_name: formData.last_name,
                bio: formData.bio,
                preferences: formData.preferences,
                avatar_url: formData.avatar_url
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
        toggleNotification,
        setTheme,
        setLanguage
    } = useSettingsStore()

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ]

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
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
        <div className="flex flex-col h-full">
            <Header
                title="Settings"
                searchPlaceholder="Search settings..."
            />

            <div className="flex-1 overflow-auto p-8">
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
                                            <Avatar className="h-24 w-24 border-4 border-[#333333] rounded-none">
                                                <AvatarFallback className="text-3xl font-bold bg-black text-white font-mono rounded-none">
                                                    {formData.first_name ? formData.first_name.substring(0, 2).toUpperCase() : 'SU'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-lg">Profile Photo</h3>
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
                                        className="bg-[#111111] text-gray-400 border-[#333333]"
                                    />
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white font-mono">Bio</label>
                                        <textarea 
                                            className="flex min-h-[80px] w-full rounded-none border border-[#333333] bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                            placeholder="Tell us a little about yourself"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white font-mono">AI Agent Preferences (Gustos)</label>
                                        <p className="text-xs text-gray-400 font-mono">
                                            Information provided here will be used to personalize your AI agent's responses.
                                            This is transparently used for model context.
                                        </p>
                                        <textarea 
                                            className="flex min-h-[100px] w-full rounded-none border border-[#333333] bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                            placeholder="e.g. I prefer concise answers, I'm a React developer, I like dark mode examples..."
                                            value={formData.preferences}
                                            onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSaveProfile} disabled={isLoading} className="gap-2 bg-primary text-black hover:bg-primary/90 rounded-none font-bold uppercase tracking-wider">
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
                                    <div className="flex items-center justify-between border border-[#333333] p-4 bg-[#0A0A0A]">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-white font-sans uppercase tracking-wide">Language</div>
                                            <div className="text-xs text-gray-400 font-mono">Select your preferred language for the interface.</div>
                                        </div>
                                        <select
                                            className="h-9 w-[150px] rounded-none border border-[#333333] bg-[#0A0A0A] px-3 text-sm text-white focus:outline-none focus:border-primary font-mono"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value as any)}
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between border border-[#333333] p-4 bg-[#0A0A0A]">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-white font-sans uppercase tracking-wide">Timezone</div>
                                            <div className="text-xs text-gray-400 font-mono">Set your local timezone.</div>
                                        </div>
                                        <select className="h-9 w-[150px] rounded-none border border-[#333333] bg-[#0A0A0A] px-3 text-sm text-white focus:outline-none focus:border-primary font-mono">
                                            <option value="utc">UTC</option>
                                            <option value="est">EST (UTC-5)</option>
                                            <option value="pst">PST (UTC-8)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'appearance' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of the application.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-none border p-4 transition-all hover:bg-[#333333]",
                                            theme === 'light' ? "border-primary bg-primary/10" : "border-[#333333] bg-[#0A0A0A]"
                                        )}
                                    >
                                        <div className="rounded-none bg-white p-2 shadow-none border border-gray-200">
                                            <Sun className="h-6 w-6 text-black" />
                                        </div>
                                        <span className="text-sm font-bold text-white font-mono uppercase tracking-wide">Light</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-none border p-4 transition-all hover:bg-[#333333]",
                                            theme === 'dark' ? "border-primary bg-primary/10" : "border-[#333333] bg-[#0A0A0A]"
                                        )}
                                    >
                                        <div className="rounded-none bg-black p-2 shadow-none border border-[#333333]">
                                            <Moon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-white font-mono uppercase tracking-wide">Dark</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('system')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-none border p-4 transition-all hover:bg-[#333333]",
                                            theme === 'system' ? "border-primary bg-primary/10" : "border-[#333333] bg-[#0A0A0A]"
                                        )}
                                    >
                                        <div className="rounded-none bg-[#111] p-2 shadow-none border border-[#333333]">
                                            <Laptop className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-white font-mono uppercase tracking-wide">System</span>
                                    </button>
                                </div>
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
                                    <div className="flex items-center justify-between border border-[#333333] p-4 bg-[#0A0A0A]">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-white font-sans uppercase tracking-wide">Email Notifications</div>
                                            <div className="text-xs text-gray-400 font-mono">Receive daily digests and important updates.</div>
                                        </div>
                                        <Switch 
                                            checked={notifications.email} 
                                            onCheckedChange={() => handleNotificationToggle('email', 'Email notifications')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border border-[#333333] p-4 bg-[#0A0A0A]">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-white font-sans uppercase tracking-wide">Desktop Notifications</div>
                                            <div className="text-xs text-gray-400 font-mono">Get real-time alerts on your desktop.</div>
                                        </div>
                                        <Switch 
                                            checked={notifications.push} 
                                            onCheckedChange={() => handleNotificationToggle('push', 'Desktop notifications')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border border-[#333333] p-4 bg-[#0A0A0A]">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-white font-sans uppercase tracking-wide">Marketing Updates</div>
                                            <div className="text-xs text-gray-400 font-mono">Notifications about new features and offers.</div>
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
                </div>
            </div>
            </div>
            </div>
        </div>
    )
}
