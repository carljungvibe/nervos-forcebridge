import React from 'react';
import ImageUploading from 'react-images-uploading';

interface Props {
    onChange: (imageList: any) => void;
    images: any[];
}

function UploadImage(props: Props) {
    // const [images, setImages] = React.useState([]);
    const maxNumber = 69;

    return (
        <ImageUploading
            multiple
            value={props.images}
            onChange={props.onChange}
            maxNumber={maxNumber}
            dataURLKey="data_url"
        >
            {({
                imageList,
                onImageUpload,

                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps
            }) => (
                // write your building UI
                <div className="upload__image-wrapper">
                    <button
                        style={isDragging ? { color: 'red' } : undefined}
                        onClick={onImageUpload}
                        {...dragProps}
                    >
                        Click or Drop here
                    </button>
                    &nbsp;
                    {imageList.map((image, index) => (
                        <div key={index} className="image-item">
                            <img src={image.data_url} alt="" width="100" />
                            <div className="image-item__btn-wrapper">
                                <button onClick={() => onImageUpdate(index)}>Update</button>
                                <button onClick={() => onImageRemove(index)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ImageUploading>
    );
}

export default UploadImage;
