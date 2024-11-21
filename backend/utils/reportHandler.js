const {supabase} = require("../config/db");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const csv = require('fast-csv');

class TransactionReporter {

  constructor() {
    this.supabase = supabase
  }

  /**
   * Fetch a single transaction by ID
   * @param {UUID} transactionId 
   * @returns {Promise<Object>} Detailed transaction
   */

  async getTransactionById(transactionId) {
    const { data, error } = await this.supabase
      .rpc('get_transaction', { p_transactionid: transactionId });

    if (error) throw error;
    return data[0]; // Assuming the function returns a single transaction
  }

  /**
   * Fetch transactions with advanced filtering
   * @param {Object} options - Query parameters
   * @returns {Promise<Object>} Transactions and metadata
   */

  async fetchTransactions(options = {}) {
    const { 
      startTimestamp, 
      endTimestamp, 
      type, 
      originUserId,
      destinationUserId,
      tags,
      pagination = { page: 1, pageSize: 100 }
    } = options;

    // Construct query using Supabase RPC or direct table query
    let query = this.supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    // Apply filters
    if (startTimestamp) {
      query = query.gte('timestamp', startTimestamp);
    }
    if (endTimestamp) {
      query = query.lte('timestamp', endTimestamp);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (originUserId) {
      query = query.eq('originUserId', originUserId);
    }
    if (destinationUserId) {
      query = query.eq('destinationUserId', destinationUserId);
    }
    if (tags) {
      // Assuming tags is a JSONB column and you want to filter by specific tags
      query = query.contains('tags', tags);
    }

    // Pagination
    query = query
      .range(
        (pagination.page - 1) * pagination.pageSize, 
        pagination.page * pagination.pageSize - 1
      )
      .order('timestamp', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      transactions: data,
      total: count,
      page: pagination.page,
      pageSize: pagination.pageSize
    };
  }

  /**
   * Generate comprehensive transaction summary
   * @param {Array} transactions - List of transactions
   * @returns {Object} Detailed summary
   */

  generateSummary(transactions) {

    const summary = {
      totalTransactions: transactions.length,
      transactionTypes: {},
      amountSummary: {
        total: {
          origin: 0,
          destination: 0
        },
        byType: {}
      },
      userActivity: {
        uniqueOriginUsers: new Set(),
        uniqueDestinationUsers: new Set()
      },
      promotionUsage: {
        total: 0,
        byType: {}
      },
      tagAnalysis: {}
    };

    transactions.forEach(tx => {
      // Transaction type breakdown
      summary.transactionTypes[tx.type] = 
        (summary.transactionTypes[tx.type] || 0) + 1;

      // Amount summary
      const originAmount = this.extractAmount(tx.originAmountDetails);
      const destinationAmount = this.extractAmount(tx.destinationAmountDetails);
      
      summary.amountSummary.total.origin += originAmount;
      summary.amountSummary.total.destination += destinationAmount;
      
      summary.amountSummary.byType[tx.type] = {
        origin: (summary.amountSummary.byType[tx.type]?.origin || 0) + originAmount,
        destination: (summary.amountSummary.byType[tx.type]?.destination || 0) + destinationAmount
      };

      // User activity
      summary.userActivity.uniqueOriginUsers.add(tx.originUserId);
      summary.userActivity.uniqueDestinationUsers.add(tx.destinationUserId);

      // Promotion usage
      if (tx.promotionCodeUsed) {
        summary.promotionUsage.total++;
        summary.promotionUsage.byType[tx.type] = 
          (summary.promotionUsage.byType[tx.type] || 0) + 1;
      }

      // Tag analysis
      if (tx.tags) {
        Object.keys(tx.tags).forEach(tag => {
          summary.tagAnalysis[tag] = 
            (summary.tagAnalysis[tag] || 0) + 1;
        });
      }
    });

    // Convert sets to arrays
    summary.userActivity.uniqueOriginUsers = 
      Array.from(summary.userActivity.uniqueOriginUsers);
    summary.userActivity.uniqueDestinationUsers = 
      Array.from(summary.userActivity.uniqueDestinationUsers);

    return summary;
  }

  /**
   * Extract amount from potentially complex amount details
   * @param {JSONB} amountDetails 
   * @returns {number} Extracted amount
   */

  extractAmount(amountDetails) {
    // Implement logic to extract amount based on your specific JSONB structure
    if (typeof amountDetails === 'number') return amountDetails;
    if (typeof amountDetails === 'object') {
      // Example: Assuming amount might be nested
      return amountDetails.amount || amountDetails.value || 0;
    }
    return 0;
  }

  /**
   * Generate PDF report with detailed insights
   * @param {Object} reportData 
   * @param {string} filepath 
   * @returns {Promise<string>} PDF filepath
   */

  async generatePDFReport(reportData, res) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="transaction_report.pdf"');

      doc.pipe(res);

      // Detailed Report Generation
      doc.fontSize(20).text('Comprehensive Transaction Report', { align: 'center' });
      doc.moveDown();

      // Transaction Type Summary
      doc.fontSize(16).text('Transaction Type Breakdown', { underline: true });
      
      Object.entries(reportData.summary.transactionTypes).forEach(([type, count]) => {
        doc.fontSize(12).text(`${type}: ${count} transactions`);
      });

      // Amount Summary
      doc.moveDown().fontSize(16).text('Financial Summary', { underline: true });
      doc.fontSize(12)
        .text(`Total Origin Amount: $${reportData.summary.amountSummary.total.origin.toFixed(2)}`)
        .text(`Total Destination Amount: $${reportData.summary.amountSummary.total.destination.toFixed(2)}`);

      // Detailed Transactions
      doc.moveDown().fontSize(16).text('Transaction Details', { underline: true });
      reportData.transactions.forEach(tx => {
        doc.fontSize(10)
          .text(`ID: ${tx.transactionId}`)
          .text(`Type: ${tx.type}`)
          .text(`Timestamp: ${new Date(tx.timestamp * 1000).toLocaleString()}`)
          .text(`Origin User: ${tx.originUserId}`)
          .text(`Destination User: ${tx.destinationUserId}`)
          .text(`Description: ${tx.description || 'N/A'}`)
          .moveDown();
      });

      doc.end();

      res.on('finish', resolve);
      res.on('error', reject);
    });
  }

  /**
   * Comprehensive report generation
   * @param {Object} options 
   * @returns {Promise<Object>} Full report
   */
  
  async generateReport(options, res) {
    // Fetch transactions
    const { transactions, total, page, pageSize } = 
      await this.fetchTransactions(options);

    // Generate summary
    const summary = this.generateSummary(transactions);

    // Generate report files
    const csvPath = `/tmp/transactions_${Date.now()}.csv`;
    const pdfPath = `/tmp/transaction_report_${Date.now()}.pdf`;

    await Promise.all([
      this.exportToCSV(transactions, csvPath),
      this.generatePDFReport({ transactions, summary }, res)
    ]);

    return {
      summary,
      transactions,
      total,
      page,
      pageSize,
      csvPath,
      pdfPath
    };
  }

  /**
   * Export transactions to CSV
   * @param {Array} transactions 
   * @param {string} filepath 
   * @returns {Promise<string>} CSV filepath
   */
  async exportToCSV(transactions, filepath) {
    return new Promise((resolve, reject) => {
      const csvStream = csv.format({ headers: true });
      const writableStream = fs.createWriteStream(filepath);

      // Flatten transaction for CSV
      const flattenedTransactions = transactions.map(tx => ({
        transactionId: tx.transactionId,
        type: tx.type,
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
        originUserId: tx.originUserId,
        destinationUserId: tx.destinationUserId,
        originAmount: this.extractAmount(tx.originAmountDetails),
        destinationAmount: this.extractAmount(tx.destinationAmountDetails),
        promotionCodeUsed: tx.promotionCodeUsed,
        reference: tx.reference,
        description: tx.description,
        originEmail: tx.originEmail,
        destinationEmail: tx.destinationEmail,
        tags: JSON.stringify(tx.tags)
      }));

      csvStream.pipe(writableStream);
      flattenedTransactions.forEach(tx => csvStream.write(tx));
      
      csvStream.end();
      writableStream.on('finish', () => resolve(filepath));
      writableStream.on('error', reject);
    });
  }
}

module.exports = TransactionReporter;

