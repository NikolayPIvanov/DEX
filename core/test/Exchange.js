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
        const transaction = await token1.connect(deployer).transfer(user1.address, tokens('10'));
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
        let result;

        beforeEach(async () => {
            amount = tokens('10');
            transaction = await token1
                .connect(user1)
                .approve(exchange.address, amount);
            await transaction.wait();

            transaction = await exchange
                .connect(user1)
                .depositToken(token1.address, amount);
            result = await transaction.wait();
        });
        describe("Success", () => {
            it("tracks the token deposit", async () => {
                // Act & Assert
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount);
                expect(await exchange.checkBalance(token1.address, user1.address)).to.equal(amount);
            });

            it("emits Deposit event", async () => {
                const event = result.events[1]; // 0 is the approval event
                expect(event.event).to.equal("Deposit");

                const args = event.args
                expect(args.token).to.equal(token1.address);
                expect(args.user).to.equal(user1.address);
                expect(args.amount).to.equal(amount);
                expect(args.balance).to.equal(amount);
            })
        });
        describe("Failure", () => { });
    });

    describe("Withdraw", () => {
        let transaction;
        let amount;
        let result;

        beforeEach(async () => {
            amount = tokens('10');

            // Approve tokens
            transaction = await token1
                .connect(user1)
                .approve(exchange.address, amount);
            await transaction.wait();

            // Deposit tokens
            transaction = await exchange
                .connect(user1)
                .depositToken(token1.address, amount);
            await transaction.wait();

            // Withdraw tokens
            transaction = await exchange
                .connect(user1)
                .withdrawToken(token1.address, amount);
            result = await transaction.wait();
        });

        describe("Success", () => {
            it("withdraws token funds", async () => {
                // Act & Assert
                expect(await token1.balanceOf(exchange.address)).to.equal(0);
                expect(await token1.balanceOf(user1.address)).to.equal(amount);
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(0);
            });

            it("emits Withdraw event", async () => {
                const event = result.events[1]; // 0 is the approval event
                expect(event.event).to.equal("Withdraw");

                const args = event.args
                expect(args.token).to.equal(token1.address);
                expect(args.user).to.equal(user1.address);
                expect(args.amount).to.equal(amount);
                expect(args.balance).to.equal(0);
            })
        });

        describe("Failure", () => {
            it("Fails when withdrawing more tokens than available", async () => {
                // Act & Assert
                await expect(exchange.connect(user1).withdrawToken(token1.address, tokens('100')))
                    .to.be.revertedWith("Insufficient balance");
            });
        });
    });
});