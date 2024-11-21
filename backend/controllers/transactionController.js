const {supabase} = require("../config/db");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { v4: uuidv4 } = require('uuid');
const TransactionReporter = require("../utils/reportHandler");
const path = require('path');


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
            destinationEmail
        } = req.body;

        // Perform necessary checks
        if (!type || !destinationUserId || !originAmountDetails || !destinationAmountDetails || !description || !destinationEmail) 
            return next(new ErrorHandler('Please provide all the required fields', 400));

        if (typeof type !== 'string' || typeof description !== 'string' || typeof originEmail !== 'string' || typeof destinationEmail !== 'string') {
            return next(new ErrorHandler('Invalid input types', 400));
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
            p_destinationemail: destinationEmail

        };

        const { data, error } = await supabase.rpc('insert_transaction', transactionObj);

        if(error) return next(new ErrorHandler(error.message, 500));

        console.log(data);

        res.status(200).json({
            success: true,
            data: transactionObj
        });

});


exports.fetchTransaction = catchAsyncError(async (req, res, next) => {

    const {transactionId} = req.params;

    if(!transactionId) return next(new ErrorHandler('Please provide the transaction id', 400));

    const { data, error } = await supabase .from('transactions').select("*").eq('transactionid', transactionId);

    if(error) return next(new ErrorHandler(error.message, 500));

    console.log(data);

    if(data.length === 0) return next(new ErrorHandler('Transaction not found', 404));

    res.status(200).json({
        success: true,
        data: data[0]
    });
});

exports.getReport = catchAsyncError(async (req, res, next) => {
    
      const reporter = new TransactionReporter();
      
      // Generate report data
      const reportData = await reporter.generateReport({
        startDate: new Date(req.query.startDate),
        endDate: new Date(req.query.endDate),
        type: req.query.type
      },res);
  
      // Send processed data to frontend
    //   res.json({
    //     summary: reportData.summary,
    //     transactions: reportData.transactions,
    //     reportOptions: {
    //       csvDownloadUrl: `/download/csv/${path.basename(reportData.csvPath)}`,
    //       pdfDownloadUrl: `/download/pdf/${path.basename(reportData.pdfPath)}`,
    //     }
    //   });
  });