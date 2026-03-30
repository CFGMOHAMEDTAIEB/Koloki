import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/errorHandler';
import { User } from '../models/User';

const router = Router();

// Get user profile
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile (requires authentication)
router.put('/:userId', verifyToken, async (req: Request, res: Response) => {
  try {
    if (req.user.userId !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { firstName, lastName, profileImage, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(profileImage && { profileImage }),
        ...(preferences && { preferences })
      },
      { new: true }
    ).select('-passwordHash');

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start KYC verification
router.post('/:userId/kyc-verify', verifyToken, async (req: Request, res: Response) => {
  try {
    const { idType, idNumber, issuedDate, expiryDate } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        verificationStatus: 'pending',
        kycVerification: {
          idType,
          idNumber,
          issuedDate,
          expiryDate
        }
      },
      { new: true }
    );

    res.json({
      message: 'KYC verification initiated',
      user
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const userRoutes = router;
