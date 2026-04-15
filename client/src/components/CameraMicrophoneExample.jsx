import React, { useRef, useEffect, useState } from "react";
import {
  getMediaStream,
  stopMediaStream,
  checkMediaDevicesAvailable,
  getAvailableDevices,
} from "../utils/mediaAccess";

/**
 * Example component showing how to use camera and microphone
 */
const CameraMicrophoneExample = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState({ cameras: [], microphones: [] });

  // Initialize and get available devices
  useEffect(() => {
    const initializeDevices = async () => {
      const availableDevices = await getAvailableDevices();
      setDevices(availableDevices);
    };

    initializeDevices();
  }, []);

  // Start camera and microphone
  const handleStartCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if devices are available
      const { hasCamera, hasMicrophone } = await checkMediaDevicesAvailable();

      if (!hasCamera) {
        throw new Error("No camera device found");
      }
      if (!hasMicrophone) {
        throw new Error("No microphone device found");
      }

      // Get media stream
      const mediaStream = await getMediaStream();
      setStream(mediaStream);

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop camera and microphone
  const handleStopCamera = () => {
    if (stream) {
      stopMediaStream(stream);
      setStream(null);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Camera & Microphone Access</h2>

      {/* Video Preview */}
      <div className="mb-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full bg-black rounded-lg"
          style={{ maxWidth: "600px" }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Available Devices */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Available Devices:</h3>
        <p className="text-sm">Cameras: {devices.cameras.length}</p>
        <p className="text-sm">Microphones: {devices.microphones.length}</p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleStartCamera}
          disabled={isLoading || !!stream}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Starting..." : "Start Camera"}
        </button>

        <button
          onClick={handleStopCamera}
          disabled={!stream}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400"
        >
          Stop Camera
        </button>
      </div>

      {/* Stream Status */}
      <p className="mt-4 text-sm text-gray-600">
        Status: {stream ? "✅ Active" : "⭕ Inactive"}
      </p>
    </div>
  );
};

export default CameraMicrophoneExample;
