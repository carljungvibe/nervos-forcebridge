import Web3 from 'web3';
import * as InstagramJSON from '../../../build/contracts/Instagram.json';
import { Instagram } from '../../types/Instagram';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

const CONTRACT_ADDRESS = '0x8C16d0FbC8b93aDeBab83E1528909efB761A733c';
export class InstagramWrapper {
    web3: Web3;

    contract: Instagram;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.address = CONTRACT_ADDRESS;
        this.contract = new web3.eth.Contract(InstagramJSON.abi as any) as any;
        this.contract.options.address = CONTRACT_ADDRESS;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getImage(imgId: number, fromAddress: string) {
        const img = await this.contract.methods.getImage(imgId).call({ from: fromAddress });
        return img;
    }

    async getImageCount(fromAddress: string) {
        const img = await this.contract.methods.imageCount().call({ from: fromAddress });
        return img;
    }

    async tipImgOwner(imgId: number, fromAddress: string) {
        const tx = await this.contract.methods.tipImageOwner(imgId).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }

    async uploadImage(imgHash: string, description: string, fromAddress: string) {
        const tx = await this.contract.methods.uploadImage(imgHash, description).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }
    // async getStoredValue(fromAddress: string) {
    //     const data = await this.contract.methods.get().call({ from: fromAddress });

    //     return parseInt(data, 10);
    // }

    // async setStoredValue(value: number, fromAddress: string) {
    //     const tx = await this.contract.methods.set(value).send({
    //         ...DEFAULT_SEND_OPTIONS,
    //         from: fromAddress,
    //         value
    //     });

    //     return tx;
    // }

    async deploy(fromAddress: string) {
        const deployTx = await (this.contract
            .deploy({
                data: InstagramJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            } as any) as any);

        this.useDeployed(deployTx.contractAddress);

        return deployTx.transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
