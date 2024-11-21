const express = require("express");
const router = express.Router();

const {checkUserAuthentication} = require("../middlewares/authMiddleware");

const {createTransaction,  fetchTransaction, getReport} = require("../controllers/transactionController");

router.route('/addTransaction').post(createTransaction);
router.route('/getTransaction/:transactionId').get(fetchTransaction);
router.route('/getReport').get(getReport);

module.exports = router;
