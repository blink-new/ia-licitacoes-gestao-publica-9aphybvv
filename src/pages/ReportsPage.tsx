import { useState } from 'react'
import { BarChart3, TrendingUp, Download, Calendar, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

const MOCK_REPORT_DATA = {
  monthlyStats: [
    { month: 'Jan', participations: 12, wins: 4, value: 850000 },
    { month: 'Fev', participations: 15, wins: 6, value: 1200000 },
    { month: 'Mar', participations: 18, wins: 5, value: 950000 },
    { month: 'Abr', participations: 22, wins: 8, value: 1500000 },
    { month: 'Mai', participations: 20, wins: 7, value: 1300000 },
    { month: 'Jun', participations: 25, wins: 9, value: 1800000 }
  ],
  topOrgaos: [
    { name: 'Prefeitura de São Paulo', participations: 8, wins: 3, winRate: 37.5 },
    { name: 'Governo do Estado SP', participations: 6, wins: 2, winRate: 33.3 },
    { name: 'Ministério da Educação', participations: 5, wins: 2, winRate: 40.0 },
    { name: 'Prefeitura de Campinas', participations: 4, wins: 1, winRate: 25.0 }
  ],
  categoryPerformance: [
    { category: 'Tecnologia da Informação', participations: 15, wins: 6, winRate: 40.0 },
    { category: 'Material de Escritório', participations: 8, wins: 2, winRate: 25.0 },
    { category: 'Consultoria', participations: 10, wins: 4, winRate: 40.0 },
    { category: 'Equipamentos', participations: 12, wins: 3, winRate: 25.0 }
  ]
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalParticipations = MOCK_REPORT_DATA.monthlyStats.reduce((sum, month) => sum + month.participations, 0)
  const totalWins = MOCK_REPORT_DATA.monthlyStats.reduce((sum, month) => sum + month.wins, 0)
  const totalValue = MOCK_REPORT_DATA.monthlyStats.reduce((sum, month) => sum + month.value, 0)
  const winRate = (totalWins / totalParticipations) * 100

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-slate-600 mt-1">Analise sua performance e resultados</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="12months">Último ano</SelectItem>
                  <SelectItem value="all">Todo período</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="ti">Tecnologia da Informação</SelectItem>
                  <SelectItem value="material">Material de Escritório</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="equipamentos">Equipamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Participações</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipations}</div>
            <p className="text-xs text-muted-foreground">
              +15% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licitações Vencidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWins}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de sucesso: {winRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Vencido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              +28% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue / totalWins)}</div>
            <p className="text-xs text-muted-foreground">
              Por licitação vencida
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_REPORT_DATA.monthlyStats.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-slate-900 w-8">{month.month}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-200 rounded-full h-2 flex-1 max-w-24">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(month.wins / month.participations) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600">
                          {month.wins}/{month.participations}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(month.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Órgãos */}
        <Card>
          <CardHeader>
            <CardTitle>Principais Órgãos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_REPORT_DATA.topOrgaos.map((orgao, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900">{orgao.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="bg-green-200 rounded-full h-2 flex-1 max-w-32">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${orgao.winRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-600">
                        {orgao.winRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-900">
                      {orgao.wins}/{orgao.participations}
                    </span>
                    <p className="text-xs text-slate-600">vitórias</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Categoria</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Participações</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Vitórias</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Taxa de Sucesso</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900">Performance</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REPORT_DATA.categoryPerformance.map((category, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-900">{category.category}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{category.participations}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{category.wins}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.winRate >= 35 
                          ? 'bg-green-100 text-green-800'
                          : category.winRate >= 25
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            category.winRate >= 35 
                              ? 'bg-green-600'
                              : category.winRate >= 25
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${category.winRate}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-4">
                Selecione os campos que deseja incluir no relatório exportado:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Número do Pregão',
                  'Órgão',
                  'Objeto',
                  'Valor Estimado',
                  'Data de Abertura',
                  'Status',
                  'Lance Inicial',
                  'Resultado',
                  'Valor Vencido'
                ].map((field) => (
                  <label key={field} className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-slate-700">{field}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Exportar Excel</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Exportar PDF</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}