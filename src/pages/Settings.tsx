import { useState } from 'react'
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Camera,
    Moon,
    Sun,
    Laptop
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Switch } from '../components/ui/Switch'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Header } from '../components/layout/Header'
import { cn } from '../lib/utils'

import { useSettingsStore } from '../stores/settingsStore'
import { toast } from '../hooks/useToast'

type Tab = 'general' | 'profile' | 'appearance' | 'notifications' | 'security'

export default function Settings() {
    const [activeTab, setActiveTab] = useState<Tab>('profile')
    // Get state and actions from store
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
                                            <Avatar className="h-24 w-24 border-4 border-bg-light">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback className="text-xl">MC</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-lg">Profile Photo</h3>
                                            <p className="text-sm text-text-secondary mb-3">
                                                This will be displayed on your profile.
                                            </p>
                                            <div className="flex gap-3">
                                                <Button size="sm" variant="outline">Change</Button>
                                                <Button size="sm" variant="ghost" className="text-accent-red hover:text-accent-red hover:bg-accent-red/10">Remove</Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Input label="First Name" defaultValue="Miguel" />
                                        <Input label="Last Name" defaultValue="Cortes" />
                                    </div>
                                    <Input label="Email" type="email" defaultValue="miguel@example.com" />
                                    <Input label="Bio" defaultValue="Software Developer & Designer" />
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
                                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Language</div>
                                            <div className="text-xs text-text-secondary">Select your preferred language for the interface.</div>
                                        </div>
                                        <select
                                            className="h-9 w-[150px] rounded-md border border-border bg-bg-card px-3 text-sm"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value as any)}
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Timezone</div>
                                            <div className="text-xs text-text-secondary">Set your local timezone.</div>
                                        </div>
                                        <select className="h-9 w-[150px] rounded-md border border-border bg-bg-card px-3 text-sm">
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
                                            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-bg-light",
                                            theme === 'light' ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="rounded-full bg-white p-2 shadow-sm border border-gray-200">
                                            <Sun className="h-6 w-6 text-gray-900" />
                                        </div>
                                        <span className="text-sm font-medium">Light</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-bg-light",
                                            theme === 'dark' ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="rounded-full bg-gray-900 p-2 shadow-sm border border-gray-700">
                                            <Moon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm font-medium">Dark</span>
                                    </button>
                                    <button
                                        onClick={() => handleThemeChange('system')}
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-bg-light",
                                            theme === 'system' ? "border-primary bg-primary/5" : "border-border"
                                        )}
                                    >
                                        <div className="rounded-full bg-gray-100 p-2 shadow-sm border border-gray-300">
                                            <Laptop className="h-6 w-6 text-gray-900" />
                                        </div>
                                        <span className="text-sm font-medium">System</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Choose what you want to be notified about.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between space-x-2">
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm font-medium">Email Notifications</span>
                                            <span className="text-xs text-text-secondary">Receive daily summaries and alerts.</span>
                                        </div>
                                        <Switch
                                            checked={notifications.email}
                                            onCheckedChange={() => handleNotificationToggle('email', 'Email notifications')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm font-medium">Push Notifications</span>
                                            <span className="text-xs text-text-secondary">Get real-time updates on your device.</span>
                                        </div>
                                        <Switch
                                            checked={notifications.push}
                                            onCheckedChange={() => handleNotificationToggle('push', 'Push notifications')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm font-medium">Marketing Emails</span>
                                            <span className="text-xs text-text-secondary">Receive news about new features and products.</span>
                                        </div>
                                        <Switch
                                            checked={notifications.marketing}
                                            onCheckedChange={() => handleNotificationToggle('marketing', 'Marketing emails')}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Manage your password and authentication methods.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Input label="Current Password" type="password" />
                                        <Input label="New Password" type="password" />
                                        <Input label="Confirm New Password" type="password" />
                                    </div>
                                    <div className="pt-2">
                                        <Button onClick={() => toast({ title: "Password Updated", type: "success" })}>Update Password</Button>
                                    </div>
                                    <div className="mt-6 border-t border-border pt-6">
                                        <div className="flex items-center justify-between space-x-2">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm font-medium">Two-Factor Authentication</span>
                                                <span className="text-xs text-text-secondary">Add an extra layer of security to your account.</span>
                                            </div>
                                            <Switch onCheckedChange={(checked) => toast({ title: checked ? "2FA Enabled" : "2FA Disabled", type: checked ? "success" : "warning" })} />
                                        </div>
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
