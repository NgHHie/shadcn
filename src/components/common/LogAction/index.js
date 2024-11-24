import React, { useEffect } from "react";
import { sendLogTracker } from "../../../services/userTrackerService";

const UserActionTracker = ({contestId}) => {

    const sendLog = (data) => {
        sendLogTracker(data)
         .then(response => {

         })
    }

    const handlePasteFallback = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            return clipboardText
        } catch (error) {
            return "không thể lấy nội dung paste"
        }
    };

    
    useEffect(() => {
        // External Link Click Tracker
        const handleClick = (event) => {
            const target = event.target.closest("a");
            if (target && !target.href.includes(window.location.origin)) {
                const data = {
                    actionType: "EXTERNAL_LINK_CLICK",
                    detail: `Click vào url: ${target.href}`,
                    contestId: contestId
                }
                sendLog(data)
            }
        };

        // Search Navigation Tracker
        const handleVisibilityChange = () => {
            const referrer = document.referrer;

            if (document.visibilityState === "hidden") {
                const data = {
                    actionType: "TAB_SWITCH",
                    detail: `Mở hoặc chuyển sang tab khác ${referrer ? referrer : ''}`,
                    contestId: contestId
                }
                sendLog(data)
            } else if (document.visibilityState === "visible") {
                const data = {
                    actionType: "TAB_RETURN",
                    detail: `Quay trở lại tab làm bài ${referrer ? referrer : ''}`,
                    contestId: contestId
                }
                sendLog(data)
            }
        };

        const handleKeyCombination = async (event) => {
            // Check for Ctrl+C (Copy)
            if (event.ctrlKey && event.key === 'c') {
                const selectedText = window.getSelection().toString();
                const data = {
                    actionType: "COPY",
                    detail: `Người dùng sao chép: "${selectedText}"`,
                    contestId: contestId
                };
                sendLog(data);
            }

            // Check for Ctrl+V (Paste)
            if (event.ctrlKey && event.key === 'v') {
                const message = await handlePasteFallback()
                const data = {
                    actionType: "PASTE",
                    detail: `Người dùng dán: "${message}"`,
                    contestId: contestId
                };
                sendLog(data);
            }
        };



        document.addEventListener("click", handleClick);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("keydown", handleKeyCombination);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("keydown", handleKeyCombination);
        };
    }, []);

    return null;
};

export default UserActionTracker;
