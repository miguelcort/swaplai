import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Send, Paperclip } from 'lucide-react'

interface ChatInputProps {
    onSend: (content: string) => void
    disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = () => {
        if (!input.trim()) return
        onSend(input)
        setInput('')
        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [input])

    return (
        <div className="relative flex items-end gap-2 p-4 bg-[#0A0A0A] border-t border-[#333333]">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-none hover:bg-[#333333]">
                <Paperclip className="h-5 w-5" />
            </Button>

            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="Type your command..."
                    className="w-full resize-none rounded-none border border-[#333333] bg-[#0A0A0A] px-4 py-[9px] text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary max-h-[200px] shadow-none min-h-[40px] placeholder:text-gray-600 font-mono"
                />
            </div>

            <Button
                onClick={handleSend}
                disabled={disabled || !input.trim()}
                className="rounded-none h-10 w-10 p-0 flex items-center justify-center bg-primary hover:bg-primary/90 text-black disabled:bg-[#333333] disabled:text-gray-600 shadow-none transition-all"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    )
}
