const { supabase } = require("../config/db");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { v4: uuidv4 } = require("uuid");
const { generatePDF, getTransactionData } = require("../utils/pdfHandler");

/*Function to create Transaction */

exports.createTransaction = catchAsyncError(async (req, res, next) => {
  const {
    type,
    originUserId,
    destinationUserId,
    originAmountDetails,
    destinationAmountDetails,
    promotionCodeUsed,
    reference,
    originDeviceData,
    destinationDeviceData,
    tags,
    description,
    originEmail,
    destinationEmail,
  } = req.body;

  // Perform necessary checks

  if (
    !type ||
    !destinationUserId ||
    !originAmountDetails ||
    !destinationAmountDetails ||
    !description ||
    !destinationEmail
  )
    return next(
      new ErrorHandler("Please provide all the required fields", 400)
    );

  if (
    typeof type !== "string" ||
    typeof description !== "string" ||
    typeof originEmail !== "string" ||
    typeof destinationEmail !== "string"
  ) {
    return next(new ErrorHandler("Invalid input types", 400));
  }

  const transactionId = uuidv4();
  const timestamp = Date.now();

  const transactionObj = {
    p_transactionid: transactionId,
    p_type: type,
    p_timestamp: timestamp,
    p_originuserid: originUserId,
    p_destinationuserid: destinationUserId,
    p_originamountdetails: originAmountDetails,
    p_destinationamountdetails: destinationAmountDetails,
    p_promotioncodeused: promotionCodeUsed,
    p_reference: reference,
    p_origindevicedata: originDeviceData,
    p_destinationdevicedata: destinationDeviceData,
    p_tags: tags,
    p_description: description,
    p_originemail: originEmail,
    p_destinationemail: destinationEmail,
  };

  const { data, error } = await supabase.rpc(
    "insert_transaction",
    transactionObj
  );

  if (error) return next(new ErrorHandler(error.message, 500));

  res.status(200).json({
    success: true,
    data: transactionObj,
  });
});

exports.fetchTransaction = catchAsyncError(async (req, res, next) => {
  const { transactionId } = req.params;

  if (!transactionId)
    return next(new ErrorHandler("Please provide the transaction id", 400));

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("transactionid", transactionId);

  if (error) return next(new ErrorHandler(error.message, 500));

  if (data.length === 0)
    return next(new ErrorHandler("Transaction not found", 404));

  res.status(200).json({
    success: true,
    data: data[0],
  });
});

/*Function used for applying filters and searching Transactions */

exports.searchTransaction = catchAsyncError(async (req, res, next) => {
  let {
    page = 1,
    per_page = 10,
    description,
    type,
    startTimestamp: startDate,
    endTimestamp: endDate,
    minAmount,
    maxAmount,
    status,
  } = req.query;

  page = parseInt(page);
  per_page = parseInt(per_page);

  let countQuery = supabase
    .from("transactions")
    .select("*", { count: "exact", head: true });

  let baseQuery = supabase
    .from("transactions")
    .select("*")
    .order("transaction_timestamp", { ascending: false });

  // Apply filters only if they exist
  if (description) {
    countQuery = countQuery.ilike("description", `%${description}%`);
    baseQuery = baseQuery.ilike("description", `%${description}%`);
  }

  if (type) {
    countQuery = countQuery.eq("type", type);
    baseQuery = baseQuery.eq("type", type);
  }

  if (status) {
    countQuery = countQuery.eq("status", status);
    baseQuery = baseQuery.eq("status", status);
  }

  if (startDate && endDate) {
    countQuery = countQuery
      .gte(
        "transaction_timestamp",
        parseInt(new Date(parseInt(startDate)).getTime())
      )
      .lte(
        "transaction_timestamp",
        parseInt(new Date(parseInt(endDate)).getTime())
      );

    baseQuery = baseQuery
      .gte(
        "transaction_timestamp",
        parseInt(new Date(parseInt(startDate)).getTime())
      )
      .lte(
        "transaction_timestamp",
        parseInt(new Date(parseInt(endDate)).getTime())
      );
  } else if (startDate) {
    countQuery = countQuery.gte(
      "transaction_timestamp",
      parseInt(new Date(parseInt(startDate)).getTime())
    );

    baseQuery = baseQuery.gte(
      "transaction_timestamp",
      parseInt(new Date(parseInt(startDate)).getTime())
    );
  } else if (endDate) {
    countQuery = countQuery.lte(
      "transaction_timestamp",
      parseInt(new Date(parseInt(endDate)).getTime())
    );

    baseQuery = baseQuery.lte(
      "transaction_timestamp",
      parseInt(new Date(parseInt(endDate)).getTime())
    );
  }

  if (minAmount) {
    countQuery = countQuery.gte(
      "originamountdetails->transactionAmount",
      minAmount
    );

    baseQuery = baseQuery.gte(
      "originamountdetails->transactionAmount",
      minAmount
    );
  }

  if (maxAmount) {
    countQuery = countQuery.lte(
      "originamountdetails->transactionAmount",
      maxAmount
    );

    baseQuery = baseQuery.lte(
      "originamountdetails->transactionAmount",
      maxAmount
    );
  }

  const { count, error: countError } = await countQuery;

  const skip = (page - 1) * per_page;

  baseQuery = baseQuery.range(skip, skip + per_page - 1);

  const { data, error } = await baseQuery;

  if (error) {
    console.log(error);
    throw new Error(error);
  }

  const pagination = {
    page: parseInt(page),
    per_page: parseInt(per_page),
    total: count,
    total_pages: Math.ceil(count / parseInt(per_page)),
    next_page_available: parseInt(page) < Math.ceil(count / parseInt(per_page)),
    next_page:
      parseInt(page) < Math.ceil(count / parseInt(per_page))
        ? parseInt(page) + 1
        : null,
    previous_page_available: parseInt(page) > 1,
    previous_page: parseInt(page) > 1 ? parseInt(page) - 1 : null,
  };

  res.status(200).json({
    success: true,
    data,
    pagination,
  });
});

/*Function to fetch all tranctionfor CSV and normally */
exports.fetchAllTransactions = catchAsyncError(async (req, res, next) => {
  let {
    page = 1,
    per_page = 10,
    current_user_id = null, // New parameter to determine if all records are needed
  } = req.query;

  const export_all = req.query.export_all === "true";

  // Check minimum and maximum values for page and per_page

  if (!export_all) {
    if (page < 1) page = 1;
    if (per_page < 1) per_page = 1;
    if (per_page > 50) per_page = 50;
  }

  // Base query for both total count and data fetch
  let countQuery = supabase.from("transactions").select("*", {
    count: "exact",
    head: true,
  });

  if (current_user_id) countQuery = countQuery.eq("user_id", current_user_id);

  const { count, countError } = await countQuery;

  if (countError) {
    console.error("Count error:", countError);
    return next(new ErrorHandler("Error fetching transaction count", 500));
  } else if (count === null) {
    console.error("Count is null, something went wrong");
    return next(new ErrorHandler("Error calculating total count", 500));
  }

  let dataQuery = supabase
    .from("transactions")
    .select("*")
    .order("transaction_timestamp", { ascending: false });

  if (current_user_id) dataQuery = dataQuery.eq("user_id", current_user_id);

  // Apply pagination if not exporting all
  if (!export_all) {
    const maxPageNumber = Math.ceil(count / per_page);

    if (page > maxPageNumber) page = maxPageNumber;

    dataQuery = dataQuery.range((page - 1) * per_page, page * per_page - 1);
  }

  // Fetch the actual data
  const { data, dataError } = await dataQuery;

  if (dataError) {
    console.error("Data fetch error:", dataError);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: dataError.message,
    });
  }

  // Generate response based on whether it's an export or paginated request
  if (export_all) {
    return res.status(200).json({
      success: true,
      total: count,
      data,
    });
  }

  // Generate the pagination object for paginated requests
  const pagination = {
    page: parseInt(page),
    per_page: parseInt(per_page),
    total: count,
    total_pages: Math.ceil(count / parseInt(per_page)),
    next_page_available: parseInt(page) < Math.ceil(count / parseInt(per_page)),
    next_page:
      parseInt(page) < Math.ceil(count / parseInt(per_page))
        ? parseInt(page) + 1
        : null,
    previous_page_available: parseInt(page) > 1,
    previous_page: parseInt(page) > 1 ? parseInt(page) - 1 : null,
  };

  return res.status(200).json({
    success: true,
    pagination,
    data,
  });
});

/*Function for getting Summarid data */

exports.getSummary = catchAsyncError(async (req, res, next) => {
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*");

    if (error) {
      throw error;
    }

    // Calculate transaction summary data
    const totalVolume = transactions.reduce((sum, transaction) => {
      const amount = transaction.originamountdetails?.transactionAmount || 0;
      return sum + amount;
    }, 0);

    // Calculate total transactions
    const totalTransactions = transactions.length;

    // Calculate average transaction size
    const avgTransactionSize = totalTransactions
      ? totalVolume / totalTransactions
      : 0;

    const completedTransactions = transactions.filter(
      (transaction) => transaction.status === "Completed"
    ).length;

    const transactionSummary = {
      totalVolume,
      totalTransactions,
      avgTransactionSize,
      completedTransactions,
    };


    const deposits = transactions.filter(
      (transaction) => transaction.type === "Deposit"
    ).length;
    const withdrawals = transactions.filter(
      (transaction) => transaction.type === "Withdrawals"
    ).length;
    const transfers = transactions.filter(
      (transaction) => transaction.type === "Transfers"
    ).length;
    const payments = transactions.filter(
      (transaction) => transaction.type === "Payments"
    ).length;

    const pieChartData = [
      { name: "Deposits", value: deposits, color: "#0088FE" },
      { name: "Withdrawals", value: withdrawals, color: "#00C49F" },
      { name: "Transfers", value: transfers, color: "#FFBB28" },
      { name: "Payments", value: payments, color: "#FF8042" },
    ];

    res.status(200).json({
      success: true,
      data: {
        transactionSummary,
        pieChartData,
      },
    });
  } catch (error) {
    console.error("Error fetching transaction data:", error);
    throw error;
  }
});

/*Function for getting tranction report in pdf format */

exports.getTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, transactionType } = req.query;

    // Get transaction data from database
    const transactionData = await getTransactionData(
      startDate,
      endDate,
      transactionType
    );

    // Validate and clean transaction data
    const validTransactions = transactionData.filter(
      (t) =>
        t &&
        t.originamountdetails &&
        typeof t.originamountdetails.transactionAmount === "number" &&
        !isNaN(t.originamountdetails.transactionAmount)
    );

    // Calculate summary with validated data
    const summary = {
      totalTransactions: validTransactions.length,
      totalVolume: validTransactions.reduce(
        (sum, t) => sum + t.originamountdetails.transactionAmount,
        0
      ),
      top4Transactions: validTransactions
        .sort(
          (a, b) =>
            b.originamountdetails.transactionAmount -
            a.originamountdetails.transactionAmount
        )
        .slice(0, 3)
        .map((t) => ({
          transactionId: t.transactionid,
          amount: Number(t.originamountdetails.transactionAmount),
          currency: t.originamountdetails.transactionCurrency,
          type: t.type,
          timestamp: t.transaction_timestamp,
          reference: t.reference || "No reference",
          originCountry: t.originamountdetails.country,
          destinationCountry: t.destinationamountdetails.country,
          originUser: t.originuserid,
          destinationUser: t.destinationuserid,
        })),
    };

    // Generate PDF
    const pdfBuffer = await generatePDF(summary);

    // Send PDF as download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transaction-summary.pdf"
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error generating transaction summary:", error);
    res.status(500).json({ error: "Failed to generate transaction summary" });
  }
};
