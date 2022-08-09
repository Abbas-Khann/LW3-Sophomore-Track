import { Contract } from "ethers";
import { 
    DEX_CONTRACT_ADDRESS,
    DEX_CONTRACT_ABI,
    KHANFT_TOKEN_ADDRESS,
    KHANFT_TOKEN_CONTRACT_ABI
} from "../Constants/constants";
import { utils } from "../node_modules/ethers/lib/ethers";

const addLiquidity = async (
    signer: any,
    addCDAmountWei,
    addEtherAmountWei
): Promise <void> => {
    try {
        const tokenContract: Contract = new Contract(
            KHANFT_TOKEN_ADDRESS,
            KHANFT_TOKEN_CONTRACT_ABI,
            signer
        );

        const DexContract: Contract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            signer
        );

        let tx: any = await tokenContract.approve(
            DEX_CONTRACT_ADDRESS,
            addCDAmountWei.toString()
        );
        await tx.wait();

        tx = await DexContract.addLiquidity(addCDAmountWei,
            {
                value: addEtherAmountWei,
            });
        await tx.wait();
    } catch (err) {
        console.error(err)
    }
}

const calculateCD = async (
    _addEther: string = "0",
    etherBalanceContract,
    cdTokensReserve 
    ): Promise <number> => {
        const _addEtherAmountWei = utils.parseEther(_addEther);

        const khaNFTTokenAmount: number = _addEtherAmountWei.mul(cdTokensReserve).div(etherBalanceContract);
        return khaNFTTokenAmount
    } 



export { addLiquidity, }