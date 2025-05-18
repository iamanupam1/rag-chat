/**
 * API service for handling PDF interactions
 * This file contains functions to communicate with the backend API endpoints
 */

// Define the response type for chat API responses
export type ChatResponse = {
  response: string;
  matched_chunks: any[];
};

// Define the response type for PDF upload responses
export type UploadResponse = {
  message: string;
  chunks: number;
};

const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Uploads a PDF file to the server
 * @param file - The PDF file to upload
 * @returns Promise with upload response
 */
export const uploadPdf = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file); 

    const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error uploading PDF: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

/**
 * Sends a message to chat with the PDF
 * @param query - The user's query/question about the PDF
 * @returns Promise with chat response
 */
export const chatWithPdf = async (query: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat-with-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Error chatting with PDF: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error chatting with PDF:', error);
    throw error;
  }
};