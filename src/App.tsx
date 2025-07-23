import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import ParticipationsPage from './pages/ParticipationsPage'
import ReportsPage from './pages/ReportsPage'
import Layout from './components/Layout'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const empresas = await blink.db.empresas.list({
        where: { userId, onboardingCompleted: "1" },
        limit: 1
      })
      setHasCompletedOnboarding(empresas.length > 0)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setHasCompletedOnboarding(false)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (state.user) {
        checkOnboardingStatus(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">IA Licitações</h1>
          <p className="text-slate-600 mb-8">Gestão Inteligente de Licitações Públicas</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Entrar na Plataforma
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route 
            path="/onboarding" 
            element={<OnboardingPage />} 
          />
          <Route
            path="/*"
            element={
              hasCompletedOnboarding ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/documentos" element={<DocumentsPage />} />
                    <Route path="/oportunidades" element={<OpportunitiesPage />} />
                    <Route path="/participacoes" element={<ParticipationsPage />} />
                    <Route path="/relatorios" element={<ReportsPage />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App