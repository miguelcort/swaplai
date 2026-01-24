import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ArrowRight, Sparkles, Clock, CheckCircle, Star } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'

export default function Dashboard() {
    const navigate = useNavigate()
    const { conversations, setConversations } = useChatStore()

    // Seed data if empty (mocking backend for now)
    useEffect(() => {
        if (conversations.length === 0) {
            setConversations([
                { id: '1', user_id: '1', title: 'Project Ideation', is_starred: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                { id: '2', user_id: '1', title: 'Bug Fixing Strategy', is_starred: false, created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString() },
                { id: '3', user_id: '1', title: 'React Performance Tuning', is_starred: true, created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date().toISOString() },
            ])
        }
    }, [conversations.length, setConversations])

    const starredCount = conversations.filter(c => c.is_starred).length

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
                    <p className="text-text-secondary">Welcome back, get detailed updates on your projects.</p>
                </div>
                <Button onClick={() => navigate('/chat')}>
                    New Project <Sparkles className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg transform transition-transform hover:scale-[1.02]">
                    <CardHeader>
                        <CardTitle className="text-white">Active Projects</CardTitle>
                        <CardDescription className="text-white/80">Total conversation threads</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{conversations.length}</div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Favorite Projects</CardTitle>
                        <Star className="h-4 w-4 text-accent-orange" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">{starredCount}</div>
                        <p className="text-xs text-text-secondary mt-1">Starred conversations</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                        <CheckCircle className="h-4 w-4 text-accent-green" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">--</div>
                        <p className="text-xs text-text-secondary mt-1">Total interactions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">Recent Activity</h3>
                <div className="grid gap-4">
                    {conversations.length > 0 ? (
                        conversations.map((conv) => (
                            <Card
                                key={conv.id}
                                className="flex items-center p-4 gap-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                                onClick={() => navigate(`/chat/${conv.id}`)}
                            >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                    {conv.title.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-text-primary group-hover:text-primary transition-colors">{conv.title}</h4>
                                        {conv.is_starred && <Star className="h-3 w-3 text-accent-orange fill-accent-orange" />}
                                    </div>
                                    <p className="text-sm text-text-secondary">
                                        Last updated: {new Date(conv.updated_at || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    Active
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No recent activity. Start a new project!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
