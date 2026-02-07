import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
//import { useNavigate } from 'react-router-dom'

export function useTour() {
    //const navigate = useNavigate()

    const startTour = () => {
        const hasFloatingChat = !!document.getElementById('floating-chat-toggle')

        const driverObj = driver({
            showProgress: true,
            animate: true,
            steps: [
                {
                    element: hasFloatingChat ? '#floating-chat-toggle' : '#nav-item-conversations',
                    popover: {
                        title: 'Everything starts here',
                        description: 'The chat is the heart of Swaplai. You can use it to create projects, tasks, or ask any question. It is your personal assistant!',
                        side: hasFloatingChat ? 'left' : 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#nav-item-projects',
                    popover: {
                        title: 'Project Management',
                        description: 'Here you can view, create, and organize all your projects and their associated tasks.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#nav-item-community',
                    popover: {
                        title: 'Community',
                        description: 'Explore tasks published by other users, apply to them, and collaborate. Earn reputation and credits!',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#nav-item-journey',
                    popover: {
                        title: 'Your Journey',
                        description: 'Track your progress, maintain your daily streak, and unlock rewards for your activity.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#nav-item-settings',
                    popover: {
                        title: 'Settings',
                        description: 'Customize your profile, preferences, and adjust the application to your liking.',
                        side: 'right',
                        align: 'start'
                    }
                }
            ],
            onDestroyed: () => {
                // Optional: navigate back to home or do cleanup
            }
        })

        driverObj.drive()
    }

    return { startTour }
}
