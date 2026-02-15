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
        apiKey: 'test-api-key',
        baseUrl: 'https://blockstream.info/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getAddressInfo', () => {
    it('should get address info successfully', async () => {
      const mockResponse = {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        chain_stats: {
          funded_txo_count: 1,
          funded_txo_sum: 5000000000,
          spent_txo_count: 0,
          spent_txo_sum: 0,
          tx_count: 1,
        },
        mempool_stats: {
          funded_txo_count: 0,
          funded_txo_sum: 0,
          spent_txo_count: 0,
          spent_txo_sum: 0,
          tx_count: 0,
        },
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAddressInfo')
        .mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getAddressTransactions', () => {
    it('should get address transactions successfully', async () => {
      const mockResponse = [
        {
          txid: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
          version: 1,
          locktime: 0,
          vin: [],
          vout: [],
        },
      ];

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAddressTransactions')
        .mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
        .mockReturnValueOnce('');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/txs',
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });

    it('should handle last_seen_txid parameter', async () => {
      const mockResponse = [];

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAddressTransactions')
        .mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
        .mockReturnValueOnce('4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/txs/4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        json: true,
      });
    });
  });

  describe('getAddressUtxos', () => {
    it('should get address UTXOs successfully', async () => {
      const mockResponse = [
        {
          txid: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
          vout: 0,
          status: {
            confirmed: true,
            block_height: 1,
            block_hash: '00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048',
          },
          value: 5000000000,
        },
      ];

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAddressUtxos')
        .mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/address/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/utxo',
        json: true,
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('error handling', () => {
    it('should handle API errors with continueOnFail true', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAddressInfo')
        .mockReturnValueOnce('invalid-address');
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: { error: 'Invalid address format' },
        pairedItem: { item: 0 },
      }]);
    });

    it('should throw error when continueOnFail is false', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAddressInfo')
        .mockReturnValueOnce('invalid-address');
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(false);

      const items = [{ json: {} }];
      
      await expect(executeAddressOperations.call(mockExecuteFunctions, items))
        .rejects
        .toThrow();
    });

    it('should handle unknown operations', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');
      
      const items = [{ json: {} }];
      
      await expect(executeAddressOperations.call(mockExecuteFunctions, items))
        .rejects
        .toThrow('Unknown operation: unknownOperation');
    });
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://blockstream.info/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should get transaction details successfully', async () => {
    const mockTransaction = {
      txid: 'abc123',
      version: 1,
      locktime: 0,
      vin: [],
      vout: [],
      size: 250,
      weight: 900,
      fee: 1000
    };
    
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getTransaction';
      if (paramName === 'txid') return 'abc123';
      return undefined;
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransaction);
    
    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockTransaction);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://blockstream.info/api/tx/abc123',
      json: true,
    });
  });

  test('should get transaction status successfully', async () => {
    const mockStatus = {
      confirmed: true,
      block_height: 700000,
      block_hash: 'def456',
      block_time: 1625097600
    };
    
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getTransactionStatus';
      if (paramName === 'txid') return 'abc123';
      return undefined;
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockStatus);
    
    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockStatus);
  });

  test('should get transaction hex successfully', async () => {
    const mockHex = '0100000001...';
    
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getTransactionHex';
      if (paramName === 'txid') return 'abc123';
      return undefined;
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockHex);
    
    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ hex: mockHex });
  });

  test('should broadcast transaction successfully', async () => {
    const mockTxid = 'broadcast123';
    const rawHex = '0100000001abcd...';
    
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'broadcastTransaction';
      if (paramName === 'rawTransactionHex') return rawHex;
      return undefined;
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTxid);
    
    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ txid: mockTxid });
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://blockstream.info/api/tx',
      body: rawHex,
      headers: { 'Content-Type': 'text/plain' },
      json: false,
    });
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getTransaction';
      if (paramName === 'txid') return 'invalid-txid';
      return undefined;
    });
    
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Transaction not found'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    
    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Transaction not found');
  });
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://blockstream.info/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getBlock operation', () => {
    it('should get block information successfully', async () => {
      const mockBlockData = {
        id: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
        height: 0,
        version: 1,
        timestamp: 1231006505,
        tx_count: 1,
        size: 285,
        weight: 1140,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getBlock';
        if (name === 'hash') return '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockData);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
        json: true,
      });

      expect(result).toEqual([{ json: mockBlockData, pairedItem: { item: 0 } }]);
    });
  });

  describe('getBlockStatus operation', () => {
    it('should get block status successfully', async () => {
      const mockStatusData = {
        in_best_chain: true,
        height: 700000,
        next_best: '00000000000000000008a89e854d57e5667df88f1cdef6fde2fbca1de5b312c6',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getBlockStatus';
        if (name === 'hash') return '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockStatusData);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f/status',
        json: true,
      });

      expect(result).toEqual([{ json: mockStatusData, pairedItem: { item: 0 } }]);
    });
  });

  describe('getLatestBlockHash operation', () => {
    it('should get latest block hash successfully', async () => {
      const mockHash = '00000000000000000008a89e854d57e5667df88f1cdef6fde2fbca1de5b312c6';

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getLatestBlockHash';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockHash);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/blocks/tip/hash',
        json: false,
      });

      expect(result).toEqual([{ json: mockHash, pairedItem: { item: 0 } }]);
    });
  });

  describe('getLatestBlockHeight operation', () => {
    it('should get latest block height successfully', async () => {
      const mockHeight = '700000';

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getLatestBlockHeight';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockHeight);

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/blocks/tip/height',
        json: false,
      });

      expect(result).toEqual([{ json: mockHeight, pairedItem: { item: 0 } }]);
    });
  });

  describe('error handling', () => {
    it('should handle API errors when continueOnFail is true', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getBlock';
        if (name === 'hash') return 'invalid-hash';
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));

      const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Block not found' }, pairedItem: { item: 0 } }]);
    });

    it('should throw error when continueOnFail is false', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getBlock';
        if (name === 'hash') return 'invalid-hash';
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(false);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Block not found'));

      await expect(executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
    });
  });
});

describe('Mempool Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://blockstream.info/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getMempoolInfo', () => {
    it('should get mempool statistics successfully', async () => {
      const mockResponse = {
        count: 15000,
        vsize: 50000000,
        total_fee: 150000000,
        fee_histogram: []
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getMempoolInfo';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeMempoolOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/mempool',
        headers: {
          'Accept': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when getting mempool info', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getMempoolInfo';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeMempoolOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow();
    });
  });

  describe('getMempoolTransactionIds', () => {
    it('should get mempool transaction IDs successfully', async () => {
      const mockResponse = [
        'tx1hash',
        'tx2hash',
        'tx3hash'
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getMempoolTransactionIds';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeMempoolOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/mempool/txids',
        headers: {
          'Accept': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getMempoolRecent', () => {
    it('should get recent mempool transactions successfully', async () => {
      const mockResponse = [
        {
          txid: 'tx1hash',
          fee: 5000,
          vsize: 250,
          value: 100000
        },
        {
          txid: 'tx2hash',
          fee: 10000,
          vsize: 500,
          value: 200000
        }
      ];

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getMempoolRecent';
        return undefined;
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeMempoolOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/mempool/recent',
        headers: {
          'Accept': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should continue on fail when continueOnFail is true', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getMempoolInfo';
        return undefined;
      });
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));

      const result = await executeMempoolOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Network error');
    });

    it('should throw error for unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'unknownOperation';
        return undefined;
      });

      await expect(
        executeMempoolOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('Unknown operation: unknownOperation');
    });
  });
});

describe('Fee Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://blockstream.info/api',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getFeeEstimates', () => {
    it('should successfully get fee estimates', async () => {
      const mockFeeEstimates = {
        '1': 15.5,
        '2': 12.3,
        '3': 10.1,
        '6': 8.5,
        '144': 4.2,
        '504': 2.1,
        '1008': 1.5,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getFeeEstimates';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockFeeEstimates);

      const items = [{ json: {} }];
      const result = await executeFeeOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockFeeEstimates);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://blockstream.info/api/fee-estimates',
        json: true,
      });
    });

    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getFeeEstimates';
        return undefined;
      });

      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const items = [{ json: {} }];

      await expect(executeFeeOperations.call(mockExecuteFunctions, items)).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getFeeEstimates';
        return undefined;
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const items = [{ json: {} }];
      const result = await executeFeeOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'unknownOperation';
      return undefined;
    });

    const items = [{ json: {} }];

    await expect(executeFeeOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Unknown operation: unknownOperation');
  });
});
});
