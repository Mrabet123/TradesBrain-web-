import { QRCodeSVG } from "qrcode.react";

/**
 * QR code for desktop visitors — scan to open the download page on the
 * phone where they'll actually install (tradespeople are mobile-first).
 * Points at the live download URL by default.
 */
export default function DownloadQR({
  url = "https://trades-brain.com/download",
}: {
  url?: string;
}) {
  return (
    <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-white p-6 shadow-[var(--shadow-card)]">
      <QRCodeSVG
        value={url}
        size={168}
        bgColor="#FFFFFF"
        fgColor="#1E3A5F"
        level="M"
        marginSize={1}
      />
      <span className="text-sm font-semibold text-navy">
        Scan to download on your phone
      </span>
    </div>
  );
}
