"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, upload_1.default.single('logo'), uploadController_1.uploadFile);
exports.default = router;
