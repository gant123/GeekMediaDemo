import { Client } from '@hubspot/api-client';
import dotenv from 'dotenv';

dotenv.config();

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_API_KEY });

/**
 * Creates a new deal in HubSpot using the provided data.
 *
 * @param {Object} data - An object with keys: phone, listingAddress, message, senderName, senderEmail.
 */
export async function createHubSpotDeal({ phone, listingAddress, message, senderName, senderEmail, spaceRequired }) {
  // Map the extracted data to HubSpot deal properties.
  const properties = {
    dealname: `Inquiry: ${listingAddress} with Space Required ${spaceRequired}`,
    description: `Sender: ${senderName}\nEmail: ${senderEmail}\nPhone: ${phone}\nMessage: ${message}\nSpace Required: ${spaceRequired}`,
    
  };

  // Construct the input for the create call. (Associations are optional.)
  const SimplePublicObjectInputForCreate = { properties };
  try {
    const apiResponse = await hubspotClient.crm.deals.basicApi.create(SimplePublicObjectInputForCreate);
    console.log('Deal created successfully:', JSON.stringify(apiResponse, null, 2));
  } catch (e) {
    if (e.message === 'HTTP request failed') {
      console.error('HTTP request failed:', JSON.stringify(e.response, null, 2));
    } else {
      console.error('Error creating deal in HubSpot:', e);
    }
  }
}
