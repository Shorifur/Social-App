// In server/routes/calls.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CallService = require('../services/callService');

// Initiate call
router.post('/initiate', auth, async (req, res) => {
  try {
    const { recipientId, type } = req.body;
    
    const call = await CallService.initiateCall(req.user.id, recipientId, type);

    res.json({
      success: true,
      call
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept call
router.post('/:callId/accept', auth, async (req, res) => {
  try {
    const call = await CallService.acceptCall(req.params.callId, req.user.id);

    res.json({
      success: true,
      call
    });
  } catch (error) {
    console.error('Accept call error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// End call
router.post('/:callId/end', auth, async (req, res) => {
  try {
    const call = await CallService.endCall(req.params.callId, req.user.id);

    res.json({
      success: true,
      call
    });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject call
router.post('/:callId/reject', auth, async (req, res) => {
  try {
    const call = await CallService.rejectCall(req.params.callId, req.user.id);

    res.json({
      success: true,
      call
    });
  } catch (error) {
    console.error('Reject call error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get call history
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await CallService.getCallHistory(req.user.id, page, limit);

    res.json({
      success: true,
      calls: result.calls,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;