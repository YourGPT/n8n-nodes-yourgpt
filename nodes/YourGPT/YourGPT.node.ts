// Import required n8n workflow types
import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	NodeConnectionType,
	INodeExecutionData,
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';

/**
 * YourGPT node class for integrating YourGPT chatbot with n8n
 * Supports creating chat sessions and sending messages
 */
export class YourGPT implements INodeType {
	// Node type description that defines how the node appears and behaves in n8n
	description: INodeTypeDescription = {
		displayName: 'YourGPT Chatbot',
		name: 'yourGPT',
		icon: 'file:yourgpt.png', 
		group: ['transform'],
		version: 1,
		description: 'Integrate YourGPT Chatbot into your n8n workflows',
		defaults: {
			name: 'YourGPT Chatbot',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'yourGPTApi',
				required: true,
			},
		],
		// Define node parameters that users can configure
		properties: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{
						name: 'Create Session',
						value: 'createSession',
					},
					{
						name: 'Send Message',
						value: 'sendMessage',
					},
				],
				default: 'createSession',
				required: true,
			},
			{
				displayName: 'Widget UID',
				name: 'widgetUid',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['sendMessage'],
					},
				},
			},
			{
				displayName: 'Session UID',
				name: 'session_uid',
				type: 'string',
				default: '',
        placeholder: 'Enter session UID ',
				displayOptions: {
					show: {
						action: ['sendMessage'],
					},
				},
				required: true,
			},
		],
	};

	/**
	 * Main execution method for the node
	 * Handles both creating sessions and sending messages to YourGPT chatbot
	 */
	async execute(this: IExecuteFunctions) {
		// Get input data and initialize response array
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get API credentials
		const credentials = await this.getCredentials('yourGPTApi');
		const apiKey = credentials.apiKey;

		for (let i = 0; i < items.length; i++) {
			const action = this.getNodeParameter('action', i) as string;
			const widgetUid = this.getNodeParameter('widgetUid', i) as string;

			try {
				// Handle session creation
			if (action === 'createSession') {
					const response = await this.helpers.request({
						method: 'POST',
						url: 'https://api.yourgpt.ai/chatbot/v1/createSession',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'api-key': apiKey,
						},
						form: {
							widget_uid: widgetUid,
						},
						json: true,
					});
					returnData.push({ json: response });
				}

				// Handle message sending
			if (action === 'sendMessage') {
					const message = this.getNodeParameter('message', i) as string;
					const sessionUid = this.getNodeParameter('session_uid', i) as string;

					const messageResponse = await this.helpers.request({
						method: 'POST',
						url: 'https://api.yourgpt.ai/chatbot/v1/sendMessage',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'api-key': apiKey,
						},
						form: {
							widget_uid: widgetUid,
							session_uid: sessionUid,
							message: message,
						},
						json: true,
					});

					// Format the response with fallback values for missing data
					// Extract the reply, session UID, and choices from the message response
					returnData.push({
						json: {
							reply: messageResponse.data?.message ?? '', // Reply from the chatbot
							choices: messageResponse.data?.choices ?? [], // Choices provided by the chatbot
						},
					});
				}
			} catch (error) {
				// Throw a NodeApiError if an error occurs during execution
				throw new NodeApiError(this.getNode(), error);
			}
		}
		// Prepare and return the output data
		return this.prepareOutputData(returnData);
	}
}
