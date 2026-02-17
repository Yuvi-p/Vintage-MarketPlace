// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IVintageItemNFT is IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

contract VlarMarketplace is Ownable, ReentrancyGuard {

    struct HistoryRecord {
        uint256 timestamp;
        string action;
        address actor;
        uint256 price;
    }

    // 0=Listed, 1=Authenticated, 2=Restoration, 3=Delivered
    enum Milestone { Listed, Authenticated, Restoration, Delivered }

    struct Listing {
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        Milestone currentMilestone;
        bool isSold;
        bool isActive;
    }

    IVintageItemNFT public nftContract;
    uint256 public constant MIN_STAKE = 0.01 ether; 

    mapping(uint256 => Listing) public listings;
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => uint256) public verifierStakes;
    mapping(address => uint256) public sellerTrustScore;
    mapping(uint256 => HistoryRecord[]) public itemHistory;

    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ItemBought(uint256 indexed tokenId, address indexed buyer);
    event MilestoneCompleted(uint256 indexed tokenId, Milestone milestone, address approvedBy);
    event FundsReleased(uint256 indexed tokenId, address recipient, uint256 amount);
    event VerifierSlashed(address indexed verifier, uint256 amount, address recipient);

    constructor(address _nftContractAddress) Ownable(msg.sender) {
        nftContract = IVintageItemNFT(_nftContractAddress);
    }

    // --- Helper to add History ---
    function _addHistory(uint256 _tokenId, string memory _action, uint256 _price) internal {
        itemHistory[_tokenId].push(HistoryRecord({
            timestamp: block.timestamp,
            action: _action,
            actor: msg.sender,
            price: _price
        }));
    }

    function getItemHistory(uint256 _tokenId) external view returns (HistoryRecord[] memory) {
        return itemHistory[_tokenId];
    }

    // --- Main Functions ---

    function registerAsVerifier() external payable {
        require(msg.value >= MIN_STAKE, "Insufficient stake");
        require(!authorizedVerifiers[msg.sender], "Already registered");
        authorizedVerifiers[msg.sender] = true;
        verifierStakes[msg.sender] = msg.value;
    }

    function listItem(uint256 tokenId, uint256 price) external nonReentrant {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be > 0");

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            buyer: address(0),
            price: price,
            currentMilestone: Milestone.Listed,
            isSold: false,
            isActive: true
        });

        _addHistory(tokenId, "Listed for Sale", price);
        emit ItemListed(tokenId, msg.sender, price);
    }

    function buyItem(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Item not active");
        require(!listing.isSold, "Item already sold");
        require(msg.value == listing.price, "Incorrect price");
        require(listing.buyer == address(0), "Already reserved");

        listing.buyer = msg.sender;
        listing.isActive = false; 
        
        _addHistory(tokenId, "Purchased (Funds Locked)", msg.value);
        emit ItemBought(tokenId, msg.sender);
    }

    // Step 1: Authentication -> Sets state to 1
    function approveAuthentication(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        require(listing.currentMilestone == Milestone.Listed, "Wrong milestone order");
        
        listing.currentMilestone = Milestone.Authenticated; 
        _addHistory(tokenId, "Authenticated", 0);
        emit MilestoneCompleted(tokenId, Milestone.Authenticated, msg.sender);
    }

    // Step 2: Restoration -> Sets state to 2 (Ready for Delivery Confirm)
    function approveRestoration(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        require(listing.currentMilestone == Milestone.Authenticated, "Must be authenticated first");

        listing.currentMilestone = Milestone.Restoration; 
        _addHistory(tokenId, "Restoration QC Passed", 0);
        emit MilestoneCompleted(tokenId, Milestone.Restoration, msg.sender);
    }

    // Step 3: Delivery Confirmation
    function confirmDelivery(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(msg.sender == listing.buyer, "Only buyer can confirm");
        require(listing.currentMilestone == Milestone.Restoration, "Item not ready or already delivered");
        require(!listing.isSold, "Already completed");

        listing.currentMilestone = Milestone.Delivered; 
        listing.isSold = true;
        
        uint256 totalPrice = listing.price;
        address payable seller = payable(listing.seller);
        address payable creator = payable(owner());

        // Royalty Logic (10%)
        if (seller != creator) {
            uint256 royaltyAmount = (totalPrice * 10) / 100;
            uint256 sellerAmount = totalPrice - royaltyAmount;
            (bool s1, ) = creator.call{value: royaltyAmount}("");
            require(s1, "Royalty failed");
            (bool s2, ) = seller.call{value: sellerAmount}("");
            require(s2, "Seller payment failed");
            sellerTrustScore[seller] += 5;
        } else {
            (bool s, ) = seller.call{value: totalPrice}("");
            require(s, "Payment failed");
            sellerTrustScore[seller] += 10;
        }

        nftContract.safeTransferFrom(listing.seller, msg.sender, tokenId);
        _addHistory(tokenId, "Delivered & Funds Released", totalPrice);
        emit FundsReleased(tokenId, seller, totalPrice);
    }

    function slashVerifier(address _verifier, address _victim) external onlyOwner {
        require(authorizedVerifiers[_verifier], "Not a verifier");
        uint256 stake = verifierStakes[_verifier];
        require(stake > 0, "No stake to slash");

        authorizedVerifiers[_verifier] = false;
        verifierStakes[_verifier] = 0;
        (bool success, ) = payable(_victim).call{value: stake}("");
        require(success, "Transfer failed");
        emit VerifierSlashed(_verifier, stake, _victim);
    }
}