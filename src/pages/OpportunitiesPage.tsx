import { useState } from 'react'
import { Search, Filter, Target, MapPin, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

const MOCK_OPPORTUNITIES = [
  {
    id: '1',
    numeroPregao: '001/2024',
    orgaoName: 'Prefeitura Municipal de São Paulo',
    objeto: 'Aquisição de equipamentos de informática para modernização do parque tecnológico',
    valorEstimado: 850000,
    dataAbertura: '2024-01-25T10:00:00',
    dataPublicacao: '2024-01-15',
    endereco: 'São Paulo - SP',
    distanceKm: 15.5,
    matchScore: 92,
    status: 'new',
    catmatCodes: ['390101', '390102'],
    uasg: '160001'
  },
  {
    id: '2',
    numeroPregao: '002/2024',
    orgaoName: 'Governo do Estado de SP',
    objeto: 'Serviços de consultoria em tecnologia da informação',
    valorEstimado: 1200000,
    dataAbertura: '2024-01-28T14:00:00',
    dataPublicacao: '2024-01-18',
    endereco: 'São Paulo - SP',
    distanceKm: 8.2,
    matchScore: 88,
    status: 'viewed',
    catmatCodes: ['390201', '390202'],
    uasg: '260001'
  },
  {
    id: '3',
    numeroPregao: '003/2024',
    orgaoName: 'Ministério da Educação',
    objeto: 'Fornecimento de material de escritório e papelaria',
    valorEstimado: 350000,
    dataAbertura: '2024-01-30T09:00:00',
    dataPublicacao: '2024-01-20',
    endereco: 'Brasília - DF',
    distanceKm: 1050,
    matchScore: 65,
    status: 'new',
    catmatCodes: ['370101', '370102'],
    uasg: '150001'
  },
  {
    id: '4',
    numeroPregao: '004/2024',
    orgaoName: 'Prefeitura de Campinas',
    objeto: 'Manutenção de sistemas de informação',
    valorEstimado: 450000,
    dataAbertura: '2024-02-02T15:00:00',
    dataPublicacao: '2024-01-22',
    endereco: 'Campinas - SP',
    distanceKm: 95,
    matchScore: 78,
    status: 'interested',
    catmatCodes: ['390301'],
    uasg: '160002'
  }
]

export default function OpportunitiesPage() {
  const [opportunities] = useState(MOCK_OPPORTUNITIES)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

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

  const getDaysUntilOpening = (dateString: string) => {
    const openingDate = new Date(dateString)
    const today = new Date()
    const diffTime = openingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.orgaoName.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    return matchesSearch && opp.status === selectedFilter
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Oportunidades</h1>
        <p className="text-slate-600 mt-1">Descubra licitações compatíveis com seu perfil</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{opportunities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">80+</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Alto Match</p>
                <p className="text-2xl font-bold text-slate-900">
                  {opportunities.filter(o => o.matchScore >= 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Abertura Hoje</p>
                <p className="text-2xl font-bold text-slate-900">
                  {opportunities.filter(o => getDaysUntilOpening(o.dataAbertura) === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Valor Total</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(opportunities.reduce((sum, o) => sum + o.valorEstimado, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por objeto ou órgão..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('all')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={selectedFilter === 'new' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('new')}
                size="sm"
              >
                Novas
              </Button>
              <Button
                variant={selectedFilter === 'interested' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('interested')}
                size="sm"
              >
                Interesse
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => {
          const daysUntilOpening = getDaysUntilOpening(opportunity.dataAbertura)
          
          return (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Pregão {opportunity.numeroPregao}
                      </h3>
                      {getStatusBadge(opportunity.status)}
                      <Badge className={`text-xs ${getMatchScoreColor(opportunity.matchScore)}`}>
                        {opportunity.matchScore}% match
                      </Badge>
                      {daysUntilOpening <= 3 && daysUntilOpening > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          {daysUntilOpening} dia(s) restante(s)
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{opportunity.orgaoName}</p>
                    <p className="text-slate-800 mb-3">{opportunity.objeto}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{formatCurrency(opportunity.valorEstimado)}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(opportunity.dataAbertura)}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{opportunity.endereco} ({opportunity.distanceKm}km)</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium">UASG:</span>
                    <span className="ml-1">{opportunity.uasg}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500">CATMAT:</span>
                    {opportunity.catmatCodes.map((code, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    <Button size="sm">
                      Demonstrar Interesse
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhuma oportunidade encontrada
            </h3>
            <p className="text-slate-600">
              Tente ajustar os filtros ou aguarde novas oportunidades serem identificadas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}