const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (value, decimals = 'ether') => {
    return ethers.utils.parseUnits(value, decimals);
}

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

    beforeEach(async () => {
        token = await deployTokenContract(
            tokenParameters.name,
            tokenParameters.symbol,
            tokenParameters.totalSupply);

        accounts = await ethers.getSigners();
        deployer = accounts[0].address;
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
            expect(await token.balanceOf(deployer)).to.equal(tokens(tokenParameters.totalSupply));
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
                expect(await token.balanceOf(deployer)).to.equal(tokens('999900'));
                expect(await token.balanceOf(recipient)).to.equal(tokens('100'));
            });

            it('Emits a transfer event', async () => {
                // Arrange
                const recipient = accounts[1].address;
                const amount = tokens('100');

                // Act
                await expect(token.transfer(recipient, amount))
                    .to.emit(token, 'Transfer')
                    .withArgs(deployer, recipient, amount);
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
