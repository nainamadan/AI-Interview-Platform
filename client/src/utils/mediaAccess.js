/**
 * Get access to user's camera and microphone
 * @param {Object} constraints - MediaStreamConstraints
 * @returns {Promise<MediaStream>} - Media stream from camera and microphone
 */
export const getMediaStream = async (
  constraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  }
) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("Media stream accessed successfully");
    return stream;
  } catch (error) {
    console.error("Error accessing media devices:", error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Stop all media tracks in a stream
 * @param {MediaStream} stream - The media stream to stop
 */
export const stopMediaStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    console.log("Media stream stopped");
  }
};

/**
 * Check if media devices are available
 * @returns {Promise<boolean>}
 */
export const checkMediaDevicesAvailable = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasCamera = devices.some((device) => device.kind === "videoinput");
    const hasMicrophone = devices.some((device) => device.kind === "audioinput");
    return { hasCamera, hasMicrophone };
  } catch (error) {
    console.error("Error checking media devices:", error);
    return { hasCamera: false, hasMicrophone: false };
  }
};

/**
 * Get list of available input devices
 * @returns {Promise<{cameras: Array, microphones: Array}>}
 */
export const getAvailableDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const microphones = devices.filter((device) => device.kind === "audioinput");
    return { cameras, microphones };
  } catch (error) {
    console.error("Error getting devices:", error);
    return { cameras: [], microphones: [] };
  }
};

/**
 * Get media stream with specific device IDs
 * @param {string} videoDeviceId - Video device ID
 * @param {string} audioDeviceId - Audio device ID
 * @returns {Promise<MediaStream>}
 */
export const getMediaStreamWithDevices = async (videoDeviceId, audioDeviceId) => {
  const constraints = {
    video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
    audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
  };

  return getMediaStream(constraints);
};

/**
 * Helper function to get user-friendly error messages
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
const getErrorMessage = (error) => {
  if (error.name === "NotAllowedError") {
    return "Camera and microphone access was denied. Please check your browser permissions.";
  } else if (error.name === "NotFoundError") {
    return "No camera or microphone found on this device.";
  } else if (error.name === "NotReadableError") {
    return "Camera or microphone is already in use by another application.";
  } else if (error.name === "SecurityError") {
    return "Camera and microphone access is not allowed from insecure contexts.";
  }
  return `Error accessing media: ${error.message}`;
};

/**
 * Hook-like function to request permissions and get stream
 * @param {Function} onSuccess - Callback when stream is obtained
 * @param {Function} onError - Callback on error
 * @param {Object} constraints - Media constraints
 */
export const requestMediaPermissions = async (
  onSuccess,
  onError,
  constraints
) => {
  try {
    const stream = await getMediaStream(constraints);
    onSuccess && onSuccess(stream);
    return stream;
  } catch (error) {
    onError && onError(error);
    throw error;
  }
};
