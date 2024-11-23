const express = require("express");
const router = express.Router();

const {checkUserAuthentication} = require("../middlewares/authMiddleware");

const {createTransaction,  fetchTransaction, getReport, searchTransaction, fetchAllTransactions, getSummary} = require("../controllers/transactionController");

router.route('/addTransaction').post(createTransaction);
router.route('/getTransaction/:transactionId').get(fetchTransaction);
router.route('/getReport').get(getReport);
router.route('/searchTransaction').get(searchTransaction);
router.route('/allTransactions').get(fetchAllTransactions);
router.route('/getSummary').get(getSummary);

module.exports = router;
