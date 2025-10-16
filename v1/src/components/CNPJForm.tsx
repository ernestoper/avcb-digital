import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CNPJFormProps {
  onCNPJSubmit: (cnpjData: any) => void;
}

export const CNPJForm = ({ onCNPJSubmit }: CNPJFormProps) => {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpj(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cnpjNumbers = cnpj.replace(/\D/g, '');
    
    if (cnpjNumbers.length !== 14) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, digite um CNPJ válido com 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjNumbers}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado');
      }

      const data = await response.json();
      
      if (data.erro || !data.razao_social) {
        throw new Error('CNPJ inválido ou não encontrado');
      }

      toast({
        title: "CNPJ consultado com sucesso",
        description: `Empresa: ${data.razao_social}`,
        variant: "default",
      });

      onCNPJSubmit(data);
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CNPJ. Verifique se o número está correto e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-elevated">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-fire p-3 rounded-full">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-fire bg-clip-text text-transparent">
          Análise AVCB - CBMPE
        </CardTitle>
        <p className="text-muted-foreground">
          Consulte seu CNPJ para iniciar a análise de segurança contra incêndio
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cnpj" className="text-sm font-medium">
              CNPJ da Empresa
            </label>
            <Input
              id="cnpj"
              type="text"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={handleCNPJChange}
              maxLength={18}
              disabled={loading}
              className="text-center text-lg tracking-wider"
            />
          </div>
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
            disabled={loading || cnpj.replace(/\D/g, '').length !== 14}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Consultar CNPJ
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};