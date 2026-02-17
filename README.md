⚜️ VLAR | Vintage Luxury Marketplace
Decentralized Authentication, Restoration, and Escrow for Fine Vintage Assets.

VLAR is a blockchain-based ecosystem designed to bring transparency and trust to the high-end vintage market. By utilizing smart contracts, the platform ensures that every luxury item is authenticated and restored by verified experts before funds are released to the seller.

✨ Key Features
Secure Escrow System: When a collector purchases an item, funds are locked in the smart contract. Payment is only released to the seller after the buyer confirms delivery.

Proof of Authenticity (Milestones): Items must pass through a mandatory 4-stage lifecycle: Listed → Authenticated → Restoration → Delivered.

Stake-Backed Verifiers: To ensure integrity, verifiers must stake a minimum of 0.01 ETH to join the network. Malicious or negligent verifiers can be "slashed" by the admin.

Immutable Provenance: Every asset maintains a permanent HistoryRecord on-chain, tracing every action from the first listing to the final sale.

Seller Trust Scores: A reputation system that rewards reliable sellers with "Trust Score" points upon successful transactions.

Loyalty Rewards (VLT): The ecosystem includes VintageLoyalty (VLT), an ERC-20 token used to reward users and incentivize platform participation.

🛠 Technical Architecture
Smart Contracts
VlarMarketplace.sol: The core engine handling escrow logic, milestone approvals, verifier management, and royalties.

VintageItemNFT.sol: An ERC-721 contract (NFT) representing unique luxury assets with metadata storage.

VintageToken.sol: An ERC-20 loyalty token for the platform's reward economy.

Tech Stack
Solidity (v0.8.20): Smart contract development using OpenZeppelin standards.

Web3.js: For blockchain interaction and wallet connectivity.

Frontend: HTML5, CSS3 (Luxury UI), and JavaScript.

⚙️ Logic Flow & Math
Listing: Sellers mint an NFT and list it for a price in Wei.

Purchasing: The buyer sends the exact ETH amount, which is held by the contract.

Verification: Authorized verifiers move the item through milestones.

Finalization: Upon buyer confirmation, the contract calculates a 10% platform royalty:


SellerAmount=TotalPrice−(TotalPrice×0.10)
Distribution: The royalty goes to the owner, and the remaining 90% is sent to the seller.

⚠️ Known Limitations
Manual Refresh: The UI does not auto-update; a page refresh is required after transactions.

Fixed Royalties: The 10% royalty fee is hardcoded and cannot be changed post-deployment.

Gas Estimation: Users may occasionally see high gas warnings in MetaMask during network congestion.

Integer Division: Minor "dust" (1-2 Wei) may remain in the contract due to Solidity's integer division.

🚀 How to Run
Deploy Contracts: Deploy the .sol files via Remix or Hardhat.

Configure App: Update the NFT_CONTRACT_ADDRESS and MARKETPLACE_CONTRACT_ADDRESS in app.js.

Approve Transfer: Before listing, the seller must call setApprovalForAll on the NFT contract to allow the marketplace to handle the asset.

Launch: Open index.html using a local server (like Live Server) and connect MetaMask.
