from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
import cv2
import base64
from PIL import Image
import io

app = Flask(__name__)

# Load the trained model
model = tf.keras.models.load_model('handwritten_digit_recognizer.keras')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the image data from the request
        data = request.json
        image_data = data['image']
        
        # Remove the data URL prefix
        image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to grayscale
        image = image.convert('L')
        
        # Convert to numpy array first for processing
        image_array = np.array(image)
        
        # Invert colors: MNIST has white digits on black background
        # Canvas has black digits on white background, so we invert
        image_array = 255 - image_array
        
        # Find bounding box of the digit to center it
        coords = cv2.findNonZero(image_array)
        if coords is not None:
            x, y, w, h = cv2.boundingRect(coords)
            
            # Add some padding
            padding = 20
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(image_array.shape[1] - x, w + 2 * padding)
            h = min(image_array.shape[0] - y, h + 2 * padding)
            
            # Crop the digit
            digit_crop = image_array[y:y+h, x:x+w]
            
            # Create a square image with the larger dimension
            size = max(w, h)
            square_image = np.zeros((size, size), dtype=np.uint8)
            
            # Center the digit in the square
            y_offset = (size - h) // 2
            x_offset = (size - w) // 2
            square_image[y_offset:y_offset+h, x_offset:x_offset+w] = digit_crop
            
            # Resize to 28x28
            image_array = cv2.resize(square_image, (28, 28))
        else:
            # If no digit found, just resize the inverted image
            image_array = cv2.resize(image_array, (28, 28))
        
        # Reshape and normalize like MNIST
        image_array = image_array.reshape(1, 28, 28)
        image_array = image_array.astype('float32') / 255.0
        
        # Make prediction
        prediction = model.predict(image_array)
        predicted_digit = np.argmax(prediction[0])
        confidence = float(np.max(prediction[0]))
        
        # Get all probabilities for visualization
        probabilities = prediction[0].tolist()
        
        return jsonify({
            'success': True,
            'predicted_digit': int(predicted_digit),
            'confidence': confidence,
            'probabilities': probabilities
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
