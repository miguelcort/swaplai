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
                        title: 'Aquí inicia todo',
                        description: 'El chat es el corazón de Swaplai. Puedes usarlo para crear proyectos, tareas, o hacer cualquier pregunta. ¡Es tu asistente personal!',
                        side: hasFloatingChat ? 'left' : 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#nav-item-projects',
                    popover: {
                        title: 'Gestión de Proyectos',
                        description: 'Aquí puedes ver, crear y organizar todos tus proyectos y sus tareas asociadas.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#nav-item-community',
                    popover: {
                        title: 'Comunidad',
                        description: 'Explora tareas publicadas por otros usuarios, aplica a ellas y colabora. ¡Gana reputación y créditos!',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#nav-item-journey',
                    popover: {
                        title: 'Tu Progreso',
                        description: 'Sigue tu avance, mantén tu racha diaria y desbloquea recompensas por tu actividad.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#nav-item-settings',
                    popover: {
                        title: 'Configuración',
                        description: 'Personaliza tu perfil, preferencias y ajusta la aplicación a tu gusto.',
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
