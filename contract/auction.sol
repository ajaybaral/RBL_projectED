// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 <0.9.0;

contract Auction{

    event listed_auction(uint auction_id);
    
    uint id_counter=0;

    struct auction{
        string prod_title;
        string owner_name;
        bool is_active;
        bool amount_status;
        uint unique_id;
        uint time_of_creation;
        uint time_of_deadline; 
        uint starting_bid_rate;
        uint winning_bid_amt;
        address auction_owner;
    }

    struct bidder{
        address bid_placer;
        uint bidded_value;
        uint order;
        bool winner;
    }

    mapping(uint => bidder[]) public bidders;

    auction[] public auctions;

     function list_new_auction(string memory title, string memory name, uint days_to_deadline, uint starting_bid) public returns(uint256){
        require(days_to_deadline > 0);
        require(starting_bid > 0);
        auctions.push(auction(title, name, true, false, id_counter, block.timestamp, uint256(block.timestamp + days_to_deadline *1 days), starting_bid, 0, msg.sender));
        id_counter++;
        emit listed_auction(id_counter-1);
        return id_counter-1;
    }

    function view_all_auctions() public view returns(auction[] memory){
        return auctions;
    }

    function make_bid(uint auction_id, uint orderval, uint bidded_value) public returns(bidder[] memory){
        require(block.timestamp < auctions[auction_id].time_of_deadline);
        require(auctions[auction_id].is_active==true);
        bidder[] storage all_bidders = bidders[auction_id];
        all_bidders.push(bidder(msg.sender, bidded_value, orderval,false));
        return bidders[auction_id];
    }

    function make_payment(uint auction_id) public payable returns(bool){
        require(block.timestamp > auctions[auction_id].time_of_deadline);
        bidder[] storage all_bidders = bidders[auction_id];
        auction storage myauction = auctions[auction_id];
        uint winner = all_bidders.length;
        for(uint i=0;i<all_bidders.length;i++){
            if(all_bidders[i].order==winner){
                require(all_bidders[i].bid_placer==msg.sender);
                require(msg.value==all_bidders[i].bidded_value);
                require(all_bidders[i].winner == false);
                myauction.winning_bid_amt=all_bidders[i].bidded_value;
                myauction.amount_status = true;
                all_bidders[i].winner=true;
                return true;
            }
        }
        return false;
    }

    function view_contract_balance() public view returns(uint256){
        return address(this).balance;
    }

    function withdraw_from_auction(uint auction_id) public {
        require(auctions[auction_id].is_active==true);
        require(auctions[auction_id].owner_name == msg.sender);
        require(block.timestamp > auctions[auction_id].time_of_deadline);
        require(auctions[auction_id].amount_status==true);
        uint amt = auctions[auction_id].winning_bid_amt;
        payable(msg.sender).transfer(amt);
        auctions[auction_id].is_active=false;
    }
}