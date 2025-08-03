import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [twits, setTwits] = useState([]);
  const [newTwit, setNewTwit] = useState('');
  const [friendAddress, setFriendAddress] = useState('');

  // Switch to Sepolia
  async function switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else console.error(e);
    }
  }

  // Connect wallet
  async function connectWallet() {
    if (window.ethereum) {
      await switchToSepolia();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } else {
      alert('Install MetaMask!');
    }
  }

  // Post twit
  async function postTwit() {
    if (!newTwit) return alert('Enter message!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.twit(newTwit);
    await tx.wait();
    setNewTwit('');
    fetchTwits();
  }

  // Fetch all twits
  async function fetchTwits() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const nextId = await contract.getNextId();
    if (Number(nextId) > 0) {
      const latest = await contract.getLatestTwits(nextId);
      setTwits([...latest].reverse());
    } else {
      setTwits([]);
    }
  }

  // Fetch my twits
  async function fetchMyTwits() {
    if (!account) return alert('Connect wallet first!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const nextId = await contract.getNextId();
    if (Number(nextId) > 0) {
      const mine = await contract.getLatestOfUser(account, nextId - 1);
      setTwits([...mine].reverse());
    } else {
      setTwits([]);
    }
  }

  // Allow friend
  async function allowFriend() {
    if (!friendAddress) return alert('Enter friend address!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.allow(friendAddress);
    await tx.wait();
    alert(`Allowed ${friendAddress} to twit as you!`);
    setFriendAddress('');
  }

  useEffect(() => { if (account) fetchTwits(); }, [account]);

  return (
    <div className="container">
      <header className="hero">
        <h1>BlockTweet </h1>
        <p className="subtitle">Post, follow, and chat — fully on-chain, censorship-free.</p>
        {!account && (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </header>

      {account && (
        <>
          <div className="actions">
            <input
              type="text"
              placeholder="What's happening?"
              value={newTwit}
              onChange={(e) => setNewTwit(e.target.value)}
            />
            <button onClick={postTwit}>Twit!</button>
          </div>
          <div className="btn-group">
            <button onClick={fetchTwits}>🌍 All Twits</button>
            <button onClick={fetchMyTwits}>👤 My Twits</button>
            <button onClick={fetchTwits}>🔄 Refresh</button>
          </div>
          <div className="actions">
            <input
              type="text"
              placeholder="Friend's address to allow"
              value={friendAddress}
              onChange={(e) => setFriendAddress(e.target.value)}
            />
            <button onClick={allowFriend}>➕ Allow Friend to Twit</button>
          </div>
          <div className="feed">
            {twits.map((twit, idx) => (
              <div key={idx} className="twit-card">
                <img
                  className="avatar"
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${twit.author}`}
                  alt="avatar"
                />
                <div className="twit-info">
                  <div className="author">{twit.author.substring(0,6)}...{twit.author.slice(-4)}</div>
                  <div className="content">{twit.content}</div>
                  <div className="time">{new Date(Number(twit.createdAt)*1000).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <footer>
        Built on Sepolia Testnet • ❤️ by Khushi
      </footer>
    </div>
  );
}

export default App;
