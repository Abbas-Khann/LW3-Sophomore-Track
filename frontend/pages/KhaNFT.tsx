import {useState, useEffect, useRef} from 'react';
import Head from '../node_modules/next/head';
import Web3Modal from 'web3modal';
import { providers, Contract } from '../node_modules/ethers/lib/ethers';
import { KhaNFTContractAddress, KHANFTCONTRACTABI } from '../Constants/constants';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const KhaNFT = () => {

    const [walletConnected, setWalletConnected] = useState <boolean> (false);
    const [presaleStarted, setPresaleStarted] = useState  <boolean> (false);
    const [presaleEnded, setPresaleEnded] = useState <boolean> (false);
    const [loading, setLoading] = useState <boolean> (false);
    const [owner, setOwner] = useState <boolean> (false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState <string> ("0");
    const web3ModalRef = useRef<any>();
    
    const getProviderOrSigner = async (needSigner: boolean = false): Promise <any> => {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if(chainId !== 80001) {
        toast.warning("Change your network to Mumbai");
        throw new Error("Change your network to Polygon Mumbai");
      }

      if(needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    }

    const presaleMint = async (): Promise <void> => {
      try{
        const signer = await getProviderOrSigner(true);

        const whitelistContract = new Contract(
          KhaNFTContractAddress,
          KHANFTCONTRACTABI,
          signer
        );

        const tx = await whitelistContract.presaleMint({
          value: utils.parseEther("0.01")
        })
        setLoading(true);
        await tx.wait();
        setLoading(false);
        toast.success("You successfully minted a KhaNFT during presaleMint!")
      }
      catch(err){
        console.error(err);
      }
    }

    const publicMint = async (): Promise <void> => {
      try {
      const signer = await getProviderOrSigner(true);
      
      const whitelistContract = new Contract(
        KhaNFTContractAddress,
        KHANFTCONTRACTABI,
        signer
      );

      const tx = await whitelistContract.mint({
        value: utils.parseEther("0.01")
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      toast.success("You successfully minted a KhaNFT during public Mint!!!")
      } 
      catch (err) {
        console.error(err)
      }      
    }

    const connectWallet = async (): Promise <void> => {
      try{
        await getProviderOrSigner();
        setWalletConnected(true);
      }
      catch(err){
        console.error(err)
      }
    }

    const startPresale = async (): Promise <void> => {
      try {
        const signer = await getProviderOrSigner(true);

        const whitelistContract = new Contract(
          KhaNFTContractAddress,
          KHANFTCONTRACTABI,
          signer
        );

        const tx = await whitelistContract.startPresale();
        setLoading(true);
        await tx.wait();
        setLoading(false);
      } catch (err) {
        console.error(err)
      }
    }

    const getOwner = async ():Promise <void> => {
      try {
        const provider = await getProviderOrSigner();
        const nftContract = new Contract(
          KhaNFTContractAddress,
          KHANFTCONTRACTABI,
          provider
          );

          const _owner: string = await nftContract.owner();
          const signer = await getProviderOrSigner(true);
          const _address: Promise <string> = await signer.getAddress();
          console.log("Owner Address: ", _owner)
          const ownerAddress = await _address;
          console.log("OwnerAddress new Variable:", ownerAddress);
          if (ownerAddress.toLowerCase() === _owner.toLowerCase()) {
            setOwner(true);
          }
      }
      catch (err) {
        console.error(err)
      }
    }

    const checkIfPresaleStarted = async (): Promise <boolean> => {
      try {
        const provider = await getProviderOrSigner();

        const nftContract = new Contract(
          KhaNFTContractAddress,
          KHANFTCONTRACTABI,
          provider
        );

        const _presaleStarted: boolean = await nftContract.presaleStarted();
        if(!_presaleStarted) {
          await getOwner();
        }
        setPresaleStarted(_presaleStarted);
        return _presaleStarted;

      } catch (err) {
        console.error(err)
      }
    }

    const checkIfPresaleEnded = async (): Promise <boolean> => {
      try {
        const provider = await getProviderOrSigner();

        const nftContract = new Contract(
          KhaNFTContractAddress,
          KHANFTCONTRACTABI,
          provider
        );

        const _presaleEnded = await nftContract.presaleEnded();

        const hasEnded: boolean = _presaleEnded.lt(Math.floor(Date.now()/1000));

        if(hasEnded) {
          setPresaleEnded(true);
        }
        else {
          setPresaleEnded(false);
        }
        return hasEnded;
      } catch (err) {
        console.error(err)
      }
    }

    const getTokenIdsMinted = async (): Promise <void> => {
      try {
        const provider = await getProviderOrSigner();

        const nftContract = new Contract(
          KhaNFTContractAddress,
          KHANFTCONTRACTABI,
          provider
        );

        const _tokenIds: number = await nftContract.tokenIds();

        setTokenIdsMinted(_tokenIds.toString())
      } 
      catch (err) {
        console.error(err)  
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

        const _presaleStarted = checkIfPresaleStarted();
        if(_presaleStarted) {
          checkIfPresaleEnded();
        }
        getTokenIdsMinted();

        const presaleEndedInterval = setInterval(async function () {
          const _presaleStarted = await checkIfPresaleStarted();
          if(_presaleStarted) {
            const _presaleEnded = await checkIfPresaleEnded();
            if(_presaleEnded) {
              clearInterval(presaleEndedInterval);
            }
          }
        }, 5 * 1000);

        setInterval(async function () {
          await getTokenIdsMinted();
        }, 5 * 1000)
      }
    }, [walletConnected])

    const renderButton = (): JSX.Element => {
      if(!walletConnected) {
        return (
          <button
          onClick={connectWallet}
          className="border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white my-4"
          >
            Connect Wallet
          </button>
        );
      }

      if(loading) {
        return (
          <button
          className='border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white my-4'
          >
          Loading ...
          </button>
        )
      }

      if(owner && !presaleStarted) {
        return (
          <button
          className='border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white my-4'
          onClick={startPresale}
          >
            Start Presale!
          </button>
        )
      }

      if(!presaleStarted) {
        return (
          <div
          className='bg-purple-800 text-3xl rounded px-3 py-2 text-white my-4'
          >
            Presale Has not started yet!
          </div>
        )
      }

      if(!presaleStarted && !presaleEnded) {
        return(
          <button
          className='border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white my-4'
          onClick={presaleMint}
          >
          Presale has Started!!! If your address is whitelisted Mint a KhaNFT
          </button>
        )
      }

      if(presaleStarted && presaleEnded) {
        return(
          <button
          className='border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white my-4'
          onClick={publicMint}
          >
          Public Mint 🚀
          </button>
        )
      }

    }


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
            Welcome to KhaNFT
        </h1>
        <p
        className='text-2xl text-center'
        >It's an NFT collection for Khans(giga Chads)</p>
        {renderButton()}
       
        <p className='text-2xl'>{tokenIdsMinted}/20 NFTs have been minted</p>
    </div>
    </main>
  )
}

export default KhaNFT