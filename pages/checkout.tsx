import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

interface itemProps {
  name: string
  description: string
  price: number
  seller: string
  _id?: string
  image?: string
  quantity?: number
  listingEndDate?: Date
  ListingStartDate?: Date
}

interface shippingAddress {
  firstName: String
  lastName: String
  emailAddress: String
  country: String
  streetAddress: String
  city: String
  state: String
  postalCode: Number | null
}

const testItem: itemProps = {
  _id: '0xtest',
  name: 'Book of Spells',
  description: 'Lets you conquer the universe',
  price: 0.1,
  seller: '0x78bCA437E8D6c961a1F1F7D97c81781044195bcF', // testing2
}

const Checkout: NextPage<itemProps> = () => {
  const [walletAddress, setWalletAddress] = useState<string | Promise<string>>()
  const [isConnected, setIsConnected] = useState<String>('Connect Wallet')
  const [ethBalance, setEthBalance] = useState<Number>(0)
  const [chainId, setChainId] = useState<String>()
  const [error, setError] = useState<any>(null)
  const [provider, setProvider] = useState<any>()
  const [isLoading, setIsLoading] = useState<Boolean>(false)
  const [shippingAddress, setShippingAddress] = useState<shippingAddress>({
    firstName: '',
    lastName: '',
    emailAddress: '',
    country: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: 0,
  })
  let txnId: String
  const firstName = useRef<any>()
  const lastName = useRef<any>()
  const emailAddress = useRef<any>()
  const country = useRef<any>()
  const streetAddress = useRef<any>()
  const city = useRef<any>()
  const state = useRef<any>()
  const postalCode = useRef<any>()

  const router = useRouter()

  const initialiseWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is present')
      setChainId(window.ethereum.chainId)
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      setProvider(provider)
      const myAddress = await signer.getAddress()
      const balance = await provider.getBalance(myAddress)
      const eth = parseFloat(ethers.utils.formatUnits(balance))
      const rounded = Math.round(eth * 10) / 10
      setEthBalance(rounded)
      setWalletAddress(myAddress)
      setIsConnected('Connected')
    } else {
      alert('Please Install Metamask!')
    }
  }

  const changeNetwork = async () => {
    try {
      if (!window.ethereum) throw new Error('No crypto wallet found')
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4' }],
      })
    } catch (err: any) {
      setError(err.message)
      console.log('error changing network: ', err.message)
    }
  }

  const executeTransaction = async () => {
    const params = [
      {
        from: walletAddress,
        to: testItem.seller,
        value: ethers.utils.parseUnits(testItem.price.toString(), 'ether').toHexString(),
      },
    ]
    try {
      const txn = await provider.send('eth_sendTransaction', params)
      const receipt = await provider.waitForTransaction(txn)
      console.log('txn: ', txn)
      console.log('txn success: ', receipt)
      const txnSuccess = {
        orderStatus: 'Success',
      }
      const res = await fetch(`http://localhost:4000/transactions/${txnId}`, {
        method: 'PUT',
        body: JSON.stringify(txnSuccess),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      console.log('database update success: ', data)
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message)
      console.log('error sending eth: ', err.message)
      const txnFailure = {
        orderStatus: 'Failure',
      }
      const res = await fetch(`http://localhost:4000/transactions/${txnId}`, {
        method: 'PUT',
        body: JSON.stringify(txnFailure),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      console.log('txn failure: ', data)
      setIsLoading(false)
    }
  }

  const handleConfirmButton = async () => {
    const shippingData: shippingAddress = {
      firstName: firstName.current.value,
      lastName: lastName.current.value,
      emailAddress: emailAddress.current.value,
      country: country.current.value,
      streetAddress: streetAddress.current.value,
      city: city.current.value,
      state: state.current.value,
      postalCode: postalCode.current.value,
    }
    setShippingAddress(shippingData)
    const initialiseTxn = {
      seller: testItem.seller,
      buyer: walletAddress,
      itemId: testItem._id,
      salePrice: testItem.price,
      purchaseDate: new Date(),
      orderStatus: 'Pending',
      shippingAddress: shippingData,
    }
    setIsLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/transactions`, {
        method: 'POST',
        body: JSON.stringify(initialiseTxn),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      txnId = await res.json()
      console.log('sent txn: ', txnId)
      await executeTransaction()
    } catch (err) {
      console.log('error posting transaction: ', err)
    }
  }

  const handlePaymentSuccess = async () => {
    router.push('/payment')
  }

  useEffect(() => {
    window.ethereum.on('accountsChanged', () => {
      setWalletAddress(window.ethereum.selectedAddress)
    })
    window.ethereum.on('chainChanged', function () {
      console.log('network changed')
      setChainId(window.ethereum.chainId)
    })
    // add cleanup function here
  }, [])

  useEffect(() => {
    initialiseWallet()
  }, [walletAddress])

  return (
    <div>
      <div className="ml-5 mr-5 flex justify-center">
        <div className="mt-10">
          <div className="mb-10">
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 bg-slate-200 sm:p-6">
                  <h1 className="font-bold text-xl">Shipping Information</h1>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="first-name"
                        className="block text-md font-medium text-gray-700">
                        First name
                      </label>
                      <input
                        ref={firstName}
                        type="text"
                        name="first-name"
                        id="first-name"
                        autoComplete="given-name"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="last-name"
                        className="block text-md font-medium text-gray-700">
                        Last name
                      </label>
                      <input
                        ref={lastName}
                        type="text"
                        name="last-name"
                        id="last-name"
                        autoComplete="family-name"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="email-address"
                        className="block text-md font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        ref={emailAddress}
                        type="text"
                        name="email-address"
                        id="email-address"
                        autoComplete="email"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="country" className="block text-md font-medium text-gray-700">
                        Country
                      </label>
                      <select
                        ref={country}
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>United States</option>
                        <option>Canada</option>
                        <option>Mexico</option>
                      </select>
                    </div>
                    <div className="col-span-6">
                      <label
                        htmlFor="street-address"
                        className="block text-md font-medium text-gray-700">
                        Street address
                      </label>
                      <input
                        ref={streetAddress}
                        type="text"
                        name="street-address"
                        id="street-address"
                        autoComplete="street-address"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <label htmlFor="city" className="block text-md font-medium text-gray-700">
                        City
                      </label>
                      <input
                        ref={city}
                        type="text"
                        name="city"
                        id="city"
                        autoComplete="address-level2"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                      <label htmlFor="region" className="block text-md font-medium text-gray-700">
                        State / Province
                      </label>
                      <input
                        ref={state}
                        type="text"
                        name="region"
                        id="region"
                        autoComplete="address-level1"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                      <label
                        htmlFor="postal-code"
                        className="block text-md font-medium text-gray-700">
                        ZIP / Postal code
                      </label>
                      <input
                        ref={postalCode}
                        type="text"
                        name="postal-code"
                        id="postal-code"
                        autoComplete="postal-code"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 m-10 w-2/5 bg-slate-200 border rounded-md relative">
          <h1 className="font-bold text-xl">Item Summary</h1>
          <div className="flex-auto justify-center">
            <span className="m-5">{testItem.name}</span>
            <span className="m-5">{testItem.description}</span>
            <span className="m-5">{testItem.price} ETH</span>
          </div>
          <div className="absolute bottom-5 font-bold text-xl">
            Total Payment: {testItem.price} ETH
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="p-5 bg-slate-200 border rounded-md">
          <h1 className="font-bold text-xl">Payment</h1>
          <div>
            <button
              onClick={initialiseWallet}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border rounded-md p-2 m-2">
              {isConnected}
            </button>
            {/* <button>Disconnect</button> */}
            <button onClick={handlePaymentSuccess}>Go to Result Page</button>
            <div>
              {isConnected === 'Connected' ? (
                <div>
                  <p>Wallet {walletAddress} is connected</p>
                  <p>Available ETH Balance: {ethBalance} ETH </p>
                  {chainId !== '0x4' ? (
                    <button onClick={changeNetwork}>Switch To Rinkeby</button>
                  ) : ethBalance > testItem.price ? (
                    <div>
                      <button
                        onClick={handleConfirmButton}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border rounded-md p-2 m-2">
                        Confirm Payment
                      </button>
                    </div>
                  ) : (
                    <p>Insufficient Funds</p>
                  )}
                </div>
              ) : (
                <p>Wallet not connected</p>
              )}
            </div>
            {isLoading ? (
              <button className="bg-yellow-300 p-3 rounded-md">Loading.... </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
      {error !== null ? (
        <div className="flex justify-center">
          <div className="mt-10 p-3 w-1/2 bg-red-100 border border-red-400 text-red-700 rounded">
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Checkout
