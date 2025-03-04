/**
 * Parses the mail object (returned by mailparser) to extract:
 * - actualFromName & actualFromEmail (from headers)
 * - senderName, senderEmail, phone, listingAddress, message (from the forwarded content in the email body)
 *
 * @param {Object} mail - The mail object with properties like from, text, html, etc.
 * @returns {Object} An object with the extracted fields.
 */
export function parseEmail(mail) {
  // Get header-level sender info
  const actualFromName = mail.from?.value?.[0]?.name || '';
  const actualFromEmail = mail.from?.value?.[0]?.address || '';

  // Use mail.text if available; fallback to mail.html.
  const content = mail.text || mail.html || '';

  // Extract all fields, including our new one
  const {
    userName,
    userEmail,
    phone,
    listingAddress,
    message,
    spaceRequired // added the new require from Rashid
  } = extractCustomFields(content);

  return {
    actualFromName: actualFromName.trim(),
    actualFromEmail: actualFromEmail.trim(),
    senderName: userName.trim(),
    senderEmail: userEmail.trim(),
    phone: phone.trim(),
    listingAddress: listingAddress.trim(),
    message: message.trim(),
    spaceRequired: spaceRequired.trim()  // <== Return it up here as well
  };
}
/**
 * Helper function to extract custom fields from the forwarded email body.
 * It expects the forwarded "From:" block to be split over two lines, e.g.:
 *
 *   "From: Emely Alvarez | Trillium Drivers | +1 832-997-6163 |"
 *   "ealvarez@trilliumdrivers.com | (Listing ID : 29941044)"
 *
 * And later the listing address and message.
 *
 * @param {string} text - The email body text.
 * @returns {Object} with keys: userName, userEmail, phone, listingAddress, message.
 */
function extractCustomFields(text) {
  let userName = '';
  let userEmail = '';
  let phone = '';
  let listingAddress = '';
  let message = '';
  let spaceRequired = ''; 
  // Split the text into lines and remove empty ones.
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  // 1. Look for the forwarded "From:" block.
  // Find the index of the line that starts with "From: "
  const fromIndex = lines.findIndex(line => line.startsWith('From: '));
  let forwardedFromLine = '';
  if (fromIndex !== -1) {
    forwardedFromLine = lines[fromIndex];
    // Check if the next line exists and if it contains an email address.
    const nextLine = lines[fromIndex + 1];
    const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
    if (nextLine && emailPattern.test(nextLine)) {
      // Append the next line so that the forwarded info is in one block.
      forwardedFromLine += ' | ' + nextLine;
    }

    // Remove the "From:" prefix and split by the pipe character.
    const parts = forwardedFromLine.replace(/^From:\s*/i, '').split('|').map(part => part.trim());
    // Expected parts order: [senderName, company, phone, senderEmail, ...]
    if (parts.length >= 4) {
      userName = parts[0];
      phone = parts[2];
      // Use regex to robustly extract the email address from parts[3]
     
      const emailMatch = parts[4].match(emailPattern);
      userEmail = emailMatch ? emailMatch[0] : '';
    }
  } else {
    console.warn('No forwarded "From:" line found.');
  }

  // 2. Extract the listing address using a regex pattern.
  // This pattern looks for a string with 4+ digits, a street keyword, and a 5-digit zip.
  const addressRegex = /\d{4,}.*(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Fwy|Highway|Hwy).*?\d{5}/i;
  const addressMatch = text.match(addressRegex);
  if (addressMatch) {
    listingAddress = addressMatch[0];
  }

  // 3. Extract the message starting at "Hi,"
  const hiIndex = text.indexOf('Hi,');
  if (hiIndex !== -1) {
    const remainder = text.substring(hiIndex).split('\n\n')[0];
    message = remainder;
  }
 // 4. NEW: Extract “Space Required:” line
  //    Example: "Space Required: 1500 sq ft"
  const spaceRegex = /Space Required:\s*(.+)/i;
  const spaceMatch = text.match(spaceRegex);
  if (spaceMatch) {
    spaceRequired = spaceMatch[1]; // might need to refine this to remove any trailing text
  }
  return { userName, userEmail, phone, listingAddress, message, spaceRequired };
}
