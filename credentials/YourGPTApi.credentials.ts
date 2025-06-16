// Import required n8n credential types
import {
    ICredentialType,
    INodeProperties,
  } from 'n8n-workflow';
  
  /**
   * Credential type for YourGPT API authentication
   * Manages API key storage and validation for YourGPT nodes
   */
  export class YourGPTApi implements ICredentialType {
    // Internal name for the credential type
    name = 'yourGPTApi';
    // Display name shown in the n8n UI
    displayName = 'YourGPT Chatbot';
    // Define credential properties that users need to provide
    properties: INodeProperties[] = [
      {
        displayName: 'API Key',
        name: 'apiKey',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          password: true,  // Masks the API key in the UI
        },
        description: 'The API key obtained from YourGPT dashboard',
      },
    ];
  }
  