import { useEffect, useRef } from 'react';

const SnapshotModal = props => {
    const modalRef = useRef();

    useEffect(() => {
        const clickOutsideContent = (e) => {
            if (e.target === modalRef.current) {
                props.setShow(false);
            }
        };
        window.addEventListener('click', clickOutsideContent);
        return () => {
            window.removeEventListener('click', clickOutsideContent);
        };
    }, [props]);

    return <div ref={modalRef} style={{position: 'absolute', zIndex: 10000, backgroundColor: "white", padding: "300px", width: "100%", height: "100%", opacity: '0.9'}}>
        <div className="modal__content">
            <p>Hellos</p>
        </div>
    </div>;
};

export default SnapshotModal;


export const ModalBody = props => {
    return <div className="modal__body">
        {props.children}
    </div>
}
