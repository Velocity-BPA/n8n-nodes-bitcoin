# n8n-nodes-bitcoin

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Bitcoin blockchain providing address, transaction, block, mempool, and fee operations with trigger support for blockchain events. Includes support for mainnet, testnet, and signet networks.

![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Bitcoin](https://img.shields.io/badge/Bitcoin-blockchain-F7931A)

## Features

### Bitcoin Node (Action)
- **Address Operations**: Get balance, UTXOs, transaction history, and full address info
- **Transaction Operations**: Lookup transactions, get confirmation status, broadcast signed transactions
- **Block Operations**: Get latest block, block by height, block by hash
- **Mempool Operations**: Get mempool statistics
- **Fee Operations**: Get recommended fee rates (fastest, half-hour, hour, economy, minimum)

### Bitcoin Trigger (Polling)
- **New Block**: Trigger when a new block is mined
- **Address Transaction**: Monitor addresses for incoming/outgoing transactions
- **Transaction Confirmed**: Trigger when a transaction reaches N confirmations
- **Fee Rate Change**: Trigger when fee rates change by a threshold percentage

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-bitcoin`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/nodes

# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-bitcoin.git

# Install dependencies and build
cd n8n-nodes-bitcoin
pnpm install
pnpm build

# Restart n8n
```

### Development Installation

```bash
# Clone and enter directory
git clone https://github.com/Velocity-BPA/n8n-nodes-bitcoin.git
cd n8n-nodes-bitcoin

# Install dependencies
pnpm install

# Build
pnpm build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-bitcoin

# Restart n8n
```

## Credentials Setup

| Field | Type | Description |
|-------|------|-------------|
| Network | Options | `mainnet`, `testnet`, or `signet` |
| API Provider | Options | `Mempool.space` or `Custom Mempool Instance` |
| Custom API URL | String | URL for self-hosted Mempool instance (optional) |

## Resources & Operations

### Address Resource

| Operation | Description |
|-----------|-------------|
| Get Info | Full address details including balance, tx count, and stats |
| Get Balance | Confirmed and unconfirmed balance in satoshis and BTC |
| Get UTXOs | Unspent transaction outputs for coin selection |
| Get Transactions | Recent transaction history (up to 25 transactions) |

### Transaction Resource

| Operation | Description |
|-----------|-------------|
| Get | Full transaction details including inputs, outputs, and status |
| Get Status | Confirmation status and block information |
| Broadcast | Broadcast a signed raw transaction to the network |

### Block Resource

| Operation | Description |
|-----------|-------------|
| Get Latest | Current blockchain tip information |
| Get by Height | Block at a specific height |
| Get | Block by hash |

### Mempool Resource

| Operation | Description |
|-----------|-------------|
| Get Info | Mempool statistics (count, vsize, total fees) |

### Fee Resource

| Operation | Description |
|-----------|-------------|
| Get Recommended | Current fee estimates for different confirmation targets |

## Trigger Node

### Events

| Event | Description | Configuration |
|-------|-------------|---------------|
| New Block | Fires when a new block is mined | None required |
| Address Transaction | Fires on address activity | Address, Direction, Include Unconfirmed |
| Transaction Confirmed | Fires when confirmations reached | Transaction ID, Required Confirmations |
| Fee Rate Change | Fires when fees change significantly | Fee Type, Change Threshold (%) |

## Usage Examples

### Get Address Balance

```javascript
// Returns:
{
  "address": "bc1q...",
  "confirmed_satoshis": 1000000,
  "confirmed_btc": 0.01,
  "unconfirmed_satoshis": 0,
  "unconfirmed_btc": 0,
  "total_satoshis": 1000000,
  "total_btc": 0.01
}
```

### Get Recommended Fees

```javascript
// Returns:
{
  "fastest_fee": 25,
  "half_hour_fee": 20,
  "hour_fee": 15,
  "economy_fee": 10,
  "minimum_fee": 5,
  "unit": "sat/vB"
}
```

### Monitor Address for Payments

Configure Bitcoin Trigger:
- Event: Address Transaction
- Address: Your Bitcoin address
- Direction: Incoming Only
- Include Unconfirmed: Yes

### Wait for Transaction Confirmation

Configure Bitcoin Trigger:
- Event: Transaction Confirmed
- Transaction ID: Your txid
- Required Confirmations: 6

## Networks

| Network | Description | Address Prefix |
|---------|-------------|----------------|
| Mainnet | Real Bitcoin network | `bc1q...`, `bc1p...`, `1...`, `3...` |
| Testnet | Test network | `tb1q...`, `tb1p...`, `m...`, `n...`, `2...` |
| Signet | Signet test network | `tb1q...`, `tb1p...` |

## Error Handling

The node handles errors gracefully:
- Invalid addresses return descriptive error messages
- Network timeouts are handled with retry logic
- Missing transactions/blocks return appropriate errors
- `continueOnFail()` support for workflow resilience

## Security Best Practices

1. **Never expose private keys** - This node is read-only for queries
2. **Use testnet for development** - Test workflows before using mainnet
3. **Validate addresses** - Always verify address formats before use
4. **Monitor rate limits** - Mempool.space has rate limits for free API

## Development

### Build

```bash
pnpm install
pnpm build
```

### Test

```bash
pnpm test
pnpm test:coverage
```

### Lint

```bash
pnpm lint
pnpm lint:fix
```

### Format

```bash
pnpm format
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

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

## Support

- **Website**: [velobpa.com](https://velobpa.com)
- **Licensing**: [licensing@velobpa.com](mailto:licensing@velobpa.com)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-bitcoin/issues)

## Acknowledgments

- [Mempool.space](https://mempool.space) - Open-source Bitcoin explorer API
- [n8n](https://n8n.io) - Workflow automation platform
- Bitcoin community for protocol documentation

## Changelog

### 1.0.0
- Initial release
- Bitcoin action node with 5 resources and 12 operations
- Bitcoin trigger node with 4 event types
- Support for mainnet, testnet, and signet networks
- Mempool.space API integration
