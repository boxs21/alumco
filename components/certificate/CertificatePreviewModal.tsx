"use client";

import { Download, Loader } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  certId: string;
  open: boolean;
  onClose: () => void;
}

export default function CertificatePreviewModal({ certId, open, onClose }: Props) {
  const [loaded, setLoaded] = useState(false);

  const previewUrl = `/api/certificate/${certId}?mode=inline`;
  const downloadUrl = `/api/certificate/${certId}`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setLoaded(false); onClose(); } }} modal>
      <DialogContent className="max-w-[92vw] w-full rounded-2xl border-[#e8e4dc] p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 py-3.5 border-b border-[#e8e4dc] flex flex-row items-center justify-between">
          <DialogTitle className="text-[15px] font-[700] text-[#15182b]">
            Vista previa del certificado
          </DialogTitle>
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#2d4a8a] text-white text-[13px] font-[600] hover:bg-[#15182b] transition-colors mr-7"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar
          </a>
        </DialogHeader>

        <div className="relative bg-[#f7f5f0]" style={{ height: "80vh" }}>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2 text-[#6b7185]">
                <Loader className="h-5 w-5 animate-spin" />
                <span className="text-[13px]">Generando certificado...</span>
              </div>
            </div>
          )}
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.2s" }}
            onLoad={() => setLoaded(true)}
            title="Certificado"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
