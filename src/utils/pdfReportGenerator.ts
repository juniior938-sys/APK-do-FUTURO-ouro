import { jsPDF } from 'jspdf';
import { AccountInfo, ClosedTrade, Position, ExnessAccountType } from '../types/mt5';
import { EXNESS_ACCOUNT_SPECS, formatUsd, formatGoldPrice } from './goldMath';

export interface PDFReportData {
  account: AccountInfo;
  accountType: ExnessAccountType;
  closedTrades: ClosedTrade[];
  positions: Position[];
  currentPrice: number;
  dateStr?: string;
}

export function generateHFTDailyPdf(data: PDFReportData): jsPDF {
  const { account, accountType, closedTrades, positions, currentPrice } = data;
  const spec = EXNESS_ACCOUNT_SPECS[accountType || account.accountType || 'raw_spread'];
  const isCent = spec.isCentAccount;

  // Metrics calculation
  const totalClosed = closedTrades.length;
  const winningTrades = closedTrades.filter((t) => t.profit > 0);
  const losingTrades = closedTrades.filter((t) => t.profit < 0);
  const winRate = totalClosed > 0 ? (winningTrades.length / totalClosed) * 100 : 0;

  const totalVolumeLots = closedTrades.reduce((acc, t) => acc + t.volume, 0) +
    positions.reduce((acc, p) => acc + p.volume, 0);

  const netRealizedPnL = closedTrades.reduce((acc, t) => acc + t.profit, 0);
  const grossProfit = winningTrades.reduce((acc, t) => acc + t.profit, 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.profit, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 1.0;
  const totalCommission = closedTrades.reduce(
    (acc, t) => acc + (t.commission !== undefined ? t.commission : spec.commissionPerLotUsd * t.volume),
    0
  );

  const bestTrade = closedTrades.reduce((best, t) => (t.profit > (best?.profit ?? -Infinity) ? t : best), closedTrades[0]);
  const worstTrade = closedTrades.reduce((worst, t) => (t.profit < (worst?.profit ?? Infinity) ? t : worst), closedTrades[0]);

  // Create jsPDF instance (A4 portrait: 210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // ===========================================================================
  // 1. HEADER BANNER (Financial Institutional Dark Theme)
  // ===========================================================================
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Top accent line (amber gold)
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EXNESS.COM · MT5 XAUUSD HFT PERFORMANCE REPORT', margin, 14);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Relatório Diário de Microestrutura, Algoritmo HFT & Execução de Trades no Ouro', margin, 20);

  // Generation timestamp & server info
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  const reportDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const reportTime = new Date().toLocaleTimeString('pt-BR');
  doc.text(`Data do Relatório: ${reportDate} às ${reportTime} · Fuso: UTC-3 / Local`, margin, 26);
  doc.text(`Corretora: ${account.broker || 'Exness'} · Servidor: ${account.server} · Login MT5: ${account.login}`, margin, 31);

  // ===========================================================================
  // 2. ACCOUNT SPECIFICATIONS & METADATA BAR
  // ===========================================================================
  let curY = 44;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, curY, contentWidth, 18, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'bold');
  doc.text(`PERFIL DE CONTA: ${spec.name.toUpperCase()}`, margin + 4, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Símbolo: ${spec.symbol}`, margin + 4, curY + 12);
  doc.text(`Spread Típico: ${spec.typicalSpreadPips.toFixed(1)} pips`, margin + 42, curY + 12);
  doc.text(`Comissão: $${spec.commissionPerLotUsd.toFixed(2)}/lote`, margin + 88, curY + 12);
  doc.text(`Alavancagem: 1:${account.leverage || 500}`, margin + 132, curY + 12);
  doc.text(`Preço Atual XAUUSD: $${formatGoldPrice(currentPrice)}`, margin + 88, curY + 6);
  doc.text(`Tamanho Contrato: ${spec.contractSizeOz} oz/lote`, margin + 132, curY + 6);

  // ===========================================================================
  // 3. EXECUTIVE KPI CARDS (2 rows x 4 columns)
  // ===========================================================================
  curY = 67;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RESUMO EXECUTIVO DO DIA (24 HORAS)', margin, curY);

  curY += 4;
  const cardW = (contentWidth - 9) / 4;
  const cardH = 17;

  interface KpiCard {
    label: string;
    value: string;
    sub: string;
    color?: [number, number, number];
  }

  const kpiRow1: KpiCard[] = [
    {
      label: 'TOTAL DE TRADES',
      value: `${totalClosed} trades`,
      sub: `${winningTrades.length} vitórias / ${losingTrades.length} derrotas`,
    },
    {
      label: 'TAXA DE ACERTO (WIN RATE)',
      value: `${winRate.toFixed(1)}%`,
      sub: `Meta HFT: > 70%`,
      color: winRate >= 70 ? [22, 101, 52] : [180, 83, 9],
    },
    {
      label: 'VOLUME TOTAL NEGOCIADO',
      value: `${totalVolumeLots.toFixed(2)} Lotes`,
      sub: isCent ? `${(totalVolumeLots * 100).toFixed(0)} oz troy (Cent)` : `${(totalVolumeLots * 100).toFixed(0)} oz troy ouro`,
    },
    {
      label: 'LUCRO LÍQUIDO REALIZADO',
      value: formatUsd(netRealizedPnL, true),
      sub: `Bruto: ${formatUsd(grossProfit)}`,
      color: netRealizedPnL >= 0 ? [22, 101, 52] : [185, 28, 28],
    },
  ];

  const kpiRow2: KpiCard[] = [
    {
      label: 'LUCRO FLUTUANTE (OPEN)',
      value: formatUsd(account.floatingProfit, true),
      sub: `${positions.length} posições ativas`,
      color: account.floatingProfit >= 0 ? [22, 101, 52] : [185, 28, 28],
    },
    {
      label: 'FATOR DE LUCRO (PF)',
      value: profitFactor >= 99 ? 'Infinito' : profitFactor.toFixed(2),
      sub: `Perda Bruta: -$${grossLoss.toFixed(2)}`,
    },
    {
      label: 'TOTAL COMISSÕES EXNESS',
      value: `-$${totalCommission.toFixed(2)} USD`,
      sub: `Dedução direta no PnL`,
    },
    {
      label: 'SALDO & PATRIMÔNIO',
      value: formatUsd(account.equity),
      sub: `Saldo Inicial: ${formatUsd(account.balance - netRealizedPnL)}`,
    },
  ];

  const renderKpiRow = (cards: KpiCard[], yPos: number) => {
    cards.forEach((c, idx) => {
      const x = margin + idx * (cardW + 3);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, yPos, cardW, cardH, 1.5, 1.5, 'FD');

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, x + 3, yPos + 4.5);

      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      if (c.color) {
        doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      } else {
        doc.setTextColor(15, 23, 42);
      }
      doc.text(c.value, x + 3, yPos + 10.5);

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(c.sub, x + 3, yPos + 15);
    });
  };

  renderKpiRow(kpiRow1, curY);
  curY += cardH + 3;
  renderKpiRow(kpiRow2, curY);
  curY += cardH + 7;

  // ===========================================================================
  // 4. MICROSTRUCTURE & RISK PARAMETERS AUDIT
  // ===========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('AUDITORIA DE MICROESTRUTURA & GESTÃO DE RISCO', margin, curY);

  curY += 4;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, curY, contentWidth, 14, 1.5, 1.5, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`• Algoritmo Avellaneda-Stoikov: Cotação bid/ask adaptativa com cálculo em tempo real de assimetria de estoque.`, margin + 4, curY + 4.5);
  doc.text(`• Bateria de 7 Julgamentos Jev: Filtragem de fluxo tóxico (Toxic Flow < 0.60) e desativação instantânea em picos de volatilidade extrema.`, margin + 4, curY + 8.5);
  doc.text(`• Melhor Trade: Ticket #${bestTrade?.ticket || '—'} (${bestTrade ? formatUsd(bestTrade.profit, true) : '—'})  |  Pior Trade: Ticket #${worstTrade?.ticket || '—'} (${worstTrade ? formatUsd(worstTrade.profit, true) : '—'})`, margin + 4, curY + 12.5);

  curY += 19;

  // ===========================================================================
  // 5. DETAILED TRADES LEDGER TABLE
  // ===========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('REGISTRO DETALHADO DE ORDENS HFT (ÚLTIMAS 24 HORAS)', margin, curY);

  curY += 4;

  // Table header
  const colX = {
    ticket: margin + 2,
    time: margin + 20,
    type: margin + 46,
    volume: margin + 68,
    open: margin + 86,
    close: margin + 110,
    pips: margin + 134,
    pnl: margin + 152,
    reason: margin + 172,
  };

  const headerHeight = 6;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, curY, contentWidth, headerHeight, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Ticket', colX.ticket, curY + 4.2);
  doc.text('Horário', colX.time, curY + 4.2);
  doc.text('Tipo', colX.type, curY + 4.2);
  doc.text('Lotes', colX.volume, curY + 4.2);
  doc.text('Entrada', colX.open, curY + 4.2);
  doc.text('Saída', colX.close, curY + 4.2);
  doc.text('Pips', colX.pips, curY + 4.2);
  doc.text('PnL Líquido', colX.pnl, curY + 4.2);
  doc.text('Motivo', colX.reason, curY + 4.2);

  curY += headerHeight;

  // Render trade rows (up to 24 rows on page 1, then create page 2 if needed)
  const maxRowsPage1 = 20;
  const rowsToRender = closedTrades.slice(0, 40);

  rowsToRender.forEach((t, idx) => {
    // Check if new page needed
    if (curY > pageHeight - 24) {
      doc.addPage();
      curY = 16;
      // Re-print table header on page 2
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, curY, contentWidth, headerHeight, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Ticket', colX.ticket, curY + 4.2);
      doc.text('Horário', colX.time, curY + 4.2);
      doc.text('Tipo', colX.type, curY + 4.2);
      doc.text('Lotes', colX.volume, curY + 4.2);
      doc.text('Entrada', colX.open, curY + 4.2);
      doc.text('Saída', colX.close, curY + 4.2);
      doc.text('Pips', colX.pips, curY + 4.2);
      doc.text('PnL Líquido', colX.pnl, curY + 4.2);
      doc.text('Motivo', colX.reason, curY + 4.2);
      curY += headerHeight;
    }

    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, curY, contentWidth, 5.5, 'F');

    doc.setFontSize(6.8);
    doc.setFont('courier', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`#${t.ticket}`, colX.ticket, curY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.text(t.closeTime || '—', colX.time, curY + 3.8);

    // Type badge
    if (t.type === 'BUY') {
      doc.setTextColor(22, 101, 52);
      doc.text('COMPRA (BUY)', colX.type, curY + 3.8);
    } else {
      doc.setTextColor(185, 28, 28);
      doc.text('VENDA (SELL)', colX.type, curY + 3.8);
    }

    doc.setTextColor(51, 65, 85);
    doc.text(`${t.volume.toFixed(2)}L`, colX.volume, curY + 3.8);
    doc.text(t.openPrice.toFixed(2), colX.open, curY + 3.8);
    doc.text(t.closePrice.toFixed(2), colX.close, curY + 3.8);
    doc.text(`${(t.pips || 0) >= 0 ? '+' : ''}${(t.pips || 0).toFixed(1)}p`, colX.pips, curY + 3.8);

    // PnL in bold green or red
    doc.setFont('helvetica', 'bold');
    if (t.profit >= 0) {
      doc.setTextColor(22, 101, 52);
      doc.text(`+${formatUsd(t.profit)}`, colX.pnl, curY + 3.8);
    } else {
      doc.setTextColor(185, 28, 28);
      doc.text(formatUsd(t.profit), colX.pnl, curY + 3.8);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(t.reason || 'MANUAL', colX.reason, curY + 3.8);

    curY += 5.5;
  });

  // Bottom border of table
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, curY, margin + contentWidth, curY);

  // ===========================================================================
  // 6. FOOTER DISCLAIMER & CERTIFICATION
  // ===========================================================================
  const footerY = pageHeight - 14;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Relatório gerado automaticamente pelo terminal MT5 XAUUSD Web HFT Engine · Certificado de execução para Exness.com',
    margin,
    footerY
  );
  doc.text(
    'Ouro (XAUUSD) é um ativo de alta volatilidade. Spreads e derrapagens (slippage) podem variar durante notícias de alto impacto (NFP, CPI, FOMC).',
    margin,
    footerY + 4
  );

  return doc;
}
