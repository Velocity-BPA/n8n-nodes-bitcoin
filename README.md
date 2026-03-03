# n8n-nodes-bitcoin

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

Bitcoin n8n community node providing comprehensive Bitcoin blockchain data access through 5 core resources: Address, Transaction, Block, Mempool, and Fee operations. Enables automated Bitcoin network monitoring, transaction tracking, balance queries, and fee estimation for n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Bitcoin](https://img.shields.io/badge/Bitcoin-F7931E?logo=bitcoin)
![Blockchain](https://img.shields.io/badge/Blockchain-121D33?logo=blockchain.com)
![API](https://img.shields.io/badge/REST-API-green)

## Features

- **Address Operations** - Query Bitcoin address balances, transaction history, and UTXO sets
- **Transaction Management** - Retrieve transaction details, broadcast raw transactions, and monitor confirmations
- **Block Data Access** - Fetch block information, headers, and merkle proofs by height or hash
- **Mempool Monitoring** - Real-time unconfirmed transaction tracking and mempool statistics
- **Fee Estimation** - Dynamic fee rate calculations for optimal transaction timing
- **Multi-Network Support** - Compatible with Bitcoin mainnet and testnet environments
- **Real-time Updates** - WebSocket support for live blockchain event monitoring
- **Batch Operations** - Process multiple addresses or transactions in single requests

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
| API Key | Bitcoin API service authentication key | Yes |
| Network | Bitcoin network (mainnet/testnet) | Yes |
| Base URL | Custom API endpoint URL (optional) | No |
| Rate Limit | Requests per minute limit | No |

## Resources & Operations

### 1. Address

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve current balance for a Bitcoin address |
| Get Transaction History | Fetch all transactions for an address with pagination |
| Get UTXO Set | List all unspent transaction outputs for an address |
| Get Address Info | Comprehensive address statistics and metadata |
| Validate Address | Check if Bitcoin address format is valid |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve detailed transaction information by hash |
| Get Raw Transaction | Fetch raw transaction hex data |
| Broadcast Transaction | Submit signed transaction to the network |
| Get Transaction Status | Check confirmation status and block inclusion |
| Decode Raw Transaction | Parse raw transaction hex into readable format |

### 3. Block

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve complete block data by hash or height |
| Get Block Header | Fetch block header information only |
| Get Block Hash | Get block hash by height number |
| Get Block Stats | Statistical information about block contents |
| Get Latest Block | Retrieve most recent block information |

### 4. Mempool

| Operation | Description |
|-----------|-------------|
| Get Mempool Info | Current mempool size and fee statistics |
| Get Mempool Transactions | List unconfirmed transactions in mempool |
| Get Transaction Ancestors | Find parent transactions in mempool |
| Get Transaction Descendants | Find child transactions in mempool |
| Get Mempool Entry | Detailed mempool entry information |

### 5. Fee

| Operation | Description |
|-----------|-------------|
| Estimate Fee | Calculate recommended fee rates for confirmation targets |
| Get Fee Statistics | Historical fee rate analysis and trends |
| Smart Fee | Intelligent fee estimation based on network conditions |
| Get Fee Rate | Current network fee rates by priority level |

## Usage Examples

```javascript
// Get Bitcoin address balance
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "confirmed": 6889478500000,
  "unconfirmed": 0,
  "total": 6889478500000
}
```

```javascript
// Retrieve transaction details
{
  "txid": "f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16",
  "version": 1,
  "size": 275,
  "vsize": 275,
  "weight": 1100,
  "confirmations": 756432,
  "blocktime": 1231731025
}
```

```javascript
// Get current mempool statistics
{
  "size": 45623,
  "bytes": 87456321,
  "usage": 234567890,
  "total_fee": 0.05432100,
  "maxmempool": 300000000,
  "mempoolminfee": 0.00001000
}
```

```javascript
// Estimate transaction fees
{
  "blocks": 6,
  "feerate": 0.00015420,
  "satoshis_per_byte": 15.42,
  "estimated_cost": 0.00234000
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and active |
| Address Not Found | Bitcoin address does not exist or has no activity | Check address format and network compatibility |
| Transaction Not Found | Transaction hash not found in blockchain or mempool | Verify transaction ID and confirm network |
| Rate Limit Exceeded | Too many requests sent to API endpoint | Implement request throttling or upgrade plan |
| Network Timeout | Request failed due to network connectivity issues | Retry with exponential backoff strategy |
| Invalid Transaction Format | Raw transaction data is malformed or corrupt | Validate transaction hex encoding and structure |

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
- **Bitcoin Developer Documentation**: [developer.bitcoin.org](https://developer.bitcoin.org)
- **Bitcoin Core API Reference**: [bitcoincore.org/en/doc](https://bitcoincore.org/en/doc/)