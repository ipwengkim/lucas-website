document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const capturedImage = document.getElementById('capturedImage');
    const fileInput = document.getElementById('fileInput');
    
    // Containers
    const cameraContainer = document.getElementById('cameraContainer');
    const previewContainer = document.getElementById('previewContainer');
    
    // Buttons
    const btnCapture = document.getElementById('btnCapture');
    const btnUpload = document.getElementById('btnUpload');
    const btnRetake = document.getElementById('btnRetake');
    const btnConvert = document.getElementById('btnConvert');
    const actionControls = document.getElementById('actionControls');

    let stream = null;

    // Initialize Camera
    async function initCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } 
            });
            video.srcObject = stream;
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Unable to access camera. Please allow permissions or use Upload.");
        }
    }

    // Start Camera on Load
    initCamera();

    // Capture Image
    btnCapture.addEventListener('click', () => {
        if (!stream) {
            alert("Camera not active");
            return;
        }

        // Set canvas size to match video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        showPreview(dataUrl);
    });

    // Upload Image
    btnUpload.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                showPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    function showPreview(src) {
        capturedImage.src = src;
        
        // Toggle Views
        cameraContainer.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        
        // Toggle Controls
        btnCapture.classList.add('hidden');
        btnUpload.classList.add('hidden');
        actionControls.classList.remove('hidden');
        
        // Add flash effect
        document.body.style.backgroundColor = '#fff';
        setTimeout(() => {
            document.body.style.backgroundColor = '';
        }, 100);
    }

    // Retake
    btnRetake.addEventListener('click', () => {
        cameraContainer.classList.remove('hidden');
        previewContainer.classList.add('hidden');
        
        btnCapture.classList.remove('hidden');
        btnUpload.classList.remove('hidden');
        actionControls.classList.add('hidden');
        
        // Clear previous image
        capturedImage.src = "";
    });

    // Convert to PDF
    btnConvert.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const imgData = capturedImage.src;
        
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        // Add a Sci-Fi footer text
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("SCANNED BY SCAN-X v2.0", 10, doc.internal.pageSize.getHeight() - 10);
        
        doc.save('scan-x_document.pdf');
        
        alert("PDF Downloaded successfully! Mission Complete.");
    });
});
