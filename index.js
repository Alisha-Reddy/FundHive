import { ethers } from "/ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = updateBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            connectButton.innerHTML = "Connected!"
            showNotification("Connected Successfully!")
        } catch (error) {
            console.log(error)
            showNotification("Connection failed!")
        }
    } else {
        connectButton.innerHTML = "Please install a metamask! "
        showNotification("Please install Metamask!")
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        return ethers.utils.formatEther(balance)
    } else {
        return "0"
    }
}

async function fund(ethAmount) {
    ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionToBeMined(transactionResponse, provider)
            console.log("Done!")
            showNotification(`Successfully funded ${ethAmount} ETH!`)
        } catch (error) {
            console.log(error)
            showNotification("Funding Failed!")
        }
    } else {
        showNotification("Ethereum provider not found")
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionToBeMined(transactionResponse, provider)
            console.log("Withdrawal successful")
            showNotification("Withdrawal successful!")
        } catch (error) {
            console.log(error)
            showNotification("Withdrawal failed!")
        }
    } else {
        showNotification("Ethereum provider not found")
    }
}

async function updateBalance() {
    try {
        const balance = await getBalance()
        showNotification(`Current balance: ${balance} ETH`)
    } catch (error) {
        console.log("Failed to get balance:", error)
        showNotification("Failed to get balance!")
    }
}

function listenForTransactionToBeMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`,
            )
            resolve()
        })
    })
}

function showNotification(message) {
    const notification = document.getElementById("notification")
    notification.innerText = message
    notification.classList.remove("hidden")
    notification.classList.add("visible")
    setTimeout(() => {
        notification.classList.remove("visible")
        notification.classList.add("hidden")
    }, 3000)
}
