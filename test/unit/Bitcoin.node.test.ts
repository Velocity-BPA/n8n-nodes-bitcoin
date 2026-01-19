/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Bitcoin } from '../../nodes/Bitcoin/Bitcoin.node';
import { BitcoinTrigger } from '../../nodes/Bitcoin/BitcoinTrigger.node';

describe('Bitcoin Node', () => {
  let bitcoinNode: Bitcoin;

  beforeEach(() => {
    bitcoinNode = new Bitcoin();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(bitcoinNode.description.displayName).toBe('Bitcoin');
    });

    it('should have correct node name', () => {
      expect(bitcoinNode.description.name).toBe('bitcoin');
    });

    it('should have correct version', () => {
      expect(bitcoinNode.description.version).toBe(1);
    });

    it('should require bitcoinApi credentials', () => {
      const credentials = bitcoinNode.description.credentials;
      expect(credentials).toBeDefined();
      expect(credentials).toHaveLength(1);
      expect(credentials![0].name).toBe('bitcoinApi');
      expect(credentials![0].required).toBe(true);
    });

    it('should have main input and output', () => {
      expect(bitcoinNode.description.inputs).toContain('main');
      expect(bitcoinNode.description.outputs).toContain('main');
    });

    it('should have all required resources', () => {
      const resourceProperty = bitcoinNode.description.properties.find(
        (p) => p.name === 'resource',
      );
      expect(resourceProperty).toBeDefined();

      const options = resourceProperty!.options as Array<{ value: string }>;
      const resourceValues = options.map((o) => o.value);

      expect(resourceValues).toContain('address');
      expect(resourceValues).toContain('transaction');
      expect(resourceValues).toContain('block');
      expect(resourceValues).toContain('mempool');
      expect(resourceValues).toContain('fee');
    });
  });

  describe('Address Operations', () => {
    it('should have getBalance operation', () => {
      const operationProperty = bitcoinNode.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('address'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((o) => o.value);

      expect(operationValues).toContain('getBalance');
      expect(operationValues).toContain('getInfo');
      expect(operationValues).toContain('getUtxos');
      expect(operationValues).toContain('getTransactions');
    });
  });

  describe('Transaction Operations', () => {
    it('should have transaction operations', () => {
      const operationProperty = bitcoinNode.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('transaction'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((o) => o.value);

      expect(operationValues).toContain('get');
      expect(operationValues).toContain('getStatus');
      expect(operationValues).toContain('broadcast');
    });
  });

  describe('Block Operations', () => {
    it('should have block operations', () => {
      const operationProperty = bitcoinNode.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('block'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((o) => o.value);

      expect(operationValues).toContain('get');
      expect(operationValues).toContain('getByHeight');
      expect(operationValues).toContain('getLatest');
    });
  });

  describe('Fee Operations', () => {
    it('should have getRecommended operation', () => {
      const operationProperty = bitcoinNode.description.properties.find(
        (p) =>
          p.name === 'operation' &&
          p.displayOptions?.show?.resource?.includes('fee'),
      );
      expect(operationProperty).toBeDefined();

      const options = operationProperty!.options as Array<{ value: string }>;
      const operationValues = options.map((o) => o.value);

      expect(operationValues).toContain('getRecommended');
    });
  });
});

describe('Bitcoin Trigger Node', () => {
  let bitcoinTrigger: BitcoinTrigger;

  beforeEach(() => {
    bitcoinTrigger = new BitcoinTrigger();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(bitcoinTrigger.description.displayName).toBe('Bitcoin Trigger');
    });

    it('should have correct node name', () => {
      expect(bitcoinTrigger.description.name).toBe('bitcoinTrigger');
    });

    it('should be a polling trigger', () => {
      expect(bitcoinTrigger.description.polling).toBe(true);
    });

    it('should have no inputs', () => {
      expect(bitcoinTrigger.description.inputs).toHaveLength(0);
    });

    it('should have main output', () => {
      expect(bitcoinTrigger.description.outputs).toContain('main');
    });

    it('should have all required events', () => {
      const eventProperty = bitcoinTrigger.description.properties.find(
        (p) => p.name === 'event',
      );
      expect(eventProperty).toBeDefined();

      const options = eventProperty!.options as Array<{ value: string }>;
      const eventValues = options.map((o) => o.value);

      expect(eventValues).toContain('newBlock');
      expect(eventValues).toContain('addressTransaction');
      expect(eventValues).toContain('transactionConfirmed');
      expect(eventValues).toContain('feeRateChange');
    });
  });

  describe('Event Options', () => {
    it('should have address field for addressTransaction event', () => {
      const addressProperty = bitcoinTrigger.description.properties.find(
        (p) =>
          p.name === 'address' &&
          p.displayOptions?.show?.event?.includes('addressTransaction'),
      );
      expect(addressProperty).toBeDefined();
      expect(addressProperty!.required).toBe(true);
    });

    it('should have txid field for transactionConfirmed event', () => {
      const txidProperty = bitcoinTrigger.description.properties.find(
        (p) =>
          p.name === 'txid' &&
          p.displayOptions?.show?.event?.includes('transactionConfirmed'),
      );
      expect(txidProperty).toBeDefined();
      expect(txidProperty!.required).toBe(true);
    });

    it('should have confirmations field for transactionConfirmed event', () => {
      const confirmationsProperty = bitcoinTrigger.description.properties.find(
        (p) =>
          p.name === 'confirmations' &&
          p.displayOptions?.show?.event?.includes('transactionConfirmed'),
      );
      expect(confirmationsProperty).toBeDefined();
      expect(confirmationsProperty!.default).toBe(6);
    });

    it('should have feeType field for feeRateChange event', () => {
      const feeTypeProperty = bitcoinTrigger.description.properties.find(
        (p) =>
          p.name === 'feeType' &&
          p.displayOptions?.show?.event?.includes('feeRateChange'),
      );
      expect(feeTypeProperty).toBeDefined();
    });

    it('should have changeThreshold field for feeRateChange event', () => {
      const thresholdProperty = bitcoinTrigger.description.properties.find(
        (p) =>
          p.name === 'changeThreshold' &&
          p.displayOptions?.show?.event?.includes('feeRateChange'),
      );
      expect(thresholdProperty).toBeDefined();
      expect(thresholdProperty!.default).toBe(10);
    });
  });
});
