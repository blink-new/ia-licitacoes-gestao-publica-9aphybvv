export interface Company {
  id: string
  userId: string
  companyName?: string
  cnpj?: string
  cnaePrincipal?: string
  cnaeSecundarios?: string[]
  cep?: string
  address?: string
  city?: string
  state?: string
  phone?: string
  email?: string
  federalEntityPreference?: 'federal' | 'estadual' | 'municipal'
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  userId: string
  companyId: string
  documentType: string
  fileUrl?: string
  fileName?: string
  issueDate?: string
  expiryDate?: string
  status: 'pending' | 'valid' | 'expired' | 'invalid'
  ocrData?: any
  createdAt: string
  updatedAt: string
}

export interface Licitacao {
  id: string
  numeroPregao?: string
  uasg?: string
  orgaoName?: string
  objeto?: string
  catmatCodes?: string[]
  catserCodes?: string[]
  dataPublicacao?: string
  dataAbertura?: string
  enderecoEntrega?: string
  cepEntrega?: string
  valorEstimado?: number
  quantidade?: number
  unidadeFornecimento?: string
  status: 'active' | 'inactive' | 'finished'
  createdAt: string
  updatedAt: string
}

export interface Opportunity {
  id: string
  userId: string
  companyId: string
  licitacaoId: string
  matchScore?: number
  cnaeMatchScore?: number
  distanceScore?: number
  entityScore?: number
  distanceKm?: number
  status: 'new' | 'viewed' | 'interested' | 'participating' | 'won' | 'lost'
  createdAt: string
  updatedAt: string
  licitacao?: Licitacao
}

export interface Participation {
  id: string
  userId: string
  companyId: string
  licitacaoId: string
  opportunityId: string
  lanceInicial?: number
  lanceMinimo?: number
  intervaloLances?: number
  status: 'preparing' | 'submitted' | 'in_progress' | 'won' | 'lost' | 'appealing'
  timelineEvents?: TimelineEvent[]
  createdAt: string
  updatedAt: string
}

export interface TimelineEvent {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  executedBy: 'ai' | 'user'
  status: 'completed' | 'pending' | 'failed'
}

export interface OnboardingData {
  companyName?: string
  cnpj?: string
  cnaePrincipal?: string
  cnaeSecundarios?: string[]
  cep?: string
  address?: string
  city?: string
  state?: string
  phone?: string
  email?: string
  federalEntityPreference?: 'federal' | 'estadual' | 'municipal'
}