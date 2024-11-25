const express = require("express");
const router = express.Router();

const { startCronJob, stopCronJob,getCronStatus } = require("../controllers/cronController");
const {
  checkUserAuthentication,
  checkAdminPrivileges,
} = require("../middlewares/authMiddleware");

router
  .route("/startCron")
  .post(checkUserAuthentication, checkAdminPrivileges(5), startCronJob);
router
  .route("/stopCron")
  .post(checkUserAuthentication, checkAdminPrivileges(5), stopCronJob);
router
  .route("/cronStatus")
  .get(checkUserAuthentication, checkAdminPrivileges(5), getCronStatus);

module.exports = router;
