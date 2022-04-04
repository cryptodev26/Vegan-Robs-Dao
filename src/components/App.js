import React, { Component } from 'react';
import { Button,InputGroup, FormControl, Card, Form} from 'react-bootstrap';
import { MDBDataTable   } from 'mdbreact';
import Web3 from 'web3';
import './App.css';
import TopNav from './Nav';
import {RPC, vrtAddress, vrtABI, daoABI,daoAddress} from './config'
const ethers = require('ethers')

const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
const vrtContract  = new web3.eth.Contract(vrtABI, vrtAddress)
const daoContract  = new web3.eth.Contract(daoABI, daoAddress)


class App extends Component {
  constructor(props){
    super(props)
    this.state={
    }
  }

  async componentWillMount(){
    setInterval(async () => {

        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
            const clientWeb3    = window.web3;
            const accounts = await clientWeb3.eth.getAccounts();
            this.setState({
                account : accounts
            }) 
        } 
        
        else if(window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
            const clientWeb3    = window.web3;
            const accounts = await clientWeb3.eth.getAccounts();
            this.setState({
                account : accounts
            }) 
        } else {
            window.alert('Non-Ethereum browser detected. Your should consider trying MetaMask!')
        }
        if(this.state.account[0] === ''){
            return
        }
        this.check(this.state.account[0]) 
    }, 10000);
  }

  async check (address){
    let balance = await vrtContract.methods.balanceOf(address).call()


    let owner   = await vrtContract.methods.owner().call()

    console.log(owner, balance)
    if (address === owner){
    } else {
      if (balance > 0) {
      } else {
      } 
    }
  }

  render() {
    return (
      <div>
        <TopNav/>
        <div className = "row">
            <h1>{ this.state.account }</h1>
        </div>
      </div>
    );
  }
}

export default App;
