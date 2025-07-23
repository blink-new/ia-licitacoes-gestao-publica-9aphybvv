import { useState } from 'react'
import { Upload, FileText, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

const MOCK_DOCUMENTS = [
  {
    id: '1',
    name: 'Contrato Social',
    type: 'contrato_social',
    status: 'valid',
    issueDate: '2023-01-15',
    expiryDate: null,
    fileUrl: '#'
  },
  {
    id: '2',
    name: 'Certidão Negativa Federal',
    type: 'certidao_federal',
    status: 'valid',
    issueDate: '2024-01-10',
    expiryDate: '2024-07-10',
    fileUrl: '#'
  },
  {
    id: '3',
    name: 'Certidão Negativa Estadual',
    type: 'certidao_estadual',
    status: 'expired',
    issueDate: '2023-06-15',
    expiryDate: '2023-12-15',
    fileUrl: '#'
  },
  {
    id: '4',
    name: 'Inscrição Municipal',
    type: 'inscricao_municipal',
    status: 'pending',
    issueDate: null,
    expiryDate: null,
    fileUrl: null
  }
]

export default function DocumentsPage() {
  const [documents] = useState(MOCK_DOCUMENTS)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Válido</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <FileText className="h-5 w-5 text-slate-400" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Repositório de Documentos</h1>
          <p className="text-slate-600 mt-1">Gerencie todos os documentos necessários para licitações</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Upload Documento</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Válidos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.filter(d => d.status === 'valid').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Vencidos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.filter(d => d.status === 'expired').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Pendentes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(doc.status)}
                  <div>
                    <h3 className="font-medium text-slate-900">{doc.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-slate-500">
                        Emissão: {formatDate(doc.issueDate)}
                      </span>
                      {doc.expiryDate && (
                        <span className="text-sm text-slate-500">
                          Validade: {formatDate(doc.expiryDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(doc.status)}
                  <div className="flex space-x-2">
                    {doc.fileUrl ? (
                      <Button variant="outline" size="sm">
                        Visualizar
                      </Button>
                    ) : (
                      <Button size="sm">
                        Upload
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Como Obter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Arraste documentos aqui ou clique para selecionar
            </h3>
            <p className="text-slate-600 mb-4">
              A IA irá analisar e classificar automaticamente seus documentos
            </p>
            <Button>Selecionar Arquivos</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}