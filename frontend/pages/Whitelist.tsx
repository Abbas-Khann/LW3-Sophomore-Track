import {useState, useEffect, useRef} from 'react'
import Head from '../node_modules/next/head'
import Web3Modal from 'web3modal';
import { providers, Contract } from 'ethers';
import { WHITELIST_CONTRACT_ADDRESS, WHITELIST_CONTRACT_ABI } from '../Constants/constants';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const Whitelist = () => {

    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [joinedWhitelist, setJoinedWhitelist] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [amountOfWhitelisted, setAmountOfWhitelisted] = useState<number>(0);
    const [maxWhitelistedAddresses, setMaxWhitelistedAddresses] = useState<number>(0);

    const web3ModalRef = useRef();

    const getProviderOrSigner = async (needSigner: boolean = false): Promise<any> => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const { chainId } = await web3Provider.getNetwork();

        if(chainId !== 80001) {
            toast.warning("Change Your network to Mumbai");
            throw new Error('Change your network to Polygon Testnet');
        }
        if(needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    }

    const addAddressToWL = async(): Promise <void> => {
        try{
            const signer = await getProviderOrSigner(true);

            const WhitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                WHITELIST_CONTRACT_ABI,
                signer
            );

            const tx = await WhitelistContract.addAddressToWhitelist();
            setLoading(true);
            await tx.wait();
            setLoading(false);
            setJoinedWhitelist(true);
        }
        catch(err){
            console.error(err)
            if(joinedWhitelist) {
                toast.error("You have already joined the Whitelist!");
            }
            if(amountOfWhitelisted > maxWhitelistedAddresses) {
                toast.error("No more Whitelist Spots left!!!")
            }
        }
    }

    const getNumberOfWhitelisted = async(): Promise <void> => {
        try{
            const provider = await getProviderOrSigner();

            const WhitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                WHITELIST_CONTRACT_ABI,
                provider
            );

            const numberOfWL: number = await WhitelistContract.numAddressesWhitelisted();
            setAmountOfWhitelisted(numberOfWL);
        }
        catch(err){
            console.error(err)
        }
    }

    const getMaxNumberOfWhitelisted = async():Promise <void> => {
        try {
            const provider = await getProviderOrSigner();

            const WhitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                WHITELIST_CONTRACT_ABI,
                provider
            );

            const _maxWhitelistedAddressses = await WhitelistContract.maxWhiteListedAddresses();
            setMaxWhitelistedAddresses(_maxWhitelistedAddressses);
        } catch (err) {
            console.error(err)
        }
    }

    const checkIfAddressInWhitelist = async ():Promise <void> => {
        try {
            const signer = await getProviderOrSigner(true);
    
            const WhitelistContract = new Contract(
                WHITELIST_CONTRACT_ADDRESS,
                WHITELIST_CONTRACT_ABI,
                signer
            )
    
            const address = await signer.getAddress();
            const _joinedWhitelist: boolean = await WhitelistContract.whitelistedAddresses(address);
            setJoinedWhitelist(_joinedWhitelist)
            
        } catch (err) {
            console.error(err)
        }

    }

    const connectWallet = async ():Promise <void> => {
        try{
            await getProviderOrSigner();
            setWalletConnected(true);
            checkIfAddressInWhitelist();
            getNumberOfWhitelisted();
            getMaxNumberOfWhitelisted();
        }
        catch(err){
            console.error(err)
        }
    }

    const renderButton = (): JSX.Element => {
        if(walletConnected) {
            if(joinedWhitelist) {
                return <button 
                    className='border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3'>
                    Thanks For Joining the Whitelist
                    </button>
            }
            else if(loading) {
                return <button 
                        className='border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3'
                        >
                    Loading ...
                </button>
            }
            else{
                return <button
                onClick={addAddressToWL}
                className='border-2 transition duration-300 motion-safe:animate-bounce ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3'
                >
                Join the Whitelist
                </button>
            }
        } else {
            return (
                <button
                className='border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3'
                onClick={connectWallet}
                >
                Connect Wallet
                </button>
            )
        }
    }

    useEffect(() => {
        if(!walletConnected) {
            web3ModalRef.current = new Web3Modal({
                network: "mumbai",
                providerOptions: {},
                disableInjectedProvider: false
            });
            connectWallet();
            getNumberOfWhitelisted();
            getMaxNumberOfWhitelisted();
        }
    }, [walletConnected])



  return (
    <main className="h-screen bg-cover bg-[url('/img/ethereum.jpeg')]" >
        <Head>
        <title>LW3 Sophomore Dapps</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,700;1,400&display=swap');
        </style>
      </Head>
      <div className='flex flex-col items-center h-96 justify-center'>
        <h1 className='text-5xl text-center py-4 text-white'>
            Whitelist Dapp
        </h1>
        {renderButton()}
        <p className='text-2xl'>Total Members Joined is {amountOfWhitelisted}</p>
    </div>
    </main>
  )
}

export default Whitelist