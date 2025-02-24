# Email Parser with HubSpot Integration

**Company:** Geekly Media

**Project Overview:**

This project demonstrates a Node.js application that automates lead management by parsing incoming emails and creating deals in HubSpot. The application showcases modern JavaScript practices, API integration, and automated workflow design.

## Technical Implementation

### Core Components

1. **Email Processing (imap.js)**
   - Utilizes `node-imap` for IMAP protocol handling
   - Implements event-driven architecture for email processing
   - Features:
     - Connects to Gmail using secure IMAP
     - Filters unread emails from specific senders
     - Streams email content for efficient memory usage
     - Handles connection lifecycle events

```javascript
// Key implementation highlights
const imap = new Imap(imapConfig);
imap.once('ready', () => {
  // Connection handling
});
```

2. **Email Parsing (parser.js)**
   - Custom parsing logic using regex patterns
   - Extracts structured data from email content:
     - Phone numbers
     - Listing addresses
     - Message content
   - Modular design for easy pattern updates

```javascript
export function parseEmail(rawText) {
  // Regex patterns for data extraction
  const phoneMatch = rawText.match(/Phone:\s?(\+?\d[\d\s-]+)/i);
  // ... additional parsing logic
}
```

3. **HubSpot Integration (hubspot.js)**
   - Implements HubSpot's REST API
   - Creates deals with structured data
   - Features:
     - Bearer token authentication
     - Error handling
     - Deal property mapping
     - Configurable pipeline integration

```javascript
export async function createHubSpotDeal({ phone, listingAddress, message }) {
  // HubSpot API integration
  const dealData = {
    properties: {
      dealname: `Inquiry: ${listingAddress}`,
      // ... deal properties
    }
  };
}
```

### Architecture Design

The application follows these architectural principles:

1. **Modularity**
   - Separate modules for IMAP, parsing, and HubSpot integration
   - Clear separation of concerns
   - Easy to maintain and extend

2. **Configuration Management**
   - Environment variables for sensitive data
   - Configurable email filtering
   - Flexible HubSpot pipeline integration

3. **Error Handling**
   - Comprehensive error catching
   - Detailed error logging
   - Graceful failure handling

### Technical Stack

- **Runtime:** Node.js (v23.3.0)
- **Package Management:** npm
- **Module System:** ES Modules
- **Key Dependencies:**
  - `node-imap`: Email server communication
  - `mailparser`: Email content parsing
  - `axios`: HTTP client for HubSpot API
  - `dotenv`: Environment configuration

## Setup and Configuration

1. **Environment Setup**
```bash
# Required environment variables
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
HUBSPOT_API_KEY=your_private_app_token
TARGET_EMAIL=leads@yourdomain.com
```

2. **Installation**
```bash
npm install
```

3. **Running the Application**
```bash
npm start
```

## Security Considerations

1. **Email Security**
   - Uses app-specific passwords
   - TLS encryption for IMAP connection
   - Secure credential management

2. **API Security**
   - Private app tokens for HubSpot
   - Environment variable protection
   - No hardcoded credentials

## Code Quality

The project demonstrates:
- Modern JavaScript practices
- Asynchronous programming
- Event-driven architecture
- Clean code principles
- Comprehensive error handling
- Modular design patterns

This implementation showcases the ability to:
- Integrate complex systems
- Handle asynchronous workflows
- Process unstructured data
- Design maintainable solutions

---

## Conclusion

This project demonstrates proficiency in:
- Node.js development
- API integration
- Email processing
- Automated workflow design
- Clean code practices
- Security implementation

The solution provides a robust foundation for automated lead management while maintaining flexibility for future enhancements and customizations.