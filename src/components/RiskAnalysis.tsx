import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowLeft, Building2, MapPin, FileText, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db, generateId, generateCertificateNumber, CompanyAnalysis } from '@/lib/database';
import { generateCertificatePDF } from '@/lib/certificate';
import { useNavigate } from 'react-router-dom';

interface CompanyData {
  cnpj: string;
  razao_social: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
  legalRef?: string;
}

interface Answer {
  questionId: string;
  questionText: string;
  answer: any;
  answerText: string;
}

interface RiskAnalysisProps {
  companyData: CompanyData;
  onRestart: () => void;
}

export const RiskAnalysis = ({ companyData, onRestart }: RiskAnalysisProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [answersHistory, setAnswersHistory] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskLevelLegal, setRiskLevelLegal] = useState<string>('');
  const [showReport, setShowReport] = useState(false);
  const [savedAnalysis, setSavedAnalysis] = useState<CompanyAnalysis | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Anexo I - Risco I (Baixo) - CNAEs que permitem DDLCB
  const anexoI_RiscoI = [
    '4711301', // Comércio varejista de mercadorias em geral (pequeno porte)
    '5611201', // Restaurantes e similares
    '4744005', // Comércio varejista de ferragens
  ];

  // Anexo II - Risco III (Alto) - CNAEs que exigem Projeto Técnico
  const anexoII_RiscoIII = [
    '1921700', // Fabricação de produtos farmoquímicos
    '2011800', // Fabricação de cloro e álcalis
    '2012600', // Fabricação de intermediários para fertilizantes
    '3511500', // Geração de energia elétrica
    '4711300', // Hipermercados
    '4729699', // Comércio varejista de produtos farmacêuticos
    '8610101', // Atividades de atendimento hospitalar
    '4731800', // Comércio varejista de combustíveis
    '2061400', // Fabricação de explosivos
    '2399101', // Fabricação de produtos inflamáveis
  ];

  const questions: Question[] = [
    {
      id: 'area_total',
      text: 'Qual a área total construída da edificação (em m²)?',
      type: 'number',
      required: true,
      legalRef: 'Art. 5º I e VII e Art. 6º I - Decreto 58.545/25'
    },
    {
      id: 'pavimentos',
      text: 'Quantos pavimentos (andares úteis) possui a edificação?',
      type: 'number',
      required: true,
      legalRef: 'Art. 6º II - Decreto 58.545/25'
    },
    {
      id: 'ocupacao_maxima',
      text: 'Qual a lotação máxima de pessoas no local simultaneamente?',
      type: 'number',
      required: true,
      legalRef: 'Art. 5º VII e Art. 6º III'
    },
    {
      id: 'hospedagem',
      text: 'A edificação é destinada a hospedagem (hotel, pousada, pensão, hospital ou clínica)?',
      type: 'select',
      options: [
        'Não se aplica',
        'Sim, até 16 leitos',
        'Sim, 17 a 40 leitos',
        'Sim, mais de 40 leitos ou hospitalar'
      ],
      required: true,
      legalRef: 'Art. 5º e Art. 6º IV e VI'
    },
    {
      id: 'inflamaveis',
      text: 'Há armazenamento de líquidos inflamáveis, GLP, produtos químicos perigosos ou gases combustíveis?',
      type: 'select',
      options: [
        'Nenhum / até 150 L ou 3 botijões P13 (39 kg)',
        '151 a 1.000 L',
        'Mais de 1.000 L ou GLP central > 190 kg'
      ],
      required: true,
      legalRef: 'Art. 5º h–k e Art. 6º V, VIII, XI, XII'
    },
    {
      id: 'patrimonio_especial',
      text: 'A edificação faz parte do patrimônio histórico, possui isolamento inadequado ou concentra idosos, crianças ou pessoas com mobilidade reduzida?',
      type: 'boolean',
      required: true,
      legalRef: 'Art. 6º VI e XIII'
    },
    {
      id: 'sistemas_existentes',
      text: 'Quais sistemas de proteção contra incêndio estão instalados no local?',
      type: 'select',
      options: [
        'Nenhum',
        'Extintores',
        'Extintores + Iluminação',
        'Extintores + Iluminação + Sinalização',
        'Sistema completo (hidrantes, sprinklers, alarme)'
      ],
      required: true,
      legalRef: 'COSCIP / NT 1.02 - Sistemas mínimos'
    },
  ];

  // Carregar resposta existente quando mudar de pergunta
  useEffect(() => {
    if (!showReport && riskLevel !== 'high' && currentQuestion < questions.length) {
      const currentQ = questions[currentQuestion];
      const existingAnswer = answers[currentQ.id];
      if (existingAnswer !== undefined) {
        setCurrentAnswer(existingAnswer);
      } else {
        setCurrentAnswer('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, showReport, riskLevel]);

  useEffect(() => {
    const cnae = companyData.cnae_fiscal;

    // Se está no Anexo II (Risco III - Alto) → encerra imediatamente
    if (anexoII_RiscoIII.includes(cnae)) {
      setRiskLevel('high');
      setRiskScore(10);
      setRiskLevelLegal('Risco III (Alto)');
      setShowReport(true);
      toast({
        title: "ALTO RISCO - Projeto Técnico Obrigatório",
        description: "CNAE listado no Anexo II do Decreto 58.545/2025",
        variant: "destructive",
      });
      return;
    }

    // Se está no Anexo I (Risco I - Baixo) → pode gerar DDLCB
    if (anexoI_RiscoI.includes(cnae)) {
      toast({
        title: "Análise Normativa CBMPE",
        description: "CNAE de Risco I - responda às perguntas para confirmar classificação",
        variant: "default",
      });
    } else {
      toast({
        title: "Análise Normativa CBMPE",
        description: "Responda às perguntas conforme o Decreto 58.545/2025 e NT 1.01/2024",
        variant: "default",
      });
    }
  }, [companyData.cnae_fiscal]);

  const formatAnswerText = (question: Question, answer: any): string => {
    switch (question.type) {
      case 'boolean':
        return answer ? 'Sim' : 'Não';
      case 'number':
        if (question.id === 'area_total') return `${answer} m²`;
        if (question.id === 'pavimentos') return `${answer} pavimento${answer > 1 ? 's' : ''}`;
        if (question.id === 'ocupacao_maxima') return `${answer} pessoa${answer > 1 ? 's' : ''}`;
        return answer.toString();
      case 'select':
        return answer;
      default:
        return answer.toString();
    }
  };

  const handleAnswer = (answer: any) => {
    const currentQ = questions[currentQuestion];

    // Armazenar resposta
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: answer
    }));

    // Atualizar histórico - substituir se já existe resposta para esta pergunta
    const newAnswer: Answer = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      answer: answer,
      answerText: formatAnswerText(currentQ, answer)
    };

    setAnswersHistory(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === currentQ.id);
      if (existingIndex >= 0) {
        // Substituir resposta existente
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      } else {
        // Adicionar nova resposta
        return [...prev, newAnswer];
      }
    });

    // Limpar campo atual
    setCurrentAnswer('');

    // Próxima pergunta ou calcular risco
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateRisk();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      // Carregar resposta anterior se existir
      const prevQuestion = questions[currentQuestion - 1];
      const prevAnswer = answers[prevQuestion.id];
      if (prevAnswer !== undefined) {
        setCurrentAnswer(prevAnswer);
      } else {
        setCurrentAnswer('');
      }
    }
  };

  const calculateRisk = () => {
    let score = 0;

    // 1. Área total construída (Art. 5º I e VII e Art. 6º I)
    const area = answers.area_total;
    if (area > 930) score += 3;
    else if (area > 200) score += 2;

    // 2. Número de pavimentos (Art. 6º II)
    const pavimentos = answers.pavimentos;
    if (pavimentos >= 4) score += 2;
    else if (pavimentos >= 2) score += 1;

    // 3. Lotação máxima (Art. 5º VII e Art. 6º III)
    const ocupacao = answers.ocupacao_maxima;
    if (ocupacao > 100) score += 3;
    else if (ocupacao > 50) score += 1;

    // 4. Hospedagem (Art. 5º e Art. 6º IV e VI)
    const hospedagemMap: Record<string, number> = {
      'Não se aplica': 0,
      'Sim, até 16 leitos': 1,
      'Sim, 17 a 40 leitos': 2,
      'Sim, mais de 40 leitos ou hospitalar': 3
    };
    score += hospedagemMap[answers.hospedagem] || 0;

    // 5. Inflamáveis (Art. 5º h–k e Art. 6º V, VIII, XI, XII)
    const inflamaveisMap: Record<string, number> = {
      'Nenhum / até 150 L ou 3 botijões P13 (39 kg)': 0,
      '151 a 1.000 L': 2,
      'Mais de 1.000 L ou GLP central > 190 kg': 3
    };
    score += inflamaveisMap[answers.inflamaveis] || 0;

    // 6. Patrimônio histórico / uso especial (Art. 6º VI e XIII)
    if (answers.patrimonio_especial) score += 2;

    // 7. Sistemas de proteção instalados (COSCIP / NT 1.02)
    const sistemasMap: Record<string, number> = {
      'Nenhum': 3,
      'Extintores': 2,
      'Extintores + Iluminação': 1,
      'Extintores + Iluminação + Sinalização': 0,
      'Sistema completo (hidrantes, sprinklers, alarme)': -1
    };
    score += sistemasMap[answers.sistemas_existentes] || 0;

    // Classificação LEGAL conforme Decreto 58.545/25
    let level: 'low' | 'medium' | 'high';
    let levelLegal: string;

    if (score <= 2) {
      level = 'low';
      levelLegal = 'Risco I (Baixo)';
    } else if (score <= 6) {
      level = 'medium';
      levelLegal = 'Risco II (Médio)';
    } else {
      level = 'high';
      levelLegal = 'Risco III (Alto)';
    }

    setRiskLevel(level);
    setRiskScore(score);
    setRiskLevelLegal(levelLegal);
    setShowReport(true);

    toast({
      title: "Análise concluída",
      description: `Classificação: ${levelLegal} - ${score} pontos`,
      variant: "default",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'high': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getRiskLabel = (level: string) => {
    if (riskLevelLegal) return riskLevelLegal.toUpperCase();
    switch (level) {
      case 'low': return 'RISCO I (BAIXO)';
      case 'medium': return 'RISCO II (MÉDIO)';
      case 'high': return 'RISCO III (ALTO)';
      default: return 'ANALISANDO';
    }
  };

  if (showReport && riskLevel) {
    const RiskIcon = getRiskIcon(riskLevel);

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho do Relatório */}
        <Card className="shadow-elevated">
          <CardHeader className="text-center bg-gradient-fire text-primary-foreground">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <RiskIcon className="h-8 w-8" />
              Relatório de Análise AVCB
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Razão Social:</strong> {companyData.razao_social}
            </div>
            <div>
              <strong>CNPJ:</strong> {companyData.cnpj}
            </div>
            <div>
              <strong>CNAE:</strong> {companyData.cnae_fiscal} - {companyData.cnae_fiscal_descricao}
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <span>
                {companyData.logradouro}, {companyData.numero} - {companyData.bairro}, {companyData.municipio}/{companyData.uf} - CEP: {companyData.cep}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pontuação da Análise */}
        {riskScore > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pontuação da Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{riskScore} pontos</div>
                <p className="text-muted-foreground mt-2">
                  Classificação Legal: <strong>{riskLevelLegal}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Respostas da Análise */}
        {answersHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Respostas da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {answersHistory.map((item, index) => (
                  <div key={item.questionId} className="border-l-4 border-primary/30 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Pergunta {index + 1}
                        </p>
                        <p className="font-medium mb-1">
                          {item.questionText}
                        </p>
                        <p className="text-primary font-semibold">
                          {item.answerText}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classificação de Risco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RiskIcon className="h-5 w-5" />
                Classificação de Risco
              </span>
              <Badge variant={getRiskColor(riskLevel)} className="text-lg px-4 py-2">
                {getRiskLabel(riskLevel)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskLevel === 'high' ? (
              <div className="space-y-4">
                <p className="text-destructive font-semibold">
                  Sua empresa foi classificada como RISCO III (ALTO) devido ao CNAE ou às características identificadas.
                </p>
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <h4 className="font-semibold text-destructive mb-2">Documentação Necessária:</h4>
                  <p className="text-sm mb-2">
                    Empresa classificada como <strong>Risco III</strong> conforme art. 7º do Decreto 58.545/2025.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>✓ <strong>Projeto Técnico completo</strong> elaborado por engenheiro/arquiteto habilitado</li>
                    <li>✓ Anotação de Responsabilidade Técnica (ART/RRT)</li>
                    <li>✓ Memorial descritivo e plantas baixas</li>
                    <li>✓ Vistoria técnica obrigatória do CBMPE</li>
                    <li>✓ Sistemas completos: sprinklers, alarme, hidrantes, rotas múltiplas</li>
                  </ul>
                </div>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full"
                  onClick={() => window.open('https://agendamento.bombeiros.pe.gov.br', '_blank')}
                >
                  <ArrowRight className="h-4 w-4" />
                  Agendar Vistoria no CBMPE
                </Button>
              </div>
            ) : riskLevel === 'medium' ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Com base nas informações fornecidas, sua empresa foi classificada como RISCO II (MÉDIO).
                </p>

                <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                  <h4 className="font-semibold text-warning mb-2">Documentação Necessária:</h4>
                  <p className="text-sm mb-2">
                    Empresa classificada como <strong>Risco II</strong> conforme art. 6º do Decreto 58.545/2025.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Emissão de <strong>AR (Atestado de Regularidade)</strong></li>
                    <li>✓ Projeto técnico simplificado pode ser exigido</li>
                    <li>✓ Vistoria técnica do CBMPE</li>
                    <li>✓ Sistemas: brigada, hidrantes (se área &gt; 750m²), alarme</li>
                  </ul>
                  <Button
                    variant="default"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => window.open('https://agendamento.bombeiros.pe.gov.br', '_blank')}
                  >
                    Agendar Vistoria no CBMPE
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Com base nas informações fornecidas, sua empresa foi classificada como RISCO I (BAIXO).
                </p>

                <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                  <h4 className="font-semibold text-success mb-2">Documentação Necessária:</h4>
                  <p className="text-sm mb-2">
                    Empresa classificada como <strong>Risco I</strong> conforme art. 5º do Decreto 58.545/2025.
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Emissão de <strong>DDLCB (Declaração de Dispensa de Licenciamento do Corpo de Bombeiros)</strong></li>
                    <li>✓ Requisitos mínimos: extintores, iluminação de emergência, sinalização</li>
                    <li>✓ Não é necessária vistoria presencial</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Base Legal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Base Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Decreto Estadual:</strong> Nº 52.005/2021, alterado pelo Decreto Nº 58.545/2025
            </div>
            <div>
              <strong>Norma Técnica:</strong> NT 1.01/2024 - COSCIP/CBMPE
            </div>
            <div>
              <strong>NBRs Aplicáveis:</strong>
              <ul className="list-disc pl-6 mt-1 text-muted-foreground">
                <li>NBR 12693 - Sistemas de proteção por extintores</li>
                <li>NBR 10898 - Sistema de iluminação de emergência</li>
                <li>NBR 13434 - Sinalização de segurança contra incêndio</li>
                {riskLevel === 'medium' && <li>NBR 13523 - Central de gás liquefeito de petróleo</li>}
                {riskLevel === 'high' && (
                  <>
                    <li>NBR 14432 - Exigências de resistência ao fogo</li>
                    <li>NBR 17240 - Sistemas de detecção e alarme de incêndio</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="shadow-elevated border-primary/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-center mb-4">Próximos Passos</h3>

              {!savedAnalysis ? (
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={async () => {
                    const analysis: CompanyAnalysis = {
                      id: generateId(),
                      cnpj: companyData.cnpj,
                      razao_social: companyData.razao_social,
                      nome_fantasia: companyData.nome_fantasia,
                      cnae_fiscal: companyData.cnae_fiscal,
                      cnae_fiscal_descricao: companyData.cnae_fiscal_descricao,
                      endereco: {
                        logradouro: companyData.logradouro,
                        numero: companyData.numero,
                        bairro: companyData.bairro,
                        municipio: companyData.municipio,
                        uf: companyData.uf,
                        cep: companyData.cep,
                      },
                      analise: {
                        riskLevel: riskLevel!,
                        riskScore,
                        riskLevelLegal,
                        answers: answersHistory,
                      },
                      status: riskLevel === 'low' ? 'aprovado' : 'pendente',
                      dataAnalise: new Date().toISOString(),
                    };

                    // Gerar certificado se aprovado (risco baixo)
                    if (riskLevel === 'low') {
                      const dataEmissao = new Date();
                      const validade = new Date();
                      validade.setFullYear(validade.getFullYear() + 1); // Validade de 1 ano

                      analysis.certificado = {
                        numero: generateCertificateNumber('DDLCB'),
                        dataEmissao: dataEmissao.toISOString(),
                        validade: validade.toISOString(),
                        tipo: 'DDLCB',
                      };
                    } else if (riskLevel === 'medium') {
                      analysis.status = 'pendente';
                    }

                    try {
                      await db.save(analysis);
                      setSavedAnalysis(analysis);

                      toast({
                        title: "Análise salva com sucesso!",
                        description: riskLevel === 'low'
                          ? "Certificado DDLCB gerado automaticamente"
                          : "Análise registrada no sistema",
                        variant: "default",
                      });
                    } catch (error) {
                      console.error('Erro ao salvar:', error);
                      toast({
                        title: "Erro ao salvar",
                        description: "Não foi possível salvar a análise. Verifique sua conexão.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Save className="h-4 w-4" />
                  Salvar Análise e Gerar Certificado
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-success/10 p-4 rounded-lg border border-success/20 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
                    <p className="font-semibold text-success">Análise salva com sucesso!</p>
                    {savedAnalysis.certificado && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Certificado: {savedAnalysis.certificado.numero}
                      </p>
                    )}
                  </div>

                  {savedAnalysis.certificado && (
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full"
                      onClick={() => generateCertificatePDF(savedAnalysis)}
                    >
                      <Download className="h-4 w-4" />
                      Baixar Certificado PDF
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    Ver Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={onRestart}
                  >
                    Nova Consulta
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se é alto risco por CNAE, não mostra perguntas
  if (riskLevel === 'high' && !showReport) {
    return null;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Análise de Risco - Questão {currentQuestion + 1} de {questions.length}
              <span className="text-sm text-muted-foreground block mt-1">
                Base: Decreto 58.545/2025 | NT 1.01/2024
              </span>
            </CardTitle>
            <Badge variant="outline">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-fire h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">{currentQ.text}</h3>
            {currentQ.legalRef && (
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Fundamento legal: {currentQ.legalRef}
              </p>
            )}

            {currentQ.type === 'number' && (
              <div className="space-y-4">
                <input
                  type="number"
                  min="0"
                  max={currentQ.id === 'area_total' ? 50000 : currentQ.id === 'pavimentos' ? 50 : 10000}
                  className="w-full p-3 border rounded-lg text-center text-xl"
                  placeholder="Digite o valor"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt(currentAnswer);
                      if (value > 0) handleAnswer(value);
                    }
                  }}
                />
                <div className="flex gap-3">
                  {currentQuestion > 0 && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                  )}
                  <Button
                    variant="hero"
                    className="flex-1"
                    disabled={!currentAnswer || parseInt(currentAnswer) <= 0}
                    onClick={() => {
                      const value = parseInt(currentAnswer);
                      if (value > 0) handleAnswer(value);
                    }}
                  >
                    {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Continuar'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentQ.type === 'boolean' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => handleAnswer(true)}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Sim
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => handleAnswer(false)}
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4" />
                    Não
                  </Button>
                </div>
                {currentQuestion > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para pergunta anterior
                  </Button>
                )}
              </div>
            )}

            {currentQ.type === 'select' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={currentAnswer === option ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleAnswer(option)}
                    className="w-full text-left justify-start h-auto py-4 px-6"
                  >
                    {option}
                  </Button>
                ))}
                {currentQuestion > 0 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para pergunta anterior
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};