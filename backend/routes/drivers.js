const express = require('express');
const router = express.Router();
const {
  login,
  toggleAvailability,
  getPendingOrders,
  acceptOrder,
} = require('../controllers/driverController');

router.post('/login', login);
router.put('/:id/availability', toggleAvailability);
router.get('/pending-orders', getPendingOrders);
router.put('/:driverId/accept-order/:orderId', acceptOrder);

module.exports = router;
