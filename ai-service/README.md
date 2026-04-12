# DietarySense AI Service

This is a Python-based microservice for AI functionalities in the DietarySense project.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set your OpenAI API key in `.env`:
   ```
   OPENAI_API_KEY=your_actual_key
   ```

3. Run the service:
   ```bash
   python main.py
   ```

The service will run on http://localhost:8000

## Endpoints

- `GET /`: Health check
- `POST /generate-recipe`: Generate a recipe based on ingredients and preferences
- `POST /analyze-nutrition`: Analyze nutritional content of food description
- `POST /chat`: Chat with AI dietary assistant

## Integration

This service is called by the Node.js backend via HTTP requests.