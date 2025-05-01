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

        // print the balance of the contract
        console.log("Balance of the contract", address(this).balance);
        console.log("Balance of the receiverEOA", address(receiverEOA).balance);

        escrow.deposit{value: 0.1 ether}(receiverEOA, 60);

        // assertEq(address(this).balance, 0.1 gwei);
        // assertEq(escrow.senderEscrows(address(this)).length, 1);
        // assertEq(escrow.receiverEscrows(address(this)).length, 1);
        // assertEq(escrow.escrows(0).sender, address(this));
        // assertEq(escrow.escrows(0).receiver, address(this));
        // assertEq(escrow.escrows(0).amount, 0.1 gwei);
        // assertEq(escrow.escrows(0).canWithdrawAt, block.timestamp + 60);
        // assertEq(escrow.escrows(0).status, Escrow.Status.Pending);
    }
}
