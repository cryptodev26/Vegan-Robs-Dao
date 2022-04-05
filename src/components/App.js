import React, { Component } from 'react';
import { Button,InputGroup, FormControl, Card, Row, Tabs, Tab, Col, Nav} from 'react-bootstrap';
import { MDBDataTableV5 } from 'mdbreact';
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
      // DASH BOARD
      linkedAccount : '',
      accountType : '',
      totalSupply : '0',
      holders     : [],
      owner       : '',
      holderTable : [],

      // ELECTION STATUS
      electionNumber : 0,
      OpenedNumberElection : 0,
      EndedNumberElection : 0,
      electionTable : []
    }
  }

  async componentWillMount(){
    if(window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
        const clientWeb3    = window.web3;
        const accounts = await clientWeb3.eth.getAccounts();
        this.setState({
            linkedAccount : accounts[0]
        }) 
    } 
    else if(window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
        const clientWeb3    = window.web3;
        const accounts = await clientWeb3.eth.getAccounts();
        this.setState({
            linkedAccount : accounts[0]
        }) 
    } else {
        window.alert('Non-Ethereum browser detected. Your should consider trying MetaMask!')
    }
    if(this.state.linkedAccount === ''){
        return
    }

    const { ethereum } = window;
    ethereum.on('accountsChanged',  (accounts) => {
      accounts =   web3.utils.toChecksumAddress(accounts + '')
      this.setState({
        linkedAccount : accounts
      })
      this.checkDashBoard(this.state.linkedAccount)
    });

    this.checkDashBoard(this.state.linkedAccount) 
    this.checkElectionStatus() 
  }



  async checkDashBoard (address){
    let balance = await vrtContract.methods.balanceOf(address).call()
    let owner   = await vrtContract.methods.owner().call()
    let totalSupply = await vrtContract.methods.totalSupply().call()
    let holders = await vrtContract.methods.getHolders().call()

    this.setState({ 
      owner : owner,
      totalSupply : totalSupply / 1,
      holders : holders,
    })

    for (let i = 0; i < this.state.holders.length; i++) {

      let balanceOfHolder = await vrtContract.methods.balanceOf(this.state.holders[i]).call()
      
      let tableRow = {
        id : i + 1,
        address : this.state.holders[i],
        balance : balanceOfHolder / 1
      }

      let balanceTableData = this.state.holderTable
      balanceTableData.push(tableRow)
      this.setState({
        holderTable : balanceTableData
      })
    }

    if (address === owner){
      this.setState({
        accountType : 'owner'
      })
    } else {
      if (balance > 0) {
        this.setState({
          accountType : 'member'
        })
      } else {
        this.setState({
          accountType : 'guest'
        })
      } 
    }
  }

  async checkElectionStatus() {

    let numberOfActive = 0

    let NumberOfElection = await daoContract.methods.proposalIndex().call()

    for (let i = 0; i < NumberOfElection / 1; i++) {

      let RowData = await daoContract.methods.proposals(i).call()
      let tableData = this.state.electionTable
      let status 
      if (RowData.isVoteEnded){
        status = "Ended"
      } else {
        status = "active"
        numberOfActive += 1
      }
      let newRowData = {
        id : RowData.id / 1,
        source : RowData.source,
        name   : RowData.name,
        createdAt : RowData.createdAt / 1,
        voteTime  : RowData.voteTime / 1,
        NumberOfVoted : RowData.NumberOfYesMenber / 1 + RowData.NumberOfNoMember / 1,
        voteAmount    : RowData.voteAmount / 1,
        NumberOfYesMenber : RowData.NumberOfYesMenber / 1,
        votesForYes : RowData.votesForYes / 1,
        NumberOfNoMember : RowData.NumberOfNoMember / 1,
        votesForNo : RowData.votesForNo / 1,
        status : RowData.status / 1,
        isVoteEnded : status
      }
      tableData.push(newRowData);

      this.setState({
        electionTable : tableData
      })
    }
    console.log(this.state.electionTable)
    this.setState({
      NumberOfElection     : NumberOfElection / 1,
      OpenedNumberElection : numberOfActive,
      EndedNumberElection  : NumberOfElection / 1 - numberOfActive
    })


  }

  render() {

    var rowsCaptureTable = this.state.holderTable
    const holderTableData = {
      columns : [

        {
            label : 'No',
            field : 'id',
            sort  : 'asc'
        },
        {
            label : 'Holder Address',
            field : 'address',
        },
        {
          label : 'Balance ',
          field : 'balance',
        },  
      ],
      rows : rowsCaptureTable,
    }

    var rowsCaptureTableElection = this.state.electionTable
    const electionTable = {
      columns : [
      {
        label : 'No',
        field : 'id',
        sort  : 'asc'
      },
      {
        label : 'Image',
        field : 'source',
      },
      {
        label : 'Content ',
        field : 'name',
      },  
      {
        label : 'Created At ',
        field : 'createdAt',
      },  
      {
        label : 'Duration',
        field : 'voteTime',
      },
      {
        label : 'Voted Number',
        field : 'NumberOfVoted',
      },
      {
        label : 'Voted Amount',
        field : 'voteAmount',
      },
      {
        label : 'Number of Yes',
        field : 'NumberOfYesMenber',
      },
      {
        label : 'Amount of Yes',
        field : 'votesForYes',
      },
      {
        label : 'Number of No',
        field : 'NumberOfNoMember',
      },
      {
        label : 'Amount of No',
        field : 'votesForNo',
      },
      {
        label : 'Status',
        field : 'status',
      },
      {
        label : 'Active or Ended',
        field : 'isVoteEnded',
      }
     ],
     rows : rowsCaptureTableElection,
    }





    return (
      <div>
        <TopNav/><br/><br/><br/>

        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
          <Row>
            <Col sm={2}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="first">DASHBOARD</Nav.Link>
                </Nav.Item><br/>
                <Nav.Item>
                  <Nav.Link eventKey="second">ELECTION STATUS</Nav.Link>
                </Nav.Item><br/>
                <Nav.Item>
                  <Nav.Link eventKey="third">CREATE NEW ELECTIOM</Nav.Link>
                </Nav.Item><br/>
                <Nav.Item>
                  <Nav.Link eventKey="fouth">VOTE</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>


            <Col sm={10}>
              <Tab.Content>
                <Tab.Pane eventKey="first">
                  <h3>Vegan Rob's Governance Token</h3><hr/><br/>
                  <div className = "row">
                    <div className='col-4'>
                      <Card bg = "light">
                        <Card.Header  bg = "dark" > <h6>TOTAL SUPPLY</h6></Card.Header>
                        <Card.Body>
                          <Card.Text>
                            {this.state.totalSupply}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-4'>
                      <Card bg = "light">
                        <Card.Header  bg = "dark" > <h6>HOLDER NUMBER</h6></Card.Header>
                        <Card.Body>
                          <Card.Text>
                            {this.state.holders.length}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-4'>
                      <Card bg = "light">
                        <Card.Header  bg = "dark" > <h6>DAO OWNER</h6></Card.Header>
                        <Card.Body>
                          <Card.Text>
                            {this.state.owner}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </div>
                  </div><br/><br/><br/><br/>
                  <h3>Table of Vegan Rob's DAO Member</h3><hr/>
                  <MDBDataTableV5 hover entriesOptions={[5,10,20,50,100,200,500,1000]} entries={5} pagesAmount={300} data={holderTableData}  materialSearch /><br/><br/>
                </Tab.Pane>




                <Tab.Pane eventKey="second">
                  <div className = "row">
                    <div className='col-4'>
                      <Card bg = "light">
                        <Card.Header  bg = "dark" > <h6>Number OF Created Election</h6></Card.Header>
                        <Card.Body>
                          <Card.Text>
                            {this.state.NumberOfElection}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-4'>
                      <Card bg = "light">
                        <Card.Header  bg = "dark" > <h6>Opended</h6></Card.Header>
                        <Card.Body>
                          <Card.Text>
                            {this.state.OpenedNumberElection}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-4'>
                      <Card bg = "light">
                        <Card.Header  bg = "dark" > <h6>Ended</h6></Card.Header>
                        <Card.Body>
                          <Card.Text>
                            {this.state.EndedNumberElection}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </div>
                  </div><br/><br/><br/><br/>

                  <MDBDataTableV5 hover entriesOptions={[5,10,20,50,100,200,500,1000]} entries={5} pagesAmount={300} data={electionTable}  materialSearch /><br/><br/>

                </Tab.Pane>
                <Tab.Pane eventKey="third">

                </Tab.Pane>
                <Tab.Pane eventKey="fouth">

                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>

      </div>
    );
  }
}

export default App;
