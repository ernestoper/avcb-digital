import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Hash, FileText, ArrowRight, Edit } from 'lucide-react';

interface CompanyData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  porte?: string;
  natureza_juridica?: string;
  situacao?: string;
  data_inicio_atividade?: string;
  capital_social?: number;
}

interface CompanyInfoProps {
  companyData: CompanyData;
  onProceed: () => void;
  onEdit: () => void;
}

export const CompanyInfo = ({ companyData, onProceed, onEdit }: CompanyInfoProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card className="shadow-elevated border-2 border-primary/20">
        <CardHeader className="bg-gradient-fire text-primary-foreground">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Dados da Empresa Consultados
          </CardTitle>
          <p className="text-primary-foreground/90">
            Verifique se as informações estão corretas antes de prosseguir
          </p>
        </CardHeader>
      </Card>

      {/* Informações Básicas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Identificação da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
              <p className="text-lg font-semibold">{companyData.razao_social}</p>
            </div>
            
            {companyData.nome_fantasia && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                <p className="text-base">{companyData.nome_fantasia}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
              <p className="text-lg font-mono font-semibold text-primary">
                {formatCNPJ(companyData.cnpj)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Situação</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={companyData.situacao === 'ATIVA' ? 'success' : 'destructive'}>
                  {companyData.situacao || 'ATIVA'}
                </Badge>
              </div>
            </div>

            {companyData.data_inicio_atividade && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Início de Atividade</label>
                <p className="text-base">{formatDate(companyData.data_inicio_atividade)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Logradouro</label>
              <p className="text-base">
                {companyData.logradouro}, {companyData.numero}
                {companyData.complemento && ` - ${companyData.complemento}`}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bairro</label>
              <p className="text-base">{companyData.bairro}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cidade/UF</label>
              <p className="text-base">{companyData.municipio}/{companyData.uf}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">CEP</label>
              <p className="text-base font-mono">{companyData.cep}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Econômica */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="h-5 w-5 text-primary" />
            Atividade Econômica Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/50 p-4 rounded-lg border border-accent">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="text-sm font-mono">
                {companyData.cnae_fiscal}
              </Badge>
              <div className="flex-1">
                <p className="text-base font-medium">{companyData.cnae_fiscal_descricao}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este CNAE será utilizado para classificação inicial de risco
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Complementares */}
      {(companyData.porte || companyData.natureza_juridica || companyData.capital_social) && (
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Informações Complementares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {companyData.porte && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Porte</label>
                  <p className="text-base">{companyData.porte}</p>
                </div>
              )}
              
              {companyData.natureza_juridica && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Natureza Jurídica</label>
                  <p className="text-base">{companyData.natureza_juridica}</p>
                </div>
              )}
              
              {companyData.capital_social && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Capital Social</label>
                  <p className="text-base font-semibold">{formatCurrency(companyData.capital_social)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aviso Importante */}
      <Card className="shadow-elevated border-warning/50 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-warning/20 p-2 rounded-full">
              <FileText className="h-5 w-5 text-warning-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-warning-foreground mb-2">
                Verificação Importante
              </h4>
              <p className="text-sm text-muted-foreground">
                Confirme se todos os dados acima estão corretos. Essas informações serão utilizadas 
                para a análise de risco e classificação de segurança contra incêndio da sua empresa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onEdit}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Consultar Outro CNPJ
        </Button>
        
        <Button 
          variant="hero" 
          size="lg"
          onClick={onProceed}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          Iniciar Análise de Risco
        </Button>
      </div>
    </div>
  );
};