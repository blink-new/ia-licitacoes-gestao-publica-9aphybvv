import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Target, 
  FileText, 
  Clock, 
  Award, 
  AlertTriangle,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { blink } from '../blink/client'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

interface DashboardStats {
  totalOpportunities: number
  activeParticipations: number
  wonBids: number
  totalValue: number
  pendingDocuments: number
  expiringDocuments: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOpportunities: 0,
    activeParticipations: 0,
    wonBids: 0,
    totalValue: 0,
    pendingDocuments: 0,
    expiringDocuments: 0
  })
  const [recentOpportunities, setRecentOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const loadDashboardData = async (userId: string) => {
    try {
      setLoading(true)
      
      // Carregar estatísticas (simuladas por enquanto)
      setStats({
        totalOpportunities: 24,
        activeParticipations: 3,
        wonBids: 8,
        totalValue: 450000,
        pendingDocuments: 2,
        expiringDocuments: 1
      })

      // Carregar oportunidades recentes (simuladas)
      setRecentOpportunities([
        {
          id: '1',
          numeroPregao: '001/2024',
          orgaoName: 'Prefeitura Municipal de São Paulo',
          objeto: 'Aquisição de equipamentos de informática',
          valorEstimado: 85000,
          dataAbertura: '2024-01-25T10:00:00',
          matchScore: 85,
          status: 'new'
        },
        {
          id: '2',
          numeroPregao: '002/2024',
          orgaoName: 'Governo do Estado de SP',
          objeto: 'Serviços de consultoria em TI',
          valorEstimado: 120000,
          dataAbertura: '2024-01-28T14:00:00',
          matchScore: 92,
          status: 'viewed'
        },
        {
          id: '3',
          numeroPregao: '003/2024',
          orgaoName: 'Ministério da Educação',
          objeto: 'Fornecimento de material de escritório',
          valorEstimado: 35000,
          dataAbertura: '2024-01-30T09:00:00',
          matchScore: 78,
          status: 'new'
        }
      ])
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadDashboardData(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">Nova</Badge>
      case 'viewed':
        return <Badge className="bg-gray-100 text-gray-800">Visualizada</Badge>
      case 'interested':
        return <Badge className="bg-yellow-100 text-yellow-800">Interesse</Badge>
      case 'participating':
        return <Badge className="bg-green-100 text-green-800">Participando</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Visão geral das suas licitações e oportunidades</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participações Ativas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeParticipations}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licitações Vencidas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wonBids}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de sucesso: 32%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Contratos vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.pendingDocuments > 0 || stats.expiringDocuments > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
              Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.pendingDocuments > 0 && (
                <p className="text-sm text-amber-800">
                  • {stats.pendingDocuments} documento(s) pendente(s) de upload
                </p>
              )}
              {stats.expiringDocuments > 0 && (
                <p className="text-sm text-amber-800">
                  • {stats.expiringDocuments} documento(s) vencendo em breve
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Oportunidades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-slate-900">
                      Pregão {opportunity.numeroPregao}
                    </h3>
                    {getStatusBadge(opportunity.status)}
                    <Badge className={`text-xs ${getMatchScoreColor(opportunity.matchScore)}`}>
                      {opportunity.matchScore}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{opportunity.orgaoName}</p>
                  <p className="text-sm text-slate-800 mb-2">{opportunity.objeto}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>Valor: {formatCurrency(opportunity.valorEstimado)}</span>
                    <span>Abertura: {formatDate(opportunity.dataAbertura)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-slate-900 mb-2">Gerenciar Documentos</h3>
            <p className="text-sm text-slate-600">
              Faça upload e organize seus documentos
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-slate-900 mb-2">Explorar Oportunidades</h3>
            <p className="text-sm text-slate-600">
              Descubra novas licitações compatíveis
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-medium text-slate-900 mb-2">Ver Relatórios</h3>
            <p className="text-sm text-slate-600">
              Analise sua performance e resultados
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}