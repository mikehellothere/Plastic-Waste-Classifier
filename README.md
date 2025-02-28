# Plastic Waste Classifier Web App

This web application uses a PyTorch AI model to identify plastic waste types from images captured by a device camera.

## Project Structure

```
/
├── .github/workflows/              # GitHub Actions workflow
│   └── azure-static-web-apps.yml
├── api/                            # Azure Functions API
│   ├── predict/                    # Prediction endpoint
│   │   ├── __init__.py
│   │   └── function.json
│   ├── shared/                     # Shared resources
│   │   └── model_fold_0.pth        # PyTorch model file
│   ├── .funcignore
│   ├── host.json
│   ├── local.settings.json
│   └── requirements.txt
├── public/                         # Static web content
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── errors/                     # Error pages
│   │   ├── 400.html
│   │   ├── 404.html
│   │   └── 500.html
│   └── index.html
├── staticwebapp.config.json        # Azure Static Web App config
└── README.md                       # This file
```

## Prerequisites

- Visual Studio Code
- GitHub Account
- Azure Account with a subscription
- PyTorch model file (`model_fold_0.pth`)

## Setup Instructions

1. Clone this repository to your local machine
2. Create the following directory structure:
   ```
   api/shared/
   public/css/
   public/js/
   public/errors/
   .github/workflows/
   ```
3. Place your PyTorch model file (`model_fold_0.pth`) in the `api/shared/` directory
4. Create all the files as listed in the project structure
5. Open the project in Visual Studio Code

## Local Development

1. Install the Azure Functions extension for VS Code
2. Install the Azure Static Web Apps extension for VS Code
3. Test the Azure Function locally:
   ```
   cd api
   func start
   ```
4. Test the frontend locally using a local web server:
   ```
   cd public
   npx http-server
   ```

## Deployment to Azure

1. Commit and push the code to your GitHub repository
2. In the Azure Portal, create a new Static Web App
3. Link it to your GitHub repository
4. Azure will automatically deploy your app using the GitHub Actions workflow

## Important Notes

- The PyTorch model used in this project is CPU-only for compatibility with Azure Functions
- If you need GPU acceleration, consider deploying the API separately using Azure App Service
- Camera access requires HTTPS in production (automatically provided by Azure Static Web Apps)
- The app is designed to work on both mobile and desktop devices