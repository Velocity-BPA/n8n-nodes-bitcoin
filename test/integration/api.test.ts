/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios from 'axios';

/**
 * Integration tests for Bitcoin node
 * These tests make real API calls to mempool.space testnet
 * Run with: npm run test -- --testPathPattern=integration
 */

const MEMPOOL_TESTNET_API = 'https://mempool.space/testnet/api';
const TEST_TIMEOUT = 30000;

// Known testnet address with activity
const TEST_ADDRESS = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';

describe('Bitcoin Integration Tests (Testnet)', () => {
  describe('Address API', () => {
    it(
      'should fetch address info',
      async () => {
        const response = await axios.get(`${MEMPOOL_TESTNET_API}/address/${TEST_ADDRESS}`);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('address');
        expect(response.data).toHaveProperty('chain_stats');
        expect(response.data).toHaveProperty('mempool_stats');
      },
      TEST_TIMEOUT,
    );

    it(
      'should fetch address UTXOs',
      async () => {
        const response = await axios.get(`${MEMPOOL_TESTNET_API}/address/${TEST_ADDRESS}/utxo`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      },
      TEST_TIMEOUT,
    );

    it(
      'should fetch address transactions',
      async () => {
        const response = await axios.get(`${MEMPOOL_TESTNET_API}/address/${TEST_ADDRESS}/txs`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Block API', () => {
    it(
      'should fetch latest block height',
      async () => {
        const response = await axios.get(`${MEMPOOL_TESTNET_API}/blocks/tip/height`);

        expect(response.status).toBe(200);
        expect(typeof response.data).toBe('number');
        expect(response.data).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );

    it(
      'should fetch block by height',
      async () => {
        // First get latest height
        const heightResponse = await axios.get(`${MEMPOOL_TESTNET_API}/blocks/tip/height`);
        const height = heightResponse.data;

        // Get block hash at that height
        const hashResponse = await axios.get(`${MEMPOOL_TESTNET_API}/block-height/${height}`);
        expect(hashResponse.status).toBe(200);
        expect(typeof hashResponse.data).toBe('string');

        // Get block details
        const blockResponse = await axios.get(`${MEMPOOL_TESTNET_API}/block/${hashResponse.data}`);
        expect(blockResponse.status).toBe(200);
        expect(blockResponse.data).toHaveProperty('height');
        expect(blockResponse.data).toHaveProperty('id');
        expect(blockResponse.data).toHaveProperty('timestamp');
        expect(blockResponse.data).toHaveProperty('tx_count');
      },
      TEST_TIMEOUT,
    );
  });

  describe('Fee API', () => {
    it(
      'should fetch recommended fees',
      async () => {
        const response = await axios.get(`${MEMPOOL_TESTNET_API}/v1/fees/recommended`);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('fastestFee');
        expect(response.data).toHaveProperty('halfHourFee');
        expect(response.data).toHaveProperty('hourFee');
        expect(response.data).toHaveProperty('economyFee');
        expect(response.data).toHaveProperty('minimumFee');

        // All fees should be numbers
        expect(typeof response.data.fastestFee).toBe('number');
        expect(typeof response.data.halfHourFee).toBe('number');
        expect(typeof response.data.hourFee).toBe('number');
      },
      TEST_TIMEOUT,
    );
  });

  describe('Mempool API', () => {
    it(
      'should fetch mempool info',
      async () => {
        const response = await axios.get(`${MEMPOOL_TESTNET_API}/mempool`);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('count');
        expect(response.data).toHaveProperty('vsize');
        expect(response.data).toHaveProperty('total_fee');
      },
      TEST_TIMEOUT,
    );
  });
});

describe('API Error Handling', () => {
  it(
    'should return 400 for invalid address',
    async () => {
      try {
        await axios.get(`${MEMPOOL_TESTNET_API}/address/invalid-address`);
        fail('Expected request to fail');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          expect(error.response?.status).toBe(400);
        }
      }
    },
    TEST_TIMEOUT,
  );

  it(
    'should return 404 for non-existent transaction',
    async () => {
      const fakeTxid = '0000000000000000000000000000000000000000000000000000000000000000';
      try {
        await axios.get(`${MEMPOOL_TESTNET_API}/tx/${fakeTxid}`);
        fail('Expected request to fail');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          expect([400, 404]).toContain(error.response?.status);
        }
      }
    },
    TEST_TIMEOUT,
  );
});
