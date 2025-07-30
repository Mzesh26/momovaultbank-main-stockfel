const express = require("express");
const router = express.Router();
const SavingsGroup = require("../../models/SavingsGroup");
const GroupContribution = require("../../models/GroupContribution");
const authenticateMiddleware = require("../../middlewares/auth-middleware");
const { processMoMoPayment } = require("../../utils/momo-utils");

// Get my groups
router.get("/my-groups", authenticateMiddleware, async (req, res) => {
  try {
    const groups = await SavingsGroup.find({
      'members.userId': req.user._id
    }).populate('createdBy', 'userName');

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: error.message
    });
  }
});

// Join group
router.post("/:groupId/join", authenticateMiddleware, async (req, res) => {
  try {
    const group = await SavingsGroup.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    if (group.currentMembers >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Group is full"
      });
    }

    const isMember = group.members.some(
      member => member.userId.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "Already a member of this group"
      });
    }

    group.members.push({
      userId: req.user._id,
      joinedAt: new Date(),
      totalContributed: 0
    });
    group.currentMembers += 1;

    await group.save();

    res.json({
      success: true,
      message: "Successfully joined group",
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to join group",
      error: error.message
    });
  }
});

// Contribute to group
router.post("/:groupId/contribute", authenticateMiddleware, async (req, res) => {
  try {
    const { amount, phoneNumber, description } = req.body;
    const group = await SavingsGroup.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    const member = group.members.find(
      m => m.userId.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Not a member of this group"
      });
    }

    if (amount < group.minimumContribution) {
      return res.status(400).json({
        success: false,
        message: `Minimum contribution is ${group.minimumContribution}`
      });
    }

    // Create contribution record
    const contribution = new GroupContribution({
      groupId: group._id,
      userId: req.user._id,
      amount,
      description,
      status: 'pending'
    });

    // Process MoMo payment
    const paymentResult = await processMoMoPayment({
      amount,
      phoneNumber,
      description: `Group contribution: ${group.name}`
    });

    if (paymentResult.success) {
      contribution.status = 'completed';
      contribution.momoTransactionId = paymentResult.transactionId;
      contribution.processedAt = new Date();

      // Update group and member totals
      group.currentAmount += amount;
      member.totalContributed += amount;
      member.lastContribution = new Date();

      await Promise.all([
        contribution.save(),
        group.save()
      ]);

      res.json({
        success: true,
        message: "Contribution successful",
        data: contribution
      });
    } else {
      contribution.status = 'failed';
      contribution.failureReason = paymentResult.error;
      await contribution.save();

      res.status(400).json({
        success: false,
        message: "Payment failed",
        error: paymentResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process contribution",
      error: error.message
    });
  }
});

module.exports = router;
