/* eslint-disable import/no-duplicates */
import Pando from '../lib'
import Repository from '../lib/components/repository'
/* eslint-enable import/no-duplicates */
import { opts } from './data'
import chai from 'chai'
import path from 'path'
import Web3 from 'Web3'
import 'chai/register-should'
import ethers from 'ethers'

chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))

const expect = chai.expect

// Web3.providers.HttpProvider.prototype.sendAsync =
//   Web3.providers.HttpProvider.prototype.send

// var blessed = require('blessed'),
//   contrib = require('blessed-contrib'),
//   screen = blessed.screen(),
//   grid = new contrib.grid({ rows: 1, cols: 2, screen: screen })
//
// var line = grid.set(0, 0, 1, 1, contrib.line, {
//   style: {
//     line: 'yellow',
//     text: 'green',
//     baseline: 'black'
//   },
//   xLabelPadding: 3,
//   xPadding: 5,
//   label: 'Stocks'
// })
//
// var map = grid.set(0, 1, 1, 1, contrib.map, { label: 'Servers Location' })
//
// var lineData = {
//   x: ['t1', 't2', 't3', 't4'],
//   y: [5, 1, 7, 5]
// }
//
// line.setData([lineData])
//
// screen.key(['escape', 'q', 'C-c'], function(ch, key) {
//   return process.exit(0)
// })
//
// screen.render()

// export const artifacts = {
//   acl: require('@aragon/os/build/contracts/ACL.json'),
//   appProxyFactory: require('@aragon/os/build/contracts/AppProxyFactory.json'),
//   appProxyUpgradeable: require('@aragon/os/build/contracts/AppProxyUpgradeable.json'),
//   daoFactory: require('@aragon/os/build/contracts/DAOFactory.json'),
//   kernel: require('@aragon/os/build/contracts/Kernel.json'),
//   tree: require('@pando/core/build/contracts/Tree.json')
// }
//
// export const acl = contractor(artifacts.acl)
// export const appProxyFactory = contractor(artifacts.appProxyFactory)
// export const appProxyUpgradeable = contractor(artifacts.appProxyUpgradeable)
// export const daoFactory = contractor(artifacts.daoFactory)
// export const kernel = contractor(artifacts.kernel)
// export const tree = contractor(artifacts.tree)
//
// export const initialize = (web3: any, account: string) => {
//   const contracts = {}
//   for (const artifact in artifacts) {
//     if (artifacts.hasOwnProperty(artifact)) {
//       contracts[artifact] = contractor(artifacts[artifact])
//       contracts[artifact].setProvider(web3.currentProvider)
//       contracts[artifact].defaults({ from: account, gas: 100000000 })
//     }
//   }
//   return contracts
// }

// console.log(Tree)

const Kernel = {
  artifact: require('@aragon/os/build/contracts/Kernel.json'),
  deploy: async wallet => {
    let transaction = ethers.Contract.getDeployTransaction(
      Kernel.artifact.bytecode,
      Kernel.artifact.abi
    )
    let gasLimit = await wallet.estimateGas(transaction)
    transaction.gasLimit = gasLimit
    return wallet.sendTransaction(transaction)
  }
}

const ACL = {
  artifact: require('@aragon/os/build/contracts/ACL.json'),
  deploy: async wallet => {
    let transaction = ethers.Contract.getDeployTransaction(
      ACL.artifact.bytecode,
      ACL.artifact.abi
    )
    let gasLimit = await wallet.estimateGas(transaction)
    transaction.gasLimit = gasLimit
    return wallet.sendTransaction(transaction)
  }
}

const Factory = {
  artifact: require('@aragon/os/build/contracts/DAOFactory.json'),
  interface: 'Toto',
  deploy: async (wallet, kernel, acl) => {
    let transaction = ethers.Contract.getDeployTransaction(
      Factory.artifact.bytecode,
      Factory.artifact.abi,
      kernel,
      acl,
      '0x0000000000000000000000000000000000000000'
    )
    let gasLimit = await wallet.estimateGas(transaction)
    transaction.gasLimit = gasLimit
    return wallet.sendTransaction(transaction)
  }
}

const main = async () => {
  var mnemonic =
    'journey nice rather ball theme used uncover gate pond rifle between state'
  var wallet = ethers.Wallet.fromMnemonic(mnemonic)
  var provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
  wallet.provider = provider
  console.log(wallet.address)
  var transaction = await Kernel.deploy(wallet)
  var kernelAddress = ethers.utils.getContractAddress(transaction)
  console.log('Kernel: ' + kernelAddress)
  transaction = await ACL.deploy(wallet)
  var aclAddress = ethers.utils.getContractAddress(transaction)
  console.log('ACL: ' + aclAddress)
  transaction = await Factory.deploy(wallet, kernelAddress, aclAddress)
  var factoryAddress = ethers.utils.getContractAddress(transaction)
  console.log('Factory: ' + factoryAddress)

  const factory = new ethers.Contract(
    factoryAddress,
    Factory.artifact.abi,
    wallet
  )

  const tx = await factory.newDAO(wallet.address)
  const receipt = await wallet.provider.getTransactionReceipt(tx.hash)

  // const kernelAddress = receipt.logs.filter(l => l.event === 'DeployDAO')[0]
  //   .args.dao

  const i = new ethers.Interface(Factory.artifact.abi)

  const log = receipt.logs.filter(
    l => l.topics[0] === i.events.DeployDAO.topics[0]
  )[0]
  const data = i.events.DeployDAO.parse(i.events.DeployDAO.topics, log.data)

  console.log(data)

  console.log(i.events.DeployDAO.topics)

  // Interface {
  //   abi: [Getter],
  //   functions: {},
  //   events: { FundUpdated: { [Function: func] inputs: [Getter] } },
  //   deployFunction: { [Function: func] inputs: [Getter] } }
  // > var info = i.events.FundUpdated()
  // EventDescription {
  //   inputs: [ { type: 'uint256', name: 'something' } ],
  //   name: 'FundUpdated',
  //   signature: 'FundUpdated(uint256)',
  //   topics:
  //    [ '0xe34c389652410c46bb438dd3b75c4e2665251c032d7cf198239862e556751e6a' ],
  //   parse: [Function] }
  // > var topics = [ '0xe34c389652410c46bb438dd3b75c4e2665251c032d7cf198239862e556751e6a' ];
  // > var data = '0x00000000000000000000000000000000000000000000000000000000000000ca'
  // > info.parse(topics, data)
  // Result {
  //   '0': BigNumber { _bn: <BN: ca> },
  //   something: BigNumber { _bn: <BN: ca> },
  //   length: 1 }
  //
  //
  //
  //   console.log(receipt.logs[5].topics)
}

// const kernelBase = await this.repository.pando.contracts.kernel.new()
// const aclBase = await this.repository.pando.contracts.acl.new()
// const factory = await this.repository.pando.contracts.daoFactory.new(
//   kernelBase.address,
//   aclBase.address,
//   '0x00'
// )
// const appProxyFactory = await this.repository.pando.contracts.appProxyFactory.new()
//
// // Deploy aragonOS-based DAO
// const receipt = await factory.newDAO(this.repository.config.author.account)

// Create a wallet to deploy the contract with
// var privateKey =
//   '0x0123456789012345678901234567890123456789012345678901234567890123'
// var wallet = new ethers.Wallet(privateKey, provider)

// Send the transaction

// const gasP = wallet.estimateGas(deploy)
//
// // deployTransaction.gasLimit = 1500000;
// // deployTransaction.gasPrice = 10000000000;
//
// // deploy.gasLimit = 0xfffffffff
//
// gasP.then(g => {
//   console.log(g)
//   deploy.gasLimit = g
//
//   var sendPromise = wallet.sendTransaction(deploy)
//
//   // Get the transaction
//   sendPromise.then(function(transaction) {
//     console.log(transaction)
//   })
// })

main()
