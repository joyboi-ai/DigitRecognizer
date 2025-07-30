class DigitRecognizer {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.initializeCanvas();
        this.bindEvents();
        this.initializeProbabilityBars();
    }
    
    initializeCanvas() {
        // Set up canvas drawing properties
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 15;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Fill canvas with white background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // Button events
        document.getElementById('clearBtn').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('predictBtn').addEventListener('click', this.predictDigit.bind(this));
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }
    
    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.resetPrediction();
    }
    
    resetPrediction() {
        document.querySelector('.digit-result').textContent = '?';
        document.querySelector('.confidence').textContent = 'Draw a digit to get started';
        this.updateProbabilityBars([]);
    }
    
    async predictDigit() {
        try {
            // Show loading state
            document.querySelector('.digit-result').textContent = '...';
            document.querySelector('.confidence').textContent = 'Analyzing...';
            
            // Convert canvas to base64 image
            const imageData = this.canvas.toDataURL('image/png');
            
            // Send to backend for prediction
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageData })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayPrediction(result);
            } else {
                this.displayError(result.error);
            }
            
        } catch (error) {
            this.displayError('Network error: ' + error.message);
        }
    }
    
    displayPrediction(result) {
        const digitResult = document.querySelector('.digit-result');
        const confidence = document.querySelector('.confidence');
        
        digitResult.textContent = result.predicted_digit;
        confidence.textContent = `Confidence: ${(result.confidence * 100).toFixed(1)}%`;
        
        this.updateProbabilityBars(result.probabilities);
    }
    
    displayError(error) {
        document.querySelector('.digit-result').textContent = '❌';
        document.querySelector('.confidence').textContent = 'Error: ' + error;
    }
    
    initializeProbabilityBars() {
        const container = document.getElementById('probabilityBars');
        container.innerHTML = '';
        
        for (let i = 0; i < 10; i++) {
            const barElement = document.createElement('div');
            barElement.className = 'probability-bar';
            barElement.innerHTML = `
                <div class="bar-label">${i}</div>
                <div class="bar-container">
                    <div class="bar-fill" data-digit="${i}" style="width: 0%"></div>
                    <div class="bar-percentage">0%</div>
                </div>
            `;
            container.appendChild(barElement);
        }
    }
    
    updateProbabilityBars(probabilities) {
        if (!probabilities || probabilities.length === 0) {
            // Reset all bars
            document.querySelectorAll('.bar-fill').forEach(bar => {
                bar.style.width = '0%';
            });
            document.querySelectorAll('.bar-percentage').forEach(percentage => {
                percentage.textContent = '0%';
            });
            return;
        }
        
        probabilities.forEach((prob, index) => {
            const percentage = (prob * 100).toFixed(1);
            const barFill = document.querySelector(`[data-digit="${index}"]`);
            const barPercentage = barFill.parentElement.querySelector('.bar-percentage');
            
            barFill.style.width = percentage + '%';
            barPercentage.textContent = percentage + '%';
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DigitRecognizer();
});
