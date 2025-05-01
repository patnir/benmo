// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow public escrow;

    function setUp() public {
        escrow = new Escrow();
    }

    uint256 public constant MIN_GAS_VALUE = 100 gwei;

    function testdeposit() public {
        vm.deal(address(this), 2 ether);

        address receiverEOA = makeAddr("receiverEOA");

        // assert balances before
        assertEq(address(this).balance, 2 ether);
        assertEq(address(receiverEOA).balance, 0);

        // Capture the returned struct from deposit
        Escrow.EscrowData memory createdEscrow = escrow.deposit{value: 0.1 ether}(receiverEOA, 60);

        assertEq(address(receiverEOA).balance, MIN_GAS_VALUE);
        assertEq(escrow.senderEscrows(address(this), 0), 0);
        assertEq(escrow.receiverEscrows(receiverEOA, 0), 0);

        // Assert using the returned struct
        assertEq(createdEscrow.id, 0);
        assertEq(createdEscrow.sender, address(this));
        assertEq(createdEscrow.receiver, receiverEOA);
        assertEq(createdEscrow.amount, 0.1 ether - MIN_GAS_VALUE);
        assertEq(createdEscrow.canWithdrawAt, block.timestamp + 60); // Note: block.timestamp might differ slightly if deposit took time
        assertEq(uint256(createdEscrow.status), uint256(Escrow.Status.Pending));

        // assert balances after
        assertEq(address(this).balance, 2 ether - 0.1 ether);
        assertEq(address(receiverEOA).balance, MIN_GAS_VALUE);
    }

    function testWithdraw() public {
        vm.deal(address(this), 2 ether);
        address receiverEOA = makeAddr("receiverEOA");

        // deposit
        escrow.deposit{value: 0.1 ether}(receiverEOA, 60);

        // assert balances before
        assertEq(address(this).balance, 2 ether - 0.1 ether);
        assertEq(address(receiverEOA).balance, MIN_GAS_VALUE);

        // advance time
        vm.warp(block.timestamp + 60);
        
        // call as receiver 
        vm.prank(receiverEOA);
        escrow.withdraw(0);

        // assert balances after
        assertEq(address(this).balance, 2 ether - 0.1 ether);
        assertEq(address(receiverEOA).balance, 0.1 ether);
    }

     // Function to receive ETH via a function call
    function deposit() external payable {}

    // Function to receive ETH without data
    receive() external payable {}

    // Fallback to receive ETH with data or unknown function call
    fallback() external payable {}

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
    
    function testCancel() public {
        vm.deal(address(this), 2 ether);
        address receiverEOA = makeAddr("receiverEOA");

        // assert balances before
        assertEq(address(this).balance, 2 ether);
        assertEq(address(receiverEOA).balance, 0);

        // deposit        
        // Capture the returned struct from deposit
        Escrow.EscrowData memory createdEscrowCancel = escrow.deposit{value: 0.1 ether}(receiverEOA, 60);
        uint256 escrowId = createdEscrowCancel.id;

        // assert balances before cancel
        assertEq(address(this).balance, 2 ether - 0.1 ether);
        assertEq(address(receiverEOA).balance, MIN_GAS_VALUE);
        // escrow balance 0.1 gwei
        assertEq(address(escrow).balance, 0.1 ether - MIN_GAS_VALUE);

        // print escrow 0 
        (address sender, address receiver, uint256 amount, Escrow.Status status, uint256 canWithdrawAt) =
            escrow.escrows(0);
    
        // cancel
        escrow.cancel(escrowId);

        // assert balances after
        assertEq(address(this).balance, 2 ether - MIN_GAS_VALUE);
        assertEq(address(receiverEOA).balance, MIN_GAS_VALUE);

        // // assert balances after - this should expect the full refund of the escrowed amount
        // assertEq(address(this).balance, 2 ether - 0.1 gwei);  // We get back the escrowed amount (0.1 ether - 0.1 gwei)
        // assertEq(address(receiverEOA).balance, 0.1 gwei);     // Receiver keeps their initial 0.1 gwei
    }

    function test_getSenderEscrows() public {
        address sender1 = makeAddr("sender1");
        address sender2 = makeAddr("sender2");
        address receiver1 = makeAddr("receiver1");
        address receiver2 = makeAddr("receiver2");

        vm.deal(sender1, 1 ether);
        vm.deal(sender2, 1 ether);

        // Deposit 1: sender1 -> receiver1 (0.1 eth)
        vm.prank(sender1);
        Escrow.EscrowData memory escrow1_data = escrow.deposit{value: 0.1 ether}(receiver1, 60);
        uint256 escrow1_timestamp = block.timestamp; // Capture timestamp *after* deposit potentially
        uint256 escrow1_id = escrow1_data.id;

        // Deposit 2: sender1 -> receiver2 (0.2 eth)
        vm.prank(sender1);
        Escrow.EscrowData memory escrow2_data = escrow.deposit{value: 0.2 ether}(receiver2, 120);
        uint256 escrow2_timestamp = block.timestamp;
        uint256 escrow2_id = escrow2_data.id;

        // Deposit 3: sender2 -> receiver1 (0.3 eth)
        vm.prank(sender2);
        Escrow.EscrowData memory escrow3_data = escrow.deposit{value: 0.3 ether}(receiver1, 180);
        uint256 escrow3_timestamp = block.timestamp;
        uint256 escrow3_id = escrow3_data.id;

        // --- Test getSenderEscrows for sender1 ---
        vm.prank(sender1);
        Escrow.EscrowData[] memory sender1Escrows = escrow.getSenderEscrows();
        assertEq(sender1Escrows.length, 2, "Sender1 should have 2 escrows");
        // Check escrow 1 details (index 0) - Assuming order is maintained
        assertEq(sender1Escrows[0].id, escrow1_id);
        assertEq(sender1Escrows[0].sender, sender1);
        assertEq(sender1Escrows[0].receiver, receiver1);
        assertEq(sender1Escrows[0].amount, 0.1 ether - MIN_GAS_VALUE);
        assertEq(uint256(sender1Escrows[0].status), uint256(Escrow.Status.Pending));
        assertEq(sender1Escrows[0].canWithdrawAt, escrow1_data.canWithdrawAt); // Use stored value
        // Check escrow 2 details (index 1)
        assertEq(sender1Escrows[1].id, escrow2_id);
        assertEq(sender1Escrows[1].sender, sender1);
        assertEq(sender1Escrows[1].receiver, receiver2);
        assertEq(sender1Escrows[1].amount, 0.2 ether - MIN_GAS_VALUE);
        assertEq(uint256(sender1Escrows[1].status), uint256(Escrow.Status.Pending));
        assertEq(sender1Escrows[1].canWithdrawAt, escrow2_data.canWithdrawAt); // Use stored value

        // --- Test getSenderEscrows for sender2 ---
        vm.prank(sender2);
        Escrow.EscrowData[] memory sender2Escrows = escrow.getSenderEscrows();
        assertEq(sender2Escrows.length, 1, "Sender2 should have 1 escrow");
        // Check escrow 3 details (index 0)
        assertEq(sender2Escrows[0].id, escrow3_id);
        assertEq(sender2Escrows[0].sender, sender2);
        assertEq(sender2Escrows[0].receiver, receiver1);
        assertEq(sender2Escrows[0].amount, 0.3 ether - MIN_GAS_VALUE);
        assertEq(uint256(sender2Escrows[0].status), uint256(Escrow.Status.Pending));
        assertEq(sender2Escrows[0].canWithdrawAt, escrow3_data.canWithdrawAt); // Use stored value

        // --- Test getSenderEscrows for an address with no sent escrows (receiver1) ---
        vm.prank(receiver1);
        Escrow.EscrowData[] memory noSenderEscrows = escrow.getSenderEscrows();
        assertEq(noSenderEscrows.length, 0, "Receiver1 should have 0 sent escrows");
    }

    // Helper function to perform deposits for receiver tests
    function _createReceiverTestDeposits() internal returns (address sender1, address sender2, address receiver1, address receiver2, Escrow.EscrowData memory escrow1, Escrow.EscrowData memory escrow2, Escrow.EscrowData memory escrow3) {
        sender1 = makeAddr("sender1");
        sender2 = makeAddr("sender2");
        receiver1 = makeAddr("receiver1");
        receiver2 = makeAddr("receiver2");

        vm.deal(sender1, 1 ether);
        vm.deal(sender2, 1 ether);

        // Deposit 1: sender1 -> receiver1 (0.1 eth)
        vm.prank(sender1);
        escrow1 = escrow.deposit{value: 0.1 ether}(receiver1, 60);

        // Deposit 2: sender1 -> receiver2 (0.2 eth)
        vm.prank(sender1);
        escrow2 = escrow.deposit{value: 0.2 ether}(receiver2, 120);

        // Deposit 3: sender2 -> receiver1 (0.3 eth)
        vm.prank(sender2);
        escrow3 = escrow.deposit{value: 0.3 ether}(receiver1, 180);
    }

    function test_getReceiverEscrows_Receiver1() public {
        (address sender1, address sender2, address receiver1, , Escrow.EscrowData memory escrow1_data, , Escrow.EscrowData memory escrow3_data) = _createReceiverTestDeposits();

        vm.prank(receiver1);
        Escrow.EscrowData[] memory receiver1Escrows = escrow.getReceiverEscrows();

        assertEq(receiver1Escrows.length, 2, "Receiver1 should have 2 escrows");
        // Check escrow 1 details (index 0) - Assuming order is maintained
        assertEq(receiver1Escrows[0].id, escrow1_data.id);
        assertEq(receiver1Escrows[0].sender, sender1);
        assertEq(receiver1Escrows[0].receiver, receiver1);
        assertEq(receiver1Escrows[0].amount, 0.1 ether - MIN_GAS_VALUE);
        assertEq(uint256(receiver1Escrows[0].status), uint256(Escrow.Status.Pending));
        assertEq(receiver1Escrows[0].canWithdrawAt, escrow1_data.canWithdrawAt); // Use stored value
        // Check escrow 3 details (index 1)
        assertEq(receiver1Escrows[1].id, escrow3_data.id);
        assertEq(receiver1Escrows[1].sender, sender2);
        assertEq(receiver1Escrows[1].receiver, receiver1);
        assertEq(receiver1Escrows[1].amount, 0.3 ether - MIN_GAS_VALUE);
        assertEq(uint256(receiver1Escrows[1].status), uint256(Escrow.Status.Pending));
        assertEq(receiver1Escrows[1].canWithdrawAt, escrow3_data.canWithdrawAt); // Use stored value
    }

    function test_getReceiverEscrows_Receiver2() public {
        (address sender1, , , address receiver2, , Escrow.EscrowData memory escrow2_data, ) = _createReceiverTestDeposits();

        vm.prank(receiver2);
        Escrow.EscrowData[] memory receiver2Escrows = escrow.getReceiverEscrows();

        assertEq(receiver2Escrows.length, 1, "Receiver2 should have 1 escrow");
        // Check escrow 2 details (index 0)
        assertEq(receiver2Escrows[0].id, escrow2_data.id);
        assertEq(receiver2Escrows[0].sender, sender1);
        assertEq(receiver2Escrows[0].receiver, receiver2);
        assertEq(receiver2Escrows[0].amount, 0.2 ether - MIN_GAS_VALUE);
        assertEq(uint256(receiver2Escrows[0].status), uint256(Escrow.Status.Pending));
        assertEq(receiver2Escrows[0].canWithdrawAt, escrow2_data.canWithdrawAt); // Use stored value
    }

    function test_getReceiverEscrows_NoEscrows() public {
         (address sender1, , , , , , ) = _createReceiverTestDeposits();

        // --- Test getReceiverEscrows for an address with no received escrows (sender1) ---
        vm.prank(sender1);
        Escrow.EscrowData[] memory noReceiverEscrows = escrow.getReceiverEscrows();
        assertEq(noReceiverEscrows.length, 0, "Sender1 should have 0 received escrows");
    }
}
