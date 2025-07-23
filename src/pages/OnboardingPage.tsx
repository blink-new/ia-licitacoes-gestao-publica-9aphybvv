import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { blink } from '@/blink/client';
import { validateCNPJ, formatCNPJ, validateEmail, validatePhone } from '@/utils/validation';
import type { Empresa, OnboardingMessage, CatmatCatserMapping } from '@/types';

interface FormData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  enderecoCompleto: string;
  cnaePrincipal: string;
  porteEmpresa: 'MEI' | 'ME' | 'EPP' | 'Grande Empresa' | '';
  produtosServicosFoco: string;
  experienciaLicitacoes: 'Sim' | 'Não' | '';
  nomeContatoPrincipal: string;
  emailContato: string;
  telefoneWhatsapp: string;
}

const OnboardingPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    enderecoCompleto: '',
    cnaePrincipal: '',
    porteEmpresa: '',
    produtosServicosFoco: '',
    experienciaLicitacoes: '',
    nomeContatoPrincipal: '',
    emailContato: '',
    telefoneWhatsapp: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'cnpj' | 'collecting' | 'completed'>('welcome');
  const [catmatMappings, setCatmatMappings] = useState<CatmatCatserMapping[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const saveMessage = useCallback(async (message: OnboardingMessage) => {
    try {
      await blink.db.onboardingMessages.create(message);
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }, []);

  const sendWelcomeMessage = useCallback(async () => {
    const welcomeMessage: OnboardingMessage = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      role: 'assistant',
      content: `🎉 **Bem-vindo ao IA Licitações!**\n\nOlá! Sou sua assistente de IA e vou te ajudar a configurar sua empresa para participar de licitações públicas de forma inteligente.\n\nPara começar, preciso do **CNPJ da sua empresa**. Por favor, digite o CNPJ (apenas números ou com formatação):`,
      timestamp: new Date().toISOString()
    };

    await saveMessage(welcomeMessage);
    setMessages([welcomeMessage]);
    setOnboardingStep('cnpj');
  }, [user, saveMessage]);

  const completeOnboarding = useCallback(async (finalFormData: FormData) => {
    try {
      // Validar dados essenciais
      const errors: Record<string, string> = {};
      
      if (!finalFormData.cnpj) errors.cnpj = 'CNPJ é obrigatório';
      if (!finalFormData.razaoSocial) errors.razaoSocial = 'Razão social é obrigatória';
      if (!finalFormData.emailContato || !validateEmail(finalFormData.emailContato)) {
        errors.emailContato = 'Email válido é obrigatório';
      }
      if (!finalFormData.telefoneWhatsapp || !validatePhone(finalFormData.telefoneWhatsapp)) {
        errors.telefoneWhatsapp = 'Telefone válido é obrigatório';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const errorMessage: OnboardingMessage = {
          id: `msg_${Date.now()}`,
          userId: user.id,
          role: 'assistant',
          content: 'Ainda preciso de algumas informações obrigatórias. Pode verificar os campos destacados no formulário ao lado?',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        await saveMessage(errorMessage);
        return;
      }

      // Buscar mapeamentos CATMAT/CATSER baseado nos produtos/serviços
      let catmatCodes: string[] = [];
      let catserCodes: string[] = [];
      
      if (finalFormData.produtosServicosFoco) {
        const matchingMappings = catmatMappings.filter(mapping =>
          finalFormData.produtosServicosFoco.toLowerCase().includes(mapping.produtoServico.toLowerCase())
        );
        
        catmatCodes = matchingMappings.map(m => m.catmatCode).filter(Boolean) as string[];
        catserCodes = matchingMappings.map(m => m.catserCode).filter(Boolean) as string[];
      }

      // Salvar empresa no banco
      const empresa: Empresa = {
        id: `emp_${Date.now()}`,
        userId: user.id,
        cnpj: finalFormData.cnpj,
        razaoSocial: finalFormData.razaoSocial,
        nomeFantasia: finalFormData.nomeFantasia || finalFormData.razaoSocial,
        enderecoCompleto: finalFormData.enderecoCompleto,
        cnaePrincipal: finalFormData.cnaePrincipal,
        porteEmpresa: finalFormData.porteEmpresa || undefined,
        produtosServicosFoco: finalFormData.produtosServicosFoco,
        experienciaLicitacoes: finalFormData.experienciaLicitacoes || undefined,
        nomeContatoPrincipal: finalFormData.nomeContatoPrincipal,
        emailContato: finalFormData.emailContato,
        telefoneWhatsapp: finalFormData.telefoneWhatsapp,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await blink.db.empresas.create(empresa);

      // Mensagem de sucesso
      const successMessage: OnboardingMessage = {
        id: `msg_${Date.now()}`,
        userId: user.id,
        role: 'assistant',
        content: `🎉 **Parabéns!** Seu cadastro foi concluído com sucesso!\n\n✅ Empresa: ${finalFormData.razaoSocial}\n✅ CNPJ: ${finalFormData.cnpj}\n✅ Contato: ${finalFormData.emailContato}\n\nAgora você pode acessar o dashboard e começar a explorar oportunidades de licitações!\n\n**Clique no botão abaixo para continuar:**`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, successMessage]);
      await saveMessage(successMessage);
      setOnboardingStep('completed');
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      const errorMessage: OnboardingMessage = {
        id: `msg_${Date.now()}`,
        userId: user.id,
        role: 'assistant',
        content: 'Ocorreu um erro ao salvar seus dados. Pode tentar novamente?',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    }
  }, [user, catmatMappings, saveMessage]);

  const handleCNPJInput = useCallback(async (cnpjInput: string) => {
    const cleanCNPJ = cnpjInput.replace(/[^\\d]/g, '');
    
    if (!validateCNPJ(cleanCNPJ)) {
      const errorMessage: OnboardingMessage = {
        id: `msg_${Date.now()}`,
        userId: user.id,
        role: 'assistant',
        content: '❌ CNPJ inválido. Por favor, digite um CNPJ válido (14 dígitos):',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
      return;
    }

    // Atualizar formulário com CNPJ
    setFormData(prev => ({ ...prev, cnpj: formatCNPJ(cleanCNPJ) }));

    const successMessage: OnboardingMessage = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      role: 'assistant',
      content: `✅ **CNPJ válido!** ${formatCNPJ(cleanCNPJ)}\n\nAgora vou coletar as demais informações da sua empresa. Vou fazer algumas perguntas e você pode responder de forma natural. Vamos começar!\n\n**Qual é a razão social da sua empresa?**`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, successMessage]);
    await saveMessage(successMessage);
    setOnboardingStep('collecting');
  }, [user, saveMessage]);

  const handleDataCollection = useCallback(async (userInput: string) => {
    // Usar IA para extrair informações do input do usuário
    const prompt = `
Você é um assistente especializado em onboarding de empresas para licitações públicas.

CONTEXTO ATUAL:
- CNPJ já coletado: ${formData.cnpj}
- Dados já coletados: ${JSON.stringify(formData, null, 2)}

RESPOSTA DO USUÁRIO: "${userInput}"

CAMPOS NECESSÁRIOS:
- razaoSocial: Razão social da empresa
- nomeFantasia: Nome fantasia (pode ser igual à razão social)
- enderecoCompleto: Endereço completo (rua, número, bairro, cidade, estado, CEP)
- cnaePrincipal: CNAE principal da empresa
- porteEmpresa: MEI, ME, EPP ou Grande Empresa
- produtosServicosFoco: Produtos/serviços que a empresa oferece
- experienciaLicitacoes: Se já participou de licitações (Sim/Não)
- nomeContatoPrincipal: Nome do contato principal
- emailContato: Email de contato
- telefoneWhatsapp: Telefone/WhatsApp

INSTRUÇÕES:
1. Analise a resposta do usuário e extraia as informações relevantes
2. Identifique quais campos ainda precisam ser coletados
3. Faça a próxima pergunta de forma natural e conversacional
4. Se todos os dados foram coletados, confirme e finalize

RESPONDA EM JSON:
{
  "extracted_data": {
    "campo": "valor_extraido_ou_null"
  },
  "next_question": "próxima pergunta ou null se finalizado",
  "is_complete": boolean,
  "response_message": "mensagem amigável para o usuário"
}
`;

    try {
      const { text } = await blink.ai.generateText({
        prompt,
        model: 'gpt-4o-mini',
        maxTokens: 500
      });

      const aiResponse = JSON.parse(text);
      
      // Atualizar dados do formulário com informações extraídas
      const updatedFormData = { ...formData };
      Object.entries(aiResponse.extracted_data).forEach(([key, value]) => {
        if (value && value !== null) {
          updatedFormData[key as keyof FormData] = value as any;
        }
      });
      setFormData(updatedFormData);

      // Enviar resposta da IA
      const aiMessage: OnboardingMessage = {
        id: `msg_${Date.now()}`,
        userId: user.id,
        role: 'assistant',
        content: aiResponse.response_message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      await saveMessage(aiMessage);

      // Se onboarding está completo, salvar empresa
      if (aiResponse.is_complete) {
        await completeOnboarding(updatedFormData);
      }
    } catch (error) {
      console.error('Erro na IA:', error);
      
      // Fallback: pergunta manual
      const fallbackMessage: OnboardingMessage = {
        id: `msg_${Date.now()}`,
        userId: user.id,
        role: 'assistant',
        content: 'Entendi! Pode me contar mais sobre os produtos ou serviços que sua empresa oferece?',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      await saveMessage(fallbackMessage);
    }
  }, [formData, user, saveMessage, completeOnboarding]);

  const initializeOnboarding = useCallback(async () => {
    try {
      // Verificar se já existe empresa cadastrada
      const existingCompany = await blink.db.empresas.list({
        where: { userId: user.id },
        limit: 1
      });

      if (existingCompany.length > 0 && existingCompany[0].onboardingCompleted) {
        // Redirecionar para dashboard se onboarding já foi completado
        window.location.href = '/dashboard';
        return;
      }

      // Carregar mensagens anteriores se existirem
      const previousMessages = await blink.db.onboardingMessages.list({
        where: { userId: user.id },
        orderBy: { timestamp: 'asc' }
      });

      if (previousMessages.length > 0) {
        setMessages(previousMessages);
        // Determinar o step atual baseado nas mensagens
        const lastMessage = previousMessages[previousMessages.length - 1];
        if (lastMessage.content.includes('CNPJ')) {
          setOnboardingStep('cnpj');
        } else {
          setOnboardingStep('collecting');
        }
      } else {
        // Iniciar onboarding com mensagem de boas-vindas
        await sendWelcomeMessage();
      }

      // Carregar mapeamentos CATMAT/CATSER
      const mappings = await blink.db.catmatCatserMapping.list();
      setCatmatMappings(mappings);
    } catch (error) {
      console.error('Erro ao inicializar onboarding:', error);
    }
  }, [user, sendWelcomeMessage]);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && !loading) {
      initializeOnboarding();
    }
  }, [user, loading, initializeOnboarding]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isAiTyping) return;

    const userMessage: OnboardingMessage = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);

    const messageContent = currentMessage;
    setCurrentMessage('');
    setIsAiTyping(true);

    try {
      if (onboardingStep === 'cnpj') {
        await handleCNPJInput(messageContent);
      } else if (onboardingStep === 'collecting') {
        await handleDataCollection(messageContent);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      const errorMessage: OnboardingMessage = {
        id: `msg_${Date.now()}`,
        userId: user.id,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Pode tentar novamente?',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFieldStatus = (field: keyof FormData) => {
    if (validationErrors[field]) return 'error';
    if (formData[field]) return 'success';
    return 'pending';
  };

  const getFieldIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">Acesso Necessário</h2>
              <p className="text-gray-600 mb-4">Faça login para continuar com o onboarding.</p>
              <Button onClick={() => blink.auth.login()}>
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-6rem)]">
          {/* Chat Panel */}
          <Card className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Assistente de Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              {onboardingStep !== 'completed' && (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      ref={chatInputRef}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua resposta..."
                      disabled={isAiTyping}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isAiTyping}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {onboardingStep === 'completed' && (
                <div className="border-t p-4">
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full"
                    size="lg"
                  >
                    Ir para o Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-6">
                  {/* CNPJ */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(getFieldStatus('cnpj'))}
                      <Label htmlFor="cnpj">CNPJ *</Label>
                    </div>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      readOnly
                      className={`${getFieldStatus('cnpj') === 'error' ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.cnpj && (
                      <p className="text-sm text-red-500">{validationErrors.cnpj}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Razão Social */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(getFieldStatus('razaoSocial'))}
                      <Label htmlFor="razaoSocial">Razão Social *</Label>
                    </div>
                    <Input
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      readOnly
                      className={`${getFieldStatus('razaoSocial') === 'error' ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.razaoSocial && (
                      <p className="text-sm text-red-500">{validationErrors.razaoSocial}</p>
                    )}
                  </div>

                  {/* Nome Fantasia */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(getFieldStatus('nomeFantasia'))}
                      <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    </div>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      readOnly
                    />
                  </div>

                  {/* Endereço */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(getFieldStatus('enderecoCompleto'))}
                      <Label htmlFor="enderecoCompleto">Endereço Completo</Label>
                    </div>
                    <Textarea
                      id="enderecoCompleto"
                      value={formData.enderecoCompleto}
                      readOnly
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* CNAE Principal */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(getFieldStatus('cnaePrincipal'))}
                      <Label htmlFor="cnaePrincipal">CNAE Principal</Label>
                    </div>
                    <Input
                      id="cnaePrincipal"
                      value={formData.cnaePrincipal}
                      readOnly
                    />
                  </div>

                  {/* Porte da Empresa */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(getFieldStatus('porteEmpresa'))}
                      <Label htmlFor="porteEmpresa">Porte da Empresa</Label>
                    </div>
                    {formData.porteEmpresa ? (
                      <Badge variant="outline" className="w-fit">
                        {formData.porteEmpresa}
                      </Badge>
                    ) : (
                      <div className="text-sm text-gray-500">Não informado</div>
                    )}
                  </div>

                  {/* Produtos/Serviços */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(getFieldStatus('produtosServicosFoco'))}
                      <Label htmlFor="produtosServicosFoco">Produtos/Serviços</Label>
                    </div>
                    <Textarea
                      id="produtosServicosFoco"
                      value={formData.produtosServicosFoco}
                      readOnly
                      rows={3}
                    />
                  </div>

                  {/* Experiência em Licitações */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(getFieldStatus('experienciaLicitacoes'))}
                      <Label htmlFor="experienciaLicitacoes">Experiência em Licitações</Label>
                    </div>
                    {formData.experienciaLicitacoes ? (
                      <Badge variant={formData.experienciaLicitacoes === 'Sim' ? 'default' : 'secondary'} className="w-fit">
                        {formData.experienciaLicitacoes}
                      </Badge>
                    ) : (
                      <div className="text-sm text-gray-500">Não informado</div>
                    )}
                  </div>

                  <Separator />

                  {/* Contato Principal */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Contato Principal</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getFieldIcon(getFieldStatus('nomeContatoPrincipal'))}
                        <Label htmlFor="nomeContatoPrincipal">Nome</Label>
                      </div>
                      <Input
                        id="nomeContatoPrincipal"
                        value={formData.nomeContatoPrincipal}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getFieldIcon(getFieldStatus('emailContato'))}
                        <Label htmlFor="emailContato">Email *</Label>
                      </div>
                      <Input
                        id="emailContato"
                        type="email"
                        value={formData.emailContato}
                        readOnly
                        className={`${getFieldStatus('emailContato') === 'error' ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.emailContato && (
                        <p className="text-sm text-red-500">{validationErrors.emailContato}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getFieldIcon(getFieldStatus('telefoneWhatsapp'))}
                        <Label htmlFor="telefoneWhatsapp">Telefone/WhatsApp *</Label>
                      </div>
                      <Input
                        id="telefoneWhatsapp"
                        value={formData.telefoneWhatsapp}
                        readOnly
                        className={`${getFieldStatus('telefoneWhatsapp') === 'error' ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.telefoneWhatsapp && (
                        <p className="text-sm text-red-500">{validationErrors.telefoneWhatsapp}</p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;