// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DEX is ERC20 {
    address public KhaNFTTokenAddress;

    constructor(address _KhanToken) ERC20 ("Khan LP Token", "KLP") {
        require(_KhanToken != address(0), "Token address passed is a null address");
        KhaNFTTokenAddress = _KhanToken;
    }

    // This function will return the amount of Khan tokens held by the contract
    function getReserve() public view returns(uint) {
        return ERC20(KhaNFTTokenAddress).balanceOf(address(this));
    }

    // Add liquidity to the exchange 

    function addLiquidity(uint _amount) pubic view returns(uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint khanTokenReserve = getReserve();
        ERC20 khanToken = ERC20(KhaNFTTokenAddress);

        if(khanTokenReserve == 0) {
            khanToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        }
        else {
            uint ethReserve = ethBalance - msg.value;
            uint khanTokenAmount = (msg.value * khanTokenReserve) / (ethReserve);
            require(
                _amount >= khanTokenAmount,
                "Amount of tokens sent is less than the minimum tokens required!"
            );

            khanToken.transferFrom(msg.sender, address(this), khanTokenAmount);

            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint _amount) public returns(uint, uint) {
        require(
            _amount > 0, "Amount needs to be greater than zero in order to remove liquidity!"
        );

        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        uint ethAmount = (ethReserve * _amount)/ _totalSupply;
        uint khanTokenAmount = (getReserve() * _amount) / _totalSupply;

        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        ERC20(KhaNFTTokenAddress).transfer(msg.sender, khanTokenAmount);
        return (ethAmount, khanTokenAmount);
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns(uint256)
    {
        require(
            inputReserve > 0 && outputReserve,
            "Invalid Response"
        );

        uint256 inputAmountWithFee = inputAmount * 99;
        
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function ethToKhanToken(uint _minTokens) public payable {
        uint256 tokenReserve = getReserve();

        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );

        require(tokensBought >= _minTokens, "Insufficient funds");
        ERC20(KhaNFTTokenAddress).transfer(msg.sender, tokensBought);
    }

    function khanTokenToEth(uint _tokensSold, uint _minEth) public {
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "Insufficient output Amount");
        ERC20(KhaNFTTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );
        payable(msg.sender).transfer(ethBought);
    }


}