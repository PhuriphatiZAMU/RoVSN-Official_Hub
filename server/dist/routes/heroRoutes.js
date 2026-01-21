"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const heroController_1 = require("../controllers/heroController");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = (0, express_1.Router)();
router.get('/', (0, cache_1.cacheControl)(600), heroController_1.getHeroes);
router.post('/upload', auth_1.authenticateToken, upload_1.default.any(), heroController_1.uploadHeroes);
router.delete('/all/clear', auth_1.authenticateToken, heroController_1.clearAllHeroes);
exports.default = router;
