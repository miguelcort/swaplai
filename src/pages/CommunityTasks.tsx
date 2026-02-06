import { useState, useEffect } from 'react'
import { tasksApi } from '../lib/projectsApi'
import type { Task, TaskApplication } from '../types/projects'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Loader2, DollarSign, Clock, Calendar, CheckCircle2, Globe, Send, User, Star, Eye } from 'lucide-react'
import { toast } from '../hooks/useToast'
import { useAuthStore } from '../stores/authStore'
import { Modal } from '../components/ui/Modal'

export default function CommunityTasks() {
    const { user } = useAuthStore()
    const [activeTab, setActiveTab] = useState<'explore' | 'my_tasks' | 'my_work'>('explore')
    const [tasks, setTasks] = useState<Task[]>([])
    const [myTasks, setMyTasks] = useState<Task[]>([])
    const [myWork, setMyWork] = useState<TaskApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [applyingTask, setApplyingTask] = useState<Task | null>(null)
    const [applicationMessage, setApplicationMessage] = useState('')
    const [bidAmount, setBidAmount] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [viewingApplicationsTask, setViewingApplicationsTask] = useState<Task | null>(null)
    const [taskApplications, setTaskApplications] = useState<TaskApplication[]>([])
    const [loadingApplications, setLoadingApplications] = useState(false)
    const [deliveringApp, setDeliveringApp] = useState<TaskApplication | null>(null)
    const [deliveryContent, setDeliveryContent] = useState('')
    const [reviewingApp, setReviewingApp] = useState<TaskApplication | null>(null)
    const [reviewFeedback, setReviewFeedback] = useState('')
    const [reviewRating, setReviewRating] = useState(5)

    const loadTasks = async () => {
        setLoading(true)
        try {
            const [communityTasks, myPostedTasks, myAppliedWork] = await Promise.all([
                tasksApi.getCommunityTasks(),
                tasksApi.getMyCommunityTasks(),
                tasksApi.getMyAppliedTasks()
            ])
            setTasks(communityTasks)
            setMyTasks(myPostedTasks)
            setMyWork(myAppliedWork)
        } catch (error) {
            console.error('Failed to load tasks:', error)
            toast({
                title: "Error",
                description: "Failed to load tasks",
                type: "error"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTasks()
    }, [])

    const handleApplyClick = (task: Task) => {
        setApplyingTask(task)
        setApplicationMessage('')
        setBidAmount(task.cost.toString())
    }

    const handleSubmitApplication = async () => {
        if (!applyingTask) return
        setSubmitting(true)
        try {
            await tasksApi.applyToTask(
                applyingTask.id, 
                applicationMessage,
                bidAmount ? parseFloat(bidAmount) : undefined
            )
            toast({
                title: "Application Sent",
                description: "Your application has been sent to the project owner.",
                type: "success"
            })
            setApplyingTask(null)
            loadTasks() // Refresh to update My Work potentially
        } catch (error: any) {
            if (error.code === '23505') { // Unique violation
                toast({
                    title: "Already Applied",
                    description: "You have already applied to this task.",
                    type: "info"
                })
                setApplyingTask(null)
            } else {
                console.error('Failed to apply:', error)
                toast({
                    title: "Error",
                    description: "Failed to send application",
                    type: "error"
                })
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleViewApplications = async (task: Task) => {
        setViewingApplicationsTask(task)
        setLoadingApplications(true)
        try {
            const apps = await tasksApi.getTaskApplications(task.id)
            setTaskApplications(apps)
        } catch (error) {
            console.error('Failed to load applications:', error)
            toast({
                title: "Error",
                description: "Failed to load applications",
                type: "error"
            })
        } finally {
            setLoadingApplications(false)
        }
    }

    const handleSubmitDelivery = async () => {
        if (!deliveringApp) return
        setSubmitting(true)
        try {
            await tasksApi.submitTaskDelivery(deliveringApp.id, deliveryContent)
            toast({ title: "Task Delivered", type: "success" })
            setDeliveringApp(null)
            loadTasks()
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to submit delivery", type: "error" })
        } finally {
            setSubmitting(false)
        }
    }

    const handleReviewDelivery = async (status: 'approved' | 'changes_requested') => {
        if (!reviewingApp) return
        setSubmitting(true)
        try {
            await tasksApi.reviewTaskDelivery(reviewingApp.id, status, reviewFeedback)
            if (status === 'approved') {
                await tasksApi.rateUser(reviewingApp.id, reviewRating)
                toast({ title: "Delivery Approved & Rated", type: "success" })
            } else {
                toast({ title: "Changes Requested", type: "info" })
            }
            setReviewingApp(null)
            setViewingApplicationsTask(null) // Close app list to refresh? Or just refresh list
            if (viewingApplicationsTask) {
                handleViewApplications(viewingApplicationsTask)
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to review delivery", type: "error" })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-bg-dark text-text-primary font-sans p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary tracking-tight font-serif flex items-center gap-3">
                            <Globe className="h-8 w-8 text-primary" />
                            Community Tasks
                        </h1>
                        <p className="text-text-secondary mt-2 font-mono">
                            Find tasks to help with or post your own. Earn rewards and build your reputation.
                        </p>
                    </div>
                    <div className="flex p-1 bg-bg-card border border-border rounded-lg">
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'explore' 
                                    ? 'bg-primary/10 text-primary shadow-sm' 
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            Explore Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('my_tasks')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'my_tasks' 
                                    ? 'bg-primary/10 text-primary shadow-sm' 
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            My Posted Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('my_work')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'my_work' 
                                    ? 'bg-primary/10 text-primary shadow-sm' 
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            My Work
                        </button>
                    </div>
                </div>

                {activeTab === 'explore' ? (
                    tasks.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-border rounded-lg">
                            <p className="text-text-secondary font-mono">No community tasks available right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tasks.map((task) => (
                                <Card key={task.id} className="hover:border-primary/50 transition-colors flex flex-col h-full bg-bg-card border-border shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                                                {task.project?.title || 'Project Task'}
                                            </Badge>
                                            <Badge 
                                                variant={task.priority === 'urgent' ? 'destructive' : 'outline'} 
                                                className={`shrink-0 ${task.priority !== 'urgent' ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                                            >
                                                {task.priority}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl font-bold font-sans line-clamp-2 leading-tight min-h-[3rem] flex items-center">
                                            {task.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col gap-4 pt-0">
                                        <CardDescription className="line-clamp-3 text-sm text-text-secondary leading-relaxed min-h-[4.5em]">
                                            {task.description || 'No description provided.'}
                                        </CardDescription>
                                        
                                        <div className="mt-auto space-y-4 pt-4 border-t border-border/50">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Reward</span>
                                                    <div className="flex items-center gap-1.5 text-green-500">
                                                        <DollarSign className="h-4 w-4" />
                                                        <span className="font-mono font-bold text-lg">${task.cost}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Duration</span>
                                                    <div className="flex items-center gap-1.5 text-text-primary">
                                                        <Clock className="h-4 w-4 text-text-secondary" />
                                                        <span className="font-mono text-sm">{task.duration || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-text-secondary bg-primary/5 p-2 rounded border border-border/50">
                                                <Calendar className="h-3 w-3" />
                                                <span className="font-mono">
                                                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No deadline'}
                                                </span>
                                            </div>

                                            {user?.id === task.created_by ? (
                                                <Button className="w-full bg-primary/5 border-border hover:bg-primary/10 text-text-secondary" variant="outline" disabled>
                                                    Your Task
                                                </Button>
                                            ) : (
                                                <Button 
                                                    className="w-full gap-2 font-bold tracking-wide" 
                                                    onClick={() => handleApplyClick(task)}
                                                >
                                                    <Send className="h-4 w-4" />
                                                    APPLY NOW
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                ) : activeTab === 'my_tasks' ? (
                    // My Tasks View
                    <div className="space-y-6">
                        {myTasks.length === 0 ? (
                             <div className="text-center py-12 border border-dashed border-border rounded-lg">
                                <p className="text-text-secondary font-mono">You haven't posted any community tasks yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {myTasks.map(task => (
                                    <Card key={task.id} className="bg-bg-card border-border">
                                        <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-text-primary">{task.title}</h3>
                                                    <Badge variant={task.status === 'completed' ? 'secondary' : 'default'}>
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-text-secondary line-clamp-2">{task.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-text-secondary mt-2">
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" /> ${task.cost}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" /> 
                                                        {task.applications?.length || 0} Applications
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => handleViewApplications(task)}
                                                    className="gap-2"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Applications
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // My Work View
                    <div className="space-y-6">
                        {myWork.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border rounded-lg">
                                <p className="text-text-secondary font-mono">You haven't applied to any tasks yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {myWork.map(app => (
                                    <Card key={app.id} className="bg-bg-card border-border">
                                        <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-text-primary">{app.task?.title}</h3>
                                                    <Badge variant={app.status === 'accepted' ? 'secondary' : app.status === 'rejected' ? 'destructive' : 'outline'}>
                                                        {app.status}
                                                    </Badge>
                                                    {app.delivery_status && (
                                                        <Badge variant={
                                                            app.delivery_status === 'approved' ? 'default' :
                                                            app.delivery_status === 'submitted' ? 'secondary' : 'outline'
                                                        }>
                                                            Delivery: {app.delivery_status}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-text-secondary mt-2">
                                                    <span className="flex items-center gap-1 text-green-500 font-bold">
                                                        Bid: ${app.bid_amount || 'N/A'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        Applied: {new Date(app.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {app.delivery_feedback && (
                                                    <div className="mt-2 p-2 bg-primary/5 rounded border border-border/50 text-sm">
                                                        <span className="font-bold text-text-secondary">Feedback: </span>
                                                        <span className="text-text-primary">{app.delivery_feedback}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {app.status === 'accepted' && app.delivery_status !== 'approved' && (
                                                    <Button 
                                                        onClick={() => {
                                                            setDeliveringApp(app)
                                                            setDeliveryContent(app.delivery_content || '')
                                                        }}
                                                        className="gap-2"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                        {app.delivery_status === 'submitted' ? 'Update Delivery' : 'Deliver Task'}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Application Modal */}
            <Modal
                isOpen={!!applyingTask}
                onClose={() => setApplyingTask(null)}
                title={`Apply for: ${applyingTask?.title}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Your Bid (Credits)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                            <input
                                type="number"
                                className="w-full pl-9 pr-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                                placeholder="0.00"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                            Original reward: ${applyingTask?.cost}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Cover Letter
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono min-h-[100px]"
                            placeholder="I have experience with..."
                            value={applicationMessage}
                            onChange={(e) => setApplicationMessage(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setApplyingTask(null)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmitApplication} 
                            disabled={submitting || !applicationMessage.trim()}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Sending...
                                </>
                            ) : (
                                'Send Application'
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* View Applications Modal */}
            <Modal
                isOpen={!!viewingApplicationsTask}
                onClose={() => setViewingApplicationsTask(null)}
                title={`Applications for: ${viewingApplicationsTask?.title}`}
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {loadingApplications ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : taskApplications.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">No applications yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {taskApplications.map((app) => (
                                <div key={app.id} className="bg-bg-dark border border-border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {app.applicant?.email?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary">{app.applicant?.full_name || app.applicant?.email}</p>
                                                <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <span>{app.applicant?.rating_sum && app.applicant?.rating_count ? (app.applicant.rating_sum / app.applicant.rating_count).toFixed(1) : 'New'}</span>
                                                    <span className="text-text-secondary ml-1">({app.applicant?.rating_count || 0} reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={app.status === 'accepted' ? 'secondary' : app.status === 'rejected' ? 'destructive' : 'outline'}>
                                            {app.status}
                                        </Badge>
                                    </div>
                                    
                                    <div className="bg-bg-card/50 p-3 rounded mb-3">
                                        <div className="flex justify-between items-center mb-2 text-sm">
                                            <span className="text-text-secondary">Bid Amount:</span>
                                            <span className="font-mono font-bold text-green-500">${app.bid_amount || 'N/A'}</span>
                                        </div>
                                        <p className="text-sm text-text-primary italic mb-2">"{app.message}"</p>
                                        
                                        {app.status === 'accepted' && (
                                            <div className="mt-3 pt-3 border-t border-border/50">
                                                <div className="flex justify-between items-center">
                                                    <Badge variant={
                                                        app.delivery_status === 'approved' ? 'default' :
                                                        app.delivery_status === 'submitted' ? 'secondary' : 'outline'
                                                    }>
                                                        Delivery: {app.delivery_status || 'Pending'}
                                                    </Badge>
                                                    
                                                    {app.delivery_status === 'submitted' && (
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => {
                                                                setReviewingApp(app)
                                                                setReviewFeedback('')
                                                                setReviewRating(5)
                                                            }}
                                                        >
                                                            Review Delivery
                                                        </Button>
                                                    )}
                                                </div>
                                                {app.delivery_status === 'approved' && (
                                                     <div className="mt-2 text-sm text-green-500 flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Delivery Approved</span>
                                                     </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {app.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button 
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => {
                                                    tasksApi.updateApplicationStatus(app.id, 'accepted')
                                                    // Optimistic update
                                                    setTaskApplications(prev => prev.map(p => p.id === app.id ? { ...p, status: 'accepted' } : p))
                                                    toast({ title: "Application Accepted", type: "success" })
                                                }}
                                            >
                                                Accept
                                            </Button>
                                            <Button 
                                                className="flex-1" 
                                                variant="destructive"
                                                onClick={() => {
                                                    tasksApi.updateApplicationStatus(app.id, 'rejected')
                                                    // Optimistic update
                                                    setTaskApplications(prev => prev.map(p => p.id === app.id ? { ...p, status: 'rejected' } : p))
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delivery Submission Modal */}
            <Modal
                isOpen={!!deliveringApp}
                onClose={() => setDeliveringApp(null)}
                title={`Submit Delivery for: ${deliveringApp?.task?.title}`}
            >
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                        Submit your completed work for review.
                    </p>
                    <textarea
                        className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono min-h-[150px]"
                        placeholder="Paste your work or provide a link to your deliverables..."
                        value={deliveryContent}
                        onChange={(e) => setDeliveryContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setDeliveringApp(null)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmitDelivery} 
                            disabled={submitting || !deliveryContent.trim()}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Delivery'
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Review Delivery Modal */}
            <Modal
                isOpen={!!reviewingApp}
                onClose={() => setReviewingApp(null)}
                title="Review Delivery"
            >
                <div className="space-y-4">
                    <div className="bg-bg-dark p-4 rounded border border-border">
                        <h4 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Delivery Content</h4>
                        <p className="text-text-primary whitespace-pre-wrap font-mono text-sm">{reviewingApp?.delivery_content}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Feedback (Optional for approval, required for changes)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono min-h-[100px]"
                            placeholder="Great work! or Please fix..."
                            value={reviewFeedback}
                            onChange={(e) => setReviewFeedback(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Rating (1-5)
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className={`p-2 rounded hover:bg-bg-dark transition-colors ${reviewRating >= star ? 'text-yellow-500' : 'text-text-secondary'}`}
                                >
                                    <Star className={`h-6 w-6 ${reviewRating >= star ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setReviewingApp(null)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={() => handleReviewDelivery('changes_requested')}
                            disabled={submitting || !reviewFeedback.trim()}
                        >
                            Request Changes
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleReviewDelivery('approved')}
                            disabled={submitting}
                        >
                            Approve & Pay
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

