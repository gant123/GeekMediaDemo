import { startImap } from './imap.js';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Optionally implement notification system here
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally implement notification system here
});

(async function main() {
  console.log('Starting email monitoring service...');
  startImap();
  
  // Keep the process alive
  setInterval(() => {
    console.log('Service is running... ' + new Date().toISOString());
  }, 300000); // Log every 5 minutes to show the service is alive
})();
