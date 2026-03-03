/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-bitcoin/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Bitcoin implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Bitcoin',
    name: 'bitcoin',
    icon: 'file:bitcoin.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Bitcoin API',
    defaults: {
      name: 'Bitcoin',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'bitcoinApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Address',
            value: 'address',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Block',
            value: 'block',
          },
          {
            name: 'Mempool',
            value: 'mempool',
          },
          {
            name: 'Fee',
            value: 'fee',
          }
        ],
        default: 'address',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['address'],
    },
  },
  options: [
    {
      name: 'Get Address Details',
      value: 'getAddress',
      description: 'Get address details including balance and transaction count',
      action: 'Get address details',
    },
    {
      name: 'Get Address Balance',
      value: 'getAddressBalance',
      description: 'Get address balance only',
      action: 'Get address balance',
    },
    {
      name: 'Get Address Full',
      value: 'getAddressFull',
      description: 'Get address with full transaction details',
      action: 'Get address full details',
    },
    {
      name: 'Generate Address',
      value: 'generateAddress',
      description: 'Generate new address and private key',
      action: 'Generate new address',
    },
    {
      name: 'Get Unspent Outputs',
      value: 'getUnspentOutputs',
      description: 'Get unspent transaction outputs for address',
      action: 'Get unspent outputs',
    },
  ],
  default: 'getAddress',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
    },
  },
  options: [
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction details by hash',
      action: 'Get transaction',
    },
    {
      name: 'Create Transaction',
      value: 'createTransaction',
      description: 'Create a new transaction',
      action: 'Create transaction',
    },
    {
      name: 'Broadcast Transaction',
      value: 'broadcastTransaction',
      description: 'Broadcast raw transaction to the network',
      action: 'Broadcast transaction',
    },
    {
      name: 'Decode Transaction',
      value: 'decodeTransaction',
      description: 'Decode raw transaction hex',
      action: 'Decode transaction',
    },
    {
      name: 'Get Transaction Confidence',
      value: 'getTransactionConfidence',
      description: 'Get transaction confidence score',
      action: 'Get transaction confidence',
    },
    {
      name: 'Delete Transaction',
      value: 'deleteTransaction',
      description: 'Delete transaction from pool if unconfirmed',
      action: 'Delete transaction',
    },
  ],
  default: 'getTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['block'],
    },
  },
  options: [
    {
      name: 'Get Block by Hash',
      value: 'getBlock',
      description: 'Get block information by hash',
      action: 'Get block by hash',
    },
    {
      name: 'Get Block by Height',
      value: 'getBlockByHeight',
      description: 'Get block information by height',
      action: 'Get block by height',
    },
    {
      name: 'Get Blockchain State',
      value: 'getBlockchain',
      description: 'Get latest blockchain state information',
      action: 'Get blockchain state',
    },
    {
      name: 'Get Latest Blocks',
      value: 'getBlocks',
      description: 'Get array of latest blocks',
      action: 'Get latest blocks',
    },
  ],
  default: 'getBlock',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['mempool'],
    },
  },
  options: [
    {
      name: 'Get Mempool Transactions',
      value: 'getMempoolTransactions',
      description: 'Get unconfirmed transactions from mempool',
      action: 'Get mempool transactions',
    },
    {
      name: 'Get Address Unconfirmed',
      value: 'getAddressUnconfirmed',
      description: 'Get unconfirmed transactions for address',
      action: 'Get address unconfirmed transactions',
    },
  ],
  default: 'getMempoolTransactions',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['fee'],
    },
  },
  options: [
    {
      name: 'Get Current Fees',
      value: 'getCurrentFees',
      description: 'Get current network fee estimates',
      action: 'Get current network fee estimates',
    },
    {
      name: 'Estimate Transaction Fee',
      value: 'estimateTransactionFee',
      description: 'Estimate fee for a transaction',
      action: 'Estimate transaction fee',
    },
  ],
  default: 'getCurrentFees',
},
      // Parameter definitions
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['getAddress', 'getAddressBalance', 'getAddressFull', 'getUnspentOutputs'],
    },
  },
  default: '',
  description: 'The Bitcoin address to query',
},
{
  displayName: 'Before',
  name: 'before',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['getAddressFull'],
    },
  },
  default: '',
  description: 'Get transactions before this transaction hash',
},
{
  displayName: 'After',
  name: 'after',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['getAddressFull'],
    },
  },
  default: '',
  description: 'Get transactions after this transaction hash',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['getAddressFull'],
    },
  },
  default: 50,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Unspent Only',
  name: 'unspentOnly',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['getUnspentOutputs'],
    },
  },
  default: true,
  description: 'Return only unspent outputs',
},
{
  displayName: 'Include Script',
  name: 'includeScript',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['getUnspentOutputs'],
    },
  },
  default: false,
  description: 'Include script hex in response',
},
{
  displayName: 'Transaction Hash',
  name: 'hash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The transaction hash to retrieve',
},
{
  displayName: 'Include Hex',
  name: 'includeHex',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransaction'],
    },
  },
  default: false,
  description: 'Whether to include the raw transaction hex in the response',
},
{
  displayName: 'Inputs',
  name: 'inputs',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction'],
    },
  },
  default: '',
  description: 'Transaction inputs as JSON array',
  placeholder: '[{"addresses": ["address1"], "prev_hash": "hash", "output_index": 0}]',
},
{
  displayName: 'Outputs',
  name: 'outputs',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction'],
    },
  },
  default: '',
  description: 'Transaction outputs as JSON array',
  placeholder: '[{"addresses": ["address1"], "value": 1000000}]',
},
{
  displayName: 'Fees',
  name: 'fees',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction'],
    },
  },
  default: 1000,
  description: 'Transaction fees in satoshis',
},
{
  displayName: 'Raw Transaction',
  name: 'tx',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['broadcastTransaction', 'decodeTransaction'],
    },
  },
  default: '',
  description: 'Raw transaction hex string',
},
{
  displayName: 'Transaction Hash',
  name: 'hash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionConfidence', 'deleteTransaction'],
    },
  },
  default: '',
  description: 'The transaction hash',
},
{
  displayName: 'Block Hash',
  name: 'hash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlock'],
    },
  },
  default: '',
  description: 'The hash of the block to retrieve',
},
{
  displayName: 'Transaction Start Index',
  name: 'txstart',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlock'],
    },
  },
  default: 0,
  description: 'The index of the first transaction to include in the response',
},
{
  displayName: 'Transaction Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlock'],
    },
  },
  default: 20,
  description: 'Maximum number of transactions to include in the response',
},
{
  displayName: 'Block Height',
  name: 'height',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHeight'],
    },
  },
  default: 0,
  description: 'The height of the block to retrieve',
},
{
  displayName: 'Transaction Start Index',
  name: 'txstart',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHeight'],
    },
  },
  default: 0,
  description: 'The index of the first transaction to include in the response',
},
{
  displayName: 'Transaction Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByHeight'],
    },
  },
  default: 20,
  description: 'Maximum number of transactions to include in the response',
},
{
  displayName: 'Block Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlocks'],
    },
  },
  default: 10,
  description: 'Maximum number of blocks to retrieve',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['mempool'],
      operation: ['getMempoolTransactions'],
    },
  },
  default: 50,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'In Start',
  name: 'instart',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['mempool'],
      operation: ['getMempoolTransactions'],
    },
  },
  default: '',
  description: 'Transaction hash to start from (for pagination)',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['mempool'],
      operation: ['getAddressUnconfirmed'],
    },
  },
  default: '',
  description: 'Bitcoin address to get unconfirmed transactions for',
},
{
  displayName: 'Transaction Inputs',
  name: 'inputs',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['fee'],
      operation: ['estimateTransactionFee'],
    },
  },
  default: '[]',
  description: 'Array of transaction inputs with address and value',
  placeholder: '[{"addresses": ["address1"], "output_value": 1000000}]',
},
{
  displayName: 'Transaction Outputs',
  name: 'outputs',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['fee'],
      operation: ['estimateTransactionFee'],
    },
  },
  default: '[]',
  description: 'Array of transaction outputs with address and value',
  placeholder: '[{"addresses": ["address1"], "value": 500000}]',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'address':
        return [await executeAddressOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'block':
        return [await executeBlockOperations.call(this, items)];
      case 'mempool':
        return [await executeMempoolOperations.call(this, items)];
      case 'fee':
        return [await executeFeeOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAddressOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('bitcoinApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAddress': {
          const address = this.getNodeParameter('address', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/addrs/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAddressBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/addrs/${address}/balance`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAddressFull': {
          const address = this.getNodeParameter('address', i) as string;
          const before = this.getNodeParameter('before', i, '') as string;
          const after = this.getNodeParameter('after', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;

          let url = `${credentials.baseUrl}/addrs/${address}/full`;
          const queryParams: string[] = [];

          if (before) queryParams.push(`before=${before}`);
          if (after) queryParams.push(`after=${after}`);
          if (limit !== 50) queryParams.push(`limit=${limit}`);

          if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'generateAddress': {
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/addrs`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getUnspentOutputs': {
          const address = this.getNodeParameter('address', i) as string;
          const unspentOnly = this.getNodeParameter('unspentOnly', i, true) as boolean;
          const includeScript = this.getNodeParameter('includeScript', i, false) as boolean;

          let url = `${credentials.baseUrl}/addrs/${address}/unspent`;
          const queryParams: string[] = [];

          if (!unspentOnly) queryParams.push('unspentOnly=false');
          if (includeScript) queryParams.push('includeScript=true');

          if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  return returnData;
}

async function executeTransactionOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('bitcoinApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getTransaction': {
          const hash = this.getNodeParameter('hash', i) as string;
          const includeHex = this.getNodeParameter('includeHex', i) as boolean;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/txs/${hash}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            qs: includeHex ? { includeHex: 'true' } : {},
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createTransaction': {
          const inputs = JSON.parse(this.getNodeParameter('inputs', i) as string);
          const outputs = JSON.parse(this.getNodeParameter('outputs', i) as string);
          const fees = this.getNodeParameter('fees', i) as number;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/txs/new`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              inputs,
              outputs,
              fees,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'broadcastTransaction': {
          const tx = this.getNodeParameter('tx', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/txs/push`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              tx,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'decodeTransaction': {
          const tx = this.getNodeParameter('tx', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/txs/decode`,
            headers: {
              'X-API-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              tx,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactionConfidence': {
          const hash = this.getNodeParameter('hash', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/txs/${hash}/confidence`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteTransaction': {
          const hash = this.getNodeParameter('hash', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/txs/${hash}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeBlockOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('bitcoinApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getBlock': {
          const hash = this.getNodeParameter('hash', i) as string;
          const txstart = this.getNodeParameter('txstart', i, 0) as number;
          const limit = this.getNodeParameter('limit', i, 20) as number;

          const queryParams = new URLSearchParams();
          if (txstart > 0) queryParams.append('txstart', txstart.toString());
          if (limit !== 20) queryParams.append('limit', limit.toString());
          if (credentials.apiKey) queryParams.append('token', credentials.apiKey);

          const queryString = queryParams.toString();
          const url = `${credentials.baseUrl}/blocks/${hash}${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockByHeight': {
          const height = this.getNodeParameter('height', i) as number;
          const txstart = this.getNodeParameter('txstart', i, 0) as number;
          const limit = this.getNodeParameter('limit', i, 20) as number;

          const queryParams = new URLSearchParams();
          if (txstart > 0) queryParams.append('txstart', txstart.toString());
          if (limit !== 20) queryParams.append('limit', limit.toString());
          if (credentials.apiKey) queryParams.append('token', credentials.apiKey);

          const queryString = queryParams.toString();
          const url = `${credentials.baseUrl}/blocks/${height}${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockchain': {
          const queryParams = new URLSearchParams();
          if (credentials.apiKey) queryParams.append('token', credentials.apiKey);

          const queryString = queryParams.toString();
          const url = `${credentials.baseUrl}${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlocks': {
          const limit = this.getNodeParameter('limit', i, 10) as number;

          const queryParams = new URLSearchParams();
          if (limit !== 10) queryParams.append('limit', limit.toString());
          if (credentials.apiKey) queryParams.append('token', credentials.apiKey);

          const queryString = queryParams.toString();
          const url = `${credentials.baseUrl}/blocks${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode && error.httpCode >= 400) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeMempoolOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('bitcoinApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getMempoolTransactions': {
          const limit = this.getNodeParameter('limit', i) as number;
          const instart = this.getNodeParameter('instart', i) as string;

          let url = `${credentials.baseUrl}/txs`;
          const params: string[] = [];
          
          if (limit) {
            params.push(`limit=${limit}`);
          }
          if (instart) {
            params.push(`instart=${instart}`);
          }
          
          if (params.length > 0) {
            url += `?${params.join('&')}`;
          }

          const options: any = {
            method: 'GET',
            url: url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.url += (url.includes('?') ? '&' : '?') + `token=${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAddressUnconfirmed': {
          const address = this.getNodeParameter('address', i) as string;

          let url = `${credentials.baseUrl}/addrs/${address}/unconfirmed`;

          const options: any = {
            method: 'GET',
            url: url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.url += `?token=${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeFeeOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('bitcoinApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getCurrentFees': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}`,
            headers: {
              'User-Agent': 'n8n-bitcoin-node',
            },
            qs: {
              token: credentials.apiKey,
            },
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          // Extract fee information from the blockchain info response
          result = {
            high_fee_per_kb: response.high_fee_per_kb || null,
            medium_fee_per_kb: response.medium_fee_per_kb || null,
            low_fee_per_kb: response.low_fee_per_kb || null,
            unconfirmed_count: response.unconfirmed_count || 0,
            last_fork_height: response.last_fork_height || null,
            last_fork_hash: response.last_fork_hash || null,
          };
          break;
        }

        case 'estimateTransactionFee': {
          const inputs = this.getNodeParameter('inputs', i) as any;
          const outputs = this.getNodeParameter('outputs', i) as any;

          let parsedInputs: any;
          let parsedOutputs: any;

          try {
            parsedInputs = typeof inputs === 'string' ? JSON.parse(inputs) : inputs;
            parsedOutputs = typeof outputs === 'string' ? JSON.parse(outputs) : outputs;
          } catch (parseError: any) {
            throw new NodeOperationError(
              this.getNode(),
              `Invalid JSON format in inputs or outputs: ${parseError.message}`,
              { itemIndex: i }
            );
          }

          if (!Array.isArray(parsedInputs) || !Array.isArray(parsedOutputs)) {
            throw new NodeOperationError(
              this.getNode(),
              'Inputs and outputs must be arrays',
              { itemIndex: i }
            );
          }

          const txData: any = {
            inputs: parsedInputs,
            outputs: parsedOutputs,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/txs/new`,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'n8n-bitcoin-node',
            },
            qs: {
              token: credentials.apiKey,
            },
            body: txData,
            json: true,
          };

          const response = await this.helpers.httpRequest(options) as any;
          
          result = {
            tx: response.tx || null,
            tosign: response.tosign || [],
            signatures: response.signatures || [],
            pubkeys: response.pubkeys || [],
            estimated_fee: response.tx?.fees || null,
            estimated_fee_kb: response.tx?.fee_per_kb || null,
            size_bytes: response.tx?.size || null,
            virtual_size: response.tx?.vsize || null,
          };
          break;
        }

        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
            { itemIndex: i }
          );
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (error.httpCode === 400) {
        throw new NodeApiError(
          this.getNode(),
          { message: 'Bad request - check your parameters', error: error.message },
          { itemIndex: i }
        );
      }
      
      if (error.httpCode === 401) {
        throw new NodeApiError(
          this.getNode(),
          { message: 'Unauthorized - check your API key', error: error.message },
          { itemIndex: i }
        );
      }

      if (error.httpCode === 429) {
        throw new NodeApiError(
          this.getNode(),
          { message: 'Rate limit exceeded - please try again later', error: error.message },
          { itemIndex: i }
        );
      }

      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error instanceof NodeOperationError || error instanceof NodeApiError) {
          throw error;
        }
        throw new NodeApiError(this.getNode(), error, { itemIndex: i });
      }
    }
  }

  return returnData;
}
