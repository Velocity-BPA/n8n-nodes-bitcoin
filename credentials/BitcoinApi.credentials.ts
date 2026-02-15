import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class BitcoinApi implements ICredentialType {
	name = 'bitcoinApi';
	displayName = 'Bitcoin API';
	documentationUrl = 'https://github.com/Blockstream/esplora/blob/master/API.md';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://blockstream.info/api',
			required: true,
			description: 'Base URL for the Bitcoin API',
		},
	];
}