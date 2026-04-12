from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import os
import random
import logging
import re

# ---------------------------------------
# App Setup
# ---------------------------------------
app = FastAPI(title="Dietary Assistant API")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = "data"

# ---------------------------------------
# Load JSON Files
# ---------------------------------------
try:
    with open(os.path.join(DATA_DIR, "nutrition_facts.json")) as f:
        NUTRITION_FACTS = json.load(f)

    with open(os.path.join(DATA_DIR, "sample_recipes.json")) as f:
        SAMPLE_RECIPES = json.load(f)

    with open(os.path.join(DATA_DIR, "tips.json")) as f:
        TIPS = json.load(f)

except Exception as e:
    logger.error("Error loading JSON files: %s", str(e))
    raise e


# ---------------------------------------
# Request Model
# ---------------------------------------
class ChatRequest(BaseModel):
    message: str


# ---------------------------------------
# Helper Functions
# ---------------------------------------

def detect_food(message):
    """Detect food item mentioned in user message"""

    for food in NUTRITION_FACTS:

        clean_name = food.replace(" nutrients", "")
        clean_name = clean_name.replace("_", " ")

        if clean_name in message:
            return food

    return None


def detect_recipe(message):
    """Detect recipe using name or ingredient"""

    for recipe in SAMPLE_RECIPES:

        recipe_name = recipe["name"].lower().replace(" recipe", "")

        if recipe_name in message:
            return recipe

        for ing in recipe["ingredients"]:

            ingredient_name = ing.replace("_", " ")

            if ingredient_name in message:
                return recipe

    return None


def format_nutrition(food):

    fact = NUTRITION_FACTS[food]

    food_name = food.replace(" nutrients", "")
    food_name = food_name.replace("_", " ").title()

    return f"""
🥗 **{food_name} Nutrition Information**

Calories: {fact['calories']} kcal  
Protein: {fact['protein']} g  
Carbohydrates: {fact['carbs']} g  
Fat: {fact['fat']} g  
Serving Size: {fact['serving']}
"""


def format_recipe(recipe):

    ingredients = "\n".join(
        [f"{i+1}. {ing.replace('_',' ').title()}" for i, ing in enumerate(recipe["ingredients"])]
    )

    steps = recipe["instructions"].split(". ")

    instructions = "\n".join(
        [f"{i+1}. {step.strip()}" for i, step in enumerate(steps) if step]
    )

    nutrition = "\n".join(
        [f"• {n}" for n in recipe["nutrition"].split(", ")]
    )

    return f"""
🍽 **{recipe['name']}**

Ingredients
{ingredients}

Instructions
{instructions}

Nutrition (approx.)
{nutrition}

Enjoy your healthy meal!
"""


# ---------------------------------------
# Root API
# ---------------------------------------
@app.get("/")
def home():
    return {"message": "Dietary Assistant API is running"}


# ---------------------------------------
# Chatbot Endpoint
# ---------------------------------------
@app.post("/chat")
def chat(request: ChatRequest):

    try:

        message = request.message.lower().strip()

        logger.info(f"User message: {message}")

        # --------------------------------
        # Nutrition Queries
        # --------------------------------
        nutrition_keywords = ["calories", "nutrition", "protein", "carbs", "fat"]

        if any(word in message for word in nutrition_keywords):

            food = detect_food(message)

            if food:
                return {"reply": format_nutrition(food)}

        # --------------------------------
        # Recipe Queries
        # --------------------------------
        if "recipe" in message or "cook" in message or "make" in message:

            recipe = detect_recipe(message)

            if recipe:
                return {"reply": format_recipe(recipe)}

            recipe = random.choice(SAMPLE_RECIPES)

            return {
                "reply": f"I couldn't find an exact match. Try this recipe:\n{format_recipe(recipe)}"
            }

        # --------------------------------
        # Ingredient Based Recipe
        # --------------------------------
        recipe = detect_recipe(message)

        if recipe:
            return {"reply": format_recipe(recipe)}

        # --------------------------------
        # Tips
        # --------------------------------
        if any(w in message for w in ["tip", "advice", "diet", "health"]):

            tip = random.choice(TIPS)

            return {"reply": f"💡 Healthy Tip: {tip}"}

        # --------------------------------
        # Greetings
        # --------------------------------
        if re.search(r"\b(hi|hello|hey)\b", message):

            return {
                "reply": """Hello! I'm your Dietary Assistant.

You can ask me things like:

• apple calories  
• nutrition of banana  
• chicken recipe  
• give diet tip

How can I help you today?
"""
            }

        # --------------------------------
        # Default Response
        # --------------------------------
        return {
            "reply": """I can help with nutrition information, recipes, and diet tips.

Examples:
• apple calories
• salmon recipe
• healthy diet tip
"""
        }

    except Exception as e:

        logger.error("Chat error: %s", str(e))

        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------------------------------
# Run Server
# ---------------------------------------
if __name__ == "__main__":

    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)