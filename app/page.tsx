'use client';
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import {
  MessageCircle,
  SendIcon,
  Upload,
} from 'lucide-react';
import SideDrawer from './components/home/sidedrawer';
import PdfViewerComponent from './components/home/pdf-viewer';
import { chatWithPdf, uploadPdf } from '@/api/pdf';
import { toast, ToastContainer } from 'react-toastify';
import Markdown from 'markdown-to-jsx'

type Message = {
  role: 'system' | 'user';
  content: string;
};

type ChatHistoryItem = {
  id: string;
  title: string;
  date: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [documentOverview, setDocumentOverview] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: 'default', title: 'New Conversation', date: new Date().toLocaleDateString() },
    { id: 'chat1', title: 'Research Paper Analysis', date: '5/16/2025' },
    { id: 'chat2', title: 'Annual Report Review', date: '5/15/2025' },
    { id: 'chat3', title: 'Contract Review', date: '5/14/2025' },
  ]);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [pdfFile]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Updated handleFileUpload to store overview from API response
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        // Create URL for PDF viewer
        const url = URL.createObjectURL(file);
        setPdfFile(url);
        setPdfLoading(true);

        // Call the upload API and handle the response
        const response = await uploadPdf(file);
        setPdfUploaded(true);

        // Store the overview and suggestions from the API response
        setDocumentOverview(response.overview);
        setSuggestedQuestions(response.suggestion || []);

        setPdfLoading(false);
        toast.success("PDF Uploaded Successfully")
      } catch (error) {
        console.error('Error uploading PDF:', error);
        toast.error("There was an error uploading your PDF. Please try again.")
      } finally {
        setPdfLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Handle sending a message with API integration
  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    // Don't allow sending messages if PDF isn't uploaded yet
    if (!pdfUploaded) {
      setMessages([
        ...messages,
        { role: 'system', content: 'Please upload a PDF first so I can provide relevant answers to your questions.' }
      ]);
      return;
    }

    const newMessages = [
      ...messages,
      { role: 'user', content: messageText },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Send query to backend API
      const response = await chatWithPdf(messageText);

      // Add the AI response to messages
      setMessages([
        ...newMessages,
        { role: 'system', content: response.response }
      ]);
    } catch (error) {
      console.error('Error chatting with PDF:', error);
      setMessages([
        ...newMessages,
        { role: 'system', content: 'Sorry, there was an error processing your question. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key in input
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle creating a new chat
  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setChatHistory([
      {
        id: newChatId,
        title: 'New Conversation',
        date: new Date().toLocaleDateString()
      },
      ...chatHistory
    ]);
    setCurrentChatId(newChatId);
    setMessages([
      {
        role: 'system',
        content: 'Hello! Upload a PDF and I can help you understand it better.',
      },
    ]);
    setPdfFile(null);
    setPdfUploaded(false);
    setSuggestedQuestions([]);
    setDocumentOverview('');
  };

  // Handle selecting a chat from history
  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    setMessages([
      {
        role: 'system',
        content: `This is chat ${id}. Upload a PDF or continue your conversation.`,
      },
    ]);
  };

  const renderDocumentOverview = () => {
    if (!documentOverview) return null;
    return <div className='mb-8 dark:text-white'><Markdown>{documentOverview}</Markdown></div>
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="application/pdf"
      onChange={handleFileUpload}
      className="hidden"
    />
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 relative">
        {/* Side Drawer */}
        <SideDrawer
          chatHistory={chatHistory}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          sidebarWidth={sidebarWidth}
          setSidebarWidth={setSidebarWidth}
        />

        {/* Main content area - Always present */}
        <main className="flex-grow flex">
          {fileInput}
          <div className="flex w-full">
            {/* If no PDF, show upload area */}
            {!pdfFile || pdfLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="max-w-lg w-full mx-auto flex flex-col items-center justify-center p-8">
                  <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold mb-2 text-blue-600 dark:text-blue-400">DocuChat AI</h1>
                    <div className="mb-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Instant document insights</span>
                    </div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">
                      Upload your PDF document and get instant answers, summaries, and insights powered by advanced retrieval-augmented AI.
                    </p>
                  </div>
                  {pdfLoading ? <div className="flex items-center justify-center z-50">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex space-x-3">
                        <div className="h-5 w-5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
                        <div
                          className="h-5 w-5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div
                          className="h-5 w-5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        ></div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">Loading PDF...</p>
                    </div>
                  </div> :
                    <div
                      className="w-full mt-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload your PDF file</div>
                      <button
                        type="button"
                        className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow transition"
                      >
                        Browse Files
                      </button>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Only PDF files supported</div>
                    </div>}
                </div>
              </div>
            ) : (
              // After PDF is uploaded: show chat + PDF viewer layout
              <>
                {/* Left column - Chat */}
                <div className="w-[50%] flex flex-col border-r border-gray-200 dark:border-gray-700 max-h-[100vh] overflow-auto">
                  <h1 className="text-xl font-bold p-4 text-blue-600 dark:text-white pb-0">Chat</h1>
                  {/* Chat messages */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none'
                            }`}
                        >
                          <Markdown>{message?.content}</Markdown>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                            <div
                              className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.4s' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Empty state with document overview and suggested questions */}
                    {messages.length === 0 && suggestedQuestions.length > 0 && (
                      <div className="p-4 w-full max-w-3xl mx-auto">
                        {/* Dynamic Document Overview */}
                        {renderDocumentOverview()}

                        {/* Suggested Questions */}
                        <div className="space-y-3">
                          {suggestedQuestions.map((question, index) => (
                            <button
                              key={index}
                              onClick={() => handleSendMessage(question)}
                              className="w-full py-3 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 
                    text-gray-800 dark:text-gray-200 text-left rounded-xl transition-all duration-200
                    border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:cursor-pointer"
                            >
                              <div className="flex items-center">
                                <div className="mr-3 text-blue-600">
                                  <MessageCircle size={20} />
                                </div>
                                <div>{question}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={endOfMessagesRef} />
                  </div>
                  {/* Input area */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                    <div className="flex space-x-2">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleInputKeyDown}
                          placeholder="Ask a question about the PDF..."
                          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendMessage()}
                          disabled={loading}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-3 pl-5 bg-blue-500 hover:bg-blue-600 text-white rounded-full hover:cursor-pointer flex items-center justify-center disabled:opacity-50"
                          tabIndex={-1}
                        >
                          <SendIcon className="h-4 w-4 mr-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - PDF viewer */}
                <div className="w-[50%] flex flex-col max-h-[100vh]">
                  <h1 className="text-xl font-bold p-4 text-blue-600 dark:text-white pb-0">Attached File: </h1>
                  <div className="flex-grow overflow-auto p-4">
                    {!pdfLoading && <PdfViewerComponent url={pdfFile} />}
                  </div>
                </div>
              </>
            )}
          </div>
          <ToastContainer position='top-right' autoClose={2500} />
        </main>
      </div>
    </div>
  );
}