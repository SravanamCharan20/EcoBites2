import express from 'express';
import {
  avldatalist,
  donationform,
  getid,
  updateDonor,
  getDonationsByUserId,
  getUserDonations,
  requestFood,
  getRequestsForDonor,
  getStatus,
  nonfooddonorform,
  avlnonfooddatalist,
  getnonid,
  nonfoodrequestFood,
  getNonFoodRequestsForDonor,
  getnonfoodStatus,
  getUsernonfoodDonations,
  updatenonfoodDonor,
} from '../controllers/donor.controller.js';

const router = express.Router();


router.post('/donorform', donationform);
router.get('/donorform', avldatalist); 
router.get('/userdonations/:userId', getDonationsByUserId);
router.get('/get-donor/:id', getid);
router.get('/get-nondonor/:id', getnonid);
router.put('/:id', updateDonor);
router.put('/nonfood/:id', updatenonfoodDonor);
router.get('/userdonations/:userId', getUserDonations); 
router.get('/usernonfooddonations/:userId', getUsernonfoodDonations); 
router.post('/request', requestFood);
router.get('/requests/:userId', getRequestsForDonor);
router.patch('/requests/:requestId/status', getStatus);
router.post('/nfdonorform',nonfooddonorform);
router.get('/nfdonorform',avlnonfooddatalist);
router.post('/request-nonfood', nonfoodrequestFood);
router.get('/requests-nonfood/:userId', getNonFoodRequestsForDonor);
router.patch('/requests-nonfood/:requestId/status', getnonfoodStatus);


export default router;