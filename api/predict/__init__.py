import logging
import azure.functions as func
import json
import base64
import os
import io
import torch
import timm
import cv2
import numpy as np
from torchvision import transforms
from PIL import Image

# Define necessary configurations
class Config:
    backbone = "resnet18"
    n_classes = 8
    image_size = 200
    device = "cpu"  # Always use CPU in Azure Functions
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

cfg = Config()

# Class names for prediction
class_names = [
    "1 polyethylene (PET)", 
    "2 high density polyethylene (HDPE/PEHD)", 
    "3 polyvinyl chloride (PVC)",
    "4 low density polyethylene (LDPE)", 
    "5 polypropylene (PP)",
    "6 polystyrene (PS)", 
    "7 other resins", 
    "8 no plastic"
]

def load_model():
    """Load the trained model from a saved state_dict"""
    # Adjust the model path for Azure Functions
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "shared", "model_fold_0.pth")
    
    model = timm.create_model(cfg.backbone, pretrained=False, num_classes=cfg.n_classes)
    model.load_state_dict(torch.load(model_path, map_location=cfg.device))
    model.to(cfg.device)
    model.eval()
    return model

def preprocess_image(image_data):
    """Preprocess the image to match the model's expected input"""
    transform = transforms.Compose([
        transforms.Resize((cfg.image_size, cfg.image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=cfg.mean, std=cfg.std),
    ])

    # Convert base64 to image
    image = Image.open(io.BytesIO(image_data))
    image = image.convert('RGB')
    
    # Apply transformations
    image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
    return image_tensor.to(cfg.device)

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        req_body = req.get_json()
        image_base64 = req_body.get('image')
        
        if not image_base64:
            return func.HttpResponse(
                json.dumps({"error": "No image data provided"}),
                mimetype="application/json",
                status_code=400
            )

        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        
        # Load model
        model = load_model()
        
        # Preprocess image
        image_tensor = preprocess_image(image_data)
        
        # Make prediction
        with torch.no_grad():
            output = model(image_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            predicted_class_idx = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0, predicted_class_idx].item() * 100
        
        # Get predicted class name
        predicted_class = class_names[predicted_class_idx]
        
        # Return result
        return func.HttpResponse(
            json.dumps({
                "prediction": predicted_class,
                "confidence": confidence
            }),
            mimetype="application/json"
        )
        
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500
        )
