import React from "react";
import Head from "../node_modules/next/head";
import Link from "../node_modules/next/link";

const Home = () => {
  return <main className="h-screen bg-cover bg-[url('/img/ethereum.jpeg')]" >
    <Head>
        <title>LW3 Sophomore Dapps</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,700;1,400&display=swap');
        </style>
      </Head>
    <div className="px-12 text-gray-900 decoration-rose-400 flex flex-col justify-center h-5/6 sm:px-44 md:px-64 lg:items-center">
        <h1 className="text-5xl mb-5">LW3 Sophomore Dapps</h1>
        <ul className="p-4 text-3xl">
          <Link href="/Whitelist">
          <li className="list-disc cursor-pointer underline mb-2">Whitelist Dapp</li>
          </Link>
          <Link href="/KhaNFT">
          <li className="list-disc cursor-pointer underline mb-2">NFT Collection</li>
          </Link>
          <Link href="/ICO">
          <li className="list-disc cursor-pointer underline mb-2">ICO</li>
          </Link>
          <Link href="/DAO">
          <li className="list-disc cursor-pointer underline mb-2">DAO</li>
          </Link>
          <li className="list-disc cursor-pointer underline mb-2">DeFi-Exchange</li>
        </ul>
    </div>
  </main>
}

export default Home