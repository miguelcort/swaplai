import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { projectsApi } from '../../lib/projectsApi'
import { toast } from '../../hooks/useToast'
import { Heart, CheckCircle, Flame } from 'lucide-react'
import { cn } from '../../lib/utils'

export function HealthPlanCard() {
    const [plan, setPlan] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [checkingIn, setCheckingIn] = useState(false)

    const loadPlan = async () => {
        try {
            const data = await projectsApi.getActiveHealthPlan()
            setPlan(data)
        } catch (error) {
            console.error('Failed to load health plan:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPlan()
    }, [])

    const handleCheckIn = async () => {
        setCheckingIn(true)
        try {
            const result = await projectsApi.checkInHealthDaily()
            if (result.success) {
                toast({
                    title: "Health Check-in",
                    description: result.message,
                    type: "success"
                })
                loadPlan() // Reload to update UI
            } else {
                toast({
                    title: "Check-in Failed",
                    description: result.message,
                    type: "warning"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to check in.",
                type: "error"
            })
        } finally {
            setCheckingIn(false)
        }
    }

    if (loading) {
        return (
            <Card className="h-full border-border bg-bg-card">
                <CardContent className="p-6 flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        )
    }

    // If no plan or active plan
    const daysCompleted = plan?.daily_completions?.length || 0
    // Check if today is in completions
    const today = new Date().toISOString().split('T')[0]
    const isCheckedInToday = plan?.daily_completions?.some((d: string) => d === today)
    const isCompleted = plan?.status === 'completed'

    return (
        <Card className="h-full border-border bg-bg-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart className="h-24 w-24 text-primary" />
            </div>
            
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Weekly Health Plan
                    </CardTitle>
                    {plan && (
                        <span className="text-xs font-mono text-text-secondary bg-bg-dark px-2 py-1 rounded-md border border-border">
                            Day {daysCompleted} / 7
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {!plan ? (
                    <div className="text-center py-4 space-y-4">
                        <p className="text-text-secondary text-sm">Start a 7-day health streak to earn credits!</p>
                        <Button onClick={handleCheckIn} disabled={checkingIn} className="w-full">
                            {checkingIn ? 'Starting...' : 'Start Health Plan'}
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-text-secondary">
                                <span>Progress</span>
                                <span>{Math.round((daysCompleted / 7) * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-bg-dark rounded-full overflow-hidden border border-border">
                                <div 
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${(daysCompleted / 7) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 7 }).map((_, i) => {
                                const isDayDone = i < daysCompleted
                                return (
                                    <div 
                                        key={i}
                                        className={cn(
                                            "aspect-square rounded-md flex items-center justify-center text-xs font-bold border",
                                            isDayDone 
                                                ? "bg-primary text-bg-dark border-primary" 
                                                : "bg-bg-dark text-text-secondary border-border"
                                        )}
                                    >
                                        {isDayDone && <CheckCircle className="h-3 w-3" />}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Action */}
                        <div className="pt-2">
                            {isCompleted ? (
                                <div className="p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg flex items-center gap-3 text-accent-green">
                                    <Flame className="h-5 w-5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">Completed!</p>
                                        <p className="text-xs opacity-80">+10 Credits Earned</p>
                                    </div>
                                </div>
                            ) : isCheckedInToday ? (
                                <div className="p-3 bg-bg-dark border border-border rounded-lg flex items-center gap-3 text-text-secondary">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text-primary">Checked in for today</p>
                                        <p className="text-xs">Come back tomorrow!</p>
                                    </div>
                                </div>
                            ) : (
                                <Button onClick={handleCheckIn} disabled={checkingIn} className="w-full">
                                    {checkingIn ? 'Checking in...' : 'Daily Check-in'}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
