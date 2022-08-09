import { Contract } from "ethers";
import { 
    DEX_CONTRACT_ADDRESS,
    DEX_CONTRACT_ABI,
    KHANFT_TOKEN_ADDRESS,
    KHANFT_TOKEN_CONTRACT_ABI
} from "../Constants/constants";

const getCDTokensBalance = async (provider: any, address: string): Promise <number> => {
   try{
       const tokenContract = new Contract(
           KHANFT_TOKEN_ADDRESS,
           KHANFT_TOKEN_CONTRACT_ABI,
           provider
       );
       const balanceOfKhaNFT_Tokens: number = await tokenContract.balanceOf(address);
       return balanceOfKhaNFT_Tokens
   }
   catch(err) {
       console.error(err)
   }
}

const getEtherBalance = async (
    provider: any,
    address: string,
    contract: boolean = false
): Promise <number> => {
    try {
        if(contract) {
            const balance: number = await provider.getBalance(DEX_CONTRACT_ADDRESS);
            return balance;
        }
        else {
            const balance: number = await provider.getBalance(address);
            return balance;
        }
    } catch (err) {
        console.error(err)
        return 0;
    }


}

const getKLPTokensBalance = async (provider: any, address: string): Promise <number> => {
    try {
        const DexContract = new Contract(
        DEX_CONTRACT_ADDRESS,
        DEX_CONTRACT_ABI,
        provider
        );
        
        const balance: number = await DexContract.balanceOf(address);
        return balance;

    } catch (err) {
        console.error(err)
    }
}

const getReserveOfCDTokens = async (provider: any): Promise <number> => {
    try {
        const DexContract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            provider
        );

        const reserve: number = await DexContract.getReserve();
        return reserve;
    } catch (err) {
        console.error(err)
    }
}

export { getEtherBalance, getCDTokensBalance, getKLPTokensBalance, getReserveOfCDTokens }