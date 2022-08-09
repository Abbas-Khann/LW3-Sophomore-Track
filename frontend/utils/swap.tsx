import { Contract } from "ethers";
import { 
    DEX_CONTRACT_ADDRESS,
    DEX_CONTRACT_ABI,
    KHANFT_TOKEN_ADDRESS,
    KHANFT_TOKEN_CONTRACT_ABI
} from "../Constants/constants";

const getAmountOfTokensReceivedFromSwap = async (
    _swapAmountWei,
    provider,
    ethSelected,
    _ethBalance,
    reservedCD
): Promise <number> => {
    try {
        const DEXContract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            provider
        );

        let amountOfTokens: number = 0;

        if(ethSelected) {
            amountOfTokens = await DEXContract.getAmountOfTokens(
                _swapAmountWei,
                _ethBalance,
                reservedCD
            );
        }
        else {
            amountOfTokens = await DEXContract.getAmountOfTokens(
                _swapAmountWei,
                reservedCD,
                _ethBalance
            );
        }
        return amountOfTokens;
    } catch (err) {
        console.error(err)
    }
}

const swapTokens = async (
    signer,
    swapAmountWei,
    tokenToBeReceivedAfterSwap,
    ethSelected
  ) => {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
      DEX_CONTRACT_ADDRESS,
      DEX_CONTRACT_ABI,
      signer
    );
    const tokenContract = new Contract(
      KHANFT_TOKEN_ADDRESS,
      KHANFT_TOKEN_CONTRACT_ABI,
      signer
    );
    let tx;
    // If Eth is selected call the `ethToCryptoDevToken` function else
    // call the `cryptoDevTokenToEth` function from the contract
    // As you can see you need to pass the `swapAmount` as a value to the function because
    // it is the ether we are paying to the contract, instead of a value we are passing to the function
    if (ethSelected) {
      tx = await exchangeContract.ethToCryptoDevToken(
        tokenToBeReceivedAfterSwap,
        {
          value: swapAmountWei,
        }
      );
    } else {
      // User has to approve `swapAmountWei` for the contract because `Crypto Dev` token
      // is an ERC20
      tx = await tokenContract.approve(
        DEX_CONTRACT_ADDRESS,
        swapAmountWei.toString()
      );
      await tx.wait();
      // call cryptoDevTokenToEth function which would take in `swapAmountWei` of `Crypto Dev` tokens and would
      // send back `tokenToBeReceivedAfterSwap` amount of `Eth` to the user
      tx = await exchangeContract.cryptoDevTokenToEth(
        swapAmountWei,
        tokenToBeReceivedAfterSwap
      );
    }
    await tx.wait();
  };

  export { swapTokens, getAmountOfTokensReceivedFromSwap }