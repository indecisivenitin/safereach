import { useRef, useState, useCallback } from 'react';

import Webcam from 'react-webcam';

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user',
};

export default function WebcamCapture({
  onCapture,
}) {

  const webcamRef = useRef(null);

  const [preview, setPreview] =
    useState(null);

  const [cameraOn, setCameraOn] =
    useState(false);

  // =========================
  // Capture image
  // =========================
  const captureImage = useCallback(
    async () => {

      const imageSrc =
        webcamRef.current?.getScreenshot();

      if (!imageSrc) return;

      setPreview(imageSrc);

      // Convert base64 → blob
      const blob = await fetch(
        imageSrc
      ).then((res) => res.blob());

      // Blob → File
      const file = new File(
        [blob],
        'selfie.jpg',
        {
          type: 'image/jpeg',
        }
      );

      onCapture(file);

      setCameraOn(false);
    },
    [onCapture]
  );

  // =========================
  // Retake image
  // =========================
  const retakePhoto = () => {
    setPreview(null);

    onCapture(null);

    setCameraOn(true);
  };

  return (
    <div className="space-y-4">

      {/* Camera OFF */}
      {!cameraOn && !preview && (

        <button
          type="button"

          onClick={() =>
            setCameraOn(true)
          }

          className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition"
        >
          📷 Open Camera
        </button>
      )}

      {/* Camera ON */}
      {cameraOn && !preview && (

        <div className="space-y-3">

          <Webcam
            ref={webcamRef}

            audio={false}

            screenshotFormat="image/jpeg"

            videoConstraints={
              videoConstraints
            }

            className="w-full rounded-2xl border"
          />

          <button
            type="button"

            onClick={captureImage}

            className="w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
          >
            📸 Capture Selfie
          </button>

        </div>
      )}

      {/* Preview */}
      {preview && (

        <div className="space-y-3">

          <img
            src={preview}
            alt="Captured selfie"
            className="w-full rounded-2xl border"
          />

          <button
            type="button"

            onClick={retakePhoto}

            className="w-full py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-900 transition"
          >
            🔄 Retake Photo
          </button>

        </div>
      )}
    </div>
  );
}