"use client";

import React from "react";

import "@react-pdf-viewer/core/lib/styles/index.css";

import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Viewer, Worker } from "@react-pdf-viewer/core";

interface PdfViewerProps {
  url?: string;
}

const PdfViewerComponent: React.FC<PdfViewerProps> = ({ url = "" }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  if (!url) {
    return <p>Not a valid PDF</p>;
  }

  return (
    <div style={{height:"100%", width:"100%"}}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  );
};

export default  PdfViewerComponent