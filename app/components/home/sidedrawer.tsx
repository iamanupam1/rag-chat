'use client';
import { useEffect, useState } from 'react';
import { PlusIcon, LogInIcon, MessageSquareIcon, ChevronRightIcon, ChevronLeftIcon, FileTextIcon, SunIcon, MoonIcon, PanelLeft, PanelRight } from 'lucide-react';
import { useTheme } from 'next-themes';

type ChatHistoryItem = { id: string; title: string; date: string; };
type SideDrawerProps = {
    chatHistory: ChatHistoryItem[];
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    sidebarWidth: number;
    setSidebarWidth: (w: number) => void;
};

export default function SideDrawer({ chatHistory, onNewChat, onSelectChat, sidebarWidth, setSidebarWidth }: SideDrawerProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        setSidebarWidth(isExpanded ? expandedWidth : collapsedWidth);
    }, [isExpanded, setSidebarWidth]);

    // Sidebar widths
    const expandedWidth = 256; 
    const collapsedWidth = 72;  

    const toggleDrawer = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <aside
            className={`h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200`}
            style={{ width: isExpanded ? expandedWidth : collapsedWidth, minWidth: isExpanded ? expandedWidth : collapsedWidth }}
        >
            {/* Top Section: RagChat Title or Icon */}
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                {isExpanded && (
                    <span className="ml-2 font-bold text-lg text-gray-900 dark:text-white">DocuChat AI</span>
                )}
                <button
                    onClick={toggleDrawer}
                    className={`ml-auto p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                    {isExpanded ? (
                        <PanelLeft className="h-5 w-5 text-gray-900 dark:text-white" />
                    ) : (
                        <PanelRight className="h-5 w-5 text-gray-900 dark:text-white" />
                    )}
                </button>
            </div>

            {/* New Chat Button */}
            <button
                onClick={onNewChat}
                className={`flex items-center gap-2 mt-4 mx-2 px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200 ${isExpanded ? 'justify-start' : 'justify-center'}`}
            >
                <PlusIcon className="h-5 w-5" />
                {isExpanded && <span>New Chat</span>}
            </button>

            {/* Recent Chats Header */}
            {isExpanded && (
                <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recent Chats
                </div>
            )}

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto">
                {chatHistory.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={`flex items-center w-full py-3 ${isExpanded ? 'justify-start px-4' : 'justify-center'} hover:bg-gray-200 dark:hover:bg-gray-700 text-left transition-colors`}
                    >
                        <MessageSquareIcon className="h-5 w-5 text-blue-400 mr-2" />
                        {isExpanded && (
                            <div className="flex flex-col flex-1">
                                <span className="font-medium text-gray-900 dark:text-white truncate">{chat.title}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{chat.date}</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Bottom Section: Sign In and Dark Mode Toggle */}
            <div className="flex flex-col gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <button className={`flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
                    <LogInIcon className="h-5 w-5" />
                    {isExpanded && <span>Sign In</span>}
                </button>
            </div>
        </aside>
    );
}
