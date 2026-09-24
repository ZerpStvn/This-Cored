import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

export function QrPanel() {
  return (
    <div className="hidden w-64 shrink-0 flex-col items-center justify-center gap-4 border-l border-white/10 px-8 py-10 text-center sm:flex">
      <div className="relative rounded-xl bg-white p-3">
        <QRCodeSVG
          value="https://thiscored.app"
          size={168}
          level="H"
          fgColor="#0b0d12"
          bgColor="#ffffff"
        />
        <div className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-indigo-500 p-1.5 ring-4 ring-white">
          <Image
            src="/mainlogo.png"
            alt="This Cored"
            width={32}
            height={32}
            className="size-full object-contain"
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-white">Log in with QR Code</h2>
        <p className="mt-1 text-xs text-white/50">
          Scan to open This Cored on your phone.
        </p>
      </div>

      <span className="text-xs text-white/30">Or sign in with a passkey</span>
    </div>
  );
}
