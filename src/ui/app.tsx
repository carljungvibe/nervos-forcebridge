/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import { create } from 'ipfs-http-client';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { InstagramWrapper } from '../lib/contracts/InstagramWrapper';
import { CONFIG } from '../config';
import NavBar from './components/navbar';
import UploadImage from './components/upload';
import Show from './components/show';
import ForceBridgeModal from './components/modal';

import * as CompiledContractArtifact from '../../build/contracts/ERC20.json';

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const SUDT_PROXY_CONTRACT_ADDRESS = '0xca5B329d454aC0107AB79780b953e54AA422621c';
async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<InstagramWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();

    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [uploadedImage, setUploadedImage] = useState<File[]>();
    const [buffer, setBuffer] = useState<Buffer>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [images, setImages] = useState<any[]>([]);
    const [l2DepositAddress, setL2DepositAddress] = useState<string>();
    const [balanceOf, setBalanceOf] = useState();

    useEffect(() => {
        if (web3 && accounts) {
            setInterval(async function() {
                console.log('Price updating...');
                const _l2Balance = BigInt(await web3.eth.getBalance(accounts[0]));
                setL2Balance(_l2Balance);
            }, 3000);
        }
    }, [web3, accounts]);

    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (contract) {
            getImages();
        }
    }, [contract]);

    useEffect(() => {
        if (accounts && polyjuiceAddress) {
            getL2Balance();
        }
    }, [accounts, polyjuiceAddress]);
    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            const _contract = new InstagramWrapper(_web3);
            setContract(_contract);

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });

    const onCaptureFile = (imageList: any) => {
        console.log(imageList);
        setUploadedImage(imageList);

        const file = imageList[0].file as File;
        console.log('FILEE::', file);
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);

        reader.onloadend = () => {
            setBuffer(Buffer.from(reader.result));
            console.log('buffer', buffer);
        };
    };

    const uploadImage = async () => {
        if (!buffer) {
            return;
        }
        try {
            setTransactionInProgress(true);
            const ipfsFile = await ipfs.add(buffer);
            console.log('ipfsFile', ipfsFile);

            const hash = ipfsFile.path;

            await contract.uploadImage(hash, 'Nervos coding tips', account);
            toast('Image uploaded successfully to Nervos network 😇 ', { type: 'success' });
            await getImages();
        } catch (error) {
            console.log('IPFS err:', error);
            toast.error(
                'There was an error sending your transaction. Please check developer console. 😠 '
            );
        } finally {
            setTransactionInProgress(false);
        }
    };

    // const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    const getImages = async () => {
        try {
            setLoading(true);
            const _images = [];
            const imageCount = Number(await contract.getImageCount(account));

            for (let i = 1; i <= imageCount; i++) {
                const image = await contract.getImage(i, account);
                _images.push(image);
            }

            setImages(_images);

            // console.log('image', image);
            setLoading(false);
        } catch (error) {
            toast.error('There is an error loading images. Please check developer console. 😠 ');
            setLoading(false);
        }
    };

    const getL2DepositAddress = async () => {
        const addressTranslator = new AddressTranslator();
        const depositAddress = await addressTranslator.getLayer2DepositAddress(web3, accounts?.[0]);

        setL2DepositAddress(depositAddress.addressString);
        console.log(`Layer 2 Deposit Address on Layer 1: \n${depositAddress.addressString}`);
    };

    const getL2Balance = async () => {
        console.log(`Using Ethereum address: ${accounts?.[0]}`);

        const _contract = new web3.eth.Contract(
            CompiledContractArtifact.abi as any,
            SUDT_PROXY_CONTRACT_ADDRESS
        );

        const balance = await _contract.methods.balanceOf(polyjuiceAddress).call({
            from: accounts?.[0]
        });

        setBalanceOf(balance);
        console.log('BALANCE::', balance);
    };

    const LoadingIndicator = () => (
        <div>
            {' '}
            <span className="rotating-icon">⚙️</span>
            <span>Images loading...</span>
        </div>
    );
    return (
        <div>
            <NavBar
                ethereumAddress={accounts?.[0] || '-'}
                polyjuiceAddress={polyjuiceAddress || ' - '}
                l2Balance={balanceOf}
                ckb={l2Balance}
            />
            <div className="app">
                <ForceBridgeModal l2Address={l2DepositAddress} onGetAddress={getL2DepositAddress} />

                <hr />
                <UploadImage images={uploadedImage} onChange={onCaptureFile} />
                <button className="btn-upload mt-1 mb-1" onClick={uploadImage}>
                    Share image to Nervos Network 🚀
                </button>
                {loading && <LoadingIndicator />}

                {!loading && <Show images={images} />}
            </div>

            <ToastContainer />
        </div>
    );
}
