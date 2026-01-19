/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ICredentialDataDecryptedObject,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Bitcoin API Credentials
 *
 * Supports connection to Bitcoin blockchain via Mempool.space API
 * for mainnet, testnet, and signet networks.
 */
export class BitcoinApi implements ICredentialType {
  name = 'bitcoinApi';
  displayName = 'Bitcoin API';
  documentationUrl = 'https://github.com/Velocity-BPA/n8n-nodes-bitcoin';
  icon = 'file:bitcoin.svg' as const;

  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      default: 'mainnet',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
          description: 'Bitcoin main network (real BTC)',
        },
        {
          name: 'Testnet',
          value: 'testnet',
          description: 'Bitcoin test network (test BTC)',
        },
        {
          name: 'Signet',
          value: 'signet',
          description: 'Bitcoin signet network (test BTC)',
        },
      ],
      description: 'The Bitcoin network to connect to',
    },
    {
      displayName: 'API Provider',
      name: 'apiProvider',
      type: 'options',
      default: 'mempool',
      options: [
        {
          name: 'Mempool.space',
          value: 'mempool',
          description: 'Free, open-source Bitcoin explorer API',
        },
        {
          name: 'Custom Mempool Instance',
          value: 'customMempool',
          description: 'Self-hosted Mempool.space instance',
        },
      ],
      description: 'The API provider to use for blockchain data',
    },
    {
      displayName: 'Custom API URL',
      name: 'customApiUrl',
      type: 'string',
      default: '',
      placeholder: 'https://your-mempool-instance.com/api',
      displayOptions: {
        show: {
          apiProvider: ['customMempool'],
        },
      },
      description: 'URL of your custom Mempool.space instance API',
    },
  ];

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiProvider === "customMempool" ? $credentials.customApiUrl : ($credentials.network === "testnet" ? "https://mempool.space/testnet/api" : ($credentials.network === "signet" ? "https://mempool.space/signet/api" : "https://mempool.space/api"))}}',
      url: '/blocks/tip/height',
      method: 'GET',
      timeout: 10000,
    },
  };
}
