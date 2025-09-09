// server/services/callService.js
const Call = require('../models/Call');
const User = require('../models/User');

class CallService {
  // Create a new call
  static async createCall(callData) {
    try {
      const call = new Call(callData);
      await call.save();
      return await call.populate('caller recipient', 'name username profilePicture');
    } catch (error) {
      throw error;
    }
  }

  // Get call by ID
  static async getCallById(callId) {
    try {
      const call = await Call.findById(callId)
        .populate('caller recipient', 'name username profilePicture');
      return call;
    } catch (error) {
      throw error;
    }
  }

  // Update call status
  static async updateCallStatus(callId, status) {
    try {
      const call = await Call.findByIdAndUpdate(
        callId,
        { status, endedAt: status === 'ended' ? new Date() : undefined },
        { new: true }
      ).populate('caller recipient', 'name username profilePicture');
      
      return call;
    } catch (error) {
      throw error;
    }
  }

  // Get user's call history
  static async getUserCalls(userId, page = 1, limit = 20) {
    try {
      const calls = await Call.find({
        $or: [
          { caller: userId },
          { recipient: userId }
        ]
      })
      .populate('caller recipient', 'name username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await Call.countDocuments({
        $or: [
          { caller: userId },
          { recipient: userId }
        ]
      });

      return {
        calls,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      throw error;
    }
  }

  // Get active calls
  static async getActiveCalls() {
    try {
      const calls = await Call.find({ status: 'active' })
        .populate('caller recipient', 'name username profilePicture');
      return calls;
    } catch (error) {
      throw error;
    }
  }

  // End all active calls for a user
  static async endAllUserCalls(userId) {
    try {
      const result = await Call.updateMany(
        {
          $or: [
            { caller: userId },
            { recipient: userId }
          ],
          status: 'active'
        },
        { 
          status: 'ended',
          endedAt: new Date()
        }
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CallService;