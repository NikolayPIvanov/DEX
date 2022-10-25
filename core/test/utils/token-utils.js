const tokens = (value, decimals = 'ether') => ethers.utils.parseUnits(value, decimals)

module.exports = {
    tokens
}