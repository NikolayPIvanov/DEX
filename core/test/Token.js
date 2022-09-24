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

    beforeEach(async () => {
        token = await deployTokenContract(
            tokenParameters.name,
            tokenParameters.symbol,
            tokenParameters.totalSupply);
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
    });

});

async function deployTokenContract(name, symbol, totalSupply) {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(name, symbol, totalSupply);
    await token.deployed();
    return token;
}
