import React, { Component } from "react";
import getWeb3, { getGanacheWeb3 } from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import Hero from "./components/Hero/index.js";
import Instructions from "./components/Instructions/index.js";
import { Loader } from 'rimble-ui';
import Voter from './components/Voter/Voter';
import {apiUrl }from './constants.js';
import styles from './App.module.scss';
import Profile from './components/Profile/Profile.js';
import Team from './components/Team/Team.js';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    route: window.location.pathname.replace("/","")
  };

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  }

  getIteration = ()=>{
    axios
  .get(`${apiUrl}/iteration`).then((response)=>(this.setState({iteration : response.data.iteration})))
  }

  componentDidMount = async () => {
    let Counter = {};
    let Wallet = {};

    this.getIteration();

    try {
      Counter = require("./contracts/Counter.json");
      Wallet = require("./contracts/Wallet.json");
    } catch (e) {
      console.log(e);
    }
    try {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        let ganacheAccounts = [];
        try {
          ganacheAccounts = await this.getGanacheAddresses();
        } catch (e) {
          console.log('Ganache is not running');
        }
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const isMetaMask = web3.currentProvider.isMetaMask;
        let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
        balance = web3.utils.fromWei(balance, 'ether');
        let instance = null;
        let instanceWallet = null;
        let deployedNetwork = null;
        if (Counter.networks) {
          deployedNetwork = Counter.networks[networkId.toString()];
          if (deployedNetwork) {
            instance = new web3.eth.Contract(
              Counter.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (Wallet.networks) {
          deployedNetwork = Wallet.networks[networkId.toString()];
          if (deployedNetwork) {
            instanceWallet = new web3.eth.Contract(
              Wallet.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (instance || instanceWallet) {
          // Set web3, accounts, and contract to the state, and then proceed with an
          // example of interacting with the contract's methods.
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId,
            isMetaMask, contract: instance, wallet: instanceWallet }, () => {
              this.refreshValues(instance, instanceWallet);
              setInterval(() => {
                this.refreshValues(instance, instanceWallet);
              }, 5000);
            });
        }
        else {
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId, isMetaMask });
        }
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshValues = (instance, instanceWallet) => {
    if (instance) {
      this.getCount();
    }
    if (instanceWallet) {
      this.updateTokenOwner();
    }
  }

  getCount = async () => {
    const { contract } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getCounter().call();
    // Update state with the result.
    this.setState({ count: response });
  };

  updateTokenOwner = async () => {
    const { wallet, accounts } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await wallet.methods.owner().call();
    // Update state with the result.
    this.setState({ tokenOwner: response.toString() === accounts[0].toString() });
  };

  increaseCount = async (number) => {
    const { accounts, contract } = this.state;
    await contract.methods.increaseCounter(number).send({ from: accounts[0] });
    this.getCount();
  };

  decreaseCount = async (number) => {
    const { accounts, contract } = this.state;
    await contract.methods.decreaseCounter(number).send({ from: accounts[0] });
    this.getCount();
  };

  renounceOwnership = async (number) => {
    const { accounts, wallet } = this.state;
    await wallet.methods.renounceOwnership().send({ from: accounts[0] });
    this.updateTokenOwner();
  };

  renderLoader() {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  renderDeployCheck(instructionsKey) {
    return (
      <div className={styles.setup}>
        <div className={styles.notice}>
          Your <b> contracts are not deployed</b> in this network. Two potential reasons: <br />
          <p>
            Maybe you are in the wrong network? Point Metamask to localhost.<br />
            You contract is not deployed. Follow the instructions below.
          </p>
        </div>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name={instructionsKey} accounts={this.state.accounts} />
      </div>
    );
  }

  renderProfile = ()=>{
    return (
      <Profile account={this.state.accounts && this.state.accounts[0]}/>
    )
  }

  renderTeam = () => {
    return (<Team />)
  }

  renderInstructions() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name="setup" accounts={this.state.accounts} />
      </div>
    );
  }


  renderVoter(){
    return (<Voter 
              iteration={this.state.iteration} account={this.state.accounts && this.state.accounts[0]}/>)
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
          {this.state.route === '' && this.renderInstructions()}
          {this.state.route === 'vote' && this.renderVoter()}
          {this.state.route === 'profile' && this.renderProfile()}
          {this.state.route === "team" && this.renderTeam()}
        <Footer />
      </div>
    );
  }
}

export default App;
