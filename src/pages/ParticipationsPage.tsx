import { useState } from 'react'
import { Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

const MOCK_PARTICIPATIONS = [
  {
    id: '1',
    numeroPregao: '001/2024',
    orgaoName: 'Prefeitura Municipal de São Paulo',
    objeto: 'Aquisição de equipamentos de informática',
    valorEstimado: 850000,
    lanceInicial: 800000,
    lanceMinimo: 750000,
    status: 'in_progress',
    dataAbertura: '2024-01-25T10:00:00',
    timelineEvents: [
      { id: '1', type: 'proposta_enviada', title: 'Proposta Enviada', timestamp: '2024-01-24T16:00:00', executedBy: 'ai', status: 'completed' },
      { id: '2', type: 'documentos_enviados', title: 'Documentos Enviados', timestamp: '2024-01-24T16:30:00', executedBy: 'ai', status: 'completed' },
      { id: '3', type: 'sessao_iniciada', title: 'Sessão Pública Iniciada', timestamp: '2024-01-25T10:00:00', executedBy: 'ai', status: 'completed' },
      { id: '4', type: 'lance_automatico', title: 'Lance Automático', timestamp: '2024-01-25T10:15:00', executedBy: 'ai', status: 'pending' }
    ]
  },
  {
    id: '2',
    numeroPregao: '002/2024',
    orgaoName: 'Governo do Estado de SP',
    objeto: 'Serviços de consultoria em TI',
    valorEstimado: 1200000,
    lanceInicial: 1150000,
    lanceMinimo: 1100000,
    status: 'won',
    dataAbertura: '2024-01-20T14:00:00',
    timelineEvents: [
      { id: '1', type: 'proposta_enviada', title: 'Proposta Enviada', timestamp: '2024-01-19T15:00:00', executedBy: 'ai', status: 'completed' },
      { id: '2', type: 'sessao_finalizada', title: 'Sessão Finalizada', timestamp: '2024-01-20T16:00:00', executedBy: 'ai', status: 'completed' },
      { id: '3', type: 'vencedor_declarado', title: 'Vencedor Declarado', timestamp: '2024-01-20T16:30:00', executedBy: 'ai', status: 'completed' }
    ]
  },
  {
    id: '3',
    numeroPregao: '003/2024',
    orgaoName: 'Ministério da Educação',
    objeto: 'Fornecimento de material de escritório',
    valorEstimado: 350000,
    lanceInicial: 340000,
    lanceMinimo: 320000,
    status: 'lost',
    dataAbertura: '2024-01-18T09:00:00',
    timelineEvents: [
      { id: '1', type: 'proposta_enviada', title: 'Proposta Enviada', timestamp: '2024-01-17T14:00:00', executedBy: 'ai', status: 'completed' },
      { id: '2', type: 'sessao_finalizada', title: 'Sessão Finalizada', timestamp: '2024-01-18T11:00:00', executedBy: 'ai', status: 'completed' },
      { id: '3', type: 'resultado_perdido', title: 'Não Venceu', timestamp: '2024-01-18T11:30:00', executedBy: 'ai', status: 'completed' }
    ]
  }
]

export default function ParticipationsPage() {
  const [participations] = useState(MOCK_PARTICIPATIONS)
  const [selectedParticipation, setSelectedParticipation] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge className="bg-blue-100 text-blue-800">Preparando</Badge>
      case 'submitted':
        return <Badge className="bg-purple-100 text-purple-800">Enviado</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>
      case 'won':
        return <Badge className="bg-green-100 text-green-800">Venceu</Badge>
      case 'lost':
        return <Badge className="bg-red-100 text-red-800">Perdeu</Badge>
      case 'appealing':
        return <Badge className="bg-orange-100 text-orange-800">Recurso</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'won':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'lost':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'appealing':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'proposta_enviada':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'documentos_enviados':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'sessao_iniciada':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'lance_automatico':
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      case 'vencedor_declarado':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const selectedParticipationData = participations.find(p => p.id === selectedParticipation)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Acompanhamento de Processos</h1>
        <p className="text-slate-600 mt-1">Monitore suas participações em licitações</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Em Andamento</p>
                <p className="text-2xl font-bold text-slate-900">
                  {participations.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Vencidas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {participations.filter(p => p.status === 'won').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Perdidas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {participations.filter(p => p.status === 'lost').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round((participations.filter(p => p.status === 'won').length / participations.length) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participations List */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Participações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participations.map((participation) => (
                <div
                  key={participation.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedParticipation === participation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedParticipation(participation.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(participation.status)}
                      <h3 className="font-medium text-slate-900">
                        Pregão {participation.numeroPregao}
                      </h3>
                    </div>
                    {getStatusBadge(participation.status)}
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-1">{participation.orgaoName}</p>
                  <p className="text-sm text-slate-800 mb-2">{participation.objeto}</p>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Lance: {formatCurrency(participation.lanceInicial)}</span>
                    <span>{formatDateTime(participation.dataAbertura)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedParticipationData 
                ? `Timeline - Pregão ${selectedParticipationData.numeroPregao}`
                : 'Selecione uma participação'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedParticipationData ? (
              <div className="space-y-4">
                {/* Participation Details */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Detalhes da Participação</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Lance Inicial:</span>
                      <p className="font-medium">{formatCurrency(selectedParticipationData.lanceInicial)}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Lance Mínimo:</span>
                      <p className="font-medium">{formatCurrency(selectedParticipationData.lanceMinimo)}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Events */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Histórico de Eventos</h4>
                  <div className="space-y-3">
                    {selectedParticipationData.timelineEvents.map((event, index) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-slate-900">{event.title}</h5>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                event.executedBy === 'ai' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {event.executedBy === 'ai' ? 'IA' : 'Usuário'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDateTime(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {selectedParticipationData.status === 'in_progress' && (
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Ajustar Lances
                      </Button>
                      <Button size="sm" variant="outline">
                        Ver Sessão
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  Selecione uma participação para ver a timeline detalhada
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}