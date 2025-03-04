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
    senderName,
    userEmail,
    phone,
    listingAddress,
    message,
    spaceRequired 
  } = extractCustomFields(content);
console.log('senderName', senderName);
  return {
    actualFromName: actualFromName.trim(),
    actualFromEmail: actualFromEmail.trim(),
    senderName: senderName.trim(),
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
  let senderName = '';
  let company = '';
  let phone = '';
  let userEmail = '';
  let listingId = '';
  
  let spaceRequired = '';
  let listingAddress = '';
  let message = '';

  // Regex patterns
  const phoneRegex = /(\+?\d{1,3}[-.\s]?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4})/;
  const emailRegex = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/;
  const listingIdRegex = /\(Listing ID\s*:\s*(.*?)\)/i;
  const spaceRegex = /space required:\s*(.+)/i;
  const addressRegex = /^\d{4,}.*\d{5}/i; 
  const hiRegex = /^hi[,.:]?/i;

  // Convert to lines
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  
  // 1) Find the "From:" line that actually contains a pipe
  //    We'll loop until we find a line that starts with "From:" AND includes "|"
  let fromBlock = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.toLowerCase().startsWith('from:') &&
      line.includes('|') // ensure it has pipe(s)
    ) {
      // Remove "From: "
      let combined = line.replace(/^from:\s*/i, '').trim();
      
      // The next line might also contain '|' e.g. "ealvarez@... | (Listing ID...)"
      const nextLine = lines[i + 1] || '';
      if (nextLine.includes('|')) {
        combined += ' ' + nextLine.trim();
      }
      fromBlock = combined;
      break; // stop after we find the first valid "From:" with pipes
    }
  }

  // 2) If we found fromBlock, parse it
  if (fromBlock) {
    // Split on '|'
    const tokens = fromBlock
      .split('|')
      .map(t => t.trim())
      .filter(Boolean);

    // Go through each token, match phone/email/listingID, or leftover
    const leftover = [];
    for (const token of tokens) {
      // phone
      if (!phone) {
        const pm = token.match(phoneRegex);
        if (pm) {
          phone = pm[1];
          continue;
        }
      }
      // email
      if (!userEmail) {
        const em = token.match(emailRegex);
        if (em) {
          userEmail = em[0];
          continue;
        }
      }
      // listing ID
      if (!listingId) {
        const lm = token.match(listingIdRegex);
        if (lm) {
          listingId = lm[1].trim();
          continue;
        }
      }
      // leftover (potential name, company, etc.)
      leftover.push(token);
    }

    // If leftover has e.g. [ "Emely Alvarez", "Trillium Drivers", ... ]
    if (leftover.length > 0) {
      senderName = leftover[0];
    }
    if (leftover.length > 1) {
      company = leftover[1];
    }
  }

  // 3) Find "Space Required:"
  const spaceLine = lines.find(l => spaceRegex.test(l));
  if (spaceLine) {
    const match = spaceLine.match(spaceRegex);
    if (match) {
      spaceRequired = match[1].trim();
    }
  }

  // 4) Listing Address (15055 East Fwy ... 77530)
  const addressLine = lines.find(l => addressRegex.test(l));
  if (addressLine) {
    listingAddress = addressLine;
  }

  // 5) Grab message after "Hi,"
  const hiIndex = lines.findIndex(l => hiRegex.test(l));
  if (hiIndex !== -1) {
    const msgLines = [];
    for (let i = hiIndex; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.toLowerCase().startsWith('visit the marketing center') ||
        line.toLowerCase().startsWith('space required') ||
        !line
      ) {
        break;
      }
      msgLines.push(line);
    }
    message = msgLines.join(' ');
  }

  return {
    senderName,
    company,
    phone,
    userEmail,
    listingId,
    listingAddress,
    spaceRequired,
    message
  };
}



