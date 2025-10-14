// Geração de certificado PDF usando jsPDF
import { CompanyAnalysis } from './database';

export const generateCertificatePDF = (analysis: CompanyAnalysis): void => {
  // Criar conteúdo HTML para impressão
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Por favor, permita pop-ups para gerar o certificado');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Certificado ${analysis.certificado?.numero}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #d32f2f;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #d32f2f;
          margin-bottom: 10px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          margin: 20px 0;
        }
        .certificate-number {
          font-size: 16px;
          color: #666;
          margin: 10px 0;
        }
        .section {
          margin: 20px 0;
          padding: 15px;
          background: #f5f5f5;
          border-left: 4px solid #d32f2f;
        }
        .section-title {
          font-weight: bold;
          font-size: 14px;
          color: #d32f2f;
          margin-bottom: 10px;
        }
        .info-row {
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
        }
        .label {
          font-weight: bold;
          color: #555;
        }
        .value {
          color: #333;
        }
        .risk-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
        }
        .risk-low {
          background: #4caf50;
          color: white;
        }
        .risk-medium {
          background: #ff9800;
          color: white;
        }
        .risk-high {
          background: #f44336;
          color: white;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .signature {
          margin-top: 60px;
          text-align: center;
        }
        .signature-line {
          border-top: 2px solid #333;
          width: 300px;
          margin: 0 auto 10px;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🔥 CBMPE</div>
        <h1>CORPO DE BOMBEIROS MILITAR DE PERNAMBUCO</h1>
        <p>Sistema AVCB Digital</p>
      </div>

      <div class="title">
        ${analysis.certificado?.tipo === 'DDLCB' 
          ? 'DECLARAÇÃO DE DISPENSA DE LICENCIAMENTO DO CORPO DE BOMBEIROS' 
          : analysis.certificado?.tipo === 'AR'
          ? 'ATESTADO DE REGULARIDADE'
          : 'AUTO DE VISTORIA DO CORPO DE BOMBEIROS'}
      </div>

      <div class="certificate-number">
        Certificado Nº: <strong>${analysis.certificado?.numero}</strong>
      </div>

      <div class="section">
        <div class="section-title">DADOS DA EMPRESA</div>
        <div class="info-row">
          <span class="label">Razão Social:</span>
          <span class="value">${analysis.razao_social}</span>
        </div>
        ${analysis.nome_fantasia ? `
        <div class="info-row">
          <span class="label">Nome Fantasia:</span>
          <span class="value">${analysis.nome_fantasia}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="label">CNPJ:</span>
          <span class="value">${analysis.cnpj}</span>
        </div>
        <div class="info-row">
          <span class="label">CNAE:</span>
          <span class="value">${analysis.cnae_fiscal} - ${analysis.cnae_fiscal_descricao}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">ENDEREÇO</div>
        <div class="info-row">
          <span class="value">
            ${analysis.endereco.logradouro}, ${analysis.endereco.numero}
            ${analysis.endereco.complemento ? ` - ${analysis.endereco.complemento}` : ''}
          </span>
        </div>
        <div class="info-row">
          <span class="value">
            ${analysis.endereco.bairro} - ${analysis.endereco.municipio}/${analysis.endereco.uf}
          </span>
        </div>
        <div class="info-row">
          <span class="label">CEP:</span>
          <span class="value">${analysis.endereco.cep}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">CLASSIFICAÇÃO DE RISCO</div>
        <div class="info-row">
          <span class="label">Nível de Risco:</span>
          <span class="risk-badge risk-${analysis.analise.riskLevel}">
            ${analysis.analise.riskLevelLegal}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Pontuação:</span>
          <span class="value">${analysis.analise.riskScore} pontos</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">VALIDADE</div>
        <div class="info-row">
          <span class="label">Data de Emissão:</span>
          <span class="value">${new Date(analysis.certificado?.dataEmissao || '').toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="info-row">
          <span class="label">Validade:</span>
          <span class="value">${new Date(analysis.certificado?.validade || '').toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      ${analysis.observacoes ? `
      <div class="section">
        <div class="section-title">OBSERVAÇÕES</div>
        <p>${analysis.observacoes}</p>
      </div>
      ` : ''}

      <div class="signature">
        <div class="signature-line"></div>
        <p><strong>Corpo de Bombeiros Militar de Pernambuco</strong></p>
        <p>Sistema AVCB Digital</p>
      </div>

      <div class="footer">
        <p>Este documento foi gerado eletronicamente pelo Sistema AVCB Digital do CBMPE.</p>
        <p>Decreto Estadual Nº 52.005/2021, alterado pelo Decreto Nº 58.545/2025</p>
        <p>Norma Técnica NT 1.01/2024 - COSCIP/CBMPE</p>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; cursor: pointer; background: #d32f2f; color: white; border: none; border-radius: 5px;">
          Imprimir / Salvar PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; cursor: pointer; background: #666; color: white; border: none; border-radius: 5px; margin-left: 10px;">
          Fechar
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
