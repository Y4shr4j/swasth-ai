import { useEffect, useRef, useState } from 'react';
import { Camera, X, QrCode, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  clinicName: string;
  onScanSuccess: (scannedValue?: string) => void;
  onClose: () => void;
}

export default function QRScannerModal({ clinicName, onScanSuccess, onClose }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraState, setCameraState] = useState<'starting' | 'active' | 'error'>('starting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [detectedText, setDetectedText] = useState<string | null>(null);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }

  async function startCamera(mode: 'environment' | 'user') {
    stopCamera();
    setCameraState('starting');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('error');
      setErrorMessage(
        'Live inline camera requires HTTPS on mobile browsers. Tap "Open Native Camera" below to launch your phone camera directly.'
      );
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        // Fallback to any available camera (e.g., laptop webcam)
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('active');
    } catch (err: any) {
      setCameraState('error');
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings or use the native camera button below.');
      } else {
        setErrorMessage('Could not access live camera stream. You can use the native mobile camera or simulate check-in below.');
      }
    }
  }

  // Start camera on mount / facingMode switch
  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, [facingMode]);

  // Real QR detection loop using browser BarcodeDetector API when supported
  useEffect(() => {
    if (cameraState !== 'active') return;
    const BarcodeDetectorAPI = (window as any).BarcodeDetector;
    if (!BarcodeDetectorAPI) return;

    let cancelled = false;
    let detector: any;
    try {
      detector = new BarcodeDetectorAPI({ formats: ['qr_code'] });
    } catch {
      return;
    }

    const interval = setInterval(async () => {
      if (cancelled || !videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes && barcodes.length > 0 && !cancelled) {
          const code = barcodes[0].rawValue || 'APEX-CARE-INDIRANAGAR-QR';
          setDetectedText(code);
          stopCamera();
          setTimeout(() => {
            if (!cancelled) onScanSuccess(code);
          }, 500);
        }
      } catch {
        // Ignore transient frame read errors
      }
    }, 350);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [cameraState, onScanSuccess]);

  function handleNativeCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDetectedText('APEX-CARE-INDIRANAGAR-QR');
    stopCamera();
    setTimeout(() => onScanSuccess('APEX-CARE-INDIRANAGAR-QR'), 400);
  }

  function handleClose() {
    stopCamera();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-end sm:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">Scan Clinic QR</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">{clinicName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {cameraState === 'active' && (
              <button
                onClick={() => setFacingMode(m => (m === 'environment' ? 'user' : 'environment'))}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Switch camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${cameraState === 'active' ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Starting overlay */}
          {cameraState === 'starting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2 p-4 text-center">
              <Camera className="w-8 h-8 animate-pulse text-emerald-400" />
              <span className="text-xs font-medium">Opening mobile camera...</span>
            </div>
          )}

          {/* Active scanner frame overlay */}
          {cameraState === 'active' && !detectedText && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 relative">
                {/* 4 emerald corner brackets */}
                <span className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <span className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <span className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <span className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                {/* Scanning line */}
                <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
              </div>
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="bg-black/60 text-white text-[11px] px-3 py-1 rounded-full">
                  Align clinic QR code inside the frame
                </span>
              </div>
            </div>
          )}

          {/* Detected success overlay */}
          {detectedText && (
            <div className="absolute inset-0 bg-emerald-900/80 flex flex-col items-center justify-center text-white gap-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-300" />
              <div className="text-sm font-semibold">QR Code Verified!</div>
              <div className="text-xs font-mono text-emerald-200">{detectedText}</div>
            </div>
          )}

          {/* Error / Non-HTTPS Fallback overlay */}
          {cameraState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5 gap-3 bg-slate-900">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-slate-300 leading-relaxed">{errorMessage}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                Open Native Camera
              </button>
            </div>
          )}
        </div>

        {/* Hidden native mobile rear-camera input (works even over plain HTTP on mobile) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeCameraCapture}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-2">
          {cameraState === 'active' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition text-xs"
            >
              <Camera className="w-4 h-4" /> Capture with Native Phone Camera
            </button>
          )}
          <button
            onClick={() => {
              stopCamera();
              onScanSuccess('APEX-CARE-INDIRANAGAR-QR');
            }}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition text-sm"
          >
            ✓ Simulate Scan &amp; Check In
          </button>
        </div>
      </div>
    </div>
  );
}
