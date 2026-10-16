const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware");
const { acessarDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", autenticarToken, acessarDashboard);

module.exports = router;