const { expect } = require("chai");
const { ethers } = require("hardhat");
const { tokens } = require("./utils/token-utils");

const tokenParameters = {
    name: "Token",
    symbol: "NPI",
    decimals: 18,
    totalSupply: '1000000'
}

describe("Token Contract Tests", function () {
    let token;
    let accounts;
    let deployer;
    let receiver;
    let exchange;

    beforeEach(async () => {
        token = await deployTokenContract(
            tokenParameters.name,
            tokenParameters.symbol,
            tokenParameters.totalSupply);

        accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
        exchange = accounts[2];
    });

    describe('Deployment', () => {
        it("Should deploy contract with correct name", async () => {
            // Act & Assert
            expect(await token.name()).to.equal(tokenParameters.name);
        });

        it("Should deploy contract with correct symbol", async () => {
            // Act & Assert
            expect(await token.symbol()).to.equal(tokenParameters.symbol);
        });

        it("Should deploy contract with correct decimals", async () => {
            // Act & Assert
            expect(await token.decimals()).to.equal(tokenParameters.decimals);
        });

        it("Should deploy contract with correct totalSupply", async () => {
            // Act & Assert
            expect(await token.totalSupply()).to.equal(tokens(tokenParameters.totalSupply));
        });

        it("Should deploy contract with correct balanceOf", async () => {
            // Act & Assert
            expect(await token.balanceOf(deployer.address)).to.equal(tokens(tokenParameters.totalSupply));
        });
    });

    describe(('Sending Token'), () => {
        describe(('Failure'), () => {
            it('Should reject insufficient balance', async () => {
                // Arrange
                const to = accounts[1].address;
                const amount = tokens('1000001');

                // Act & Assert
                const transfer = token.connect(accounts[1]).transfer(to, amount);
                await expect(transfer).to.be.revertedWith('ERC20: transfer amount exceeds balance');
            });

            it('Should reject transfer to zero address', async () => {
                // Arrange
                const to = ethers.constants.AddressZero;
                const amount = tokens('100');

                // Act & Assert
                await expect(token.transfer(to, amount)).to.be.revertedWith('ERC20: transfer to the zero address');
            });
        });

        describe('Success', () => {
            it('Transfers token balances', async () => {
                // Arrange
                const recipient = accounts[1].address;
                const amount = tokens('100');

                // Act
                await token.transfer(recipient, amount);

                // Assert
                expect(await token.balanceOf(deployer.address)).to.equal(tokens('999900'));
                expect(await token.balanceOf(recipient)).to.equal(tokens('100'));
            });

            it('Emits a transfer event', async () => {
                // Arrange
                const recipient = accounts[1].address;
                const amount = tokens('100');

                // Act
                await expect(token.transfer(recipient, amount))
                    .to.emit(token, 'Transfer')
                    .withArgs(deployer.address, recipient, amount);
            });
        });
    });

    describe(('Approving Token'), () => {
        describe(('Failure'), () => {
            it('Should reject approval to zero address', async () => {
                // Arrange
                const to = ethers.constants.AddressZero;
                const amount = tokens('100');

                // Act & Assert
                await expect(token.approve(to, amount)).to.be.revertedWith('ERC20: approve to the zero address');
            });
        });

        describe('Success', () => {
            it('Approves token for delegated transfer', async () => {
                // Arrange
                const recipient = accounts[1].address;
                const amount = tokens('100');

                // Act
                await token.approve(recipient, amount);

                // Assert
                expect(await token.allowance(deployer.address, recipient)).to.equal(amount);
            });

            it('Emits an approval event', async () => {
                // Arrange
                const recipient = accounts[1].address;
                const amount = tokens('100');

                // Act
                await expect(token.approve(recipient, amount))
                    .to.emit(token, 'Approval')
                    .withArgs(deployer.address, recipient, amount);
            });
        });
    });

    describe(('Sending Token From'), () => {
        describe(('Failure'), () => {
            it('Should reject insufficient allowance', async () => {
                // Arrange
                const amount = tokens('100');

                // Act
                await token.connect(deployer).approve(exchange.address, amount);

                // Assert
                const transfer = token.connect(exchange).transferFrom(deployer.address, exchange.address, tokens('1000'));
                await expect(transfer).to.be.revertedWith('ERC20: transfer amount exceeds allowance');
            });

            it('Should reject insufficient balance', async () => {
                // Arrange
                const amount = tokens('100');

                // Act
                await token.connect(deployer).approve(exchange.address, amount);

                const exceededAmount = tokens('1000001');

                // Assert
                const transfer = token.connect(exchange).transferFrom(deployer.address, exchange.address, exceededAmount);
                await expect(transfer).to.be.revertedWith('ERC20: transfer amount exceeds balance');
            });

            it('Should reject transfer to zero address', async () => {
                // Arrange
                const amount = tokens('100');
                const to = ethers.constants.AddressZero;

                // Act
                await token.connect(deployer).approve(exchange.address, amount);

                // Assert
                const transfer = token.connect(exchange).transferFrom(deployer.address, to, amount);
                await expect(transfer).to.be.revertedWith('ERC20: transfer to the zero address');
            });
        });

        describe('Success', () => {
            it('Transfers token balances', async () => {
                // Arrange
                const amount = tokens('100');
                const recipient = accounts[4].address;

                // Act
                await token.connect(deployer).approve(exchange.address, amount);
                await token.connect(exchange).transferFrom(deployer.address, recipient, amount);

                // Assert
                expect(await token.balanceOf(deployer.address)).to.equal(tokens('999900'));
                expect(await token.balanceOf(recipient)).to.equal(tokens('100'));
            });

            it('Emits a transfer event', async () => {
                // Arrange
                const owner = accounts[1].address;
                const spender = accounts[2].address;
            });
        });
    });
});

async function deployTokenContract(name, symbol, totalSupply) {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(name, symbol, totalSupply);
    await token.deployed();
    return token;
}
