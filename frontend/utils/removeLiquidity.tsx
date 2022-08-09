import { providers, utils, Contract, BigNumber } from "ethers";
import { DEX_CONTRACT_ADDRESS, DEX_CONTRACT_ABI } from "../Constants/constants";

const removeLiquidity = async (signer: any, removeLPTokensWei): Promise <void> => {
    try {
        const DEXContract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            signer
        );
        const tx: any = await DEXContract.removeLiquidity(removeLPTokensWei);
        await tx.wait();
    } catch (err) {
        console.error(err)
    }
}

const getTokensAfterRemove = async (
    provider: any,
    removeLPTokensWei,
    _ethBalance,
    khaNFTTokenReserve
): Promise <object> => {
    try{

        const DEXContract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            provider
            );
            
            const _totalSupply = await DEXContract.totalSupply();
            const _removeEther = _ethBalance.mul(removeLPTokensWei).div(_totalSupply);
            const _removeCD = khaNFTTokenReserve.mul(removeLPTokensWei).div(_totalSupply);
            return {
                _removeEther,
                _removeCD,
            };
    }
    catch(err){
        console.error(err);
    }
}

export { getTokensAfterRemove, removeLiquidity }