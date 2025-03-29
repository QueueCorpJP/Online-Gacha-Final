import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { GachaItem } from '../gacha/entities/gacha-item.entity';
import { InventorySettings } from '../inventory/inventory-settings.entity';
import * as PDFDocument from 'pdfkit';
import * as csv from 'fast-csv';

interface ExportResult {
  data: string | Buffer;
  filename: string;
}

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(GachaItem)
    private gachaItemRepository: Repository<GachaItem>,
    @InjectRepository(InventorySettings)
    private settingsRepository: Repository<InventorySettings>,
  ) { }

  async getReportData(type: string) {
    switch (type) {
      case 'sales':
        return this.getSalesReport();
      case 'users':
        return this.getUsersReport();
      case 'inventory':
        return this.getInventoryReport();
      default:
        throw new Error('Invalid report type');
    }
  }

  private async getSalesReport() {
    const sales = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('DATE(payment."createdAt")', 'name')
      .addSelect('SUM(payment.amount)', 'sales')
      .addSelect('COUNT(DISTINCT payment.userId)', 'users')
      .where('payment.status = :status', { status: 'success' })
      .groupBy('DATE(payment."createdAt")')
      .orderBy('DATE(payment."createdAt")', 'DESC')
      .limit(10)
      .getRawMany();

    return sales.reverse();
  }

  private async getUsersReport() {
    return this.userRepository
      .createQueryBuilder('users')
      .select(`DATE(users."createdAt"::timestamp)`, 'name')
      .addSelect('COUNT(*)', 'total')
      .addSelect(`COUNT(CASE WHEN users.status = 'ACTIVE' THEN 1 END)`, 'Active')
      .addSelect(`COUNT(CASE WHEN users.status = 'SUSPENDED' THEN 1 END)`, 'Suspended')
      .addSelect(`COUNT(CASE WHEN users.status = 'BANNED' THEN 1 END)`, 'Banned')
      .groupBy(`DATE(users."createdAt"::timestamp)`)
      .orderBy(`DATE(users."createdAt"::timestamp)`, 'DESC')
      .limit(10)
      .getRawMany();
  }

  private async getInventoryReport() {
    const settings = await this.settingsRepository.findOne({
      where: {} // get the first record
    });
    const globalThreshold = settings?.globalThreshold || 10;

    const inventory = await this.gachaItemRepository
      .createQueryBuilder('item')
      .select('DATE(item."updatedAt")', 'name')
      .addSelect('SUM(item.stock)', 'total')
      .addSelect(
        `COUNT(CASE WHEN item.stock < :threshold THEN 1 END)`,
        'lowStock'
      )
      .addSelect(
        `COUNT(CASE WHEN item.stock >= :threshold THEN 1 END)`,
        'normalStock'
      )
      .addSelect('COUNT(*)', 'itemCount')
      .setParameter('threshold', globalThreshold)
      .groupBy('DATE(item."updatedAt")')
      .orderBy('DATE(item."updatedAt")', 'DESC')
      .limit(10)
      .getRawMany();

    return inventory.reverse();
  }

  async exportReport(type: string, format: string): Promise<ExportResult> {
    const data = await this.getReportData(type);
    
    // Transform the data to rename 'name' to 'date'
    const transformedData = data.map(item => {
      const { name, ...rest } = item;
      return {
        date: name,
        ...rest
      };
    });

    if (format === 'csv') {
      return this.generateCSV(transformedData, type) as Promise<ExportResult>;
    } else {
      return this.generatePDF(transformedData, type) as Promise<ExportResult>;
    }
  }

  private async generateCSV(data: any[], type: string): Promise<ExportResult> {
    const csvData = await new Promise<string>((resolve, reject) => {
      csv.writeToString(data, { headers: true })
        .then((data: string) => resolve(data))
        .catch((error: Error) => reject(error));
    });

    return {
      data: csvData,
      filename: `report-${type}-${new Date().toISOString()}.csv`
    };
  }

  private async generatePDF(data: any[], type: string): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        margin: 50,
        layout: 'landscape'  // Set landscape orientation
      });
      const chunks: any[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        resolve({
          data: Buffer.concat(chunks),
          filename: `report-${type}-${new Date().toISOString()}.pdf`
        });
      });
      doc.on('error', reject);

      // Add title
      doc.fontSize(20)
         .text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, {
           align: 'center',
           underline: true
         });
      doc.moveDown(2);

      // Add timestamp
      doc.fontSize(12)
         .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown(2);

      // Add table
      const headers = Object.keys(data[0]);
      const rowSpacing = 20;
      let yPosition = doc.y;

      // Draw headers
      headers.forEach((header, i) => {
        const xPosition = 50 + (i * (doc.page.width - 100) / headers.length);
        doc.fontSize(12)
           .text(header.toUpperCase(), xPosition, yPosition, {
             width: (doc.page.width - 100) / headers.length,
             align: 'center'
           });
      });

      // Draw horizontal line
      yPosition += rowSpacing;
      doc.moveTo(50, yPosition)
         .lineTo(doc.page.width - 50, yPosition)
         .stroke();

      // Draw data rows
      data.forEach((row, rowIndex) => {
        yPosition += rowSpacing;

        // Check if we need a new page
        if (yPosition > doc.page.height - 50) {
          doc.addPage();
          yPosition = 50;
        }

        headers.forEach((header, i) => {
          const xPosition = 50 + (i * (doc.page.width - 100) / headers.length);
          doc.fontSize(10)
             .text(String(row[header]), xPosition, yPosition, {
               width: (doc.page.width - 100) / headers.length,
               align: 'center'
             });
        });
      });

      doc.end();
    });
  }
}

