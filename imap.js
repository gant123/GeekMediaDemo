import Imap from 'node-imap';
import { createHubSpotDeal } from './hubspot.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { parseEmail } from './parser.js';
import { simpleParser } from 'mailparser';

dotenv.config();

const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  tls: true
};

const imap = new Imap(imapConfig);

// Create a Set to track processed emails in memory
const processedEmails = new Set();

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

function checkEmails() {
  openInbox((err, box) => {
    if (err) {
      console.error('Error opening inbox:', err);
      reconnect();
      return;
    }

    // Search for unread emails
    imap.search(['UNSEEN'], (searchErr, results) => {
      if (searchErr) {
        console.error('Search error:', searchErr);
        reconnect();
        return;
      }

      if (!results || !results.length) {
        console.log('No new emails found. Waiting for next check...');
        return;
      }

      const fetcher = imap.fetch(results, { bodies: '', markSeen: true });

      fetcher.on('message', (msg, seqno) => {
        let emailBuffer = '';

        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            emailBuffer += chunk.toString('utf8');
          });
        });

        msg.once('end', async () => {
          try {
            const parsed = await simpleParser(emailBuffer);
            const messageId = parsed.messageId;
            const fromAddress = parsed.from?.text || '';
        
            if (fromAddress.toLowerCase().includes(process.env.TARGET_EMAIL.toLowerCase())) {
              console.log(`New email from target (${process.env.TARGET_EMAIL}). Processing...`);
              
              // Check if we've already processed this email
              if (await isEmailProcessed(messageId)) {
                console.log(`Email ${messageId} already processed, skipping...`);
                return;
              }
        
              const parsedData = parseEmail(parsed);
            //  console.log(parsedData);
        
              // Create HubSpot deal
              await createHubSpotDeal(parsedData);
              
              // Mark email as processed in our tracking system
              await markEmailAsProcessed(messageId);
            }
          } catch (parseErr) {
            console.error('Error parsing email:', parseErr);
          }
        });
      });

      fetcher.once('error', (fetchErr) => {
        console.error('Fetch error:', fetchErr);
      });

      fetcher.once('end', () => {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });
}

// Function to check if email was processed
async function isEmailProcessed(messageId) {
  // In-memory check
  if (processedEmails.has(messageId)) {
    return true;
  }
  
  // You could also implement persistent storage here
  // Example with a JSON file:
  try {
    const processed = await fs.readFile('processed_emails.json', 'utf8');
    const processedList = JSON.parse(processed);
    return processedList.includes(messageId);
  } catch (err) {
    // If file doesn't exist or other error, assume not processed
    return false;
  }
}

// Function to mark email as processed
async function markEmailAsProcessed(messageId) {
  // Add to in-memory Set
  processedEmails.add(messageId);
  
  // You could also implement persistent storage here
  // Example with a JSON file:
  try {
    let processedList = [];
    try {
      const processed = await fs.readFile('processed_emails.json', 'utf8');
      processedList = JSON.parse(processed);
    } catch (err) {
      // File doesn't exist yet, start with empty array
    }
    
    processedList.push(messageId);
    await fs.writeFile('processed_emails.json', JSON.stringify(processedList));
  } catch (err) {
    console.error('Error saving processed email:', err);
  }
}

function reconnect() {
  console.log('Attempting to reconnect...');
  if (imap.state !== 'disconnected') {
    imap.end();
  }
  setTimeout(() => {
    imap.connect();
  }, 5000); // Wait 5 seconds before reconnecting
}

// Set up event handlers for connection monitoring
imap.once('ready', () => {
  console.log('IMAP connection ready...');
  
  // Initial check
  checkEmails();
  
  // Set up interval for continuous checking
  setInterval(() => {
    if (imap.state === 'authenticated') {
      checkEmails();
    }
  }, 30000); // Check every 30 seconds
});

// Enhanced error handling
imap.on('error', (err) => {
  console.error('IMAP error:', err);
  reconnect();
});

imap.on('end', () => {
  console.log('IMAP connection ended');
  reconnect();
});

export function startImap() {
  imap.connect();
}
