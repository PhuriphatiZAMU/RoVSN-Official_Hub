"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const standingsController_1 = require("../controllers/standingsController");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
// Public routes - standings calculated from database
router.get('/', (0, cache_1.cacheControl)(60), standingsController_1.getStandings);
router.get('/detailed', (0, cache_1.cacheControl)(60), standingsController_1.getDetailedStandings);
exports.default = router;
