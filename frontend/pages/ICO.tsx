import {useState, useEffect, useRef} from 'react';
import Head from '../node_modules/next/head';
import { BigNumber, Contract, providers, utils } from 'ethers';
import Web3Modal from 'web3modal';
import { 
     KhaNFTContractAddress,
     KHANFTCONTRACTABI,
     KHANFT_TOKEN_ADDRESS,
     KHANFT_TOKEN_CONTRACT_ABI
 } from '../Constants/constants';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


const ICO = () => {

    const zero: number = BigNumber.from(0);

    const [walletConnected, setWalletConnected] = useState <boolean> (false);

    const [loading, setLoading] = useState <boolean> (false);

    const [tokensToBeClaimed, setTokensToBeClaimed] = useState <number> (zero);
    
    const [balanceOfKhaNftTokens, setBalanceOfKhaNftTokens] = useState <number> (zero);

    const [tokenAmount, setTokenAmount] = useState <number> (zero);

    const [tokensMinted, setTokensMinted] = useState <number> (zero);

    const [isOwner, setIsOwner] = useState <boolean> (false);

    const web3ModalRef = useRef<any>();

    const getProviderOrSigner = async (needSigner: boolean = false): Promise <any> => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const { chainId } = await web3Provider.getNetwork();

        if (chainId !== 80001) {
            toast.warning("Change your network to Mumbai!");
            throw new Error ("Change your network to Polygon Testnet!");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    }      

  const mintKhaNFTtoken = async (amount: number): Promise<void> => {
    try {
      const signer: any = await getProviderOrSigner(true);

      const tokenContract = new Contract(
        KHANFT_TOKEN_ADDRESS,
        KHANFT_TOKEN_CONTRACT_ABI,
        signer
      );

      const value: number = 0.001 * amount;

      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });

      setLoading(true);
      await tx.wait();
      setLoading(false);
      toast.success("Successfully minted a KhaNFT Token");
      await getBalanceOfKhaNFTtoken();
      await getTotalNumberOfTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  const getBalanceOfKhaNFTtoken = async (): Promise<void> => {
    try {
      const provider: any = await getProviderOrSigner(false);

      const tokenContract = new Contract(
        KHANFT_TOKEN_ADDRESS,
        KHANFT_TOKEN_CONTRACT_ABI,
        provider
      );

      const signer: any = await getProviderOrSigner(true);

      const _address: string = await signer.getAddress();

      const balance: number = await tokenContract.balanceOf(_address);
      setBalanceOfKhaNftTokens(balance);
    } catch (err) {
      console.error(err);
    }
  };

  const getTotalNumberOfTokensMinted = async (): Promise <void> => {
    try {
      const provider: any = await getProviderOrSigner(false);

      const tokenContract = new Contract(
        KHANFT_TOKEN_ADDRESS,
        KHANFT_TOKEN_CONTRACT_ABI,
        provider
      )

      const _tokensMinted: number = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);

    } catch (err) {
      console.error(err)
    }
  }

  const getTokensToBeClaimed = async (): Promise <void> => {
    try {
      const provider: any = await getProviderOrSigner(false);

      const tokenContract = new Contract(
        KHANFT_TOKEN_ADDRESS,
        KHANFT_TOKEN_CONTRACT_ABI,
        provider
      )

      const nftContract = new Contract(
        KhaNFTContractAddress,
        KHANFTCONTRACTABI,
        provider
      );
      
      const signer: any = await getProviderOrSigner(true);

      const address: string = await signer.getAddress();

      const balance: number = await nftContract.balanceOf(address);

      if(balance === zero) {
        setTokensToBeClaimed(zero);
      }
      else {
        let amount: number = 0;

        for(let i: number = 0; i < balance; i++) {
          const tokenId: number = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed: boolean = await tokenContract.tokenIdsClaimed(tokenId);
          if(!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (err) {
      console.error(err)
    }
  }

  const claimTokens = async (): Promise <void> => {
    try {
      const signer: any = await getProviderOrSigner(true);

      const tokenContract = new Contract(
        KHANFT_TOKEN_ADDRESS,
        KHANFT_TOKEN_CONTRACT_ABI,
        signer
      )

      const tx: any = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      toast.success("Successfully claimed KhaNFT Token!!!");
      getTokensToBeClaimed();
      // function calls
    } catch (err) {
      console.error(err)
    }
  }

  const connectWallet = async (): Promise<void> => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      await getBalanceOfKhaNFTtoken();
      await getTotalNumberOfTokensMinted();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      console.log(tokensToBeClaimed)
      connectWallet();
      getBalanceOfKhaNFTtoken();
      getTotalNumberOfTokensMinted();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);

  const renderButton = (): JSX.Element => {
    if (loading) {
      return (
        <div>
          <button className="border-2 transition duration-300 ease-out motion-safe:animate-spin hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3">
            Loading...
          </button>
        </div>
      );
    }
    if (walletConnected && isOwner) {
      return (
        <div>
          <button className="border-2 transition duration-300 ease-out motion-safe:animate-bounce hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3">
            Withdraw Coins
          </button>
        </div>
      );
    }
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <p className="text-2xl my-2">
            {tokensToBeClaimed * 10} Tokens can be claimed{" "}
          </p>
          <button className="border-2 transition duration-300 motion-safe:animate-bounce ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3"
          onClick={claimTokens}
          >
            Claim Tokens
          </button>
        </div>
      );
    }

    return (
      <div>
        <div>
          <input
            className="p-2 text-black"
            type="number"
            placeholder="Amount of tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          />
          <button
            className="p-2 bg-purple-500 cursor-pointer "
            disabled={!(tokenAmount > 0)}
            onClick={() => mintKhaNFTtoken(tokenAmount)}
          >
            Mint Tokens
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="h-screen bg-cover bg-[url('/img/ethereum.jpeg')]">
      <Head>
        <title>LW3 Sophomore Dapps</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,700;1,400&display=swap');
        </style>
      </Head>
      <div className="flex flex-col items-center h-96 justify-center">
        <h1 className="text-5xl text-center py-4 text-white">
          Welcome to KhaNFT ICO!!!
        </h1>
        <p className="text-3xl text-center">
          You can claim or mint KhaNFT Tokens here!
        </p>
        <div>
          {walletConnected ? (
            <div className="px-4 text-white text-center">
              <p className="text-2xl my-2">
                You have minted {utils.formatEther(balanceOfKhaNftTokens)}
                KhaNFT tokens
              </p>
              <p className="text-2xl my-2">
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted
              </p>
              {renderButton()}
            </div>
          ) : (
            <button
              className="border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white my-3"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default ICO;