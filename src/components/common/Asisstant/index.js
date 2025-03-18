import React, { useEffect, useState } from "react";
import { Button, message, Spin, Tooltip } from "antd"; // Ant Design components
import { getEvaluate } from "../../../services/evaluateService";
import { updateEvaluate } from "../../../services/submitHistoryService";
import { InfoCircleOutlined } from "@ant-design/icons";

// Bot image URLs
const botImages = [
    "/assets/bot1.png",
    "/assets/bot2.png",
    "/assets/bot3.png",
    "/assets/bot4.png",
    "/assets/bot5.png",
];


const BotAssistant = ({ submitId, evaluateContent }) => {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(""); // Final content
    const [botIndex, setBotIndex] = useState(0); // Current bot image index

    useEffect(() => {
        if (submitId) {
            setLoading(false)
            setBotIndex(0)
            if (evaluateContent) {
                setContent(evaluateContent)
            } else {
                setContent(null)
            }
        } else {
            setLoading(false)
            setBotIndex(0)
            setContent(null)
        }
    }, [submitId])

    // Simulate content generation with bot face animation
    const handleEvaluate = () => {
        setLoading(true);
        setContent("");
        setBotIndex(0); // Reset bot face index

        const botAnimation = setInterval(() => {
            setBotIndex((prev) => (prev + 1) % botImages.length);
        }, 500);

        getEvaluate(submitId)
            .then(response => {
                setContent(response?.content)
                const payload = {
                    "submitId": submitId,
                    "evaluate": response?.content
                }
                updateEvaluate(payload)
                    .then(res => {

                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
            .catch(err => {
                message?.error(err?.response?.data?.description)
            })
            .finally(() => {
                setLoading(false);
                clearInterval(botAnimation);
            })
    };

    return (
        <div className="text-center">
            {/* Bot Image */}
            <div className="flex justify-center mb-4">
                <img
                    src={content ? botImages[0] : botImages[botIndex]} // Show bot1 after content
                    alt="Bot Assistant"
                    width="70" // Smaller size
                    height="70"
                    className={`transition-all duration-500 ease-in-out ${loading ? "animate-bounce" : ""
                        }`}
                />
            </div>

            {/* Evaluate Button */}
            {!loading && !content && (
                <div className="relative inline-block">
                    <button
                        onClick={handleEvaluate}
                        className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg 
          transform transition-transform duration-300 ease-in-out hover:scale-105 animate-pulse`}
                    >
                        🚀 Đánh giá kết quả
                    </button>
                    
                    {/* Trial Feature Note */}
                    <div className="absolute top-full mt-1 w-full text-xs text-gray-500">
                        Tính năng <span className="font-semibold text-red-500">đang phát triển</span>.
                        <Tooltip
                        title="LearnSQL AI hỗ trợ phân tích sql submit, đưa ra đánh giá, tối ưu sql, phát hiện lỗi sai và gợi ý hướng giải quyết"
                        placement="topLeft" // Tooltip position (adjust as needed)
                    >
                        <InfoCircleOutlined
                            className="ml-1 mt-1 cursor-pointer text-blue-500"
                            style={{ fontSize: '14px' }} // Adjust size if necessary
                        />
                    </Tooltip>
                    </div>
                </div>
            )}

            {/* Typing Animation While Loading */}
            {loading && (
                <div className="mb-4">
                    <div className="flex justify-center items-center space-x-2">
                        <Spin size="small" />
                        <p className="text-gray-500 text-sm font-medium">
                            Đang xử lý <span className="dot-typing">...</span>
                        </p>
                    </div>
                </div>
            )}

            {content && (
                <div className="flex justify-center mt-4">
                    <pre
                        className="bg-gray-900 text-white text-left p-4 rounded-md shadow-lg max-w-3xl whitespace-pre-wrap leading-relaxed"
                        style={{
                            fontFamily: "Fira Code, monospace",
                            fontSize: "14px",
                            backgroundColor: "#282a36", // Dracula background
                            color: "#f8f8f2", // Dracula foreground
                            border: "1px solid #44475a", // Border
                        }}
                    >
                        {content}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default BotAssistant;
