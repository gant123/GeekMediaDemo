# Automated Email Lead Parser with HubSpot Integration

## Project Overview

This Node.js application automates the lead management process by monitoring an email inbox for incoming leads and automatically creating corresponding deals in HubSpot. The system specifically handles forwarded emails containing property inquiries, demonstrating advanced email parsing, API integration, and automated workflow design.

## Core Features

### 📧 Email Monitoring
- Real-time monitoring of Gmail inbox via IMAP
- Automatic detection and processing of unread messages
- Filtering system to process only relevant leads
- Secure email authentication using app-specific passwords

### 🔍 Intelligent Parsing
- Advanced regex patterns for data extraction
- Handles complex email structures including forwarded content
- Extracts key information:
  - Sender details (name, email)
  - Contact information (phone)
  - Property details (listing address)
  - Inquiry message content

### 🔄 HubSpot Integration
- Automated deal creation in HubSpot CRM
- Structured data mapping to HubSpot properties
- Error handling and retry logic
- Configurable deal pipeline integration

## Technical Architecture

### Component Overview

#### 1. Email Processor (imap.js)
```javascript
// Handles email server connection and message retrieval
const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  tls: true
});
```
- Manages IMAP connection lifecycle
- Implements event-driven email processing
- Streams message content for memory efficiency

#### 2. Parser Engine (parser.js)
```javascript
export function parseEmail(mail) {
  // Extracts data from email content using sophisticated regex patterns
  const { userName, userEmail, phone, listingAddress, message } = extractCustomFields(content);
}
```
- Custom parsing algorithms for data extraction
- Handles various email formats and structures
- Robust error handling for malformed content

#### 3. HubSpot Integration (hubspot.js)
```javascript
export async function createHubSpotDeal({ phone, listingAddress, message, senderName, senderEmail }) {
  // Creates structured deals in HubSpot with extracted data
  const properties = {
    dealname: `Inquiry: ${listingAddress}`,
    description: `Sender: ${senderName}\nEmail: ${senderEmail}\nPhone: ${phone}\nMessage: ${message}`
  };
}
```
- Seamless HubSpot API integration
- Structured deal creation
- Comprehensive error handling

## Technical Stack

### Core Technologies
- **Runtime Environment:** Node.js (v23.3.0)
- **Package Management:** npm
- **Module System:** ES Modules

### Key Dependencies
- `node-imap`: Email server communication
- `mailparser`: Email content parsing
- `@hubspot/api-client`: HubSpot API integration
- `dotenv`: Environment configuration

## Setup Guide

### 1. Environment Configuration
Create a `.env` file with the following variables:
```bash
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
HUBSPOT_API_KEY=your_hubspot_api_key
TARGET_EMAIL=leads@yourdomain.com
```

### 2. Installation
```bash
# Install dependencies
npm install

# Start the application
npm start
```

## Security Implementation

### Email Security
- TLS encryption for IMAP connections
- App-specific password implementation
- Secure credential management

### API Security
- Private app tokens for HubSpot authentication
- Environment variable protection
- No hardcoded credentials

## Error Handling

The application implements comprehensive error handling:
- Connection failures
- Parse errors
- API integration issues
- Malformed email content

## Monitoring and Logging

The system provides detailed logging for:
- Email processing status
- Parsing results
- HubSpot integration outcomes
- Error conditions and stack traces

## Best Practices Implemented

### Code Quality
- Modern JavaScript practices
- Asynchronous programming patterns
- Clean code principles
- Comprehensive documentation
- Modular architecture

### Performance
- Stream processing for emails
- Efficient memory usage
- Optimized regex patterns
- Connection pooling

## Future Enhancements

### Planned Features
1. Message queue implementation
2. Multi-account support
3. Advanced filtering options
4. Custom deal pipeline mapping
5. Automated contact creation
6. Performance metrics dashboard

### Scalability Considerations
- Horizontal scaling capability
- Rate limiting handling
- Load balancing preparation
- Caching implementation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Contact

For questions or support, please contact the development team.

---

## Project Status

🟢 Active Development | Version 1.0.0

This implementation demonstrates expertise in:
- Node.js development
- API integration
- Email processing
- Automated workflow design
- Security implementation
- Clean code practices

The solution provides a robust foundation for automated lead management while maintaining flexibility for future enhancements and customizations.