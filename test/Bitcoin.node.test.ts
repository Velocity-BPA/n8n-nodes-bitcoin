/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Bitcoin } from '../nodes/Bitcoin/Bitcoin.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Bitcoin Node', () => {
  let node: Bitcoin;

  beforeAll(() => {
    node = new Bitcoin();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Bitcoin');
      expect(node.description.name).toBe('bitcoin');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Address Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://blockstream.info/api',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	it('should get address information successfully', async () => {
		const mockResponse = {
			address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
			chain_stats: { funded_txo_count: 1, funded_txo_sum: 5000000000 },
		};

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAddress')
			.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAddressOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual(mockResponse);
	});

	it('should get address transactions successfully', async () => {
		const mockResponse = [
			{ txid: 'abc123', status: { confirmed: true } },
		];

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAddressTransactions')
			.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
			.mockReturnValueOnce('');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAddressOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toHaveLength(1);
		expect(result[0].json).toEqual(mockResponse);
	});

	it('should handle errors when continue on fail is enabled', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAddress')
			.mockReturnValueOnce('invalid-address');

		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
			new Error('Invalid address'),
		);
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeAddressOperations.call(
			mockExecuteFunctions,
			[{ json: {} }],
		);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('Invalid address');
	});
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://blockstream.info/api' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  test('should get transaction details successfully', async () => {
    const mockTransaction = {
      txid: 'test-txid',
      version: 1,
      locktime: 0,
      vin: [],
      vout: [],
      size: 250,
      weight: 1000,
      fee: 1000
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransaction')
      .mockReturnValueOnce('test-txid');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransaction);

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockTransaction, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://blockstream.info/api/tx/test-txid',
      headers: { 'Accept': 'application/json' },
      json: true,
    });
  });

  test('should get transaction status successfully', async () => {
    const mockStatus = {
      confirmed: true,
      block_height: 700000,
      block_hash: 'test-block-hash',
      block_time: 1609459200
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransactionStatus')
      .mockReturnValueOnce('test-txid');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockStatus);

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockStatus, pairedItem: { item: 0 } }]);
  });

  test('should broadcast transaction successfully', async () => {
    const mockTxid = 'broadcast-txid';

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('broadcastTransaction')
      .mockReturnValueOnce('01000000...');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTxid);

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { txid: mockTxid }, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://blockstream.info/api/tx',
      headers: { 'Content-Type': 'text/plain' },
      body: '01000000...',
      json: false,
    });
  });

  test('should handle API errors gracefully', async () => {
    const mockError = new Error('Transaction not found');

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransaction')
      .mockReturnValueOnce('invalid-txid');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'Transaction not found' }, pairedItem: { item: 0 } }]);
  });

  test('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

    await expect(
      executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key',
        baseUrl: 'https://blockstream.info/api'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn().mockResolvedValue({ id: 'test-block' }),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  it('should get block information by hash', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlock')
      .mockReturnValueOnce('0000000000000000000f3b9bf7f8e5d8f8a0c9e2b4a0f5a0d0c0e0f0a0b0c0d0');

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://blockstream.info/api/block/0000000000000000000f3b9bf7f8e5d8f8a0c9e2b4a0f5a0d0c0e0f0a0b0c0d0',
      headers: {},
      json: true
    });
    expect(result[0].json).toEqual({ id: 'test-block' });
  });

  it('should get block status by hash', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockStatus')
      .mockReturnValueOnce('0000000000000000000f3b9bf7f8e5d8f8a0c9e2b4a0f5a0d0c0e0f0a0b0c0d0');

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://blockstream.info/api/block/0000000000000000000f3b9bf7f8e5d8f8a0c9e2b4a0f5a0d0c0e0f0a0b0c0d0/status',
      headers: {},
      json: true
    });
    expect(result[0].json).toEqual({ id: 'test-block' });
  });

  it('should get block transactions by hash', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockTransactions')
      .mockReturnValueOnce('0000000000000000000f3b9bf7f8e5d8f8a0c9e2b4a0f5a0d0c0e0f0a0b0c0d0')
      .mockReturnValueOnce(0);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://blockstream.info/api/block/0000000000000000000f3b9bf7f8e5d8f8a0c9e2b4a0f5a0d0c0e0f0a0b0c0d0/txs',
      headers: {},
      json: true
    });
    expect(result[0].json).toEqual({ id: 'test-block' });
  });

  it('should get latest block hash', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getLatestBlockHash');

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://blockstream.info/api/blocks/tip/hash',
      headers: {},
      json: false
    });
    expect(result[0].json).toEqual({ id: 'test-block' });
  });

  it('should get latest block height', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getLatestBlockHeight');

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://blockstream.info/api/blocks/tip/height',
      headers: {},
      json: false
    });
    expect(result[0].json).toEqual({ id: 'test-block' });
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlock');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result[0].json).toEqual({ error: 'API Error' });
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlock');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);

    await expect(executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]))
      .rejects.toThrow('API Error');
  });
});

describe('Mempool Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://blockstream.info/api' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getMempoolStats operation', () => {
    it('should get mempool statistics successfully', async () => {
      const mockMempoolStats = {
        count: 5000,
        vsize: 2000000,
        total_fee: 50000000,
        fee_histogram: []
      };
      
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getMempoolStats');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockMempoolStats);

      const result = await executeMempoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/mempool',
        headers: { 'Authorization': 'Bearer test-key' },
        json: true,
      });
      expect(result).toEqual([{ json: mockMempoolStats, pairedItem: { item: 0 } }]);
    });

    it('should handle errors in getMempoolStats', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getMempoolStats');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeMempoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getMempoolTransactionIds operation', () => {
    it('should get mempool transaction IDs successfully', async () => {
      const mockTxIds = ['txid1', 'txid2', 'txid3'];
      
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getMempoolTransactionIds');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTxIds);

      const result = await executeMempoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/mempool/txids',
        headers: { 'Authorization': 'Bearer test-key' },
        json: true,
      });
      expect(result).toEqual([{ json: mockTxIds, pairedItem: { item: 0 } }]);
    });

    it('should handle errors in getMempoolTransactionIds', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getMempoolTransactionIds');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeMempoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Network Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getRecentMempoolTransactions operation', () => {
    it('should get recent mempool transactions successfully', async () => {
      const mockRecentTxs = [
        { txid: 'tx1', fee: 1000, vsize: 250 },
        { txid: 'tx2', fee: 1500, vsize: 300 }
      ];
      
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getRecentMempoolTransactions');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockRecentTxs);

      const result = await executeMempoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/mempool/recent',
        headers: { 'Authorization': 'Bearer test-key' },
        json: true,
      });
      expect(result).toEqual([{ json: mockRecentTxs, pairedItem: { item: 0 } }]);
    });

    it('should handle errors in getRecentMempoolTransactions', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getRecentMempoolTransactions');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Server Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeMempoolOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Server Error' }, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Fee Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://blockstream.info/api' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getFeeEstimates', () => {
    it('should get fee estimates successfully', async () => {
      const mockFeeEstimates = {
        '1': 87.882,
        '2': 87.882,
        '3': 87.882,
        '6': 80.237,
        '10': 77.081,
        '25': 77.081,
        '144': 1.027,
        '504': 1.027,
        '1008': 1.027
      };

      mockExecuteFunctions.getNodeParameter.mockReturnValue('getFeeEstimates');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockFeeEstimates);

      const result = await executeFeeOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/fee-estimates',
        json: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockFeeEstimates);
      expect(result[0].pairedItem).toEqual({ item: 0 });
    });

    it('should handle API errors when getting fee estimates', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getFeeEstimates');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeFeeOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
      expect(result[0].pairedItem).toEqual({ item: 0 });
    });

    it('should throw error when continueOnFail is false', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getFeeEstimates');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(false);

      await expect(
        executeFeeOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });
  });

  it('should handle unknown operations', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

    await expect(
      executeFeeOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});
});
