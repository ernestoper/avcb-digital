import { useState } from 'react';
import { CNPJForm } from '@/components/CNPJForm';
import { CompanyInfo } from '@/components/CompanyInfo';
import { RiskAnalysis } from '@/components/RiskAnalysis';
import { Button } from '@/components/ui/button';
import cbmpeLogo from '@/assets/cbmpe-logo.png';

const Index = () => {
  const [step, setStep] = useState<'form' | 'company-info' | 'analysis'>('form');
  const [companyData, setCompanyData] = useState(null);

  const handleCNPJSubmit = (data: any) => {
    setCompanyData(data);
    setStep('company-info');
  };

  const handleProceedToAnalysis = () => {
    setStep('analysis');
  };

  const handleRestart = () => {
    setCompanyData(null);
    setStep('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={cbmpeLogo} 
                alt="CBMPE Logo" 
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-fire bg-clip-text text-transparent">
                  Sistema AVCB Digital
                </h1>
                <p className="text-sm text-muted-foreground">
                  Corpo de Bombeiros Militar de Pernambuco
                </p>
              </div>
            </div>
            <a href="/dashboard" className="hidden md:block">
              <Button variant="outline">
                Ver Dashboard
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {step === 'form' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-4xl font-bold mb-4">
                Análise de Segurança Contra Incêndio
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Consulte automaticamente os dados da sua empresa e receba orientações 
                personalizadas para adequação às normas de segurança contra incêndio e pânico.
              </p>
              
              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-card p-6 rounded-lg shadow-elevated border">
                  <div className="bg-gradient-fire w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Consulta Automática</h3>
                  <p className="text-sm text-muted-foreground">
                    Digite seu CNPJ e obtenha automaticamente os dados da empresa via BrasilAPI
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg shadow-elevated border">
                  <div className="bg-gradient-safety w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-secondary-foreground font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Análise Inteligente</h3>
                  <p className="text-sm text-muted-foreground">
                    Classificação automática de risco baseada no CNAE e características específicas
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg shadow-elevated border">
                  <div className="bg-gradient-fire w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Relatório Completo</h3>
                  <p className="text-sm text-muted-foreground">
                    Receba orientações detalhadas e próximos passos para adequação normativa
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <CNPJForm onCNPJSubmit={handleCNPJSubmit} />
          </div>
        )}

        {step === 'company-info' && companyData && (
          <CompanyInfo 
            companyData={companyData} 
            onProceed={handleProceedToAnalysis}
            onEdit={handleRestart}
          />
        )}

        {step === 'analysis' && companyData && (
          <RiskAnalysis companyData={companyData} onRestart={handleRestart} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Sistema desenvolvido para auxiliar na análise de conformidade com as normas 
              de segurança contra incêndio e pânico do CBMPE.
            </p>
            <p className="mt-2">
              Para informações oficiais, consulte sempre o site do Corpo de Bombeiros de Pernambuco.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
