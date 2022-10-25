const { expect } = require("chai");
const { ethers } = require("hardhat");
const { tokens } = require("./utils/token-utils");

describe("Exchange", function () {
    let deployer, feeAccount, exchange, user1, token1;

    const percentage = 10;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];

        const Exchange = await ethers.getContractFactory("Exchange");
        const Token = await ethers.getContractFactory("Token");

        token1 = await Token.deploy('Dapp Token', 'DAPP', '1000000');
        const transaction = await token1.connect(deployer).transfer(user1.address, tokens('100'));
        await transaction.wait();

        exchange = await Exchange.deploy(feeAccount.address, percentage);
    });

    describe('Deployment', () => {
        it("tracks the fee account", async () => {
            // Act & Assert
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        });

        it("tracks the fee percent", async () => {
            // Act & Assert
            expect(await exchange.feePercent()).to.equal(percentage);
        });
    });

    describe("Deposit", () => {
        let transaction;
        let amount;

        beforeEach(async () => {
            amount = tokens('10');
            transaction = await token1
                .connect(user1)
                .approve(exchange.address, amount);
            await transaction.wait();

            transaction = await exchange
                .connect(user1)
                .depositToken(token1.address, amount);
            await transaction.wait();
        });
        describe("Success", () => {
            it("tracks the token deposit", async () => {
                // Act & Assert
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount);
                expect(await exchange.checkBalance(token1.address, user1.address)).to.equal(amount);
            });
        });
        describe("Failure", () => { });
    });
});