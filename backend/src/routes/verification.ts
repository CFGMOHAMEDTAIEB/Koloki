import { Router, Request, Response } from 'express';
import { verifyToken, verifyAdmin } from '../middleware/errorHandler';
import { User } from '../models/User';

const router = Router();

// Get pending verifications
router.get('/pending', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
  try {
    const pendingUsers = await User.find({
      verificationStatus: 'pending'
    }).select('-passwordHash');

    res.json(pendingUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve user verification
router.post('/:userId/approve', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        verificationStatus: 'verified',
        'kycVerification.verifiedAt': new Date()
      },
      { new: true }
    ).select('-passwordHash');

    res.json({
      message: 'User verified successfully',
      user
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject user verification
router.post('/:userId/reject', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        verificationStatus: 'rejected'
      },
      { new: true }
    ).select('-passwordHash');

    // TODO: Send email to user about rejection with reason

    res.json({
      message: 'User verification rejected',
      user
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const verificationRoutes = router;
