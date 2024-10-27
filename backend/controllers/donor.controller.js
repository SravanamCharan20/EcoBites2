import Donor from '../models/donor.model.js';
import User from '../models/user.model.js';
// import Request from '../models/request.model.js'
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import twilio from 'twilio';
import Request from '../models/request.model.js'
import NonFoodDonation from '../models/nonfood.model.js';
import NonFoodRequest from '../models/nonfoodrequest.model.js';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSmsNotification = async (phoneNumber, message) => {
  try {
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    if (formattedPhoneNumber.length !== 13) { 
      throw new Error('Invalid phone number length');
    }

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhoneNumber
    });
  } catch (error) {
    console.error('Failed to send SMS:', error.message);
  }
};

export const donationform = async (req, res) => {
  try {
    const donoremail = req.body.email;
    const existingUser = await User.findOne({ email: donoremail });
    if (!existingUser) 
      return res.status(400).json({ message: 'Email is not registered. Please sign up.' });

    const donor = new Donor({
      ...req.body,
      userId: existingUser._id
    });

    const savedDonor = await donor.save();
    res.status(201).json(savedDonor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create donation.', error });
  }
};
export const nonfooddonorform = async (req, res) => {
  try {
    const donoremail = req.body.email;
    const existingUser = await User.findOne({ email: donoremail });
    if (!existingUser) 
      return res.status(400).json({ message: 'Email is not registered. Please sign up.' });

    const donor = new NonFoodDonation({
      ...req.body,
      userId: existingUser._id
    });

    const savedDonor = await donor.save();
    res.status(201).json(savedDonor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create donation.', error });
  }
};

export const avldatalist = async (req, res) => {
  try {
    const donatedFoodItems = await Donor.find({ isAccepted: false });
    if (donatedFoodItems.length === 0) {
      return res.status(404).json({ message: 'No donated food items found.' });
    }
    res.status(200).json(donatedFoodItems);
  } catch (error) {
    console.error('Error fetching donated food items:', error); 
    res.status(500).json({ message: 'Failed to fetch donated food items.', error: error.message });
  }
};
export const avlnonfooddatalist = async (req, res) => {
  try {
    const donatedFoodItems = await NonFoodDonation.find();
    if (donatedFoodItems.length === 0) {
      return res.status(404).json({ message: 'No donated food items found.' });
    }
    res.status(200).json(donatedFoodItems);
  } catch (error) {
    console.error('Error fetching donated food items:', error); 
    res.status(500).json({ message: 'Failed to fetch donated food items.', error: error.message });
  }
};

export const getid = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};
export const getnonid = async (req, res) => {
  try {
    const donor = await NonFoodDonation.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
};

export const updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update donation.', error });
  }
};

export const updatenonfoodDonor = async (req, res) => {
  try {
    const donor = await NonFoodDonation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }
    res.json(donor);
  } catch (error) {
    console.error('Update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update donation.', error });
  }
};

export const getDonationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const donations = await Donor.find({ userId });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch donations for this user.', error });
  }
};
export const getUserDonations = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const donations = await Donor.find({ userId });
    if (!donations.length) {
      return res.status(404).json({ message: 'No donations found for this user.' });
    }
    res.status(200).json(donations);
  } catch (error) {
    console.error('Error fetching user donations:', error);
    res.status(500).json({ message: 'Failed to fetch donations.', error });
  }
};
export const getUsernonfoodDonations = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const donations = await NonFoodDonation.find({ userId });
    if (!donations.length) {
      return res.status(404).json({ message: 'No donations found for this user.' });
    }
    res.status(200).json(donations);
  } catch (error) {
    console.error('Error fetching user donations:', error);
    res.status(500).json({ message: 'Failed to fetch donations.', error });
  }
};

export const requestFood = async (req, res) => {
  try {
    const { donorId, name, contactNumber, address, latitude, longitude, description } = req.body;

    if (!donorId || !name || !contactNumber || !address) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    const existingRequest = await Request.findOne({ donorId, contactNumber });
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested this food item.' });
    }

    const newRequest = new Request({
      donorId,
      userId: donor.userId, 
      requesterName: name,
      contactNumber,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      latitude: latitude || null,
      longitude: longitude || null,
      description,
    });

    await newRequest.save();
    const message = `New request from ${name} for your food item. Contact them at ${contactNumber}.`;
    await sendSmsNotification(donor.contactNumber, message);
    res.status(200).json({ message: 'Request submitted successfully.' });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Failed to submit request.', error });
  }
};
export const nonfoodrequestFood = async (req, res) => {
  try {
    const { donorId, name, contactNumber, address, latitude, longitude, description } = req.body;

    if (!donorId || !name || !contactNumber || !address) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const donor = await NonFoodDonation.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    const existingRequest = await NonFoodRequest.findOne({ donorId, contactNumber });
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested this food item.' });
    }

    const newRequest = new NonFoodRequest({
      donorId,
      userId: donor.userId, 
      requesterName: name,
      contactNumber,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      latitude: latitude || null,
      longitude: longitude || null,
      description,
    });

    await newRequest.save();
    const message = `New request from ${name} for your food item. Contact them at ${contactNumber}.`;
    await sendSmsNotification(donor.contactNumber, message);
    res.status(200).json({ message: 'Request submitted successfully.' });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Failed to submit request.', error });
  }
};

export const getRequestsForDonor = async (req, res) => {
  try {
    const { userId } = req.params; 
    const requests = await Request.find({ userId });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error });
  }
};
export const getNonFoodRequestsForDonor = async (req, res) => {
  try {
    const { userId } = req.params; 
    const requests = await NonFoodRequest.find({ userId });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error });
  }
};

export const getStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  try {
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Determine message to send based on status
    let message;
    if (status === 'Accepted') {
      const donorId = request.donorId;
      const updatedDonation = await Donor.findByIdAndUpdate(
        donorId,
        {isAccepted: true},
        {new: true}
      );
      message = `Hi ${request.requesterName}, your food request has been accepted!`;
    } else if (status === 'Rejected') {
      message = `Hi ${request.requesterName}, your food request has been rejected.`;
    }

    // Send SMS notification using Twilio
    await sendSmsNotification(request.contactNumber, message);

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request status and send SMS' });
  }
};
export const getnonfoodStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  try {
    const request = await NonFoodRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Determine message to send based on status
    let message;
    if (status === 'Accepted') {
      const donorId = request.donorId;
      const updatedDonation = await NonFoodDonation.findByIdAndUpdate(
        donorId,
        {isAccepted: true},
        {new: true}
      );
      message = `Hi ${request.requesterName}, your food request has been accepted!`;
    } else if (status === 'Rejected') {
      message = `Hi ${request.requesterName}, your food request has been rejected.`;
    }

    // Send SMS notification using Twilio
    await sendSmsNotification(request.contactNumber, message);

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request status and send SMS' });
  }
};


