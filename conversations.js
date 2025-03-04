import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Fetches the email data from a HubSpot conversation using the
 * HubSpot Conversations API.
 *
 * @param {string} conversationId - The ID of the conversation or email thread.
 * @returns {Promise<Object>} The conversation details as JSON.
 */
export async function getHubSpotConversation(conversationId) {
  try {

    const url = `https://api.hubapi.com/conversations/v3/conversations/${conversationId}`;
    
    // If using an API Key (hapikey), you'd do: params: { hapikey: process.env.HUBSPOT_API_KEY }
    // If using a Private App Token (recommended), you pass it in headers:
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error retrieving conversation:', error?.response?.data || error);
    throw error;
  }
}

/**
 * Fetches a list of conversation threads from HubSpot.
 * @param {number} limit - How many threads to fetch at once.
 * @param {number} offset - Pagination offset, if required.
 * @returns {Promise<Object>} The threads data.
 */
export async function listHubSpotConversations(limit = 10, offset = 0) {
  try {
    const url = `https://api.hubapi.com/conversations/v3/conversations/threads`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      },
      params: {
        limit,
        offset
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error listing conversations:', error?.response?.data || error);
    throw error;
  }
}


/**
 * Fetches messages for a specific thread by ID.
 * @param {string} threadId
 * @returns {Promise<Array>} An array of messages (or an object, depending on HubSpot's response).
 */
export async function getThreadMessages(threadId) {
  try {
    const url = `https://api.hubapi.com/conversations/v3/conversations/threads/${threadId}/messages`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      }
    });

  
    return response.data;
  } catch (error) {
    console.error(`Error retrieving messages for thread ${threadId}:`, error?.response?.data || error);
    throw error;
  }
}

export async function getThreadMessageContent(threadId, messageId) {
  console.log('threadId', threadId);
  console.log('messageId', messageId);
  try {
    const url = `https://api.hubapi.com/conversations/v3/conversations/threads/${threadId}/messages/${messageId}/original-content`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      }
    });
    //console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error retrieving message content for thread ${threadId}, message ${messageId}:`, error?.response?.data || error);
    throw error;
  }
}