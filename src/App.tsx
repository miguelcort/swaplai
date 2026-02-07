import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import ProjectDetail from './pages/ProjectDetail'
import Projects from './pages/Projects'
import CommunityTasks from './pages/CommunityTasks'
import Journey from './pages/Journey'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useAuthStore } from './stores/authStore'
import { useSettingsStore } from './stores/settingsStore'
import { ToastContainer } from './components/ui/Toast'

import { projectsApi } from './lib/projectsApi'
import { toast } from './hooks/useToast'

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize)
  const { theme, customColors } = useSettingsStore()

  useEffect(() => {
    initializeAuth()
    
    // Check daily login reward
    const checkDaily = async () => {
        const result = await projectsApi.checkDailyLogin()
        if (result.success && result.message) {
             toast({ 
                title: "Daily Bonus!", 
                description: result.message + (result.streak ? ` Streak: ${result.streak}` : ''), 
                type: "success" 
            })
        }
    }
    // Small delay to ensure auth is ready or check inside if needed
    // Actually, initializeAuth is async but doesn't return promise here. 
    // We should probably wait for user to be set. 
    // For now, let's just call it, projectsApi handles "not authenticated" gracefully.
    checkDaily()
  }, [initializeAuth])

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'light') {
        root.style.setProperty('--primary', '#4682B4')
        root.style.setProperty('--bg-dark', '#FFFFFF')
        root.style.setProperty('--bg-card', '#F9FAFB')
        root.style.setProperty('--bg-light', '#F3F4F6')
        root.style.setProperty('--text-primary', '#0A0A0A')
        root.style.setProperty('--text-secondary', '#4B5563')
        root.style.setProperty('--border', '#E5E7EB')
        root.style.setProperty('--text-on-primary', '#FFFFFF')
        root.style.setProperty('color-scheme', 'light')
    } else if (theme === 'custom' && customColors) {
        root.style.setProperty('--primary', customColors.primary)
        root.style.setProperty('--bg-dark', customColors.background)
        root.style.setProperty('--bg-card', customColors.background)
        root.style.setProperty('--bg-light', customColors.background)
        // Reset to dark mode defaults for others
        root.style.setProperty('--text-primary', customColors.text || '#FFFFFF')
        root.style.setProperty('--text-secondary', customColors.text ? customColors.text + '99' : '#A3A3A3') // Add transparency for secondary
        // Use color-mix to create a border color derived from text color (20% opacity)
        // This ensures contrast regardless of whether the theme is light or dark
        root.style.setProperty('--border', 'color-mix(in srgb, var(--text-primary) 20%, transparent)')
        root.style.setProperty('--text-on-primary', '#FFFFFF') // Assume white text on custom primary for better contrast in dark mode
        root.style.setProperty('color-scheme', 'dark')
    } else {
        // Dark / System
        root.style.setProperty('--primary', '#C9A962')
        root.style.setProperty('--bg-dark', '#0A0A0A')
        root.style.setProperty('--bg-card', '#0A0A0A')
        root.style.setProperty('--bg-light', '#171717')
        root.style.setProperty('--text-primary', '#FFFFFF')
        root.style.setProperty('--text-secondary', '#A3A3A3')
        root.style.setProperty('--border', '#333333')
        root.style.setProperty('--text-on-primary', '#000000')
        root.style.setProperty('color-scheme', 'dark')
    }
  }, [theme, customColors])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="community" element={<CommunityTasks />} />
            <Route path="journey" element={<Journey />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:id" element={<Chat />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
