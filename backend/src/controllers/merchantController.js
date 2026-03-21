const Merchant = require('../models/Merchant');

/**
 * @desc    Register a new merchant or login if exists
 * @route   POST /api/merchants/register
 */
const registerMerchant = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    console.log(name, phone);
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    let merchant = await Merchant.findOne({ phone });
    if (!merchant) {
      merchant = await Merchant.create({ name, phone });
      merchant.save();
    }
    console.log(merchant);
    res.status(200).json(merchant);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update merchant settings
 * @route   PUT /api/merchants/:id/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { digestTime } = req.body;
    let merchant = await Merchant.findById(id);
    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
    
    // Allow updating digestTime (null means disabled)
    merchant.digestTime = digestTime;
    await merchant.save();
    
    res.json(merchant);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get merchant details
 * @route   GET /api/merchants/:id
 */
const getMerchant = async (req, res, next) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) return res.status(404).json({ message: 'Not found' });
    res.json(merchant);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerMerchant, updateSettings, getMerchant };
