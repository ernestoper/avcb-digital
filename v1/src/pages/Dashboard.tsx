import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db, CompanyAnalysis } from '@/lib/database';
import { generateCertificatePDF } from '@/lib/certificate';
import { seedDatabase, clearDatabase } from '@/lib/seedData';
import { auth } from '@/lib/auth';
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  Trash2,
  BarChart3,
  PieChart,
  Home,
  Database,
  RefreshCw,
  LogOut,
  User
} from 'lucide-react';
import cbmpeLogo from '@/assets/cbmpe-logo.png';

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<CompanyAnalysis[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'aprovado' | 'pendente' | 'reprovado'>('all');
  const navigate = useNavigate();
  const user = auth.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await db.getAll();
      setAnalyses(data);
      const statsData = await db.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta análise?')) {
      try {
        await db.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar análise');
      }
    }
  };

  const handleDownloadCertificate = (analysis: CompanyAnalysis) => {
    generateCertificatePDF(analysis);
  };

  const filteredAnalyses = filter === 'all' 
    ? analyses 
    : analyses.filter(a => a.status === filter);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'success';
      case 'pendente': return 'warning';
      case 'reprovado': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={cbmpeLogo} alt="CBMPE Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-fire bg-clip-text text-transparent">
                  Dashboard AVCB
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerenciamento de Análises
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <Badge variant="default">Admin</Badge>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4" />
                Início
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  auth.logout();
                  navigate('/login');
                }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Análises</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Empresas analisadas
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{stats.aprovados}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total > 0 ? Math.round((stats.aprovados / stats.total) * 100) : 0}% do total
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">{stats.pendentes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aguardando vistoria
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Reprovados</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{stats.reprovados}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Necessitam adequação
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos de Distribuição */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição por Nível de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-success"></div>
                      <span className="text-sm">Risco Baixo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stats.porRisco.baixo}</span>
                      <span className="text-xs text-muted-foreground">
                        ({stats.total > 0 ? Math.round((stats.porRisco.baixo / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-warning"></div>
                      <span className="text-sm">Risco Médio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stats.porRisco.medio}</span>
                      <span className="text-xs text-muted-foreground">
                        ({stats.total > 0 ? Math.round((stats.porRisco.medio / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-destructive"></div>
                      <span className="text-sm">Risco Alto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stats.porRisco.alto}</span>
                      <span className="text-xs text-muted-foreground">
                        ({stats.total > 0 ? Math.round((stats.porRisco.alto / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Certificados Emitidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-success" />
                      <span className="text-sm">DDLCB</span>
                    </div>
                    <span className="font-bold">{stats.porTipo.DDLCB}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-warning" />
                      <span className="text-sm">AR</span>
                    </div>
                    <span className="font-bold">{stats.porTipo.AR}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-destructive" />
                      <span className="text-sm">AVCB</span>
                    </div>
                    <span className="font-bold">{stats.porTipo.AVCB}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros e Ações */}
        <Card className="shadow-elevated mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtrar Análises</CardTitle>
              <div className="flex gap-2">
                {analyses.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const count = seedDatabase();
                      loadData();
                      alert(`${count} análises de exemplo carregadas!`);
                    }}
                  >
                    <Database className="h-4 w-4" />
                    Carregar Dados de Exemplo
                  </Button>
                )}
                {analyses.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja limpar todos os dados?')) {
                        clearDatabase();
                        loadData();
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Limpar Dados
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Todas ({analyses.length})
              </Button>
              <Button
                variant={filter === 'aprovado' ? 'default' : 'outline'}
                onClick={() => setFilter('aprovado')}
              >
                Aprovadas ({analyses.filter(a => a.status === 'aprovado').length})
              </Button>
              <Button
                variant={filter === 'pendente' ? 'default' : 'outline'}
                onClick={() => setFilter('pendente')}
              >
                Pendentes ({analyses.filter(a => a.status === 'pendente').length})
              </Button>
              <Button
                variant={filter === 'reprovado' ? 'default' : 'outline'}
                onClick={() => setFilter('reprovado')}
              >
                Reprovadas ({analyses.filter(a => a.status === 'reprovado').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Análises */}
        <div className="space-y-4">
          {filteredAnalyses.length === 0 ? (
            <Card className="shadow-elevated">
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma análise encontrada
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="shadow-elevated">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Building2 className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{analysis.razao_social}</h3>
                          {analysis.nome_fantasia && (
                            <p className="text-sm text-muted-foreground">{analysis.nome_fantasia}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            CNPJ: {analysis.cnpj}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant={getRiskColor(analysis.analise.riskLevel)}>
                          {analysis.analise.riskLevelLegal}
                        </Badge>
                        <Badge variant={getStatusColor(analysis.status)}>
                          {analysis.status.toUpperCase()}
                        </Badge>
                        {analysis.certificado && (
                          <Badge variant="outline">
                            {analysis.certificado.tipo}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Análise realizada em: {new Date(analysis.dataAnalise).toLocaleDateString('pt-BR')}
                      </p>
                      {analysis.certificado && (
                        <p className="text-sm text-muted-foreground">
                          Certificado: {analysis.certificado.numero} | 
                          Validade: {new Date(analysis.certificado.validade).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {analysis.certificado && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDownloadCertificate(analysis)}
                        >
                          <Download className="h-4 w-4" />
                          Baixar Certificado
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(analysis.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
