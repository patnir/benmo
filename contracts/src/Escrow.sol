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
    mapping(address => uint256) public senderEscrowLength;
    mapping(address => uint256[]) public receiverEscrows;
    mapping(address => uint256) public receiverEscrowLength;

    uint256 public constant MIN_GAS_VALUE = 100 gwei;

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
        require(msg.value > MIN_GAS_VALUE, "Amount must be greater than 0.1 gwei");
        require(receiver != address(0), "Invalid receiver address");
        require(canWithdrawAfter >= 60, "Can withdraw after must be greater than 1 minute");
        require(msg.sender != receiver, "Sender and receiver cannot be the same");

        uint256 receiverAmount = msg.value - MIN_GAS_VALUE;

        uint256 canWithdrawAt = block.timestamp + canWithdrawAfter;
        uint256 escrowId = escrowCount++;

        escrows[escrowId] = EscrowData({
            sender: msg.sender,
            receiver: receiver,
            amount: receiverAmount,
            status: Status.Pending,
            canWithdrawAt: canWithdrawAt
        });

        senderEscrows[msg.sender].push(escrowId);
        receiverEscrows[receiver].push(escrowId);

        // transfer the receiverAmount to the receiver
        payable(receiver).transfer(MIN_GAS_VALUE);
    }

    // the deposit wallet should be able to cancel the escrow before the receiver withdraws
    function cancel(uint256 escrowId) external escrowExists(escrowId) onlySender(escrowId) isPending(escrowId) {
        escrows[escrowId].status = Status.Cancelled;
        // print the escrowId
        // refund the sender the amount
        payable(escrows[escrowId].sender).transfer(escrows[escrowId].amount);
    }

    function withdraw(uint256 escrowId) external escrowExists(escrowId) onlyReceiver(escrowId) isPending(escrowId) {
        require(escrows[escrowId].sender == msg.sender, "Only sender can withdraw");
        escrows[escrowId].status = Status.Completed;
        payable(escrows[escrowId].receiver).transfer(escrows[escrowId].amount);
    }

    function getEscrowDetails(uint256 escrowId)
        external
        view
        returns (address sender, address receiver, uint256 amount, Status status, uint256 canWithdrawAt)
    {
        require(escrowId < escrowCount, "Escrow does not exist");
        EscrowData memory escrow = escrows[escrowId];
        return (escrow.sender, escrow.receiver, escrow.amount, escrow.status, escrow.canWithdrawAt);
    }
}
