// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Escrow {
    struct EscrowData {
        uint256 id;
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

    function deposit(address receiver, uint256 canWithdrawAfter) external payable returns (EscrowData memory) {
        require(msg.value > MIN_GAS_VALUE, "Amount must be greater than 0.1 gwei");
        require(receiver != address(0), "Invalid receiver address");
        require(canWithdrawAfter >= 60, "Can withdraw after must be greater than 1 minute");
        require(msg.sender != receiver, "Sender and receiver cannot be the same");

        uint256 receiverAmount = msg.value - MIN_GAS_VALUE;

        uint256 canWithdrawAt = block.timestamp + canWithdrawAfter;
        uint256 escrowId = escrowCount++;

        escrows[escrowId] = EscrowData({
            id: escrowId,
            sender: msg.sender,
            receiver: receiver,
            amount: receiverAmount,
            status: Status.Pending,
            canWithdrawAt: canWithdrawAt
        });

        senderEscrows[msg.sender].push(escrowId);
        receiverEscrows[receiver].push(escrowId);
        senderEscrowLength[msg.sender]++;
        receiverEscrowLength[receiver]++;

        // transfer the receiverAmount to the receiver
        payable(receiver).transfer(MIN_GAS_VALUE);

        return escrows[escrowId];
    }

    // the deposit wallet should be able to cancel the escrow before the receiver withdraws
    function cancel(uint256 escrowId) external escrowExists(escrowId) onlySender(escrowId) isPending(escrowId) {
        escrows[escrowId].status = Status.Cancelled;
        payable(msg.sender).transfer(escrows[escrowId].amount);
    }

    function withdraw(uint256 escrowId) external escrowExists(escrowId) onlyReceiver(escrowId) isPending(escrowId) {
        require(block.timestamp >= escrows[escrowId].canWithdrawAt, "Cannot withdraw yet");
        escrows[escrowId].status = Status.Completed;
        payable(msg.sender).transfer(escrows[escrowId].amount);
    }

    function getEscrowDetails(uint256 escrowId)
        external
        view
        returns (uint256 id, address sender, address receiver, uint256 amount, Status status, uint256 canWithdrawAt)
    {
        require(escrowId < escrowCount, "Escrow does not exist");
        EscrowData memory escrow = escrows[escrowId];
        return (escrow.id, escrow.sender, escrow.receiver, escrow.amount, escrow.status, escrow.canWithdrawAt);
    }

    function getSenderEscrows() external view returns (EscrowData[] memory) {
        uint256[] memory escrowIds = senderEscrows[msg.sender];
        EscrowData[] memory result = new EscrowData[](escrowIds.length);
        for (uint256 i = 0; i < escrowIds.length; i++) {
            result[i] = escrows[escrowIds[i]];
        }
        return result;
    }

    function getReceiverEscrows() external view returns (EscrowData[] memory) {
        uint256[] memory escrowIds = receiverEscrows[msg.sender];
        EscrowData[] memory result = new EscrowData[](escrowIds.length);
        for (uint256 i = 0; i < escrowIds.length; i++) {
            result[i] = escrows[escrowIds[i]];
        }
        return result;
    }
}
