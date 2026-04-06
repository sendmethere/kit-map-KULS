import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import TeacherMode from './components/TeacherMode'
import StudentMode from './components/StudentMode'

export default function App() {
  const [mode, setMode] = useState('home')

  const handleKitActivated = () => {
    // Navigate to student mode after kit activation
    setMode('student')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {mode === 'home' && (
        <HomeScreen onSelectMode={setMode} />
      )}
      {mode === 'teacher' && (
        <TeacherMode
          onHome={() => setMode('home')}
          onKitActivated={handleKitActivated}
        />
      )}
      {mode === 'student' && (
        <StudentMode onHome={() => setMode('home')} />
      )}
    </div>
  )
}
