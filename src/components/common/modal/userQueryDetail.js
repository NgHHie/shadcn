import React, { useContext, useEffect, useState } from "react";
import { Modal, Tag } from "antd"; // Import Ant Design components
import { getSubmitDetail } from "../../../services/submitHistoryService";
import { GlobalContext } from "../../../globalContext";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import BotAssistant from "../Asisstant";

const UserQueryDetailModal = ({ submitId }) => {
    const [submission, setSubmission] = useState(null);
    const { appState, setAppState } = useContext(GlobalContext);
    const [loading,setLoading] = useState(false)

    const onClose = () => {
        setAppState({ ...appState, showUserQueryDetailModal: false })
    }
    // Fetch submission details
    useEffect(() => {
        if (submitId) {
            setLoading(true)
            getSubmitDetail(submitId)
                .then((response) => {
                    setSubmission(response);
                })
                .catch(err => {

                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            setSubmission(null)
            setLoading(false)
        }

    }, [submitId]);

    return (
        <Modal
            title="Chi tiết submit"
            visible={appState?.showUserQueryDetailModal} // Controlled visibility
            onCancel={onClose} // Close handler
            footer={null}
            width={800} // Adjust modal width
        >
            {/* Title Row */}
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        Status:{" "}
                        {submission?.status === "AC" ? (
                            <Tag color="green">Accepted</Tag>
                        ) : submission?.status === "WA" ? (
                            <Tag color="red">Wrong Answer</Tag>
                        ) : submission?.status === "TLE" ? (
                            <Tag color="orange">Time Limit Exceeded</Tag>
                        ) : (
                            <Tag color="blue">Compile Error</Tag>
                        )}
                    </div>
                    <div>Database: {submission?.database?.name || "Loading..."}</div>
                </div>
            </div>

            {/* SQL Query Display */}
            <div className="rounded-lg overflow-hidden shadow-sm">
                <SyntaxHighlighter language="sql" style={darcula} className='rounded-md'>
                    {submission?.querySub || "Loading..."}
                </SyntaxHighlighter>
            </div>

            {
                submission && !loading && (
                    <div className="mb-3">
                        <BotAssistant submitId={submitId} evaluateContent={submission?.evaluate}></BotAssistant>
                    </div>
                )
            }


        </Modal>
    );
};

export default UserQueryDetailModal;
