# n8n-nodes-bitcoin

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Bitcoin blockchain integration, featuring 5 resources with complete address monitoring, transaction processing, block analysis, mempool tracking, and dynamic fee estimation capabilities for automated cryptocurrency workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Bitcoin](https://img.shields.io/badge/Bitcoin-Core-orange)
![Blockchain](https://img.shields.io/badge/Blockchain-API-gold)
![Cryptocurrency](https://img.shields.io/badge/Crypto-Integration-green)

## Features

- **Address Management** - Query address balances, transaction history, and UTXO sets for comprehensive wallet monitoring
- **Transaction Processing** - Retrieve detailed transaction data, broadcast raw transactions, and track confirmation status
- **Block Analysis** - Access complete block information, headers, and statistics for blockchain analysis
- **Mempool Monitoring** - Real-time mempool insights including pending transactions and network congestion metrics
- **Dynamic Fee Estimation** - Get optimal transaction fees based on current network conditions and confirmation targets
- **Multi-Network Support** - Compatible with Bitcoin mainnet, testnet, and other Bitcoin-compatible networks
- **Rate Limiting** - Built-in intelligent rate limiting and retry mechanisms for reliable API interactions
- **Error Handling** - Comprehensive error handling with detailed debugging information for troubleshooting

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
| API Key | Your Bitcoin API service key for authenticated requests | Yes |
| Base URL | Custom API endpoint URL (leave empty for default) | No |
| Network | Bitcoin network (mainnet, testnet, regtest) | Yes |
| Rate Limit | Maximum requests per minute (default: 60) | No |

## Resources & Operations

### 1. Address

| Operation | Description |
|-----------|-------------|
| Get Address Info | Retrieve comprehensive address information including balance and transaction count |
| Get Address Balance | Get current confirmed and unconfirmed balance for an address |
| Get Address History | Fetch complete transaction history for an address with pagination |
| Get Address UTXOs | List all unspent transaction outputs for an address |
| Validate Address | Verify address format and network validity |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve detailed transaction information by transaction ID |
| Get Transaction Status | Check confirmation status and block inclusion details |
| Broadcast Transaction | Submit a raw transaction to the Bitcoin network |
| Get Transaction Hex | Retrieve raw transaction data in hexadecimal format |
| Estimate Transaction Size | Calculate estimated transaction size and virtual bytes |

### 3. Block

| Operation | Description |
|-----------|-------------|
| Get Block Info | Retrieve complete block information including all transactions |
| Get Block Header | Get block header data without transaction details |
| Get Block Hash | Get block hash by block height |
| Get Block Height | Get current blockchain height |
| Get Block Stats | Retrieve block statistics and analysis data |

### 4. Mempool

| Operation | Description |
|-----------|-------------|
| Get Mempool Info | Retrieve current mempool statistics and size information |
| Get Mempool Transactions | List pending transactions in the mempool |
| Get Transaction from Mempool | Get specific transaction details from mempool |
| Get Mempool Ancestors | Retrieve ancestor transactions for a mempool transaction |
| Get Mempool Descendants | Get descendant transactions for a mempool transaction |

### 5. Fee

| Operation | Description |
|-----------|-------------|
| Estimate Fee | Get recommended fee rates for different confirmation targets |
| Get Fee Histogram | Retrieve current fee rate distribution histogram |
| Get Recommended Fees | Get optimized fee recommendations for economy, standard, and priority |
| Calculate Transaction Fee | Compute exact fee for a transaction based on size and fee rate |

## Usage Examples

```javascript
// Monitor address balance
{
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "include_mempool": true
}

// Get transaction details
{
  "txid": "f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16",
  "include_hex": true,
  "include_witness": true
}

// Estimate optimal fees
{
  "target_blocks": 6,
  "mode": "economical",
  "include_histogram": true
}

// Query recent blocks
{
  "block_hash": "00000000000000000008a89e854d57e5667df88f1cdef6fde2fbca1de5b639ad",
  "include_transactions": false,
  "verbosity": 2
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has sufficient permissions |
| Rate Limit Exceeded | Too many requests sent within time window | Reduce request frequency or upgrade API plan |
| Invalid Address Format | Bitcoin address format is incorrect or invalid | Validate address format matches selected network |
| Transaction Not Found | Specified transaction ID does not exist | Verify transaction ID is correct and confirmed |
| Network Connection Error | Unable to connect to Bitcoin API service | Check internet connection and API service status |
| Insufficient Balance | Address does not have enough funds for operation | Verify address balance before attempting transaction |

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