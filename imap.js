import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { parseEmail } from './parser.js';
import { createHubSpotDeal } from './hubspot.js';
import dotenv from 'dotenv';
dotenv.config();

const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  tls: true
};

const imap = new Imap(imapConfig);

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

imap.once('ready', () => {
  console.log('IMAP connection ready...');
  openInbox((err, box) => {
    if (err) throw err;

    // Search for unread emails
    imap.search(['UNSEEN'], (searchErr, results) => {
      if (searchErr) throw searchErr;
      if (!results || !results.length) {
        console.log('No new emails found.');
        imap.end();
        return;
      }

      const fetcher = imap.fetch(results, { bodies: '' });

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
            const fromAddress = parsed.from?.text || '';
        
            if (fromAddress.toLowerCase().includes(process.env.TARGET_EMAIL.toLowerCase())) {
              console.log(`New email from target (${process.env.TARGET_EMAIL}). Processing...`);
        
              // Pass the entire "parsed" object
              const parsedData = parseEmail(parsed);
              console.log(parsedData);
        
              // HubSpot deal:
             await createHubSpotDeal(parsedData);
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
});

imap.once('error', (err) => {
  console.error('IMAP error:', err);
});

imap.once('end', () => {
  console.log('IMAP connection ended');
});

export function startImap() {
  imap.connect();
}
