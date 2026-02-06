import { useState, useEffect, useRef } from 'react'
import { Gift, Trophy, Flame, Lock, CheckCircle, Zap, Loader2 } from 'lucide-react'
import { projectsApi } from '../lib/projectsApi'

export default function Journey() {
    const [credits, setCredits] = useState(0)
    const [streak, setStreak] = useState(0)
    const [loading, setLoading] = useState(true)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadStats()
    }, [])

    useEffect(() => {
        if (!loading && scrollContainerRef.current) {
            // Scroll to current level logic
            // If Level 1 is at TOP, we want to scroll DOWN to the current level.
            const currentLevelNode = document.getElementById(`level-${streak + 1}`)
            if (currentLevelNode) {
                currentLevelNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                // Default to top if something is wrong or level 1
                scrollContainerRef.current.scrollTop = 0
            }
        }
    }, [loading, streak])

    const loadStats = async () => {
        try {
            const data = await projectsApi.getUserCredits()
            setCredits(data.amount)
            setStreak(data.global_streak)
        } catch (error) {
            console.error('Failed to load stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-bg-dark">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // CONSTANTS
    const TOTAL_LEVELS = 50
    
    // Render levels from 1 (Top) to 50 (Bottom)
    const levels = Array.from({ length: TOTAL_LEVELS }).map((_, i) => i + 1)

    return (
        <div className="h-screen bg-bg-dark text-text-primary flex flex-col font-sans">
            {/* Header Stats */}
            <div className="flex-none z-50 bg-bg-dark/95 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <Flame className="h-5 w-5 text-primary fill-primary" />
                        <span className="text-primary font-bold text-base">{streak}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                        <Zap className="h-5 w-5 text-blue-400 fill-blue-400" />
                        <span className="text-blue-400 font-bold text-base">{credits}</span>
                    </div>
                </div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Your Journey</h2>
            </div>

            {/* Scrollable Map Area */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto relative scroll-smooth px-4"
            >
                <div className="max-w-sm mx-auto relative py-12 flex flex-col items-center">
                    
                    {/* Instructions Section */}
                    <div className="mb-12 w-full bg-bg-card border border-border p-6 rounded-xl z-10 relative">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">How to Progress</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Flame className="h-4 w-4" /></div>
                                <div>
                                    <p className="text-sm font-bold text-text-primary">Daily Connection</p>
                                    <p className="text-xs text-text-secondary">Login daily to build your streak</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-green/10 rounded-lg text-accent-green"><CheckCircle className="h-4 w-4" /></div>
                                <div>
                                    <p className="text-sm font-bold text-text-primary">Complete Projects</p>
                                    <p className="text-xs text-text-secondary">Finish projects to earn major XP</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Zap className="h-4 w-4" /></div>
                                <div>
                                    <p className="text-sm font-bold text-text-primary">Complete Health Plans</p>
                                    <p className="text-xs text-text-secondary">Weekly goals give bonus rewards</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vertical Progress Line (Simplified) */}
                    <div className="absolute top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-text-primary/10 to-transparent z-0" />

                    {/* Start Indicator (Top) */}
                    <div className="mb-8 text-center opacity-50 z-10 bg-bg-dark py-2 px-4">
                        <span className="text-[10px] uppercase tracking-widest text-text-secondary">Start Here</span>
                    </div>

                    {/* Levels */}
                    {levels.map((level) => {
                        const isCompleted = level <= streak
                        const isCurrent = level === streak + 1
                        const isLocked = level > streak + 1
                        const isMilestone = level % 10 === 0

                        return (
                            <div 
                                key={level} 
                                id={`level-${level}`}
                                className="relative z-10 my-3 flex items-center justify-center w-full group"
                            >
                                {/* Level Node */}
                                <div 
                                    className={`
                                        w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 transform relative
                                        ${isCompleted 
                                            ? 'bg-accent-green text-bg-dark shadow-lg shadow-accent-green/20' 
                                            : isCurrent 
                                                ? 'bg-primary text-bg-dark shadow-xl shadow-primary/20 scale-110 ring-4 ring-primary/10' 
                                                : 'bg-bg-card text-text-secondary border border-border'
                                        }
                                    `}
                                >
                                    {isMilestone ? (
                                        <Gift className={`h-6 w-6 ${isCurrent ? 'text-bg-dark' : isCompleted ? 'text-bg-dark' : 'text-text-secondary'}`} />
                                    ) : (
                                        <span className={`text-base font-bold`}>
                                            {level}
                                        </span>
                                    )}

                                    {/* Lock Icon (Simplified - no dark overlay box) */}
                                    {isLocked && !isMilestone && (
                                        <Lock className="absolute h-3 w-3 text-text-secondary/50 bottom-1 right-1" />
                                    )}
                                </div>

                                {/* Current Indicator Label (Side) */}
                            {isCurrent && (
                                <div className="absolute left-full ml-3 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-md whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                                    Current
                                </div>
                            )}
                            </div>
                        )
                    })}
                    
                    {/* End Indicator */}
                     <div className="mt-8 text-center opacity-30 z-10 bg-bg-dark py-2">
                        <Trophy className="h-6 w-6 mx-auto mb-1 text-text-secondary" />
                        <span className="text-[10px] uppercase tracking-widest text-text-secondary">Goal</span>
                    </div>

                </div>
            </div>

            {/* Test Controls Removed */}
        </div>
    )
}
