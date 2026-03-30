import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/errorHandler';
import { Property } from '../models/Property';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// List properties
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const properties = await Property.find({ status: 'active' })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments({ status: 'active' });

    res.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get property details
router.get('/:propertyId', async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create listing (requires authentication and listing fee payment)
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, description, location, roomTypes, amenities, rules, availableFrom } = req.body;

    // Create property
    const property = new Property({
      ownerId: req.user.userId,
      title,
      description,
      location,
      roomTypes,
      amenities,
      rules,
      availableFrom,
      listingFee: {
        amount: 10,
        currency: 'TND',
        paid: false
      }
    });

    await property.save();

    res.status(201).json({
      message: 'Property listing created. Please complete the listing fee payment.',
      property,
      listingFeePaymentRequired: true
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update property (owner only)
router.put('/:propertyId', verifyToken, async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.ownerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.propertyId,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const propertyRoutes = router;
