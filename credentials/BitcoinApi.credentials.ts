import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BitcoinApi implements ICredentialType {
	name = 'bitcoinApi';
	displayName = 'Bitcoin API';
	documentationUrl = 'https://www.blockcypher.com/dev/bitcoin/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'API token for BlockCypher Bitcoin API. Free tier available with rate limits.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.blockcypher.com/v1/btc/main',
			description: 'Base URL for the Bitcoin API service',
		},
	];
}