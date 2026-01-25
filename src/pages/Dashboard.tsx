import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Star, Trash2 } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { Header } from '../components/layout/Header'
import { cn } from '../lib/utils'

export default function Dashboard() {
    const navigate = useNavigate()
    const { conversations, setConversations } = useChatStore()
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    // Seed data if empty (mocking backend for now)
    useEffect(() => {
        if (conversations.length === 0) {
            setConversations([
                {
                    id: '1',
                    user_id: '1',
                    title: 'Customer Support Integration',
                    is_starred: false,
                    created_at: new Date(2024, 9, 15).toISOString(),
                    updated_at: new Date().toISOString(),
                    members: [
                        { id: '1', name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=1', email: 'alice@example.com' },
                        { id: '2', name: 'Bob Smith', avatar: 'https://i.pravatar.cc/150?img=2', email: 'bob@example.com' },
                        { id: '3', name: 'Carol White', avatar: 'https://i.pravatar.cc/150?img=3', email: 'carol@example.com' },
                        { id: '4', name: 'David Brown', avatar: 'https://i.pravatar.cc/150?img=4', email: 'david@example.com' }
                    ]
                },
                {
                    id: '2',
                    user_id: '1',
                    title: 'Marketing Campaign Analysis',
                    is_starred: true,
                    created_at: new Date(2024, 7, 20).toISOString(),
                    updated_at: new Date(Date.now() - 86400000).toISOString(),
                    members: [
                        { id: '5', name: 'Eve Davis', avatar: 'https://i.pravatar.cc/150?img=5', email: 'eve@example.com' },
                        { id: '6', name: 'Frank Miller', avatar: 'https://i.pravatar.cc/150?img=6', email: 'frank@example.com' }
                    ]
                },
                {
                    id: '3',
                    user_id: '1',
                    title: 'Product Development Chat',
                    is_starred: false,
                    created_at: new Date(2024, 8, 10).toISOString(),
                    updated_at: new Date(Date.now() - 172800000).toISOString(),
                    members: [
                        { id: '7', name: 'Grace Lee', avatar: 'https://i.pravatar.cc/150?img=7', email: 'grace@example.com' },
                        { id: '8', name: 'Henry Wilson', avatar: 'https://i.pravatar.cc/150?img=8', email: 'henry@example.com' },
                        { id: '9', name: 'Ivy Chen', avatar: 'https://i.pravatar.cc/150?img=9', email: 'ivy@example.com' },
                        { id: '10', name: 'Jack Taylor', avatar: 'https://i.pravatar.cc/150?img=10', email: 'jack@example.com' },
                        { id: '11', name: 'Kate Anderson', avatar: 'https://i.pravatar.cc/150?img=11', email: 'kate@example.com' }
                    ]
                },
                {
                    id: '4',
                    user_id: '1',
                    title: 'Sales Team Discussion',
                    is_starred: true,
                    created_at: new Date(2024, 6, 5).toISOString(),
                    updated_at: new Date(Date.now() - 259200000).toISOString(),
                    members: [
                        { id: '12', name: 'Leo Martinez', avatar: 'https://i.pravatar.cc/150?img=12', email: 'leo@example.com' },
                        { id: '13', name: 'Mia Garcia', avatar: 'https://i.pravatar.cc/150?img=13', email: 'mia@example.com' },
                        { id: '14', name: 'Noah Rodriguez', avatar: 'https://i.pravatar.cc/150?img=14', email: 'noah@example.com' }
                    ]
                },
                {
                    id: '5',
                    user_id: '1',
                    title: 'Tech Support Queries',
                    is_starred: false,
                    created_at: new Date(2024, 5, 12).toISOString(),
                    updated_at: new Date(Date.now() - 345600000).toISOString(),
                    members: [
                        { id: '15', name: 'Olivia Kim', avatar: 'https://i.pravatar.cc/150?img=15', email: 'olivia@example.com' }
                    ]
                },
            ])
        }
    }, [conversations.length, setConversations])

    const getStatusBadge = (updatedAt: string) => {
        const daysSinceUpdate = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))

        if (daysSinceUpdate === 0) {
            return { label: 'Active', color: 'bg-green-100 text-green-700' }
        } else if (daysSinceUpdate <= 2) {
            return { label: 'Recent', color: 'bg-blue-100 text-blue-700' }
        } else if (daysSinceUpdate <= 7) {
            return { label: 'Idle', color: 'bg-yellow-100 text-yellow-700' }
        } else {
            return { label: 'Inactive', color: 'bg-gray-100 text-gray-700' }
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    }

    const handleRowClick = (id: string) => {
        navigate(`/chat/${id}`)
    }

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setOpenMenuId(openMenuId === id ? null : id)
    }

    return (
        <div className="flex flex-col h-full">
            <Header
                title="Conversation Directory"
                onNewClick={() => navigate('/chat')}
                newButtonText="New conversation"
                searchPlaceholder="Search conversations..."
            />

            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Wrapper con scroll horizontal */}
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Conversation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Activity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Progress
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Starred
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {conversations.length > 0 ? (
                                conversations.map((conv) => {
                                    const status = getStatusBadge(conv.updated_at)
                                    const progress = Math.floor(Math.random() * 100)

                                    return (
                                        <tr
                                            key={conv.id}
                                            onClick={() => handleRowClick(conv.id)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{conv.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={cn(
                                                    "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                    status.color
                                                )}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(conv.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(conv.updated_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                                        <div
                                                            className={cn(
                                                                "h-2 rounded-full transition-all",
                                                                progress < 30 ? "bg-red-500" :
                                                                progress < 70 ? "bg-yellow-500" :
                                                                "bg-green-500"
                                                            )}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center -space-x-2">
                                                    {conv.members?.slice(0, 4).map((member, idx) => (
                                                        <img
                                                            key={member.id}
                                                            src={member.avatar}
                                                            alt={member.name}
                                                            title={member.name}
                                                            className="h-8 w-8 rounded-full border-2 border-white hover:z-10 hover:scale-110 transition-transform cursor-pointer"
                                                            style={{ zIndex: 4 - idx }}
                                                        />
                                                    ))}
                                                    {conv.members && conv.members.length > 4 && (
                                                        <div
                                                            className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 hover:z-10 hover:scale-110 transition-transform cursor-pointer"
                                                            title={`+${conv.members.length - 4} more`}
                                                        >
                                                            +{conv.members.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {conv.is_starred ? (
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                ) : (
                                                    <Star className="h-4 w-4 text-gray-300" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => toggleMenu(e, conv.id)}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>

                                                    {openMenuId === conv.id && (
                                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        navigate(`/chat/${conv.id}`)
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Open
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setOpenMenuId(null)
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Manage
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setOpenMenuId(null)
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No conversations yet. Create your first one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
