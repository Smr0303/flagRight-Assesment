const express = require("express");
const router = express.Router();

const {startCronJob, stopCronJob} = require("../controllers/cronController");

router.route('/startCron').post(startCronJob);
router.route('/stopCron').post(stopCronJob);

module.exports = router;