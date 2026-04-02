# n8n-nodes-bitcoin

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Bitcoin blockchain operations, providing access to 5 core resources including addresses, transactions, blocks, mempool, and fee estimation. Query Bitcoin network data, track transactions, analyze blockchain activity, and integrate Bitcoin data into your automation workflows with full API coverage.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Bitcoin](https://img.shields.io/badge/Bitcoin-Network-orange)
![Blockchain](https://img.shields.io/badge/Blockchain-API-yellow)
![Cryptocurrency](https://img.shields.io/badge/Crypto-Integration-green)

## Features

- **Address Operations** - Query address balances, transaction history, and UTXO sets
- **Transaction Management** - Retrieve transaction details, broadcast raw transactions, and track confirmations
- **Block Information** - Access block data, headers, and blockchain statistics
- **Mempool Monitoring** - Real-time mempool analysis and pending transaction tracking
- **Fee Estimation** - Dynamic fee calculation for optimal transaction pricing
- **Multi-Network Support** - Compatible with Bitcoin mainnet and testnet
- **Rate Limiting** - Built-in request throttling for API compliance
- **Error Recovery** - Comprehensive error handling with retry mechanisms

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-bitcoin`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-bitcoin
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-bitcoin.git
cd n8n-nodes-bitcoin
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-bitcoin
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Bitcoin API service key | Yes |
| Network | Bitcoin network (mainnet/testnet) | Yes |
| Base URL | Custom API endpoint (optional) | No |

## Resources & Operations

### 1. Address

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve confirmed and unconfirmed balance for an address |
| Get Transaction History | List all transactions for a specific address |
| Get UTXO | Get unspent transaction outputs for an address |
| Validate Address | Check if a Bitcoin address is valid |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve detailed transaction information by hash |
| Get Raw Transaction | Get raw transaction data in hex format |
| Broadcast Transaction | Submit a signed raw transaction to the network |
| Get Transaction Status | Check confirmation status and block inclusion |

### 3. Block

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block information by hash or height |
| Get Block Header | Get block header data only |
| Get Latest Block | Fetch the most recent block |
| Get Block Transactions | List all transactions in a specific block |

### 4. Mempool

| Operation | Description |
|-----------|-------------|
| Get Mempool Info | Retrieve current mempool statistics |
| Get Mempool Transactions | List pending transactions in mempool |
| Get Transaction Ancestors | Find parent transactions of a mempool transaction |
| Get Transaction Descendants | Find child transactions of a mempool transaction |

### 5. Fee

| Operation | Description |
|-----------|-------------|
| Estimate Fee | Calculate recommended fee for transaction confirmation |
| Get Fee Rate | Get current fee rates per byte |
| Get Fee History | Historical fee rate data |
| Smart Fee Estimate | AI-powered fee estimation for target confirmation time |

## Usage Examples

```javascript
// Get Bitcoin address balance
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "include_unconfirmed": true
}
```

```javascript
// Retrieve transaction details
{
  "transaction_hash": "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
  "include_hex": true
}
```

```javascript
// Get latest block information
{
  "include_transactions": false,
  "verbosity": 2
}
```

```javascript
// Estimate transaction fee
{
  "target_blocks": 6,
  "transaction_size": 250,
  "priority": "medium"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid Address | Bitcoin address format is incorrect | Verify address format and network compatibility |
| Transaction Not Found | Transaction hash does not exist | Check transaction hash and network selection |
| API Rate Limited | Too many requests to Bitcoin API | Implement delays or upgrade API plan |
| Network Timeout | Bitcoin node connection failed | Retry request or check node availability |
| Insufficient Funds | Address balance too low for operation | Verify address has required Bitcoin amount |
| Invalid Transaction | Raw transaction format incorrect | Validate transaction hex and signatures |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-bitcoin/issues)
- **Bitcoin Core API**: [Bitcoin Core RPC Documentation](https://bitcoincore.org/en/doc/)
- **Developer Community**: [Bitcoin Stack Exchange](https://bitcoin.stackexchange.com/)