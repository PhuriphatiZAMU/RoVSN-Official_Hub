"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resultController_1 = require("../controllers/resultController");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validations/schemas");
const router = (0, express_1.Router)();
// Public routes
router.get('/', (0, cache_1.cacheControl)(60), resultController_1.getResults);
// Protected routes
router.post('/', auth_1.authenticateToken, (0, validate_1.validate)(schemas_1.saveResultSchema), resultController_1.saveResult);
router.delete('/:matchId', auth_1.authenticateToken, (0, validate_1.validate)(schemas_1.matchIdParamSchema, 'params'), resultController_1.deleteResult);
router.delete('/reset/:day', auth_1.authenticateToken, (0, validate_1.validate)(schemas_1.dayParamSchema, 'params'), resultController_1.resetDayResults);
// History & Validation routes
router.get('/history', auth_1.authenticateToken, resultController_1.getResultHistory);
router.get('/recent-changes', auth_1.authenticateToken, resultController_1.getRecentChanges);
router.post('/validate', auth_1.authenticateToken, resultController_1.validateResult);
exports.default = router;
