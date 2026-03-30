import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/errorHandler';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake');

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  redirectUrl: string;
  position: 'top' | 'bottom' | 'sidebar';
  active: boolean;
  impressions: number;
  clicks: number;
  cpm: number; // Cost per mille (per 1000 impressions)
  startDate: Date;
  endDate: Date;
  publisherId: string;
}

// Mock storage
const advertisements: Map<string, Advertisement> = new Map();

// Get active advertisements
router.get('/', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const activeAds = Array.from(advertisements.values()).filter(
      ad => ad.active && ad.startDate <= now && ad.endDate >= now
    );

    res.json(activeAds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create advertisement (requires authentication)
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, imageUrl, redirectUrl, position, startDate, endDate, cpm } = req.body;

    const advertisement: Advertisement = {
      id: `ad_${Date.now()}`,
      title,
      imageUrl,
      redirectUrl,
      position,
      active: true,
      impressions: 0,
      clicks: 0,
      cpm,
      startDate,
      endDate,
      publisherId: req.user.userId
    };

    advertisements.set(advertisement.id, advertisement);

    res.status(201).json({
      message: 'Advertisement created',
      advertisement
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Track impression
router.post('/:adId/impression', async (req: Request, res: Response) => {
  try {
    const ad = advertisements.get(req.params.adId);
    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    ad.impressions += 1;
    advertisements.set(req.params.adId, ad);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Track click
router.post('/:adId/click', async (req: Request, res: Response) => {
  try {
    const ad = advertisements.get(req.params.adId);
    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    ad.clicks += 1;
    advertisements.set(req.params.adId, ad);

    res.json({ redirectUrl: ad.redirectUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const advertisingRoutes = router;
