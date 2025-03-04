// index.js

import {
  getThreadMessageContent,
  getThreadMessages,
  listHubSpotConversations
} from './conversations.js';

import { createHubSpotDeal } from './hubspot.js';
import dotenv from 'dotenv';
import { parseEmail as parseEmailContent } from './parser.js';

dotenv.config();

(async function main() {
  try {
    console.log('Listing threads...');
    // 1) Pull threads from HubSpot
    const conversationList = await listHubSpotConversations(10, 0);
    const threads = conversationList.results || [];

    // 2) Iterate over each thread
    for (const thread of threads) {
      const threadId = thread.id;

      // 3) Fetch messages for this thread
      let messagesData = await getThreadMessages(threadId);
      // messagesData is an object, typically with a "results" array
      const messages = messagesData.results || [];

      // 4) For each message, if it is type 'MESSAGE', fetch its original content
      for (const msg of messages) {
        if (msg.type !== 'MESSAGE') {
          console.log(`Skipping non-MESSAGE type: ${msg.type}`);
          continue;
        }

        // 5) Fetch the "original-content" for this message
        const originalContent = await getThreadMessageContent(threadId, msg.id);
        // originalContent should contain fields like .text or .html

        // 6) Grab the raw text to parse
        //    The .text field is the big chunk with "From: Geekly Leads <leads@geeklymedia.com>" etc.
        const emailBody = originalContent.text || originalContent.html || '';

        // 7) Use your existing parser. It expects something like { text, html, ... }.
        //    We'll pass the entire text into "mailparser" structure:
        const parsedData = parseEmailContent({ text: emailBody });

        console.log('Parsed data:', parsedData);

        // 8) Create a deal with the parsed data
        await createHubSpotDeal(parsedData);
      }
    }

    console.log('Done processing all threads!');
  } catch (error) {
    console.error('Error in main workflow:', error);
  }
})();
