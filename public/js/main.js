document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const videoElement = document.getElementById('video');
    const canvasElement = document.getElementById('canvas');
    const captureButton = document.getElementById('capture-btn');
    const switchCameraButton = document.getElementById('switch-camera-btn');
    const tryAgainButton = document.getElementById('try-again-btn');
    const cameraContainer = document.querySelector('.camera-container');
    const resultsContainer = document.querySelector('.results-container');
    const capturedImageElement = document.getElementById('captured-image');
    const predictionResultElement = document.getElementById('prediction-result');
    
    // Global variables
    let stream = null;
    let facingMode = 'environment'; // Start with back camera
    let constraints = {
        video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };

    // Initialize camera
    async function initCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            captureButton.disabled = false;
            
            // Check if device has multiple cameras (for mobile)
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            // Only show switch camera button if multiple cameras are available
            if (videoDevices.length <= 1) {
                switchCameraButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error accessing camera. Please make sure you have given permission to use the camera and try again.');
        }
    }

    // Switch between front and back cameras
    switchCameraButton.addEventListener('click', async () => {
        // Stop current stream
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
        }
        
        // Toggle facing mode
        facingMode = facingMode === 'environment' ? 'user' : 'environment';
        
        // Update constraints
        constraints.video.facingMode = facingMode;
        
        // Reinitialize camera
        await initCamera();
    });

    // Capture image
    captureButton.addEventListener('click', () => {
        // Set canvas dimensions to match video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        
        // Draw current video frame on canvas
        const context = canvasElement.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Convert canvas to data URL (image)
        const imageDataUrl = canvasElement.toDataURL('image/jpeg');
        
        // Display captured image
        capturedImageElement.src = imageDataUrl;
        
        // Show results container, hide camera container
        cameraContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // Analyze image
        analyzeImage(imageDataUrl);
    });

    // Try again button (go back to camera)
    tryAgainButton.addEventListener('click', () => {
        // Show camera container, hide results container
        cameraContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        // Clear prediction result
        predictionResultElement.innerHTML = '<div class="loading">Analyzing image...</div>';
    });

    // Analyze image with API
    async function analyzeImage(imageDataUrl) {
        try {
            // Remove data URL prefix to get just the base64 data
            const base64Image = imageDataUrl.split(',')[1];
            
            // Call API with image data
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image })
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Display prediction result
            predictionResultElement.innerHTML = `
                <h3>Prediction:</h3>
                <p class="result">${result.prediction}</p>
                <p class="confidence">Confidence: ${result.confidence.toFixed(2)}%</p>
            `;
        } catch (error) {
            console.error('Error analyzing image:', error);
            predictionResultElement.innerHTML = `
                <p class="error">Error analyzing image. Please try again.</p>
                <p class="error-details">${error.message}</p>
            `;
        }
    }

    // Initialize app
    initCamera();
});