const cron = require("node-cron");
const generateRandomTransaction = require("../utils/randomData");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const {supabase} = require("../config/db");

let task, isRunning = false;

const generateTransaction = async () => {
  try {
    const transaction = generateRandomTransaction();

    console.log(transaction);

    const { data, error } = await supabase.rpc(
      "insert_transaction",
      transaction
    );

    if (error) console.log("Error inserting transaction:", error);
    else console.log("Transaction inserted successfully:", data);
  } catch (err) {
    console.log(err);
  }
};

// Start the CRON job
exports.startCronJob = catchAsyncError(async (req, res) => {

  if (isRunning)
    return res.status(400).json({ message: "CRON job is already running." });

  console.log("Starting CRON job1");

  task = cron.schedule("* * * * * *", generateTransaction);
  task.start();
  isRunning = true;

  return res.status(200).json({ message: "CRON job started successfully." });
});

// Stop the CRON job
exports.stopCronJob = catchAsyncError(async (req, res) => {
  if (!isRunning) {
    return res.status(400).json({ message: "CRON job is not running." });
  }

  task.stop();
  isRunning = false;

  return res.status(200).json({ message: "CRON job stopped successfully." });
});

exports.getCronStatus = (req, res) => {
  return res.status(200).json({ isRunning });
};
