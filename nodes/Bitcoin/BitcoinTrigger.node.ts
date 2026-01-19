/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IPollFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios, { AxiosInstance } from 'axios';

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

export class BitcoinTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Bitcoin Trigger',
    name: 'bitcoinTrigger',
    icon: 'file:bitcoin.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Triggers on Bitcoin blockchain events',
    defaults: {
      name: 'Bitcoin Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'bitcoinApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        required: true,
        default: 'newBlock',
        options: [
          {
            name: 'New Block',
            value: 'newBlock',
            description: 'Trigger when a new block is mined',
          },
          {
            name: 'Address Transaction',
            value: 'addressTransaction',
            description: 'Trigger when an address receives or sends a transaction',
          },
          {
            name: 'Transaction Confirmed',
            value: 'transactionConfirmed',
            description: 'Trigger when a transaction reaches specified confirmations',
          },
          {
            name: 'Fee Rate Change',
            value: 'feeRateChange',
            description: 'Trigger when fee rates change significantly',
          },
        ],
      },
      // Address Transaction options
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            event: ['addressTransaction'],
          },
        },
        description: 'Bitcoin address to monitor',
        placeholder: 'bc1q...',
      },
      {
        displayName: 'Direction',
        name: 'direction',
        type: 'options',
        default: 'all',
        displayOptions: {
          show: {
            event: ['addressTransaction'],
          },
        },
        options: [
          { name: 'All', value: 'all' },
          { name: 'Incoming Only', value: 'incoming' },
          { name: 'Outgoing Only', value: 'outgoing' },
        ],
      },
      {
        displayName: 'Include Unconfirmed',
        name: 'includeUnconfirmed',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            event: ['addressTransaction'],
          },
        },
        description: 'Whether to include unconfirmed transactions',
      },
      // Transaction Confirmed options
      {
        displayName: 'Transaction ID',
        name: 'txid',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            event: ['transactionConfirmed'],
          },
        },
        description: 'Transaction ID to monitor',
      },
      {
        displayName: 'Required Confirmations',
        name: 'confirmations',
        type: 'number',
        default: 6,
        displayOptions: {
          show: {
            event: ['transactionConfirmed'],
          },
        },
        description: 'Number of confirmations required to trigger',
      },
      // Fee Rate Change options
      {
        displayName: 'Fee Type',
        name: 'feeType',
        type: 'options',
        default: 'fastestFee',
        displayOptions: {
          show: {
            event: ['feeRateChange'],
          },
        },
        options: [
          { name: 'Fastest Fee', value: 'fastestFee' },
          { name: 'Half Hour Fee', value: 'halfHourFee' },
          { name: 'Hour Fee', value: 'hourFee' },
          { name: 'Economy Fee', value: 'economyFee' },
          { name: 'Minimum Fee', value: 'minimumFee' },
        ],
      },
      {
        displayName: 'Change Threshold (%)',
        name: 'changeThreshold',
        type: 'number',
        default: 10,
        displayOptions: {
          show: {
            event: ['feeRateChange'],
          },
        },
        description: 'Percentage change required to trigger (e.g., 10 for 10%)',
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const webhookData = this.getWorkflowStaticData('node');
    const event = this.getNodeParameter('event') as string;
    const credentials = (await this.getCredentials('bitcoinApi')) as IDataObject;

    const client = createMempoolClient(credentials);
    const returnData: INodeExecutionData[] = [];

    try {
      // ==================== NEW BLOCK ====================
      if (event === 'newBlock') {
        const response = await client.get('/blocks/tip/height');
        const currentHeight = response.data as number;
        const lastHeight = webhookData.lastBlockHeight as number | undefined;

        if (lastHeight === undefined) {
          webhookData.lastBlockHeight = currentHeight;
          return null;
        }

        if (currentHeight > lastHeight) {
          // Fetch new blocks
          for (let height = lastHeight + 1; height <= currentHeight; height++) {
            try {
              const blockResponse = await client.get(`/block-height/${height}`);
              const blockHash = blockResponse.data as string;
              const blockInfoResponse = await client.get(`/block/${blockHash}`);
              const block = blockInfoResponse.data;

              returnData.push({
                json: {
                  event: 'newBlock',
                  height: block.height,
                  hash: block.id,
                  timestamp: block.timestamp,
                  txCount: block.tx_count,
                  size: block.size,
                  weight: block.weight,
                  difficulty: block.difficulty,
                },
              });
            } catch (_err) {
              // Skip blocks we can't fetch
            }
          }
          webhookData.lastBlockHeight = currentHeight;
        }
      }

      // ==================== ADDRESS TRANSACTION ====================
      else if (event === 'addressTransaction') {
        const address = this.getNodeParameter('address') as string;
        const direction = this.getNodeParameter('direction') as string;
        const includeUnconfirmed = this.getNodeParameter('includeUnconfirmed') as boolean;

        // Fetch recent transactions
        const txResponse = await client.get(`/address/${address}/txs`);
        const txs = txResponse.data as IDataObject[];

        if (!txs || txs.length === 0) {
          return null;
        }

        const lastTxid = webhookData.lastTxid as string | undefined;
        if (lastTxid === undefined) {
          webhookData.lastTxid = txs[0].txid as string;
          return null;
        }

        // Find new transactions
        const newTxs: IDataObject[] = [];
        for (const tx of txs) {
          if (tx.txid === lastTxid) break;

          // Check confirmation status
          const status = tx.status as IDataObject | undefined;
          const isConfirmed = status?.confirmed === true;

          if (!includeUnconfirmed && !isConfirmed) continue;

          // Calculate direction
          const vin = (tx.vin as IDataObject[]) || [];
          const vout = (tx.vout as IDataObject[]) || [];

          const inputAddresses: string[] = [];
          for (const input of vin) {
            const prevout = input.prevout as IDataObject | undefined;
            if (prevout?.scriptpubkey_address) {
              inputAddresses.push(prevout.scriptpubkey_address as string);
            }
          }

          const outputAddresses: string[] = [];
          for (const output of vout) {
            if (output.scriptpubkey_address) {
              outputAddresses.push(output.scriptpubkey_address as string);
            }
          }

          const isIncoming =
            outputAddresses.includes(address) && !inputAddresses.includes(address);
          const isOutgoing = inputAddresses.includes(address);

          if (direction === 'incoming' && !isIncoming) continue;
          if (direction === 'outgoing' && !isOutgoing) continue;

          newTxs.push(tx);
        }

        if (newTxs.length > 0) {
          webhookData.lastTxid = newTxs[0].txid as string;

          for (const tx of newTxs.reverse()) {
            const status = tx.status as IDataObject | undefined;
            returnData.push({
              json: {
                event: 'addressTransaction',
                address,
                txid: tx.txid,
                confirmed: status?.confirmed || false,
                blockHeight: status?.block_height || null,
                blockTime: status?.block_time || null,
                fee: tx.fee,
              },
            });
          }
        }
      }

      // ==================== TRANSACTION CONFIRMED ====================
      else if (event === 'transactionConfirmed') {
        const txid = this.getNodeParameter('txid') as string;
        const requiredConfirmations = this.getNodeParameter('confirmations') as number;

        // Get current block height
        const heightResponse = await client.get('/blocks/tip/height');
        const currentHeight = heightResponse.data as number;

        // Get transaction status
        const txResponse = await client.get(`/tx/${txid}`);
        const tx = txResponse.data as IDataObject;
        const status = tx.status as IDataObject | undefined;

        if (!status?.confirmed) {
          return null;
        }

        const txBlockHeight = status.block_height as number;
        const currentConfirmations = currentHeight - txBlockHeight + 1;
        const lastConfirmations = webhookData.lastConfirmations as number | undefined;

        if (lastConfirmations === undefined) {
          webhookData.lastConfirmations = currentConfirmations;

          if (currentConfirmations >= requiredConfirmations) {
            returnData.push({
              json: {
                event: 'transactionConfirmed',
                txid,
                confirmations: currentConfirmations,
                blockHash: status.block_hash,
                blockHeight: txBlockHeight,
              },
            });
            webhookData.triggered = true;
          }
          return returnData.length > 0 ? [returnData] : null;
        }

        if (webhookData.triggered) {
          return null;
        }

        if (
          currentConfirmations >= requiredConfirmations &&
          currentConfirmations !== lastConfirmations
        ) {
          webhookData.lastConfirmations = currentConfirmations;
          webhookData.triggered = true;

          returnData.push({
            json: {
              event: 'transactionConfirmed',
              txid,
              confirmations: currentConfirmations,
              blockHash: status.block_hash,
              blockHeight: txBlockHeight,
            },
          });
        }
      }

      // ==================== FEE RATE CHANGE ====================
      else if (event === 'feeRateChange') {
        const feeType = this.getNodeParameter('feeType') as string;
        const changeThreshold = this.getNodeParameter('changeThreshold') as number;

        const feeResponse = await client.get('/v1/fees/recommended');
        const fees = feeResponse.data as IDataObject;
        const currentFee = fees[feeType] as number;
        const lastFee = webhookData.lastFee as number | undefined;

        if (lastFee === undefined) {
          webhookData.lastFee = currentFee;
          return null;
        }

        const changePercent = Math.abs(((currentFee - lastFee) / lastFee) * 100);

        if (changePercent >= changeThreshold) {
          webhookData.lastFee = currentFee;

          returnData.push({
            json: {
              event: 'feeRateChange',
              feeType,
              previousFee: lastFee,
              currentFee,
              changePercent: Math.round(changePercent * 100) / 100,
              direction: currentFee > lastFee ? 'increased' : 'decreased',
              allFees: {
                fastestFee: fees.fastestFee,
                halfHourFee: fees.halfHourFee,
                hourFee: fees.hourFee,
                economyFee: fees.economyFee,
                minimumFee: fees.minimumFee,
              },
            },
          });
        }
      }

      return returnData.length > 0 ? [returnData] : null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new NodeOperationError(this.getNode(), `Bitcoin trigger error: ${errorMessage}`);
    }
  }
}
