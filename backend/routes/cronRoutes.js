const express = require("express");
const router = express.Router();

const {startCronJob, stopCronJob} = require("../controllers/cronController");
const {checkUserAuthentication, checkAdminPrivileges} = require("../middlewares/authMiddleware")

router.route('/startCron').post(checkUserAuthentication , checkAdminPrivileges(5),startCronJob);
router.route('/stopCron').post(checkUserAuthentication, checkAdminPrivileges(5) , stopCronJob);

module.exports = router;