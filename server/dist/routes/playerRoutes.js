"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playerController_1 = require("../controllers/playerController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validations/schemas");
const router = (0, express_1.Router)();
router.get('/', playerController_1.getPlayers);
router.post('/', auth_1.authenticateToken, playerController_1.createPlayer); // Create player
router.put('/:id', auth_1.authenticateToken, playerController_1.updatePlayerFull); // Update full player
router.delete('/:id', auth_1.authenticateToken, playerController_1.deletePlayer); // Delete player
router.post('/import', auth_1.authenticateToken, (0, validate_1.validate)(schemas_1.importPlayersSchema), playerController_1.importPlayers);
router.post('/rename-team', auth_1.authenticateToken, playerController_1.renameTeam); // Rename team batch
router.delete('/all/clear', auth_1.authenticateToken, playerController_1.clearAllPlayers);
router.get('/unmatched-igns', auth_1.authenticateToken, playerController_1.getUnmatchedIGNs);
router.post('/:playerId/add-previous-ign', auth_1.authenticateToken, (0, validate_1.validate)(schemas_1.playerIdParamSchema, 'params'), (0, validate_1.validate)(schemas_1.previousIGNSchema), playerController_1.addPreviousIGN);
router.patch('/:playerId/update-ign', auth_1.authenticateToken, (0, validate_1.validate)(schemas_1.playerIdParamSchema, 'params'), (0, validate_1.validate)(schemas_1.newIGNSchema), playerController_1.updateIGN);
exports.default = router;
