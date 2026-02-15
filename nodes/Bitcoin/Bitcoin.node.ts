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
      name: 'Get Address Info',
      value: 'getAddressInfo',
      description: 'Get address information including balance and transaction counts',
      action: 'Get address info',
    },
    {
      name: 'Get Address Transactions',
      value: 'getAddressTransactions',
      description: 'Get transaction history for an address',
      action: 'Get address transactions',
    },
    {
      name: 'Get Address Transactions Chain',
      value: 'getAddressTransactionsChain',
      description: 'Get confirmed transaction history for an address',
      action: 'Get address transactions chain',
    },
    {
      name: 'Get Address Transactions Mempool',
      value: 'getAddressTransactionsMempool',
      description: 'Get unconfirmed transactions for an address',
      action: 'Get address transactions mempool',
    },
    {
      name: 'Get Address UTXOs',
      value: 'getAddressUtxos',
      description: 'Get unspent transaction outputs for an address',
      action: 'Get address UTXOs',
    },
  ],
  default: 'getAddressInfo',
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
      description: 'Get transaction details by transaction ID',
      action: 'Get transaction details',
    },
    {
      name: 'Get Transaction Status',
      value: 'getTransactionStatus',
      description: 'Get transaction confirmation status',
      action: 'Get transaction status',
    },
    {
      name: 'Get Transaction Hex',
      value: 'getTransactionHex',
      description: 'Get raw transaction hex data',
      action: 'Get transaction hex',
    },
    {
      name: 'Get Transaction Merkle Proof',
      value: 'getTransactionMerkleProof',
      description: 'Get merkle proof for transaction',
      action: 'Get transaction merkle proof',
    },
    {
      name: 'Get Transaction Outspend',
      value: 'getTransactionOutspend',
      description: 'Get spending status of transaction output',
      action: 'Get transaction outspend',
    },
    {
      name: 'Get Transaction Outspends',
      value: 'getTransactionOutspends',
      description: 'Get spending status of all transaction outputs',
      action: 'Get transaction outspends',
    },
    {
      name: 'Broadcast Transaction',
      value: 'broadcastTransaction',
      description: 'Broadcast a raw transaction to the network',
      action: 'Broadcast transaction',
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
      name: 'Get Block',
      value: 'getBlock',
      description: 'Get block information by block hash',
      action: 'Get block information',
    },
    {
      name: 'Get Block Status',
      value: 'getBlockStatus',
      description: 'Get block confirmation status',
      action: 'Get block status',
    },
    {
      name: 'Get Block Transactions',
      value: 'getBlockTransactions',
      description: 'Get transactions in a block',
      action: 'Get block transactions',
    },
    {
      name: 'Get Block Transactions Paginated',
      value: 'getBlockTransactionsPaginated',
      description: 'Get paginated transactions in a block',
      action: 'Get paginated block transactions',
    },
    {
      name: 'Get Block Transaction ID',
      value: 'getBlockTransactionId',
      description: 'Get transaction ID by index in block',
      action: 'Get block transaction ID',
    },
    {
      name: 'Get Block Raw',
      value: 'getBlockRaw',
      description: 'Get raw block data',
      action: 'Get raw block data',
    },
    {
      name: 'Get Block Header',
      value: 'getBlockHeader',
      description: 'Get block header',
      action: 'Get block header',
    },
    {
      name: 'Get Block Hash',
      value: 'getBlockHash',
      description: 'Get block hash by height',
      action: 'Get block hash by height',
    },
    {
      name: 'Get Recent Blocks',
      value: 'getRecentBlocks',
      description: 'Get list of recent blocks',
      action: 'Get recent blocks',
    },
    {
      name: 'Get Blocks From Height',
      value: 'getBlocksFromHeight',
      description: 'Get blocks starting from specific height',
      action: 'Get blocks from height',
    },
    {
      name: 'Get Latest Block Hash',
      value: 'getLatestBlockHash',
      description: 'Get hash of the latest block',
      action: 'Get latest block hash',
    },
    {
      name: 'Get Latest Block Height',
      value: 'getLatestBlockHeight',
      description: 'Get height of the latest block',
      action: 'Get latest block height',
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
      name: 'Get Mempool Info',
      value: 'getMempoolInfo',
      description: 'Get mempool backlog statistics',
      action: 'Get mempool info',
    },
    {
      name: 'Get Mempool Transaction IDs',
      value: 'getMempoolTransactionIds',
      description: 'Get list of transaction IDs in mempool',
      action: 'Get mempool transaction IDs',
    },
    {
      name: 'Get Recent Mempool Transactions',
      value: 'getMempoolRecent',
      description: 'Get list of recent transactions added to mempool',
      action: 'Get recent mempool transactions',
    },
  ],
  default: 'getMempoolInfo',
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
      name: 'Get Fee Estimates',
      value: 'getFeeEstimates',
      description: 'Get fee estimates for different confirmation targets',
      action: 'Get fee estimates',
    },
  ],
  default: 'getFeeEstimates',
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
      operation: ['getAddressInfo', 'getAddressTransactions', 'getAddressTransactionsChain', 'getAddressTransactionsMempool', 'getAddressUtxos'],
    },
  },
  default: '',
  description: 'The Bitcoin address',
},
{
  displayName: 'Last Seen Transaction ID',
  name: 'lastSeenTxid',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['getAddressTransactions', 'getAddressTransactionsChain'],
    },
  },
  default: '',
  description: 'The last transaction ID for pagination',
},
{
  displayName: 'Transaction ID',
  name: 'txid',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransaction', 'getTransactionStatus', 'getTransactionHex', 'getTransactionMerkleProof', 'getTransactionOutspend', 'getTransactionOutspends'],
    },
  },
  default: '',
  description: 'The transaction ID (txid)',
},
{
  displayName: 'Output Index (vout)',
  name: 'vout',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionOutspend'],
    },
  },
  default: 0,
  description: 'The output index (vout) of the transaction output',
},
{
  displayName: 'Raw Transaction Hex',
  name: 'rawTransactionHex',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['broadcastTransaction'],
    },
  },
  default: '',
  description: 'The raw transaction hex string to broadcast',
},
{
  displayName: 'Block Hash',
  name: 'hash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlock', 'getBlockStatus', 'getBlockTransactions', 'getBlockTransactionsPaginated', 'getBlockTransactionId', 'getBlockRaw', 'getBlockHeader'],
    },
  },
  default: '',
  description: 'The block hash',
},
{
  displayName: 'Start Index',
  name: 'startIndex',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockTransactions'],
    },
  },
  default: 0,
  description: 'Start index for transaction list',
},
{
  displayName: 'Start Index',
  name: 'startIndex',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockTransactionsPaginated'],
    },
  },
  default: 0,
  description: 'Start index for paginated transaction list',
},
{
  displayName: 'Transaction Index',
  name: 'index',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockTransactionId'],
    },
  },
  default: 0,
  description: 'Index of the transaction in the block',
},
{
  displayName: 'Block Height',
  name: 'height',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockHash'],
    },
  },
  default: 0,
  description: 'The block height',
},
{
  displayName: 'Start Height',
  name: 'startHeight',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getRecentBlocks'],
    },
  },
  default: undefined,
  description: 'Starting block height for recent blocks list',
},
{
  displayName: 'Start Height',
  name: 'startHeight',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlocksFromHeight'],
    },
  },
  default: 0,
  description: 'Starting block height',
},
// No additional parameters needed for getFeeEstimates,
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

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getAddressInfo': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/address/${address}`,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getAddressTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const lastSeenTxid = this.getNodeParameter('lastSeenTxid', i) as string;
          
          let url = `https://blockstream.info/api/address/${address}/txs`;
          if (lastSeenTxid) {
            url += `/${lastSeenTxid}`;
          }
          
          const options: any = {
            method: 'GET',
            url,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getAddressTransactionsChain': {
          const address = this.getNodeParameter('address', i) as string;
          const lastSeenTxid = this.getNodeParameter('lastSeenTxid', i) as string;
          
          let url = `https://blockstream.info/api/address/${address}/txs/chain`;
          if (lastSeenTxid) {
            url += `/${lastSeenTxid}`;
          }
          
          const options: any = {
            method: 'GET',
            url,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getAddressTransactionsMempool': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/address/${address}/txs/mempool`,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getAddressUtxos': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/address/${address}/utxo`,
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
        throw new NodeApiError(this.getNode(), error);
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

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getTransaction': {
          const txid = this.getNodeParameter('txid', i) as string;
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/tx/${txid}`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactionStatus': {
          const txid = this.getNodeParameter('txid', i) as string;
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/tx/${txid}/status`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactionHex': {
          const txid = this.getNodeParameter('txid', i) as string;
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/tx/${txid}/hex`,
            json: false,
          };
          const hexData = await this.helpers.httpRequest(options) as any;
          result = { hex: hexData };
          break;
        }
        
        case 'getTransactionMerkleProof': {
          const txid = this.getNodeParameter('txid', i) as string;
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/tx/${txid}/merkleblock-proof`,
            json: false,
          };
          const proofData = await this.helpers.httpRequest(options) as any;
          result = { merkle_proof: proofData };
          break;
        }
        
        case 'getTransactionOutspend': {
          const txid = this.getNodeParameter('txid', i) as string;
          const vout = this.getNodeParameter('vout', i) as number;
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/tx/${txid}/outspend/${vout}`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactionOutspends': {
          const txid = this.getNodeParameter('txid', i) as string;
          const options: any = {
            method: 'GET',
            url: `https://blockstream.info/api/tx/${txid}/outspends`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'broadcastTransaction': {
          const rawTransactionHex = this.getNodeParameter('rawTransactionHex', i) as string;
          const options: any = {
            method: 'POST',
            url: 'https://blockstream.info/api/tx',
            body: rawTransactionHex,
            headers: {
              'Content-Type': 'text/plain',
            },
            json: false,
          };
          const txid = await this.helpers.httpRequest(options) as any;
          result = { txid: txid };
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { 
            error: error.message,
            operation: operation,
            item_index: i 
          }, 
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

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = 'https://blockstream.info/api';

      switch (operation) {
        case 'getBlock': {
          const hash = this.getNodeParameter('hash', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/block/${hash}`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockStatus': {
          const hash = this.getNodeParameter('hash', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/block/${hash}/status`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockTransactions': {
          const hash = this.getNodeParameter('hash', i) as string;
          const startIndex = this.getNodeParameter('startIndex', i, 0) as number;
          let url = `${baseUrl}/block/${hash}/txs`;
          if (startIndex > 0) {
            url += `?start_index=${startIndex}`;
          }
          const options: any = {
            method: 'GET',
            url,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockTransactionsPaginated': {
          const hash = this.getNodeParameter('hash', i) as string;
          const startIndex = this.getNodeParameter('startIndex', i) as number;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/block/${hash}/txs/${startIndex}`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockTransactionId': {
          const hash = this.getNodeParameter('hash', i) as string;
          const index = this.getNodeParameter('index', i) as number;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/block/${hash}/txid/${index}`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockRaw': {
          const hash = this.getNodeParameter('hash', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/block/${hash}/raw`,
            json: false,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockHeader': {
          const hash = this.getNodeParameter('hash', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/block/${hash}/header`,
            json: false,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockHash': {
          const height = this.getNodeParameter('height', i) as number;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/block-height/${height}`,
            json: false,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getRecentBlocks': {
          const startHeight = this.getNodeParameter('startHeight', i, undefined) as number | undefined;
          let url = `${baseUrl}/blocks`;
          if (startHeight !== undefined) {
            url += `?start_height=${startHeight}`;
          }
          const options: any = {
            method: 'GET',
            url,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlocksFromHeight': {
          const startHeight = this.getNodeParameter('startHeight', i) as number;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/blocks/${startHeight}`,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLatestBlockHash': {
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/blocks/tip/hash`,
            json: false,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLatestBlockHeight': {
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/blocks/tip/height`,
            json: false,
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
        if (error.httpCode) {
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

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getMempoolInfo': {
          const options: any = {
            method: 'GET',
            url: 'https://blockstream.info/api/mempool',
            headers: {
              'Accept': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMempoolTransactionIds': {
          const options: any = {
            method: 'GET',
            url: 'https://blockstream.info/api/mempool/txids',
            headers: {
              'Accept': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMempoolRecent': {
          const options: any = {
            method: 'GET',
            url: 'https://blockstream.info/api/mempool/recent',
            headers: {
              'Accept': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
          );
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
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

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getFeeEstimates': {
          const options: any = {
            method: 'GET',
            url: 'https://blockstream.info/api/fee-estimates',
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error instanceof NodeApiError || error instanceof NodeOperationError) {
          throw error;
        }
        throw new NodeApiError(this.getNode(), error, { itemIndex: i });
      }
    }
  }

  return returnData;
}
