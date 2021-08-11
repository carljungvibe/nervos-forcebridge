import React from 'react';
import '../styles/navbar.scss';

interface Props {
    ethereumAddress?: string;
    polyjuiceAddress?: string;
    l2Balance?: any;
    ckb?: bigint;
}

// const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

function NavBar(props: Props) {
    const { ethereumAddress, polyjuiceAddress, ckb } = props;

    return (
        <div className="navbar mb-1">
            <div className="nav-header">
                <h2>Nervos-IPFS Images</h2>
            </div>
            <div className="nav-balance">
                <strong>L2 Balance:</strong>
                <div>
                    {' '}
                    <small style={{ backgroundColor: 'yellow' }}>
                        <strong>CKB:</strong>
                    </small>{' '}
                    {ckb ? (ckb / 10n ** 8n).toString() : '-'}
                </div>

                {/* CKB: {ckb} */}
                <div>
                    <small style={{ backgroundColor: 'orange' }}>
                        {' '}
                        <strong>SUDT:</strong>
                    </small>{' '}
                    {props.l2Balance}
                </div>

                <button>Refresh</button>
            </div>
            <div className="nav-accounts">
                <h4>ETH:</h4> {ethereumAddress}
                <h4>PolyJuice:</h4> {polyjuiceAddress}
            </div>
        </div>
    );
}

export default NavBar;
