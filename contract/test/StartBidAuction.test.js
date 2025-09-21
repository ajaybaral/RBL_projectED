const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StartBidAuction", function () {
  let startBidAuction;
  let owner;
  let seller;
  let bidder1;
  let bidder2;
  let bidder3;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, bidder3] = await ethers.getSigners();
    
    const StartBidAuction = await ethers.getContractFactory("StartBidAuction");
    startBidAuction = await StartBidAuction.deploy();
    await startBidAuction.waitForDeployment();
  });

  describe("Auction Creation", function () {
    it("Should create an auction successfully", async function () {
      const ipfsCID = "QmTest123";
      const reservePrice = ethers.parseEther("1.0");
      const biddingTime = 3600; // 1 hour

      const tx = await startBidAuction.connect(seller).createAuction(
        ipfsCID,
        reservePrice,
        biddingTime
      );

      await expect(tx)
        .to.emit(startBidAuction, "AuctionCreated")
        .withArgs(1, seller.address, ipfsCID, reservePrice, await tx.getBlock().then(b => b.timestamp), await tx.getBlock().then(b => b.timestamp) + biddingTime);

      const auction = await startBidAuction.getAuction(1);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.ipfsCID).to.equal(ipfsCID);
      expect(auction.reservePrice).to.equal(reservePrice);
      expect(auction.highestBid).to.equal(0);
      expect(auction.settled).to.be.false;
      expect(auction.canceled).to.be.false;
    });

    it("Should reject auction creation with empty IPFS CID", async function () {
      await expect(
        startBidAuction.connect(seller).createAuction("", ethers.parseEther("1.0"), 3600)
      ).to.be.revertedWith("IPFS CID required");
    });

    it("Should reject auction creation with too short bidding time", async function () {
      await expect(
        startBidAuction.connect(seller).createAuction("QmTest123", ethers.parseEther("1.0"), 30)
      ).to.be.revertedWith("Bidding time too short");
    });
  });

  describe("Bidding", function () {
    let auctionId;

    beforeEach(async function () {
      const ipfsCID = "QmTest123";
      const reservePrice = ethers.parseEther("1.0");
      const biddingTime = 3600;

      const tx = await startBidAuction.connect(seller).createAuction(
        ipfsCID,
        reservePrice,
        biddingTime
      );
      auctionId = 1;
    });

    it("Should allow placing a bid", async function () {
      const bidAmount = ethers.parseEther("2.0");

      await expect(
        startBidAuction.connect(bidder1).placeBid(auctionId, { value: bidAmount })
      )
        .to.emit(startBidAuction, "BidPlaced")
        .withArgs(auctionId, bidder1.address, bidAmount);

      const auction = await startBidAuction.getAuction(auctionId);
      expect(auction.highestBid).to.equal(bidAmount);
      expect(auction.highestBidder).to.equal(bidder1.address);
    });

    it("Should reject bid that is not higher than current highest bid", async function () {
      const bidAmount = ethers.parseEther("2.0");
      await startBidAuction.connect(bidder1).placeBid(auctionId, { value: bidAmount });

      await expect(
        startBidAuction.connect(bidder2).placeBid(auctionId, { value: bidAmount })
      ).to.be.revertedWith("Bid <= highest bid");
    });

    it("Should handle multiple bids correctly", async function () {
      const bid1 = ethers.parseEther("2.0");
      const bid2 = ethers.parseEther("3.0");
      const bid3 = ethers.parseEther("4.0");

      await startBidAuction.connect(bidder1).placeBid(auctionId, { value: bid1 });
      await startBidAuction.connect(bidder2).placeBid(auctionId, { value: bid2 });
      await startBidAuction.connect(bidder3).placeBid(auctionId, { value: bid3 });

      const auction = await startBidAuction.getAuction(auctionId);
      expect(auction.highestBid).to.equal(bid3);
      expect(auction.highestBidder).to.equal(bidder3.address);

      // Check pending returns for outbid users
      expect(await startBidAuction.pendingReturns(bidder1.address)).to.equal(bid1);
      expect(await startBidAuction.pendingReturns(bidder2.address)).to.equal(bid2);
      expect(await startBidAuction.pendingReturns(bidder3.address)).to.equal(0);
    });

    it("Should reject bid after auction ends", async function () {
      // Fast forward time to after auction ends
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      await expect(
        startBidAuction.connect(bidder1).placeBid(auctionId, { value: ethers.parseEther("2.0") })
      ).to.be.revertedWith("Auction ended");
    });
  });

  describe("Withdrawal", function () {
    let auctionId;

    beforeEach(async function () {
      const ipfsCID = "QmTest123";
      const reservePrice = ethers.parseEther("1.0");
      const biddingTime = 3600;

      await startBidAuction.connect(seller).createAuction(ipfsCID, reservePrice, biddingTime);
      auctionId = 1;

      // Place multiple bids
      await startBidAuction.connect(bidder1).placeBid(auctionId, { value: ethers.parseEther("2.0") });
      await startBidAuction.connect(bidder2).placeBid(auctionId, { value: ethers.parseEther("3.0") });
    });

    it("Should allow withdrawal of outbid funds", async function () {
      const initialBalance = await ethers.provider.getBalance(bidder1.address);
      
      const tx = await startBidAuction.connect(bidder1).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(bidder1.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("2.0") - gasUsed);

      expect(await startBidAuction.pendingReturns(bidder1.address)).to.equal(0);
    });

    it("Should reject withdrawal when no funds available", async function () {
      await expect(
        startBidAuction.connect(bidder3).withdraw()
      ).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Auction Cancellation", function () {
    let auctionId;

    beforeEach(async function () {
      const ipfsCID = "QmTest123";
      const reservePrice = ethers.parseEther("1.0");
      const biddingTime = 3600;

      await startBidAuction.connect(seller).createAuction(ipfsCID, reservePrice, biddingTime);
      auctionId = 1;
    });

    it("Should allow seller to cancel auction with no bids", async function () {
      await expect(
        startBidAuction.connect(seller).cancelAuction(auctionId)
      )
        .to.emit(startBidAuction, "AuctionCanceled")
        .withArgs(auctionId);

      const auction = await startBidAuction.getAuction(auctionId);
      expect(auction.canceled).to.be.true;
    });

    it("Should reject cancellation by non-seller", async function () {
      await expect(
        startBidAuction.connect(bidder1).cancelAuction(auctionId)
      ).to.be.revertedWith("Not seller");
    });

    it("Should reject cancellation when bids exist", async function () {
      await startBidAuction.connect(bidder1).placeBid(auctionId, { value: ethers.parseEther("2.0") });

      await expect(
        startBidAuction.connect(seller).cancelAuction(auctionId)
      ).to.be.revertedWith("Cannot cancel with active bids");
    });
  });

  describe("Auction Settlement", function () {
    let auctionId;

    beforeEach(async function () {
      const ipfsCID = "QmTest123";
      const reservePrice = ethers.parseEther("1.0");
      const biddingTime = 3600;

      await startBidAuction.connect(seller).createAuction(ipfsCID, reservePrice, biddingTime);
      auctionId = 1;

      await startBidAuction.connect(bidder1).placeBid(auctionId, { value: ethers.parseEther("2.0") });
    });

    it("Should settle auction successfully", async function () {
      // Fast forward time to after auction ends
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
      const ownerInitialBalance = await ethers.provider.getBalance(owner.address);

      const tx = await startBidAuction.connect(bidder2).settleAuction(auctionId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(startBidAuction, "AuctionSettled")
        .withArgs(auctionId, bidder1.address, ethers.parseEther("2.0"));

      const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
      const ownerFinalBalance = await ethers.provider.getBalance(owner.address);

      // Check that seller received payout minus platform fee
      const expectedPayout = ethers.parseEther("2.0") * 975n / 1000n; // 2.5% fee
      expect(sellerFinalBalance).to.equal(sellerInitialBalance + expectedPayout);

      // Check that owner received platform fee
      const expectedFee = ethers.parseEther("2.0") * 25n / 1000n; // 2.5% fee
      expect(ownerFinalBalance).to.equal(ownerInitialBalance + expectedFee);

      const auction = await startBidAuction.getAuction(auctionId);
      expect(auction.settled).to.be.true;
    });

    it("Should reject settlement before auction ends", async function () {
      await expect(
        startBidAuction.connect(bidder2).settleAuction(auctionId)
      ).to.be.revertedWith("Auction not yet ended");
    });

    it("Should reject settlement when reserve not met", async function () {
      // Create auction with higher reserve price
      const ipfsCID2 = "QmTest456";
      const reservePrice2 = ethers.parseEther("5.0");
      const biddingTime2 = 3600;

      await startBidAuction.connect(seller).createAuction(ipfsCID2, reservePrice2, biddingTime2);
      const auctionId2 = 2;

      await startBidAuction.connect(bidder1).placeBid(auctionId2, { value: ethers.parseEther("2.0") });

      // Fast forward time to after auction ends
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      await expect(
        startBidAuction.connect(bidder2).settleAuction(auctionId2)
      ).to.be.revertedWith("Reserve not met");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set platform fee", async function () {
      await startBidAuction.connect(owner).setPlatformFee(500); // 5%
      expect(await startBidAuction.platformFeeBasisPoints()).to.equal(500);
    });

    it("Should reject platform fee > 10%", async function () {
      await expect(
        startBidAuction.connect(owner).setPlatformFee(1100) // 11%
      ).to.be.revertedWith("Fee too large");
    });

    it("Should allow owner to transfer ownership", async function () {
      await startBidAuction.connect(owner).transferOwnership(bidder1.address);
      expect(await startBidAuction.owner()).to.equal(bidder1.address);
    });

    it("Should reject non-owner from setting platform fee", async function () {
      await expect(
        startBidAuction.connect(seller).setPlatformFee(500)
      ).to.be.revertedWith("Not owner");
    });
  });
});
