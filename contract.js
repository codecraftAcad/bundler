const { ethers } = require("ethers");
const contractABI = require('./contractABI')
const dotenv = require('dotenv').config()


const providerUrl = "https://light-tetra-upright.ngrok-free.app";
const provider = new ethers.providers.JsonRpcProvider(providerUrl);


const contractAddress = "0x2B8F5e69C35c1Aff4CCc71458CA26c2F313c3ed3";
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const privateKey = process.env.PRIVATE_KEY

const signer = new ethers.Wallet(privateKey, provider) 
const contractWithSigner = contract.connect(signer)


async function getAdminAddress() {
    try {
        const adminAddress = await contract.adminAddress();
        console.log("Admin Address:", adminAddress);
    } catch (error) {
        console.error("Error fetching admin address:", error);
    }
}


getAdminAddress();

async function deployToken(tokenName, tokenSymbol, totalSupply, tokenDecimals, taxWallet){
    try {
        const tx = await contractWithSigner.createNewToken(
            taxWallet,        
            tokenName,        
            tokenSymbol,     
            totalSupply,      
            tokenDecimals,   
            {
                gasLimit: 1000000 
            }
        );

        
        await tx.wait();

        console.log("Token deployed successfully:", tx.hash);
    } catch (error) {
        console.error("Error deploying token:", error);   
    }
}

console.log(privateKey)

deployToken(
    "TestToken",      
    "TST",            
    ethers.utils.parseUnits("1000000", 18),  
    18,               
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"  
); a