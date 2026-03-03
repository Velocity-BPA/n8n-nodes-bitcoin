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
        baseUrl: 'https://api.blockcypher.com/v1/btc/main',
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

  describe('getAddress', () => {
    it('should get address details successfully', async () => {
      const mockResponse = {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        balance: 5000000000,
        unconfirmed_balance: 0,
        n_tx: 1,
        total_received: 5000000000,
        total_sent: 0,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAddress';
        if (paramName === 'address') return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main/addrs/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });

    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAddress';
        if (paramName === 'address') return 'invalid-address';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));

      await expect(
        executeAddressOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Invalid address format');
    });
  });

  describe('getAddressBalance', () => {
    it('should get address balance successfully', async () => {
      const mockResponse = {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        balance: 5000000000,
        unconfirmed_balance: 0,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAddressBalance';
        if (paramName === 'address') return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main/addrs/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/balance',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getAddressFull', () => {
    it('should get full address details with parameters', async () => {
      const mockResponse = {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        txs: [],
        balance: 5000000000,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number, defaultValue?: any) => {
        if (paramName === 'operation') return 'getAddressFull';
        if (paramName === 'address') return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        if (paramName === 'limit') return 10;
        return defaultValue || '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main/addrs/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/full?limit=10',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('generateAddress', () => {
    it('should generate new address successfully', async () => {
      const mockResponse = {
        private: 'KxFC1jmwwCoACiCAWZ3eXa96mBM6tb3TYzGmf6YwgdGWZgawvrtJ',
        public: '02f12f0b8f8b6c3b4c3b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b',
        address: '1C6Rc3w25VHud3dLDamutbXaXrH95FWVdg',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'generateAddress';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.blockcypher.com/v1/btc/main/addrs',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getUnspentOutputs', () => {
    it('should get unspent outputs successfully', async () => {
      const mockResponse = {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        outputs: [
          {
            tx_hash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
            tx_output_n: 0,
            value: 5000000000,
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, index: number, defaultValue?: any) => {
        if (paramName === 'operation') return 'getUnspentOutputs';
        if (paramName === 'address') return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        if (paramName === 'unspentOnly') return true;
        if (paramName === 'includeScript') return false;
        return defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAddressOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main/addrs/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/unspent',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
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
        baseUrl: 'https://api.blockcypher.com/v1/btc/main',
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

  test('should get transaction successfully', async () => {
    const mockResponse = {
      hash: '123abc',
      confirmations: 6,
      value: 1000000,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getTransaction';
      if (param === 'hash') return '123abc';
      if (param === 'includeHex') return false;
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.blockcypher.com/v1/btc/main/txs/123abc',
      headers: {
        'X-API-Key': 'test-api-key',
      },
      qs: {},
      json: true,
    });
  });

  test('should create transaction successfully', async () => {
    const mockResponse = {
      tx: {
        hash: '456def',
        tosign: ['signature_hash'],
      },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'createTransaction';
      if (param === 'inputs') return '[{"addresses": ["addr1"], "prev_hash": "hash1", "output_index": 0}]';
      if (param === 'outputs') return '[{"addresses": ["addr2"], "value": 1000000}]';
      if (param === 'fees') return 1000;
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.blockcypher.com/v1/btc/main/txs/new',
      headers: {
        'X-API-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        inputs: [{"addresses": ["addr1"], "prev_hash": "hash1", "output_index": 0}],
        outputs: [{"addresses": ["addr2"], "value": 1000000}],
        fees: 1000,
      },
      json: true,
    });
  });

  test('should broadcast transaction successfully', async () => {
    const mockResponse = {
      tx: {
        hash: '789ghi',
        received: '2023-01-01T00:00:00Z',
      },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'broadcastTransaction';
      if (param === 'tx') return '01000000...';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.blockcypher.com/v1/btc/main/txs/push',
      headers: {
        'X-API-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        tx: '01000000...',
      },
      json: true,
    });
  });

  test('should handle errors correctly', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getTransaction';
      if (param === 'hash') return 'invalid-hash';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Transaction not found'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'Transaction not found' });
  });

  test('should get transaction confidence successfully', async () => {
    const mockResponse = {
      confidence: 0.95,
      confirmations: 3,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getTransactionConfidence';
      if (param === 'hash') return '123abc';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.blockcypher.com/v1/btc/main/txs/123abc/confidence',
      headers: {
        'X-API-Key': 'test-api-key',
      },
      json: true,
    });
  });
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.blockcypher.com/v1/btc/main',
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

  it('should get block by hash successfully', async () => {
    const mockBlockData = {
      hash: '00000000000000000002c510d6c49770c85ad17fdc6b81ed1f5f5d8e6f8d8a52',
      height: 800000,
      confirmations: 1000,
      time: 1693507200,
      txids: ['tx1', 'tx2', 'tx3'],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlock';
      if (param === 'hash') return '00000000000000000002c510d6c49770c85ad17fdc6b81ed1f5f5d8e6f8d8a52';
      if (param === 'txstart') return 0;
      if (param === 'limit') return 20;
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockData);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockBlockData, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('/blocks/00000000000000000002c510d6c49770c85ad17fdc6b81ed1f5f5d8e6f8d8a52'),
      headers: { 'Content-Type': 'application/json' },
      json: true,
    });
  });

  it('should get block by height successfully', async () => {
    const mockBlockData = {
      hash: '00000000000000000002c510d6c49770c85ad17fdc6b81ed1f5f5d8e6f8d8a52',
      height: 800000,
      confirmations: 1000,
      time: 1693507200,
      txids: ['tx1', 'tx2', 'tx3'],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlockByHeight';
      if (param === 'height') return 800000;
      if (param === 'txstart') return 0;
      if (param === 'limit') return 20;
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockData);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockBlockData, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('/blocks/800000'),
      headers: { 'Content-Type': 'application/json' },
      json: true,
    });
  });

  it('should get blockchain state successfully', async () => {
    const mockBlockchainData = {
      name: 'btc',
      height: 800000,
      hash: '00000000000000000002c510d6c49770c85ad17fdc6b81ed1f5f5d8e6f8d8a52',
      time: '2023-08-31T12:00:00Z',
      latest_url: 'https://api.blockcypher.com/v1/btc/main/blocks/800000',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlockchain';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlockchainData);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockBlockchainData, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('https://api.blockcypher.com/v1/btc/main'),
      headers: { 'Content-Type': 'application/json' },
      json: true,
    });
  });

  it('should get latest blocks successfully', async () => {
    const mockBlocksData = [
      {
        hash: '00000000000000000002c510d6c49770c85ad17fdc6b81ed1f5f5d8e6f8d8a52',
        height: 800000,
        time: '2023-08-31T12:00:00Z',
      },
      {
        hash: '00000000000000000001b410c6d39660c75bd16fdc5c70ed2e4e4d7e5f7d7b41',
        height: 799999,
        time: '2023-08-31T11:50:00Z',
      },
    ];

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlocks';
      if (param === 'limit') return 10;
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockBlocksData);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockBlocksData, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('/blocks'),
      headers: { 'Content-Type': 'application/json' },
      json: true,
    });
  });

  it('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getBlock';
      if (param === 'hash') return 'invalid-hash';
      return undefined;
    });

    const apiError = new Error('Block not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'Block not found' }, pairedItem: { item: 0 } }]);
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'unknownOperation';
      return undefined;
    });

    await expect(
      executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Mempool Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.blockcypher.com/v1/btc/main',
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

  describe('getMempoolTransactions', () => {
    it('should get mempool transactions successfully', async () => {
      const mockResponse = {
        txs: [
          {
            hash: 'abc123',
            confirmations: 0,
            size: 250,
            fee: 1000
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getMempoolTransactions';
          case 'limit': return 50;
          case 'instart': return '';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeMempoolOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main/txs?limit=50&token=test-api-key',
        headers: {
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle pagination with instart parameter', async () => {
      const mockResponse = { txs: [] };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getMempoolTransactions';
          case 'limit': return 25;
          case 'instart': return 'def456';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      await executeMempoolOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main/txs?limit=25&instart=def456&token=test-api-key',
        headers: {
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getAddressUnconfirmed', () => {
    it('should get address unconfirmed transactions successfully', async () => {
      const mockResponse = {
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        txs: [
          {
            hash: 'xyz789',
            confirmations: 0,
            value: 50000000
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAddressUnconfirmed';
          case 'address': return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeMempoolOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main/addrs/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/unconfirmed?token=test-api-key',
        headers: {
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAddressUnconfirmed';
          case 'address': return 'invalid-address';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));

      const items = [{ json: {} }];
      
      await expect(
        executeMempoolOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow();
    });

    it('should continue on fail when enabled', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAddressUnconfirmed';
          case 'address': return 'invalid-address';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];
      const result = await executeMempoolOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
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
        baseUrl: 'https://api.blockcypher.com/v1/btc/main',
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

  describe('getCurrentFees', () => {
    it('should get current network fee estimates', async () => {
      const mockResponse = {
        high_fee_per_kb: 50000,
        medium_fee_per_kb: 25000,
        low_fee_per_kb: 10000,
        unconfirmed_count: 5000,
        last_fork_height: 750000,
        last_fork_hash: 'abc123',
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getCurrentFees')
        .mockReturnValueOnce([{ json: {} }]);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeFeeOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main',
        headers: {
          'User-Agent': 'n8n-bitcoin-node',
        },
        qs: {
          token: 'test-api-key',
        },
        json: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle API errors for getCurrentFees', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getCurrentFees');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];

      await expect(
        executeFeeOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow('API Error');
    });
  });

  describe('estimateTransactionFee', () => {
    it('should estimate transaction fee successfully', async () => {
      const inputs = [{ addresses: ['input_address'], output_value: 1000000 }];
      const outputs = [{ addresses: ['output_address'], value: 500000 }];
      
      const mockResponse = {
        tx: {
          fees: 2500,
          fee_per_kb: 25000,
          size: 250,
          vsize: 200,
        },
        tosign: ['hash1'],
        signatures: [],
        pubkeys: [],
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('estimateTransactionFee')
        .mockReturnValueOnce(inputs)
        .mockReturnValueOnce(outputs);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeFeeOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.blockcypher.com/v1/btc/main/txs/new',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'n8n-bitcoin-node',
        },
        qs: {
          token: 'test-api-key',
        },
        body: {
          inputs,
          outputs,
        },
        json: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].json.estimated_fee).toBe(2500);
    });

    it('should handle invalid JSON in parameters', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('estimateTransactionFee')
        .mockReturnValueOnce('invalid json')
        .mockReturnValueOnce('[]');

      const items = [{ json: {} }];

      await expect(
        executeFeeOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow('Invalid JSON format');
    });
  });
});
});
