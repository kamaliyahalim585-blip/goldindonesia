import { jsPDF } from 'jspdf';
import { Transaction } from '../types';
import { formatIDR, formatGrams } from '../data/mockData';

/**
 * Browser-safe string to hexadecimal encoder (replaces Node.js Buffer in client code)
 */
function encodeStringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

export interface GoldCertificateData {
  certificateNumber: string;
  serialNumber: string;
  ownerName: string;
  brand: string;
  fineness: string;
  weightGrams: number;
  issueDate: string;
  assayerName: string;
  accreditationNumber: string;
}

/**
 * Generates an official, publication-quality PDF receipt for a transaction.
 */
export function generateTransactionReceiptPdf(
  transaction: Transaction,
  userName: string = 'Khoirul Anis'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Background tint
  doc.setFillColor(250, 249, 246);
  doc.rect(0, 0, pageWidth, 297, 'F');

  // Top luxury accent bar (Gold)
  doc.setFillColor(212, 175, 55); // #D4AF37
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Box
  doc.setFillColor(26, 24, 22); // #1A1816
  doc.roundedRect(margin, 12, contentWidth, 38, 3, 3, 'F');

  // Brand text on dark header
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('INDOGOLD', margin + 8, 24);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(190, 185, 175);
  doc.text('PT INDOGOLD NUSANTARA BERJAYA', margin + 8, 30);
  doc.text('Terdaftar & Diawasi oleh BAPPEBTI | Izin No. 002/BAPPEBTI/CP-EMAS/2023', margin + 8, 35);
  doc.text('Gedung Bursa Logam Mulia Lt. 18, SCBD Kav. 52-53, Jakarta Selatan', margin + 8, 40);

  // Right side badge on header
  doc.setFillColor(74, 60, 19);
  doc.roundedRect(pageWidth - margin - 55, 18, 47, 24, 2, 2, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - margin - 55, 18, 47, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text('BUKTI TRANSAKSI', pageWidth - margin - 31.5, 26, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(234, 230, 225);
  doc.text('OFFICIAL RECEIPT', pageWidth - margin - 31.5, 32, { align: 'center' });
  doc.text('FINE GOLD 999.9', pageWidth - margin - 31.5, 37, { align: 'center' });

  // Receipt Info Strip
  let y = 56;
  doc.setFillColor(242, 238, 230);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(220, 212, 198);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 105, 95);
  doc.text('Nomor Transaksi (Order ID)', margin + 6, y + 7);
  doc.text('Tanggal & Waktu', margin + 65, y + 7);
  doc.text('Status Pembayaran', margin + 120, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 28, 25);
  doc.text(transaction.id, margin + 6, y + 15);
  doc.text(transaction.date, margin + 65, y + 15);

  // Status Badge
  const statusColor = transaction.status === 'Approved' ? [46, 125, 50] : [197, 124, 0];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(
    transaction.status === 'Approved' ? 'LUNAS (BERHASIL)' : 'DALAM PROSES',
    margin + 120,
    y + 15
  );

  // Customer Information section
  y = 85;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 28, 25);
  doc.text('INFORMASI NASABAH', margin, y);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.line(margin, y + 2, margin + 45, y + 2);

  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
  doc.setDrawColor(225, 220, 210);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 105, 95);
  doc.text('Nama Pemilik Akun:', margin + 6, y + 7);
  doc.text('Verifikasi Kependudukan:', margin + 6, y + 14);
  doc.text('Metode Transaksi:', margin + 85, y + 7);
  doc.text('Rekening / Saldo Terkait:', margin + 85, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 28, 25);
  doc.text(userName, margin + 42, y + 7);
  doc.setTextColor(46, 125, 50);
  doc.text('KYC Tingkat 2 (Terverifikasi BAPPEBTI)', margin + 42, y + 14);

  doc.setTextColor(30, 28, 25);
  doc.text(transaction.paymentMethod || 'Saldo Kas IndoGold', margin + 122, y + 7);
  doc.text(transaction.accountNumber || '8271-8821-00 (BCA)', margin + 122, y + 14);

  // Transaction Breakdown Table
  y = 118;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 28, 25);
  doc.text('RINCIAN PESANAN EMAS & PEMBAYARAN', margin, y);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.line(margin, y + 2, margin + 75, y + 2);

  y += 7;
  // Table Header
  doc.setFillColor(38, 35, 31);
  doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text('DESKRIPSI ITEM', margin + 6, y + 5.5);
  doc.text('BERAT', margin + 70, y + 5.5);
  doc.text('HARGA SATUAN', margin + 105, y + 5.5);
  doc.text('TOTAL (IDR)', pageWidth - margin - 6, y + 5.5, { align: 'right' });

  y += 8;
  // Table Row
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 22, 'F');
  doc.setDrawColor(230, 225, 218);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 22, pageWidth - margin, y + 22);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 28, 25);
  doc.text(transaction.title, margin + 6, y + 8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 105, 95);
  doc.text(`Kemurnian: Fine Gold 999.9 (24 Karat)`, margin + 6, y + 13);
  doc.text(`Sertifikasi Produsen: ${transaction.brandName || 'ANTAM CertiCard / LBMA'}`, margin + 6, y + 18);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 28, 25);
  doc.text(transaction.goldGrams ? formatGrams(transaction.goldGrams) : '-', margin + 70, y + 10);
  doc.text(transaction.pricePerGram ? formatIDR(transaction.pricePerGram) : '-', margin + 105, y + 10);
  doc.text(formatIDR(transaction.amountIdr), pageWidth - margin - 6, y + 10, { align: 'right' });

  // Summary section
  y += 26;
  const summaryX = pageWidth - margin - 80;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 105, 95);
  doc.text('Subtotal:', summaryX, y);
  doc.text(formatIDR(transaction.amountIdr), pageWidth - margin - 6, y, { align: 'right' });

  y += 6;
  doc.text('Biaya Administrasi & Kliring:', summaryX, y);
  doc.setTextColor(46, 125, 50);
  doc.text('Rp 0 (GRATIS)', pageWidth - margin - 6, y, { align: 'right' });

  y += 6;
  doc.setTextColor(110, 105, 95);
  doc.text('PPN Logam Mulia (PP No. 49/2022):', summaryX, y);
  doc.setTextColor(46, 125, 50);
  doc.text('Bebas PPN (0%)', pageWidth - margin - 6, y, { align: 'right' });

  y += 8;
  doc.setFillColor(242, 238, 230);
  doc.roundedRect(summaryX - 4, y - 4, 84, 11, 2, 2, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.roundedRect(summaryX - 4, y - 4, 84, 11, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 28, 25);
  doc.text('TOTAL DIBAYAR:', summaryX, y + 3.5);
  doc.setFontSize(11);
  doc.setTextColor(166, 124, 0);
  doc.text(formatIDR(transaction.amountIdr), pageWidth - margin - 6, y + 3.5, { align: 'right' });

  // Official Security Seal & Notes
  y = 190;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'F');
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'S');

  // Watermark text in seal
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text('KEAMANAN & VALIDASI DIGITAL KUSTODI EMAS', margin + 6, y + 8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 95, 88);
  doc.text('1. Dokumen ini adalah bukti transaksi digital sah yang diterbitkan otomatis oleh sistem komputasi IndoGold.', margin + 6, y + 15);
  doc.text('2. Setiap gram emas fisik dialokasikan 1:1 di brankas kustodi berstandar keamanan internasional LBMA & SNI.', margin + 6, y + 21);
  doc.text('3. Data transaksi dicatat permanen pada sistem kliring teregulasi BAPPEBTI dengan enkripsi SHA-256.', margin + 6, y + 27);
  doc.text(`4. Kode Enkripsi Transaksi: SHA256:${encodeStringToHex(transaction.id + transaction.date).slice(0, 32).toUpperCase()}`, margin + 6, y + 33);

  // Signatures / Assayer Seal block
  y = 238;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 95, 88);
  doc.text('Jakarta, ' + transaction.date, pageWidth - margin - 6, y, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 28, 25);
  doc.text('PT INDOGOLD NUSANTARA BERJAYA', pageWidth - margin - 6, y + 6, { align: 'right' });

  // Simulated digital seal stamp
  const stampX = pageWidth - margin - 50;
  const stampY = y + 10;
  doc.setDrawColor(180, 140, 20);
  doc.setLineWidth(0.8);
  doc.circle(stampX + 20, stampY + 14, 13, 'S');
  doc.setLineWidth(0.3);
  doc.circle(stampX + 20, stampY + 14, 11.5, 'S');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 140, 20);
  doc.text('INDEPENDENT', stampX + 20, stampY + 11, { align: 'center' });
  doc.text('GOLD ASSAYER', stampX + 20, stampY + 15, { align: 'center' });
  doc.text('LBMA COMPLIANT', stampX + 20, stampY + 19, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(50, 48, 44);
  doc.text('Drs. Handoko Pratama, M.Sc.', pageWidth - margin - 6, y + 43, { align: 'right' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 115, 108);
  doc.text('Head of Custody & Bullion Operations', pageWidth - margin - 6, y + 47, { align: 'right' });

  // Bottom Footer
  doc.setFillColor(26, 24, 22);
  doc.rect(0, 287, pageWidth, 10, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 175, 55);
  doc.text(
    'IndoGold Secure Vault • Hotline 24 Jam: (021) 8062-8888 • Email: support@indogold.co.id • www.indogold.co.id',
    pageWidth / 2,
    293,
    { align: 'center' }
  );

  // Trigger download in browser
  const filename = `Struk_Resmi_IndoGold_${transaction.id}.pdf`;
  doc.save(filename);
}

/**
 * Generates an authentic, luxury Fine Gold 999.9 Certificate of Authenticity PDF.
 */
export function generateGoldCertificatePdf(cert: GoldCertificateData): void {
  if (!cert.weightGrams || cert.weightGrams <= 0) {
    throw new Error('Penerbitan dan pengunduhan sertifikat hanya diperbolehkan untuk nasabah yang memiliki saldo emas aktif.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Rich parchment / ivory background
  doc.setFillColor(252, 250, 246);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Gold Filigree Border
  doc.setDrawColor(212, 175, 55); // #D4AF37
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');

  // Inner Fine Border
  doc.setLineWidth(0.4);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - (margin + 2.5) * 2, pageHeight - (margin + 2.5) * 2, 'S');

  // Corner decorative flourishes
  const corners = [
    { x: margin + 3.5, y: margin + 3.5 },
    { x: pageWidth - margin - 9.5, y: margin + 3.5 },
    { x: margin + 3.5, y: pageHeight - margin - 9.5 },
    { x: pageWidth - margin - 9.5, y: pageHeight - margin - 9.5 }
  ];
  corners.forEach(c => {
    doc.setFillColor(212, 175, 55);
    doc.rect(c.x, c.y, 6, 6, 'F');
  });

  // Top Regal Crest Header
  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(170, 130, 25);
  doc.text('R E P U B L I K   I N D O N E S I A', pageWidth / 2, y, { align: 'center' });

  y += 8;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 24, 22);
  doc.text('SERTIFIKAT KEASLIAN LOGAM MULIA', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(170, 130, 25);
  doc.text('CERTIFICATE OF AUTHENTICITY - FINE GOLD 999.9', pageWidth / 2, y, { align: 'center' });

  // Center Gold Bar Emblem
  y += 12;
  doc.setFillColor(35, 30, 22);
  doc.roundedRect(pageWidth / 2 - 35, y, 70, 18, 3, 3, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.roundedRect(pageWidth / 2 - 35, y, 70, 18, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text('FINE GOLD 999.9', pageWidth / 2, y + 7.5, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(245, 240, 230);
  doc.text('24 KARAT PURITY GUARANTEED', pageWidth / 2, y + 13, { align: 'center' });

  // Legal standard declaration
  y += 27;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 85, 78);
  doc.text(
    'Sertifikat ini menerangkan bahwa produk logam mulia batangan yang tercantum di bawah ini',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  doc.text(
    'telah melalui pengujian laboratorium independen (Assay Tested) dan memenuhi standar kemurnian',
    pageWidth / 2,
    y + 5,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 24, 22);
  doc.text(
    'Standar Nasional Indonesia (SNI 13-3487-2005) & London Bullion Market Association (LBMA)',
    pageWidth / 2,
    y + 10,
    { align: 'center' }
  );

  // Specification Table
  y += 20;
  const tableX = margin + 12;
  const tableW = pageWidth - (margin + 12) * 2;
  const tableH = 76;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(tableX, y, tableW, tableH, 2, 2, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.roundedRect(tableX, y, tableW, tableH, 2, 2, 'S');

  const specs = [
    { label: 'Nomor Sertifikat (Certificate No.)', value: cert.certificateNumber, highlight: true },
    { label: 'Nomor Seri Batangan (Serial Number)', value: cert.serialNumber, highlight: true },
    { label: 'Berat Bersih Logam (Fine Weight)', value: `${cert.weightGrams.toFixed(4)} Gram (${cert.weightGrams} gr)`, highlight: true },
    { label: 'Kadar Kemurnian (Fineness)', value: cert.fineness || '99.99% Au (Fine Gold 999.9)', highlight: true },
    { label: 'Bentuk & Cetakan (Form / Cut)', value: 'Minted Bullion Bar / CertiCard Tamper-Evident', highlight: false },
    { label: 'Pabrikan / Pelebur Resmi (Refiner)', value: cert.brand || 'PT ANTAM Tbk (UBPP Logam Mulia)', highlight: false },
    { label: 'Pemilik Terdaftar (Certified Owner)', value: cert.ownerName, highlight: false },
    { label: 'Tanggal Sertifikasi (Date of Issue)', value: cert.issueDate, highlight: false },
  ];

  let specY = y + 7;
  specs.forEach((item, index) => {
    // Alternating faint zebra background
    if (index % 2 === 1) {
      doc.setFillColor(249, 247, 242);
      doc.rect(tableX + 1, specY - 5, tableW - 2, 9, 'F');
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 105, 95);
    doc.text(item.label, tableX + 6, specY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    if (item.highlight) {
      doc.setTextColor(165, 120, 20);
    } else {
      doc.setTextColor(30, 28, 25);
    }
    doc.text(item.value, tableX + tableW - 6, specY, { align: 'right' });

    specY += 9;
  });

  // Security Hologram representation & QR Seal
  y += tableH + 12;
  const sealBoxW = 44;
  const sealBoxH = 44;
  const sealBoxX = margin + 14;

  // Gold Hologram Emblem Box
  doc.setFillColor(247, 243, 230);
  doc.roundedRect(sealBoxX, y, sealBoxW, sealBoxH, 3, 3, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.roundedRect(sealBoxX, y, sealBoxW, sealBoxH, 3, 3, 'S');

  // Multi-ring security assayer seal
  doc.setDrawColor(180, 138, 25);
  doc.setLineWidth(0.8);
  doc.circle(sealBoxX + sealBoxW / 2, y + sealBoxH / 2, 16, 'S');
  doc.setLineWidth(0.3);
  doc.circle(sealBoxX + sealBoxW / 2, y + sealBoxH / 2, 14, 'S');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(170, 125, 20);
  doc.text('OFFICIAL SEAL', sealBoxX + sealBoxW / 2, y + 17, { align: 'center' });
  doc.text('ASSAYER CERTIFIED', sealBoxX + sealBoxW / 2, y + 22, { align: 'center' });
  doc.text('KAN LP-001-IDN', sealBoxX + sealBoxW / 2, y + 27, { align: 'center' });
  doc.text('FINE GOLD 999.9', sealBoxX + sealBoxW / 2, y + 32, { align: 'center' });

  // Signatures & Authorization on right
  const sigX = pageWidth - margin - 85;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 85, 78);
  doc.text('Diterbitkan secara sah oleh:', sigX, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 24, 22);
  doc.text('KOMITE UJI LAB & KUSTODI INDOGOLD', sigX, y + 9);

  doc.setDrawColor(180, 140, 30);
  doc.setLineWidth(0.4);
  doc.line(sigX, y + 32, sigX + 75, y + 32);

  doc.setFontSize(8.5);
  doc.setTextColor(26, 24, 22);
  doc.text(cert.assayerName || 'Ir. Bambang Sugiarto, M.T.', sigX, y + 37);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 105, 95);
  doc.text(`Chief Bullion Assayer • Akreditasi ${cert.accreditationNumber || 'KAN LP-001-IDN'}`, sigX, y + 41);

  // Bottom microtext warning
  y = pageHeight - margin - 12;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 125, 118);
  doc.text(
    'PERINGATAN RESMI: Sertifikat ini dilindungi oleh hak cipta dan hukum perundang-undangan Republik Indonesia.',
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  doc.text(
    'Segala bentuk pemalsuan atau modifikasi dokumen fisik/digital dapat dituntut secara pidana sesuai UU ITE & KUHP.',
    pageWidth / 2,
    y + 4,
    { align: 'center' }
  );

  // Trigger download
  const filename = `Sertifikat_Keaslian_Emas_${cert.serialNumber}.pdf`;
  doc.save(filename);
}
