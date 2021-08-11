import React from 'react';
import '../styles/show.scss';
interface Props {
    images: any[];
}

function Show(props: Props) {
    const { images } = props;
    // const imageSrc = `https://ipfs.io/ipfs/${image.hash}`;

    const getImgSrc = (hash: string) => {
        return `https://ipfs.io/ipfs/${hash}`;
    };
    return (
        <>
            {images.map(img => {
                return (
                    <div className="show-images" key={img[1]}>
                        <div>
                            <span>
                                <h4>Author:</h4>
                            </span>
                            {img[4]}
                        </div>
                        <hr />
                        <img alt="nervos" src={getImgSrc(img[1])} />
                    </div>
                );
            })}
        </>
    );
}

export default Show;
