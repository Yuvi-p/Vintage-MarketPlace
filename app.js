// ==========================================
// 1. CONFIGURATION (PASTE YOUR ADDRESSES HERE)
// ==========================================
const NFT_CONTRACT_ADDRESS = "0xadC21c5afCFEAF4d5F91dF0b845e86350b584791"; 
const MARKETPLACE_CONTRACT_ADDRESS = "0x3C7b88c38Ef4Cf4Fe0E1Baa6dd3D59617041a8ea";

// ==========================================
// 2. ABIs (UPDATED INTERFACES)
// ==========================================

const nftABI = [
	{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
	{ "inputs": [{ "internalType": "string", "name": "tokenURI", "type": "string" }], "name": "mintItem", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
];

const marketplaceABI = [
	{ "inputs": [{ "internalType": "address", "name": "_nftContractAddress", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
	{ "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approveAuthentication", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approveRestoration", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "buyItem", "outputs": [], "stateMutability": "payable", "type": "function" },
	{ "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "confirmDelivery", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [{ "internalType": "uint256", "name": "_tokenId", "type": "uint256" }], "name": "getItemHistory", "outputs": [{ "components": [{ "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "string", "name": "action", "type": "string" }, { "internalType": "address", "name": "actor", "type": "address" }, { "internalType": "uint256", "name": "price", "type": "uint256" }], "internalType": "struct VlarMarketplace.HistoryRecord[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "price", "type": "uint256" }], "name": "listItem", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "listings", "outputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "address", "name": "seller", "type": "address" }, { "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "price", "type": "uint256" }, { "internalType": "uint8", "name": "currentMilestone", "type": "uint8" }, { "internalType": "bool", "name": "isSold", "type": "bool" }, { "internalType": "bool", "name": "isActive", "type": "bool" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "registerAsVerifier", "outputs": [], "stateMutability": "payable", "type": "function" },
	{ "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "sellerTrustScore", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

// ==========================================
// 3. LOGIC & FUNCTIONS
// ==========================================

let web3;
let userAccount;
let nftContract;
let marketplaceContract;

async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            userAccount = accounts[0];
            
            // Update UI
            const dot = document.getElementById("statusDot");
            if(dot) dot.classList.add("connected");
            
            const addrDisplay = document.getElementById("walletAddress");
            if(addrDisplay) addrDisplay.innerText = userAccount.substring(0,6) + "..." + userAccount.substring(38);

            // Init Contracts
            nftContract = new web3.eth.Contract(nftABI, NFT_CONTRACT_ADDRESS);
            marketplaceContract = new web3.eth.Contract(marketplaceABI, MARKETPLACE_CONTRACT_ADDRESS);

            console.log("Wallet Connected:", userAccount);
        } catch (error) {
            console.error("User denied access", error);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// --- SELLER FUNCTIONS ---
async function mintNFT() {
    const tokenURI = document.getElementById("tokenUri").value;
    if (!tokenURI) return alert("Please enter Token Name");
    try {
        await nftContract.methods.mintItem(tokenURI).send({ from: userAccount });
        alert("✅ NFT Minted Successfully!");
    } catch (error) {
        console.error(error);
        alert("Minting failed.");
    }
}

async function listItem() {
    const tokenId = document.getElementById("listTokenId").value;
    const priceEth = document.getElementById("listPrice").value;
    if (!tokenId || !priceEth) return alert("Please enter ID and Price");
    
    const priceWei = web3.utils.toWei(priceEth, "ether");
    try {
        await marketplaceContract.methods.listItem(tokenId, priceWei).send({ from: userAccount });
        alert("✅ Item Listed for Sale!");
    } catch (error) {
        console.error(error);
        alert("Listing failed. (Did you Approve in Remix?)");
    }
}

// --- BUYER FUNCTIONS ---
async function buyItem() {
    const tokenId = document.getElementById("buyTokenId").value;
    if (!tokenId) return alert("Please enter Token ID");

    try {
        // 1. Get price automatically from contract
        const listing = await marketplaceContract.methods.listings(tokenId).call();
        const priceWei = listing.price;

        if (priceWei == 0) return alert("Item not found or not listed.");

        // 2. Send transaction
        await marketplaceContract.methods.buyItem(tokenId).send({ 
            from: userAccount, 
            value: priceWei 
        });
        alert("✅ Item Purchased! Funds held in Escrow.");
    } catch (error) {
        console.error(error);
        alert("Purchase failed.");
    }
}

async function confirmDelivery() {
    const tokenId = document.getElementById("confirmTokenId").value;
    try {
        await marketplaceContract.methods.confirmDelivery(tokenId).send({ from: userAccount });
        alert("✅ Delivery Confirmed! Funds Released to Seller.");
    } catch (error) {
        console.error(error);
        alert("Confirmation failed. (Is restoration complete?)");
    }
}

// --- VERIFIER FUNCTIONS ---
async function registerVerifier() {
    try {
        const stake = web3.utils.toWei("0.01", "ether");
        await marketplaceContract.methods.registerAsVerifier().send({ from: userAccount, value: stake });
        alert("✅ Registered as Verifier!");
    } catch (error) {
        console.error(error);
        alert("Registration failed");
    }
}

async function approveAuthentication() {
    const tokenId = document.getElementById("verifyTokenId").value;
    try {
        await marketplaceContract.methods.approveAuthentication(tokenId).send({ from: userAccount });
        alert("✅ Step 1: Authentication Approved!");
    } catch (error) {
        console.error(error);
        alert("Authentication failed.");
    }
}

async function approveRestoration() {
    const tokenId = document.getElementById("verifyTokenId").value;
    try {
        await marketplaceContract.methods.approveRestoration(tokenId).send({ from: userAccount });
        alert("✅ Step 2: Restoration Approved!");
    } catch (error) {
        console.error(error);
        alert("Restoration failed.");
    }
}

// --- HISTORY & REPUTATION ---
async function checkReputation() {
    const sellerAddr = document.getElementById("sellerAddress").value;
    try {
        const score = await marketplaceContract.methods.sellerTrustScore(sellerAddr).call();
        document.getElementById("reputationResult").innerText = "Trust Score: " + score;
    } catch (error) {
        console.error(error);
        alert("Could not fetch score");
    }
}

async function fetchItemHistory() {
    const resultsDiv = document.getElementById("historyResults");
    resultsDiv.innerHTML = '<div style="text-align:center;">Loading...</div>';
    try {
        const tokenId = document.getElementById("historyTokenId").value;
        const history = await marketplaceContract.methods.getItemHistory(tokenId).call();
        
        if(history.length === 0) {
            resultsDiv.innerHTML = "<p style='text-align:center;'>No history found.</p>";
            return;
        }

        let html = '<ul>';
        history.forEach(rec => {
            const date = new Date(rec.timestamp * 1000).toLocaleString();
            const eth = web3.utils.fromWei(rec.price, 'ether');
            html += `
            <li>
                <div class="history-card">
                    <div class="history-action">${rec.action}</div>
                    <div class="history-meta">
                        ${date} | User: ${rec.actor.substring(0,6)}... | Value: ${eth} ETH
                    </div>
                </div>
            </li>`;
        });
        html += '</ul>';
        resultsDiv.innerHTML = html;
    } catch (e) {
        console.error(e);
        resultsDiv.innerHTML = "Error fetching history.";
    }
}