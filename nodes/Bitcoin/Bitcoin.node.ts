/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios, { AxiosInstance } from 'axios';

// Licensing notice logged once per node load
const LICENSING_LOGGED = Symbol.for('n8n-nodes-bitcoin-licensing-logged');
if (!(globalThis as Record<symbol, boolean>)[LICENSING_LOGGED]) {
  console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
  (globalThis as Record<symbol, boolean>)[LICENSING_LOGGED] = true;
}

/**
 * Creates a Mempool.space API client for the specified network
 */
function createMempoolClient(credentials: IDataObject): AxiosInstance {
  const network = (credentials.network as string) || 'mainnet';
  const apiProvider = (credentials.apiProvider as string) || 'mempool';

  let baseURL: string;

  if (apiProvider === 'customMempool' && credentials.customApiUrl) {
    baseURL = credentials.customApiUrl as string;
  } else {
    switch (network) {
      case 'testnet':
        baseURL = 'https://mempool.space/testnet/api';
        break;
      case 'signet':
        baseURL = 'https://mempool.space/signet/api';
        break;
      default:
        baseURL = 'https://mempool.space/api';
    }
  }

  return axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Convert satoshis to BTC
 */
function satoshisToBtc(satoshis: number): number {
  return satoshis / 100000000;
}

export class Bitcoin implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Bitcoin',
    name: 'bitcoin',
    icon: 'file:bitcoin.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Bitcoin blockchain',
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
      // Resource Selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Address',
            value: 'address',
            description: 'Operations on Bitcoin addresses',
          },
          {
            name: 'Block',
            value: 'block',
            description: 'Operations on Bitcoin blocks',
          },
          {
            name: 'Fee',
            value: 'fee',
            description: 'Fee estimation operations',
          },
          {
            name: 'Mempool',
            value: 'mempool',
            description: 'Mempool statistics',
          },
          {
            name: 'Transaction',
            value: 'transaction',
            description: 'Operations on Bitcoin transactions',
          },
        ],
        default: 'address',
      },

      // ============== ADDRESS OPERATIONS ==============
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
            name: 'Get Balance',
            value: 'getBalance',
            description: 'Get the balance of a Bitcoin address',
            action: 'Get balance of address',
          },
          {
            name: 'Get Info',
            value: 'getInfo',
            description: 'Get full information about a Bitcoin address',
            action: 'Get info of address',
          },
          {
            name: 'Get Transactions',
            value: 'getTransactions',
            description: 'Get transactions for a Bitcoin address',
            action: 'Get transactions of address',
          },
          {
            name: 'Get UTXOs',
            value: 'getUtxos',
            description: 'Get unspent transaction outputs for an address',
            action: 'Get UTXOs of address',
          },
        ],
        default: 'getBalance',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['address'],
          },
        },
        default: '',
        placeholder: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        description: 'Bitcoin address to query',
      },

      // ============== TRANSACTION OPERATIONS ==============
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
            name: 'Broadcast',
            value: 'broadcast',
            description: 'Broadcast a signed transaction to the network',
            action: 'Broadcast transaction',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get transaction details by txid',
            action: 'Get transaction',
          },
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get confirmation status of a transaction',
            action: 'Get transaction status',
          },
        ],
        default: 'get',
      },
      {
        displayName: 'Transaction ID',
        name: 'txid',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['transaction'],
            operation: ['get', 'getStatus'],
          },
        },
        default: '',
        placeholder: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        description: 'The transaction ID (txid) to look up',
      },
      {
        displayName: 'Raw Transaction Hex',
        name: 'rawTx',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['transaction'],
            operation: ['broadcast'],
          },
        },
        default: '',
        description: 'The signed raw transaction in hexadecimal format',
      },

      // ============== BLOCK OPERATIONS ==============
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
            name: 'Get',
            value: 'get',
            description: 'Get block details by hash',
            action: 'Get block',
          },
          {
            name: 'Get by Height',
            value: 'getByHeight',
            description: 'Get block at a specific height',
            action: 'Get block by height',
          },
          {
            name: 'Get Latest',
            value: 'getLatest',
            description: 'Get the latest block',
            action: 'Get latest block',
          },
        ],
        default: 'getLatest',
      },
      {
        displayName: 'Block Hash',
        name: 'blockHash',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['block'],
            operation: ['get'],
          },
        },
        default: '',
        description: 'The block hash to look up',
      },
      {
        displayName: 'Block Height',
        name: 'blockHeight',
        type: 'number',
        required: true,
        displayOptions: {
          show: {
            resource: ['block'],
            operation: ['getByHeight'],
          },
        },
        default: 0,
        description: 'The block height to look up',
      },

      // ============== MEMPOOL OPERATIONS ==============
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
            name: 'Get Info',
            value: 'getInfo',
            description: 'Get mempool statistics',
            action: 'Get mempool info',
          },
        ],
        default: 'getInfo',
      },

      // ============== FEE OPERATIONS ==============
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
            name: 'Get Recommended',
            value: 'getRecommended',
            description: 'Get recommended fee rates',
            action: 'Get recommended fees',
          },
        ],
        default: 'getRecommended',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;
    const credentials = await this.getCredentials('bitcoinApi');
    const client = createMempoolClient(credentials as IDataObject);

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject = {};

        // ============== ADDRESS OPERATIONS ==============
        if (resource === 'address') {
          const address = this.getNodeParameter('address', i) as string;

          if (operation === 'getInfo') {
            const response = await client.get(`/address/${address}`);
            const data = response.data;
            responseData = {
              address: data.address,
              chain_stats: data.chain_stats,
              mempool_stats: data.mempool_stats,
              total_received_satoshis: data.chain_stats.funded_txo_sum,
              total_received_btc: satoshisToBtc(data.chain_stats.funded_txo_sum),
              total_sent_satoshis: data.chain_stats.spent_txo_sum,
              total_sent_btc: satoshisToBtc(data.chain_stats.spent_txo_sum),
              balance_satoshis: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
              balance_btc: satoshisToBtc(
                data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
              ),
              tx_count: data.chain_stats.tx_count,
            };
          } else if (operation === 'getBalance') {
            const response = await client.get(`/address/${address}`);
            const data = response.data;
            const confirmedBalance =
              data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
            const unconfirmedBalance =
              data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
            responseData = {
              address,
              confirmed_satoshis: confirmedBalance,
              confirmed_btc: satoshisToBtc(confirmedBalance),
              unconfirmed_satoshis: unconfirmedBalance,
              unconfirmed_btc: satoshisToBtc(unconfirmedBalance),
              total_satoshis: confirmedBalance + unconfirmedBalance,
              total_btc: satoshisToBtc(confirmedBalance + unconfirmedBalance),
            };
          } else if (operation === 'getUtxos') {
            const response = await client.get(`/address/${address}/utxo`);
            const utxos = response.data;
            responseData = {
              address,
              utxo_count: utxos.length,
              utxos: utxos.map((utxo: IDataObject) => ({
                txid: utxo.txid,
                vout: utxo.vout,
                value_satoshis: utxo.value,
                value_btc: satoshisToBtc(utxo.value as number),
                confirmed: (utxo.status as IDataObject)?.confirmed || false,
                block_height: (utxo.status as IDataObject)?.block_height || null,
              })),
              total_value_satoshis: utxos.reduce(
                (sum: number, utxo: IDataObject) => sum + (utxo.value as number),
                0,
              ),
              total_value_btc: satoshisToBtc(
                utxos.reduce(
                  (sum: number, utxo: IDataObject) => sum + (utxo.value as number),
                  0,
                ),
              ),
            };
          } else if (operation === 'getTransactions') {
            const response = await client.get(`/address/${address}/txs`);
            responseData = {
              address,
              transaction_count: response.data.length,
              transactions: response.data.slice(0, 25).map((tx: IDataObject) => ({
                txid: tx.txid,
                confirmed: (tx.status as IDataObject)?.confirmed || false,
                block_height: (tx.status as IDataObject)?.block_height || null,
                block_time: (tx.status as IDataObject)?.block_time || null,
                fee: tx.fee,
                size: tx.size,
                weight: tx.weight,
              })),
            };
          }
        }

        // ============== TRANSACTION OPERATIONS ==============
        else if (resource === 'transaction') {
          if (operation === 'get') {
            const txid = this.getNodeParameter('txid', i) as string;
            const response = await client.get(`/tx/${txid}`);
            const tx = response.data;
            responseData = {
              txid: tx.txid,
              version: tx.version,
              locktime: tx.locktime,
              size: tx.size,
              weight: tx.weight,
              fee: tx.fee,
              fee_rate: tx.fee / (tx.weight / 4),
              confirmed: tx.status?.confirmed || false,
              block_height: tx.status?.block_height || null,
              block_hash: tx.status?.block_hash || null,
              block_time: tx.status?.block_time || null,
              input_count: tx.vin?.length || 0,
              output_count: tx.vout?.length || 0,
              input_value_satoshis: tx.vin?.reduce(
                (sum: number, vin: IDataObject) =>
                  sum + ((vin.prevout as IDataObject)?.value as number || 0),
                0,
              ),
              output_value_satoshis: tx.vout?.reduce(
                (sum: number, vout: IDataObject) => sum + ((vout.value as number) || 0),
                0,
              ),
            };
          } else if (operation === 'getStatus') {
            const txid = this.getNodeParameter('txid', i) as string;
            const response = await client.get(`/tx/${txid}/status`);
            const heightResponse = await client.get('/blocks/tip/height');
            const currentHeight = heightResponse.data;
            const status = response.data;
            responseData = {
              txid,
              confirmed: status.confirmed || false,
              block_height: status.block_height || null,
              block_hash: status.block_hash || null,
              block_time: status.block_time || null,
              confirmations: status.confirmed ? currentHeight - status.block_height + 1 : 0,
            };
          } else if (operation === 'broadcast') {
            const rawTx = this.getNodeParameter('rawTx', i) as string;
            const response = await client.post('/tx', rawTx, {
              headers: { 'Content-Type': 'text/plain' },
            });
            responseData = {
              txid: response.data,
              broadcast: true,
              message: 'Transaction broadcast successfully',
            };
          }
        }

        // ============== BLOCK OPERATIONS ==============
        else if (resource === 'block') {
          if (operation === 'getLatest') {
            const heightResponse = await client.get('/blocks/tip/height');
            const height = heightResponse.data;
            const hashResponse = await client.get(`/block-height/${height}`);
            const hash = hashResponse.data;
            const blockResponse = await client.get(`/block/${hash}`);
            const block = blockResponse.data;
            responseData = {
              height: block.height,
              hash: block.id,
              timestamp: block.timestamp,
              tx_count: block.tx_count,
              size: block.size,
              weight: block.weight,
              difficulty: block.difficulty,
              merkle_root: block.merkle_root,
              previous_block_hash: block.previousblockhash,
              nonce: block.nonce,
              bits: block.bits,
              version: block.version,
            };
          } else if (operation === 'getByHeight') {
            const height = this.getNodeParameter('blockHeight', i) as number;
            const hashResponse = await client.get(`/block-height/${height}`);
            const hash = hashResponse.data;
            const blockResponse = await client.get(`/block/${hash}`);
            const block = blockResponse.data;
            responseData = {
              height: block.height,
              hash: block.id,
              timestamp: block.timestamp,
              tx_count: block.tx_count,
              size: block.size,
              weight: block.weight,
              difficulty: block.difficulty,
              merkle_root: block.merkle_root,
              previous_block_hash: block.previousblockhash,
            };
          } else if (operation === 'get') {
            const blockHash = this.getNodeParameter('blockHash', i) as string;
            const response = await client.get(`/block/${blockHash}`);
            const block = response.data;
            responseData = {
              height: block.height,
              hash: block.id,
              timestamp: block.timestamp,
              tx_count: block.tx_count,
              size: block.size,
              weight: block.weight,
              difficulty: block.difficulty,
              merkle_root: block.merkle_root,
              previous_block_hash: block.previousblockhash,
            };
          }
        }

        // ============== MEMPOOL OPERATIONS ==============
        else if (resource === 'mempool') {
          if (operation === 'getInfo') {
            const response = await client.get('/mempool');
            const mempool = response.data;
            responseData = {
              count: mempool.count,
              vsize: mempool.vsize,
              total_fee: mempool.total_fee,
              fee_histogram: mempool.fee_histogram,
            };
          }
        }

        // ============== FEE OPERATIONS ==============
        else if (resource === 'fee') {
          if (operation === 'getRecommended') {
            const response = await client.get('/v1/fees/recommended');
            const fees = response.data;
            responseData = {
              fastest_fee: fees.fastestFee,
              half_hour_fee: fees.halfHourFee,
              hour_fee: fees.hourFee,
              economy_fee: fees.economyFee,
              minimum_fee: fees.minimumFee,
              unit: 'sat/vB',
            };
          }
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw new NodeOperationError(
          this.getNode(),
          error instanceof Error ? error.message : String(error),
          { itemIndex: i },
        );
      }
    }

    return [returnData];
  }
}
