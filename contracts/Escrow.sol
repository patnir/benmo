// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    struct EscrowData {
        address sender;
        address receiver;
        uint256 amount;
        Status status;
        uint256 canWithdrawAt;
    }

    enum Status {
        Pending,
        Completed,
        Cancelled
    }

    mapping(uint256 => EscrowData) public escrows;
    mapping(address => uint256[]) public senderEscrows;
    mapping(address => uint256[]) public receiverEscrows;

    
    uint256 public escrowCount;

    modifier onlySender(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].sender, "Only sender can perform this action");
        _;
    }

    modifier onlyReceiver(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].receiver, "Only receiver can perform this action");
        _;
    }

    modifier escrowExists(uint256 escrowId) {
        require(escrowId < escrowCount, "Escrow does not exist");
        _;
    }

    modifier isPending(uint256 escrowId) {
        require(escrows[escrowId].status == Status.Pending, "Escrow is not in pending state");
        _;
    }

    function deposit(address receiver, uint256 canWithdrawAfter) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(receiver != address(0), "Invalid receiver address");
        require(canWithdrawAfter > 300, "Can withdraw after must be greater than 5 minutes");

        uint256 canWithdrawAt = block.timestamp + canWithdrawAfter;
        uint256 escrowId = escrowCount++;
        
        escrows[escrowId] = EscrowData({
            sender: msg.sender,
            receiver: receiver,
            amount: msg.value,
            status: Status.Pending,
            canWithdrawAt: canWithdrawAt
        });

        senderEscrows[msg.sender].push(escrowId);
        receiverEscrows[receiver].push(escrowId);
    }

    function cancel(uint256 escrowId) external escrowExists(escrowId) onlySender(escrowId) isPending(escrowId) {
        require(block.timestamp >= escrows[escrowId].canWithdrawAt, "Cannot cancel before can withdraw at");
        escrows[escrowId].status = Status.Cancelled;
        payable(escrows[escrowId].sender).transfer(escrows[escrowId].amount);
    }

    function withdraw(uint256 escrowId) external escrowExists(escrowId) onlyReceiver(escrowId) isPending(escrowId) {
        require(escrows[escrowId].sender == msg.sender, "Only sender can withdraw");
        escrows[escrowId].status = Status.Completed;
        payable(escrows[escrowId].receiver).transfer(escrows[escrowId].amount);
    }

    function getEscrowDetails(uint256 escrowId) external view returns (
        address sender,
        address receiver,
        uint256 amount,
        Status status,
        uint256 canWithdrawAt
    ) {
        require(escrowId < escrowCount, "Escrow does not exist");
        EscrowData memory escrow = escrows[escrowId];
        return (
            escrow.sender,
            escrow.receiver,
            escrow.amount,
            escrow.status,
            escrow.canWithdrawAt
        );
    }
} 