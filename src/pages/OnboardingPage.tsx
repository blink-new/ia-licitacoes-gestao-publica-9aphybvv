import { useState, useEffect, useRef } from 'react'
import { Send, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { blink } from '../blink/client'
import { OnboardingData } from '../types'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

interface OnboardingPageProps {
  onComplete: () => void
}

interface ChatMessage {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
}

const ONBOARDING_QUESTIONS = [
  {
    key: 'companyName',
    question: 'Olá! Vou te ajudar a configurar sua empresa na plataforma. Primeiro, qual é o nome da sua empresa?',
    field: 'companyName'
  },
  {
    key: 'cnpj',
    question: 'Perfeito! Agora me informe o CNPJ da empresa (apenas números):',
    field: 'cnpj'
  },
  {
    key: 'cnaePrincipal',
    question: 'Qual é o CNAE principal da sua empresa? (código de 7 dígitos)',
    field: 'cnaePrincipal'
  },
  {
    key: 'address',
    question: 'Qual é o endereço completo da empresa?',
    field: 'address'
  },
  {
    key: 'cep',
    question: 'E o CEP? (formato: 00000-000)',
    field: 'cep'
  },
  {
    key: 'phone',
    question: 'Telefone para contato:',
    field: 'phone'
  },
  {
    key: 'email',
    question: 'E-mail corporativo:',
    field: 'email'
  },
  {
    key: 'federalEntityPreference',
    question: 'Qual tipo de licitação tem mais interesse? Digite: "federal", "estadual" ou "municipal"',
    field: 'federalEntityPreference'
  }
]

const DOCUMENT_TYPES = [
  { key: 'contrato_social', name: 'Contrato Social', required: true },
  { key: 'cartao_cnpj', name: 'Cartão CNPJ', required: false },
  { key: 'inscricao_estadual', name: 'Inscrição Estadual', required: false },
  { key: 'inscricao_municipal', name: 'Inscrição Municipal', required: false },
  { key: 'certidao_federal', name: 'Certidão Negativa Federal', required: false },
  { key: 'certidao_estadual', name: 'Certidão Negativa Estadual', required: false },
  { key: 'certidao_municipal', name: 'Certidão Negativa Municipal', required: false },
  { key: 'certidao_trabalhista', name: 'Certidão Negativa Trabalhista', required: false },
  { key: 'certidao_falencia', name: 'Certidão Negativa de Falência', required: false }
]

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [isDocumentPhase, setIsDocumentPhase] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addAIMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const classifyDocument = (fileName: string): string => {
    const name = fileName.toLowerCase()
    if (name.includes('contrato') || name.includes('social')) return 'contrato_social'
    if (name.includes('cnpj')) return 'cartao_cnpj'
    if (name.includes('estadual')) return 'inscricao_estadual'
    if (name.includes('municipal')) return 'inscricao_municipal'
    if (name.includes('federal')) return 'certidao_federal'
    if (name.includes('trabalhista')) return 'certidao_trabalhista'
    if (name.includes('falencia')) return 'certidao_falencia'
    return 'documento_generico'
  }

  const getDocumentTypeName = (type: string): string => {
    const doc = DOCUMENT_TYPES.find(d => d.key === type)
    return doc?.name || 'Documento Genérico'
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (messages.length === 0) {
      addAIMessage(ONBOARDING_QUESTIONS[0].question)
    }
  }, [messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return

    const userMessage = currentInput.trim()
    addUserMessage(userMessage)
    setCurrentInput('')
    setIsProcessing(true)

    if (!isDocumentPhase) {
      // Fase de perguntas
      const currentQuestion = ONBOARDING_QUESTIONS[currentQuestionIndex]
      const newData = { ...onboardingData, [currentQuestion.field]: userMessage }
      setOnboardingData(newData)

      if (currentQuestionIndex < ONBOARDING_QUESTIONS.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1)
          addAIMessage(ONBOARDING_QUESTIONS[currentQuestionIndex + 1].question)
          setIsProcessing(false)
        }, 1000)
      } else {
        // Finalizar fase de perguntas e iniciar upload de documentos
        setTimeout(() => {
          setIsDocumentPhase(true)
          addAIMessage('Ótimo! Agora vamos fazer o upload dos seus documentos. Você pode arrastar e soltar os arquivos aqui no chat ou usar o botão de upload. Vou analisar automaticamente cada documento e classificá-lo. Comece pelo Contrato Social que é obrigatório.')
          setIsProcessing(false)
        }, 1000)
      }
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!user) return

    setIsProcessing(true)
    
    for (const file of Array.from(files)) {
      try {
        // Upload do arquivo
        const { publicUrl } = await blink.storage.upload(
          file,
          `documents/${user.id}/${Date.now()}-${file.name}`,
          { upsert: true }
        )

        // Simular análise OCR (em produção seria integrado com OCR real)
        const documentType = classifyDocument(file.name)
        
        addAIMessage(`📄 Documento "${file.name}" recebido! Analisando...`)
        
        setTimeout(() => {
          addAIMessage(`✅ Documento classificado como: ${getDocumentTypeName(documentType)}. Arquivo processado com sucesso!`)
          setUploadedDocuments(prev => [...prev, documentType])
        }, 2000)

      } catch (error) {
        console.error('Error uploading file:', error)
        addAIMessage(`❌ Erro ao processar o arquivo "${file.name}". Tente novamente.`)
      }
    }
    
    setIsProcessing(false)
  }

  const handleCompleteOnboarding = async () => {
    if (!user) return

    setIsProcessing(true)
    
    try {
      // Salvar dados da empresa
      await blink.db.companies.create({
        id: `company_${user.id}_${Date.now()}`,
        userId: user.id,
        companyName: onboardingData.companyName,
        cnpj: onboardingData.cnpj,
        cnaePrincipal: onboardingData.cnaePrincipal,
        cep: onboardingData.cep,
        address: onboardingData.address,
        phone: onboardingData.phone,
        email: onboardingData.email,
        federalEntityPreference: onboardingData.federalEntityPreference as any,
        onboardingCompleted: true
      })

      addAIMessage('🎉 Perfeito! Seu cadastro foi concluído com sucesso. Redirecionando para o dashboard...')
      
      setTimeout(() => {
        onComplete()
      }, 2000)
      
    } catch (error) {
      console.error('Error completing onboarding:', error)
      addAIMessage('❌ Erro ao finalizar cadastro. Tente novamente.')
    }
    
    setIsProcessing(false)
  }

  const canComplete = uploadedDocuments.includes('contrato_social')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col max-w-2xl">
        <div className="bg-white border-b border-slate-200 p-4">
          <h1 className="text-2xl font-bold text-slate-900">Configuração Inicial</h1>
          <p className="text-slate-600">Vamos configurar sua empresa para começar a usar a plataforma</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Processando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          {isDocumentPhase ? (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFileUpload(e.dataTransfer.files)
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">Arraste arquivos aqui ou clique para selecionar</p>
                <p className="text-sm text-slate-500 mt-1">PDF, JPG, PNG até 10MB</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />

              {canComplete && (
                <Button 
                  onClick={handleCompleteOnboarding}
                  className="w-full"
                  disabled={isProcessing}
                >
                  Finalizar Configuração
                </Button>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Digite sua resposta..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isProcessing}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isProcessing || !currentInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Form Preview Panel */}
      <div className="w-96 bg-white border-l border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Dados Capturados</h2>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(onboardingData).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {value || '-'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {isDocumentPhase && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DOCUMENT_TYPES.map((doc) => {
                    const isUploaded = uploadedDocuments.includes(doc.key)
                    return (
                      <div key={doc.key} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{doc.name}</span>
                        <div className="flex items-center space-x-2">
                          {doc.required && (
                            <Badge variant="outline" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                          {isUploaded ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}