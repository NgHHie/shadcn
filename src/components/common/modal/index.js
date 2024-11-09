import { Modal } from "antd";
import Login from "../login/Login";
import { TYPE_MODAL } from "../../../config/data";
import Register from "../register";
import { useEffect, useState } from "react";
import Information from "../infomation";

export default function CommonModal({typeModal,stateApp, onClose}) {
    const [modalType,setModalType] = useState("")

    useEffect(() => {
        setModalType(typeModal)

    },[stateApp?.change])
    return (
        <Modal
            open={stateApp?.showLogin}
            onCancel={onClose}
            footer={[]}
            className="common-modal"
        >
              {
            modalType === TYPE_MODAL.LOGIN ? (
                <Login onTypeModal={setModalType} onClose={onClose}></Login>
            ) : modalType === TYPE_MODAL.REGISTER ? (
                <Register onClose={onClose}></Register>
            ) : modalType === TYPE_MODAL.INFOMATION ? (
                <Information onClose={onClose}></Information>
            ) : null
        }
        </Modal>
    );
}
