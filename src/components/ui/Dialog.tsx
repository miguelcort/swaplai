import { Dialog as HeadlessDialog, Transition } from '@headlessui/react'
import { Fragment, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DialogProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
    className?: string
}

export function Dialog({ isOpen, onClose, title, description, children, className }: DialogProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <HeadlessDialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-bg-dark/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <HeadlessDialog.Panel className={cn(
                                "w-full max-w-md transform overflow-hidden rounded-none border border-border bg-bg-card p-6 text-left align-middle shadow-xl transition-all font-sans",
                                className
                            )}>
                                <div className="flex items-center justify-between mb-4">
                                    <HeadlessDialog.Title as="h3" className="text-lg font-bold leading-6 text-text-primary uppercase tracking-wide">
                                        {title}
                                    </HeadlessDialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-none p-1 text-text-secondary hover:bg-border hover:text-text-primary transition-colors focus:outline-none"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {description && (
                                    <div className="mb-4">
                                        <p className="text-sm text-text-secondary font-mono">
                                            {description}
                                        </p>
                                    </div>
                                )}

                                {children}
                            </HeadlessDialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </HeadlessDialog>
        </Transition>
    )
}
