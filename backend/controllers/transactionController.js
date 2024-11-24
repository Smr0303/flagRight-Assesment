const { supabase } = require("../config/db");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { v4: uuidv4 } = require("uuid");
const TransactionReporter = require("../utils/reportHandler");
const path = require("path");
const z = require("zod");

// Zod validation schemas
const DeviceDataSchema = z.object({
  batteryLevel: z.number().optional(),
  deviceLatitude: z.number().optional(),
  deviceLongitude: z.number().optional(),
  ipAddress: z.string().optional(),
  deviceIdentifier: z.string().optional(),
  vpnUsed: z.boolean().optional(),
  operatingSystem: z.string().optional(),
  deviceMaker: z.string().optional(),
  deviceModel: z.string().optional(),
  deviceYear: z.string().optional(),
  appVersion: z.string().optional(),
});

const AmountDetailsSchema = z.object({
  transactionAmount: z.number().positive(),
  transactionCurrency: z.string(),
  country: z.string(),
});

const TagSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const TransactionSchema = z.object({
  transactionId: z.string().uuid().optional(),
  type: z.enum(["Deposit", "Withdrawal", "Transfer", "Payment"]),
  timestamp: z.number().int().optional(),
  originUserId: z.string(),
  destinationUserId: z.string(),
  originAmountDetails: AmountDetailsSchema,
  destinationAmountDetails: AmountDetailsSchema,
  promotionCodeUsed: z.boolean().optional(),
  reference: z.string().optional(),
  originDeviceData: DeviceDataSchema.optional(),
  destinationDeviceData: DeviceDataSchema.optional(),
  tags: z.array(TagSchema).optional(),
  description: z.string().optional(),
  originEmail: z.string().email().optional(),
  destinationEmail: z.string().email().optional(),
});

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

  console.log(req.body);
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

exports.getReport = catchAsyncError(async (req, res, next) => {
  const reporter = new TransactionReporter();

  // Generate report data
  const reportData = await reporter.generateReport(
    {
      startDate: new Date(req.query.startDate),
      endDate: new Date(req.query.endDate),
      type: req.query.type,
    },
    res
  );
});

exports.searchTransaction = catchAsyncError(async (req, res, next) => {
  const searchParams = z
    .object({
      userId: z.string().uuid().optional(),
      type: z.enum(["Deposit", "Withdrawal", "Transfer", "Payment"]).optional(),
      startTimestamp: z.number().int().optional(),
      endTimestamp: z.number().int().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      currency: z.string().optional(),
      description: z.string().optional(),
      page: z.number().int().positive().optional().default(1),
      pageSize: z.number().int().positive().optional().default(20),
    })
    .parse(req.query);

  const { data, error } = await supabase.rpc("search_transactions", {
    p_user_id: searchParams.userId || null,
    p_type: searchParams.type || null,
    p_start_timestamp: searchParams.startTimestamp || null,
    p_end_timestamp: searchParams.endTimestamp || null,
    p_min_amount: searchParams.minAmount || null,
    p_max_amount: searchParams.maxAmount || null,
    p_currency: searchParams.currency || null,
    p_description: searchParams.description || null,
    p_page: searchParams.page,
    p_page_size: searchParams.pageSize,
  });

  if (error) {
    return res.status(500).json({
      message: "Error searching transactions",
      error: error.message,
    });
  }

  // Calculate pagination metadata
  const totalCount = data.length > 0 ? data[0].total_count : 0;
  const totalPages = Math.ceil(totalCount / searchParams.pageSize);

  res.status(200).json({
    data: data,
    pagination: {
      page: searchParams.page,
      pageSize: searchParams.pageSize,
      totalCount: totalCount,
      totalPages: totalPages,
    },
  });
});

exports.fetchAllTransactions = catchAsyncError(async (req, res, next) => {
  let { page = 1, per_page = 10, current_user_id = null } = req.query;

  // Check minimum and maximum values for page and per_page
  if (page < 1) page = 1;
  if (per_page < 1) per_page = 1;
  if (per_page > 50) per_page = 50;

  // Fetch the total count of transactions
  const { count, error: countError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true });

  // console.log("here us the",count);

  if (countError)
    return next(new ErrorHandler("Error fetching transaction count", 500));

  // Calculate the maximum page number
  const maxPageNumber = Math.ceil(count / per_page);

  if (page > maxPageNumber) page = maxPageNumber;

  // Fetch the paginated transactions
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_timestamp", { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1);

  if (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }

  // Generate the pagination object
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

  // Return the transactions data and the pagination object
  return res.status(200).json({ pagination, data });
});

exports.getSummary = catchAsyncError(async (req, res, next) => {
  try {
    // Fetch all transactions
    console.log(49823);

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
    const avgTransactionSize = totalTransactions ? totalVolume / totalTransactions : 0;

    const completedTransactions = transactions.filter(
      (transaction) => transaction.status === "Completed"
    ).length;

    const transactionSummary = {
      totalVolume,
      totalTransactions,
      avgTransactionSize,
      completedTransactions,
    };

    console.log(transactionSummary);

    // Calculate pie chart data
    const deposits = transactions.filter(
      (transaction) => transaction.type === "Deposit"
    ).length;
    const withdrawals = transactions.filter(
      (transaction) => transaction.type === "Withdrawal"
    ).length;
    const transfers = transactions.filter(
      (transaction) => transaction.type === "Transfer"
    ).length;
    const payments = transactions.filter(
      (transaction) => transaction.type === "Payment"
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
  } 
  catch (error) {
    console.error("Error fetching transaction data:", error);
    throw error;
  }
});
