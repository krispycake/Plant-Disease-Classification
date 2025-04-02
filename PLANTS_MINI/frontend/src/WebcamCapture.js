import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel, 
  Typography, 
  makeStyles 
} from '@material-ui/core';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import VideocamIcon from '@material-ui/icons/Videocam';

const useStyles = makeStyles((theme) => ({
  cameraContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  videoElement: {
    width: '100%',
    borderRadius: '8px',
    maxHeight: '400px',
    marginBottom: '10px',
  },
  canvasHidden: {
    display: 'none',
  },
  cameraButton: {
    backgroundColor: '#e6e07e',
    margin: '10px 0',
    '&:hover': {
      backgroundColor: '#c9c462',
    },
  },
  captureButton: {
    backgroundColor: '#ff5d00',
    color: 'white',
    margin: '10px 0',
    '&:hover': {
      backgroundColor: '#d64d00',
    },
  },
  cameraSelect: {
    minWidth: 200,
    marginBottom: '15px',
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    gap: '10px',
    marginTop: '10px',
  },
  instructionsText: {
    marginTop: '10px',
    fontStyle: 'italic',
  },
  errorText: {
    color: theme.palette.error.main,
    marginTop: '10px',
  },
}));

const WebcamCapture = ({ onCapture, translations }) => {
  const classes = useStyles();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [error, setError] = useState(null);
  
  // Refs for camera and canvas
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Get translated strings or use defaults
  const t = translations || {};
  
  // Fetch available camera devices
  const getCameraDevices = async () => {
    try {
      // Request permission first to ensure we can access devices
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available camera devices:', videoDevices);
      setCameraDevices(videoDevices);
      
      // Auto-select first camera if available
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (err) {
      console.error('Error accessing camera devices:', err);
      setError(t.cameraPermissionDenied || 'Camera permission denied. Please check browser settings.');
      return [];
    }
  };

  // Handle camera selection change
  const handleCameraChange = async (event) => {
    const newCameraId = event.target.value;
    setSelectedCamera(newCameraId);
    
    // Restart camera with new device if active
    if (cameraActive) {
      await stopCamera();
      startCamera(newCameraId);
    }
  };

  // Start camera
  const startCamera = async (deviceId = selectedCamera) => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Stop any existing stream first
        await stopCamera();
        
        // Set constraints based on selected device
        let constraints = {
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        // If we have a specific device selected, use it
        if (deviceId) {
          constraints.video.deviceId = { exact: deviceId };
        } else {
          // Otherwise prefer back camera on mobile
          constraints.video.facingMode = 'environment';
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setCameraActive(true);
            setError(null);
          };
        }
      } else {
        setError(t.cameraNotSupported || 'Camera not supported on this device or browser');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError') {
        setError(t.cameraPermissionDenied || 'Camera access denied. Please check permissions.');
      } else if (err.name === 'NotFoundError') {
        setError(t.cameraNotFound || 'Selected camera not found or not available.');
      } else {
        setError(t.cameraAccessError || 'Error accessing the camera: ' + err.message);
      }
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = async () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setCameraActive(false);
      return true;
    }
    return false;
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Create a preprocessed version at 256x256
      const preprocessedCanvas = document.createElement('canvas');
      preprocessedCanvas.width = 256;
      preprocessedCanvas.height = 256;
      const preprocessedCtx = preprocessedCanvas.getContext('2d');
      
      // Draw and resize the image to 256x256
      preprocessedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 256, 256);
      
      // Convert to blob and create a File object
      preprocessedCanvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          
          // Send the file and preview URL to the parent component
          const objectUrl = URL.createObjectURL(blob);
          onCapture(file, objectUrl);
          
          // Stop the camera after capturing
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  // Initialize component - get cameras when component mounts
  useEffect(() => {
    getCameraDevices();
    
    // Clean up camera resources when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={classes.cameraContainer}>
      {/* Video element for camera stream */}
      <video 
        ref={videoRef} 
        className={classes.videoElement}
        autoPlay
        playsInline
      />
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className={classes.canvasHidden} />
      
      {/* Camera selection dropdown */}
      {cameraDevices.length > 0 && (
        <FormControl variant="outlined" className={classes.cameraSelect}>
          <InputLabel id="camera-select-label">
            {t.selectCamera || "Select Camera"}
          </InputLabel>
          <Select
            labelId="camera-select-label"
            value={selectedCamera}
            onChange={handleCameraChange}
            label={t.selectCamera || "Select Camera"}
            disabled={cameraActive}
          >
            {cameraDevices.map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${cameraDevices.indexOf(device) + 1}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      {/* Camera controls */}
      <div className={classes.buttonContainer}>
        {!cameraActive ? (
          <Button
            variant="contained"
            className={classes.cameraButton}
            onClick={() => startCamera()}
            startIcon={<VideocamIcon />}
            fullWidth
            disabled={cameraDevices.length === 0}
          >
            {t.startCamera || "Start Camera"}
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              className={classes.captureButton}
              onClick={captureImage}
              startIcon={<CameraAltIcon />}
              fullWidth
            >
              {t.captureImage || "Take Photo"}
            </Button>
            
            <Button
              variant="outlined"
              onClick={stopCamera}
              fullWidth
            >
              {t.stopCamera || "Stop Camera"}
            </Button>
          </>
        )}
      </div>
      
      {/* Instructions */}
      <Typography variant="caption" className={classes.instructionsText}>
        {t.cameraInstructions || "Position the leaf in the center of the frame for best results"}
      </Typography>
      
      {/* Error messages */}
      {error && (
        <Typography variant="body2" className={classes.errorText}>
          {error}
        </Typography>
      )}
      
      {/* Refresh camera list button */}
      {!cameraActive && (
        <Button 
          size="small" 
          onClick={getCameraDevices} 
          style={{ marginTop: '10px' }}
        >
          {t.refreshCameraList || "Refresh Camera List"}
        </Button>
      )}
    </div>
  );
};

export default WebcamCapture;