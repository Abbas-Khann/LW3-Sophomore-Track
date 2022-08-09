import {useEffect, useState, useRef} from 'react';
import Head from '../node_modules/next/head';
import { Contract, providers } from 'ethers';
import { formatEther } from '../node_modules/ethers/lib/utils';
import Web3Modal from 'web3modal';
import { KhaNFTContractAddress,
         KHANFTCONTRACTABI,
         DAO_CONTRACT_ADDRESS,
         DAO_CONTRACT_ABI
        } from '../Constants/constants';
import { toast } from 'react-toastify';

const DAO = (): JSX.Element => {

  const [walletConnected, setWalletConnected] = useState <boolean> (false);
  const [treasuryBalance, setTreasuryBalance] = useState <string> ("0");
  const [numProposals, setNumProposals] = useState <string>("0");
  const [nftBalance, setNftBalance] = useState <number> (0);
  const [loading, setLoading] = useState <boolean> (false);
  const [fakeNftTokenId, setFakeNftTokenId] = useState <string> ("");
  const [selectedTab, setSelectedTab] = useState <string> ("");
  const [proposals, setProposals] = useState([]);
  const web3modalRef = useRef<any>();

  console.table(proposals)
  
  const getProviderOrSigner = async (needSigner: boolean = false): Promise <void> => {
    const provider = await web3modalRef.current.connect();
    const web3Provider: any = new providers.Web3Provider(provider);
    
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
  
  const connectWallet = async (): Promise <void> => {
    try {
        await getProviderOrSigner();
        setWalletConnected(true);
    } catch (err) {
      console.error(err)
    }
  }
  const getDAOContractInstance = (providerOrSigner): Contract => {
    return new Contract(DAO_CONTRACT_ADDRESS, DAO_CONTRACT_ABI, providerOrSigner);
  };
  
  const getNFTContractInstance = (providerOrSigner): Contract => {
    return new Contract(
      KhaNFTContractAddress,
      KHANFTCONTRACTABI,
      providerOrSigner
    );
  };
  
  const getUserNFTBalance = async (): Promise<void> => {
    try {
      const signer: any = await getProviderOrSigner(true);
      const nftContract: Contract = getNFTContractInstance(signer);
  
      const balance: number = await nftContract.balanceOf(signer.getAddress());
      setNftBalance(parseInt(balance.toString()));
    } catch (err) {
      console.error(err);
    }
  };
  
  const getDAOTreasuryBalance = async (): Promise<void> => {
    try {
      const provider: any = await getProviderOrSigner(false);
  
      const balance: string = await provider.getBalance(DAO_CONTRACT_ADDRESS);
      setTreasuryBalance(balance.toString());
    } catch (err) {
      console.error(err);
    }
  };
  
  const getNumProposalsInDAO = async (): Promise<void> => {
    try {
      const provider: any = await getProviderOrSigner(false);
  
      const contract: Contract = getDAOContractInstance(provider);
      const daoNumProposals: string = await contract.numProposals();
      setNumProposals(daoNumProposals.toString());
    } catch (err) {
      console.error(err);
    }
  };
  
  const createProposal = async (): Promise<void> => {
    try {
      const signer: any = await getProviderOrSigner(true);
      const contract: Contract = getDAOContractInstance(signer);
      const txn = await contract.createProposal(fakeNftTokenId);
      setLoading(true);
      await txn.wait();
      await getNumProposalsInDAO();
      toast.success("Proposal Created!!!");
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchProposalById = async (id: number): Promise<object> => {
    try {
      const provider: any = await getProviderOrSigner(false);
  
      const daoContract: Contract = getDAOContractInstance(provider);
      const proposal = await daoContract.proposals(id);
      const parsedProposal = {
        proposalId: id,
        nftTokenId: proposal.nftTokenId.toString(),
        deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
        yayVotes: proposal.yayVotes.toString(),
        nayVotes: proposal.nayVotes.toString(),
        executed: proposal.executed,
      };
      return parsedProposal;
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchAllProposals = async (): Promise<object[]> => {
    try {
      const proposals: object[] = [];
      for (let i: number = 0; i < parseInt(numProposals); i++) {
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
        console.log("proposals inside loop", proposals);
      }
      setProposals(proposals);
      console.log("proposals inside the function: ", proposals);
      return proposals;
    } catch (err) {
      console.error(err);
    }
  };
  
  const voteOnProposal = async (proposalId: number, _vote): Promise<void> => {
    try {
      const signer: any = await getProviderOrSigner(true);
      const contract: Contract = getDAOContractInstance(signer);
  
      let vote: number = _vote === "YAY" ? 0 : 1;
      const tx = await contract.voteOnProposal(proposalId, vote);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await fetchAllProposals();
    } catch (err) {
      console.error(err);
    }
  };
  
  const executeProposal = async (proposalId: number): Promise<void> => {
    try {
      const signer: any = await getProviderOrSigner(true);
      const contract: Contract = getDAOContractInstance(signer);
  
      const txn = await contract.executeProposal(proposalId);
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await fetchAllProposals();
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    if (!walletConnected) {
      web3modalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet().then(() => {
        getDAOTreasuryBalance();
        getUserNFTBalance();
        getNumProposalsInDAO();
      });
    }
  }, [walletConnected]);
  
  useEffect(() => {
    if (selectedTab === "View Proposals") {
      console.log("Effect and condition executed!");
      fetchAllProposals();
    }
  }, [selectedTab]);
  
  function renderTabs(): JSX.Element {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalsTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }
  
  function renderCreateProposalsTab() {
    if (loading) {
      return (
        <div className="border-2 transition duration-300 ease-out motion-safe:animate-spin hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3">
          Loading...
        </div>
      );
    } else if (nftBalance === 0) {
      return (
        <div className=" transition duration-300 ease-out hover:ease-in  text-3xl rounded px-3 py-2 text-white mb-3">
          You don't own any KhaNFTs
          {toast.error("You cannot create or vote on proposals")}
        </div>
      );
    } else {
      return (
        <div className="text-center mt-2">
          <p className="text-2xl">Purchase NFT TokenId: </p>
          <input
            className="text-2xl w-44 rounded text-center"
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <div className="flex items-center justify-center">
            <button
              className="border-2 transition duration-300 ease-out hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mt-4"
              onClick={createProposal}
            >
              Create
            </button>
          </div>
        </div>
      );
    }
  }
  
  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className="border-2 transition duration-300 ease-out motion-safe:animate-spin hover:ease-in hover:bg-purple-800 text-3xl rounded px-3 py-2 hover:text-white mb-3">
          Loading...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <p
          className="transition duration-300 ease-out hover:ease-in  text-3xl rounded px-3 py-2 text-white mb-3
          "
        >
          No proposals have been created
        </p>
      );
    } else {
      return (
        <div>
          {proposals.map((p, idx) => (
            <div key={idx} className="">
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className="">
                  <button
                    onClick={() => voteOnProposal(p.proposalId, "YAY")}
                    className="bg-blue-400 rounded p-1"
                  >
                    Vote YAY
                  </button>
                  <button
                    className="bg-cyan-400 rounded p-1 ml-1"
                    onClick={() => voteOnProposal(p.proposalId, "NAY")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div>
                  <button
                    className="bg-pink-400 rounded text-white py-2"
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
              ) : (
                <div>Proposal Executed!!!</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }
  
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
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl text-black">Welcome to the DAO</h1>
        <div className="text-2xl text-center my-2 text-white">
          Your KhaNFT Balance: {nftBalance}
          <br />
          Treasury Balance: {formatEther(treasuryBalance)} ETH
          <br />
          Total Number of Proposals: {(formatEther(numProposals))}
        </div>
        <div>
          <button
            className="p-2 rounded bg-indigo-500 text-white hover:bg-indigo-400"
            onClick={() => setSelectedTab("Create Proposal")}
          >
            Create Proposal
          </button>
          <button
            className="p-2 rounded bg-cyan-300 text-black hover:bg-cyan-200 ml-2"
            onClick={() => setSelectedTab("View Proposals")}
          >
            View Proposals
          </button>
        </div>
        {renderTabs()}
      </div>
    </main>
  );
}

export default DAO