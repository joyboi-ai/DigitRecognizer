# Handwritten Digit Recognizer

A machine learning project that recognizes handwritten digits (0-9) using a neural network trained on the MNIST dataset.

## Overview

This project implements a deep learning model using TensorFlow/Keras to classify handwritten digits. The model achieves high accuracy on the MNIST dataset and can be used to predict digits from 28x28 pixel grayscale images.

## Features

- **Neural Network Architecture**: Sequential model with dense layers
- **MNIST Dataset**: Trained on 60,000 training images and tested on 10,000 test images
- **Early Stopping**: Prevents overfitting with validation monitoring
- **Model Persistence**: Saves trained model for future use
- **Data Normalization**: Preprocesses input data for optimal training

## Requirements

- Python 3.8+
- TensorFlow 2.15.0
- OpenCV 4.8.1
- NumPy 1.24.3
- Matplotlib 3.7.2

## Installation

1. Clone or download this repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Usage

### Training the Model

Run the main script to train the model:

```bash
python main.py
```

This will:
- Load and preprocess the MNIST dataset
- Train a neural network with early stopping
- Save the trained model as `handwritten_digit_recognizer.keras`

### Model Architecture

The neural network consists of:
- **Input Layer**: Flattened 28x28 pixel images (784 features)
- **Hidden Layer 1**: 128 neurons with ReLU activation
- **Hidden Layer 2**: 128 neurons with ReLU activation
- **Output Layer**: 10 neurons with softmax activation (for digits 0-9)

### Training Configuration

- **Optimizer**: Adam
- **Loss Function**: Sparse Categorical Crossentropy
- **Metrics**: Accuracy
- **Epochs**: Up to 30 (with early stopping)
- **Validation Split**: 10%
- **Early Stopping**: Monitors validation loss with patience of 3 epochs

## Project Structure

```
DigitRecognizer/
├── main.py                              # Main training script
├── requirements.txt                     # Python dependencies
├── README.md                           # Project documentation
└── handwritten_digit_recognizer.keras  # Saved trained model
```

## Model Performance

The model typically achieves:
- **Training Accuracy**: ~99%
- **Validation Accuracy**: ~97-98%
- **Test Accuracy**: ~97-98%

## Future Enhancements

- Add a prediction script for custom images
- Implement data augmentation for better generalization
- Create a web interface for real-time digit recognition
- Add support for drawing digits with mouse input
- Experiment with convolutional neural networks (CNNs)

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this project and submit pull requests for any improvements!
