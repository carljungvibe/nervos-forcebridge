import React, { useState } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

interface Props {
    l2Address?: string;
    onGetAddress: () => void;
}
const FORCE_BRIDGE_URL =
    'https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000';
const ForceBridgeModal = (props: Props) => {
    const [open, setOpen] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);

    const redirectToBridge = () => {
        window.open(
            FORCE_BRIDGE_URL,
            '_blank' // <- This is what makes it open in a new window.
        );
        // window.location.href = ;
    };
    return (
        <div className="fb-modal mt-1 mb-1">
            <button onClick={onOpenModal}>Force Bridge 💰 </button>
            <Modal open={open} onClose={onCloseModal} center>
                <h2>Ethereum Assets Via Force Bridge</h2>

                {!props.l2Address && (
                    <div>
                        <small>
                            Get your Layer 2 Deposit Address and deposit via Force Bridge{' '}
                        </small>
                        <p>Click the button below to get your Layer2 Deposit Address</p>
                        <button onClick={props.onGetAddress}>
                            Get My Layer2 Deposit Address 📚{' '}
                        </button>
                    </div>
                )}
                {props.l2Address && (
                    <div>
                        <small className=" mt-1 mb-1">
                            Copy the address and go to Force Bridge
                        </small>
                        <div className="l2-address mt-1 mb-1">{props.l2Address}</div>
                        <button onClick={redirectToBridge} className="btn-fb">
                            Go to Force Bridge 🤑
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ForceBridgeModal;
