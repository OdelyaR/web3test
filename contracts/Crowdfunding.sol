// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


contract Crowdfunding {
    uint256 fundGoal = 10 ether;
    uint256 minContribution = 0.01 ether;

    address payable destinationWallet = payable(0xEee9a15454Ee744b96CB76Ef59c7EF15879Cf010);

    mapping(address => uint256) addressContributions;

    function donate() public payable {
        require(msg.value >= minContribution, "Donate Error: Did not meet minimum contribution");
        addressContributions[msg.sender] = msg.value;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        require(address(this).balance >= fundGoal, "Withdraw Error: Did not meet contribution goal");
        destinationWallet.transfer(address(this).balance);
    }

    function returnFunds() public {
        require(address(this).balance < fundGoal, "ReturnFunds Error: Cannot refund, goal has been met");
        require(addressContributions[msg.sender] != 0, "ReturnFunds Error: You have not contributed");
        uint256 amount = addressContributions[msg.sender];
        payable(msg.sender).transfer(amount);
    }

    receive() external payable {}
}