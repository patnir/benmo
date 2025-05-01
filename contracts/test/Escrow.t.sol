// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow public escrow;

    function setUp() public {
        escrow = new Escrow();
    }

    function testdeposit() public {
        vm.deal(address(this), 2 ether);

        address receiverEOA = makeAddr("receiverEOA");

        // assert balances before
        assertEq(address(this).balance, 2 ether);
        assertEq(address(receiverEOA).balance, 0);

        escrow.deposit{value: 0.1 ether}(receiverEOA, 60);

        assertEq(address(receiverEOA).balance, 0.1 gwei);
        assertEq(escrow.senderEscrows(address(this), 0), 0);
        assertEq(escrow.receiverEscrows(receiverEOA, 0), 0);
        (address sender, address receiver, uint256 amount, Escrow.Status status, uint256 canWithdrawAt) =
            escrow.escrows(0);
        assertEq(sender, address(this));
        assertEq(receiver, receiverEOA);
        assertEq(amount, 0.1 ether - 0.1 gwei);
        assertEq(canWithdrawAt, block.timestamp + 60);
        assertEq(uint256(status), uint256(Escrow.Status.Pending));

        // assert balances after
        assertEq(address(this).balance, 2 ether - 0.1 ether);
        assertEq(address(receiverEOA).balance, 0.1 gwei);
    }

    function testCancel() public {
        vm.deal(address(this), 2 ether);
        address receiverEOA = makeAddr("receiverEOA");

        // assert balances before
        assertEq(address(this).balance, 2 ether);
        assertEq(address(receiverEOA).balance, 0);

        // deposit        
        escrow.deposit{value: 0.1 ether}(receiverEOA, 60);

        // assert balances before
        assertEq(address(this).balance, 2 ether - 0.1 ether);
        assertEq(address(receiverEOA).balance, 0.1 gwei);
        // escrow balance 0.1 gwei
        assertEq(address(escrow).balance, 0.1 ether - 0.1 gwei);

        // cancel
        escrow.cancel(0);

        // assert balances after
        assertEq(address(this).balance, 2 ether);
        assertEq(address(receiverEOA).balance, 0);

        // // assert balances after - this should expect the full refund of the escrowed amount
        // assertEq(address(this).balance, 2 ether - 0.1 gwei);  // We get back the escrowed amount (0.1 ether - 0.1 gwei)
        // assertEq(address(receiverEOA).balance, 0.1 gwei);     // Receiver keeps their initial 0.1 gwei
    }
}
