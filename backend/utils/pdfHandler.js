const { supabase } = require("../config/db");
const PDFDocument = require("pdfkit");

const getTransactionData = async (startDate, endDate, transactionType) => {
  let query = supabase.from("transactions").select("*");

  if (startDate) {
    query = query.gte("created_at", startDate);
  }
  if (endDate) {
    query = query.lte("created_at", endDate);
  }
  if (transactionType) {
    query = query.eq("type", transactionType);
  }

  if (transactionType) {
    query = query.eq("type", transactionType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

const generatePDF = async (summary) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Define table properties
      const table = {
        x: 50,
        y: 200,
        rowHeight: 30,
        columnWidth: {
          id: 150,
          amount: 120,
          type: 100,
          date: 130,
        },
      };

      // Draw header
      doc.rect(0, 0, doc.page.width, 100).fill("#2563eb");

      doc
        .fontSize(24)
        .fillColor("#FFFFFF")
        .text("Transaction Summary Report", 50, 40, {
          align: "center",
        });

      // Summary Box
      doc
        .rect(50, 120, doc.page.width - 100, 60)
        .fillAndStroke("#f8fafc", "#e2e8f0");

      doc
        .fillColor("#1e3a8a")
        .fontSize(12)
        .text("Summary Statistics", 70, 130)
        .fillColor("#334155")
        .fontSize(10)
        .text(`Total Transactions: ${summary.totalTransactions || 0}`, 70, 150)
        .text(
          `Total Volume: $${(summary.totalVolume || 0).toFixed(2)}`,
          270,
          150
        );

      // Table Header
      const drawTableHeader = () => {
        doc
          .rect(
            table.x,
            table.y,
            table.columnWidth.id +
              table.columnWidth.amount +
              table.columnWidth.type +
              table.columnWidth.date,
            table.rowHeight
          )
          .fill("#2563eb");

        doc.fillColor("#FFFFFF").fontSize(10);

        let xOffset = table.x + 10;
        doc.text("Transaction ID", xOffset, table.y + 10);

        xOffset += table.columnWidth.id;
        doc.text("Amount & Currency", xOffset, table.y + 10);

        xOffset += table.columnWidth.amount;
        doc.text("Type", xOffset, table.y + 10);

        xOffset += table.columnWidth.type;
        doc.text("Date", xOffset, table.y + 10);
      };

      // Draw table rows
      const drawTableRow = (transaction, rowIndex) => {
        const yPos = table.y + (rowIndex + 1) * table.rowHeight;
        const backgroundColor = rowIndex % 2 === 0 ? "#f8fafc" : "#ffffff";

        // Draw row background
        doc
          .rect(
            table.x,
            yPos,
            table.columnWidth.id +
              table.columnWidth.amount +
              table.columnWidth.type +
              table.columnWidth.date,
            table.rowHeight
          )
          .fillAndStroke(backgroundColor, "#e2e8f0");

        doc.fillColor("#334155").fontSize(9);

        // Draw cell content
        let xOffset = table.x + 10;
        doc.text(
          transaction.transactionId.substring(0, 12) + "...",
          xOffset,
          yPos + 10
        );

        xOffset += table.columnWidth.id;
        doc.text(
          `${transaction.amount.toFixed(2)} ${transaction.currency}`,
          xOffset,
          yPos + 10
        );

        xOffset += table.columnWidth.amount;
        doc.text(transaction.type, xOffset, yPos + 10);

        xOffset += table.columnWidth.type;
        const date = new Date(transaction.timestamp).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );
        doc.text(date, xOffset, yPos + 10);
      };

      // Draw table
      doc
        .fontSize(14)
        .fillColor("#1e3a8a")
        .text("Top 4 Transactions", table.x, table.y + 5);

      drawTableHeader();

      if (summary.top4Transactions && summary.top4Transactions.length > 0) {
        summary.top4Transactions.forEach((transaction, index) => {
          drawTableRow(transaction, index);
        });
      } else {
        doc
          .fillColor("#334155")
          .fontSize(10)
          .text(
            "No transactions available",
            table.x,
            table.y + table.rowHeight + 10
          );
      }

      // Detailed Transaction Section
      if (summary.top4Transactions && summary.top4Transactions.length > 0) {
        const detailsStartY =
          table.y +
          (summary.top4Transactions.length + 1) * table.rowHeight +
          50;

        doc
          .fontSize(14)
          .fillColor("#1e3a8a")
          .text("Top 3 Transaction Details", table.x, detailsStartY);

        summary.top4Transactions.forEach((transaction, index) => {
          const yPos = detailsStartY + 30 + index * 120;

          // Detail box
          doc
            .rect(table.x, yPos, doc.page.width - 100, 100)
            .fillAndStroke("#f8fafc", "#e2e8f0");

          // Detail content
          doc.fontSize(10).fillColor("#334155");

          const leftColumn = table.x + 20;
          const rightColumn = table.x + 300;

          doc
            .text(
              `Transaction ID: ${transaction.transactionId}`,
              leftColumn,
              yPos + 15
            )
            .text(
              `Origin User: ${transaction.originUser}`,
              leftColumn,
              yPos + 35
            )
            .text(
              `Origin Country: ${transaction.originCountry}`,
              leftColumn,
              yPos + 55
            )
            .text(`Reference: ${transaction.reference}`, leftColumn, yPos + 75);

          doc
            .text(
              `Amount: ${transaction.amount} ${transaction.currency}`,
              rightColumn,
              yPos + 15
            )
            .text(
              `Destination User: ${transaction.destinationUser}`,
              rightColumn,
              yPos + 35
            )
            .text(
              `Destination Country: ${transaction.destinationCountry}`,
              rightColumn,
              yPos + 55
            );
        });
      }

      // Footer
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text(
          `Generated on ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 50,
          { align: "center" }
        );

      doc.end();
    } catch (error) {
      console.error("PDF Generation Error:", error);
      reject(error);
    }
  });
};

module.exports = {
  getTransactionData,
  generatePDF,
};
