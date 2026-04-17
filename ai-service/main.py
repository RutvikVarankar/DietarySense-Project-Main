from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import random
import logging
import re

# ---------------------------------------
# App Setup
# ---------------------------------------
app = FastAPI(title="Dietary Assistant API")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------
# MongoDB Connection
# ---------------------------------------
try:
    client = MongoClient("mongodb+srv://rutvikvarankar06_db_user:Admin123@cluster0.pjeotvx.mongodb.net/DietarySense?retryWrites=true&w=majority")
    db = client["DietarySense"]

    nutrition_collection = db["nutritions"]
    recipes_collection = db["recipes"]
    tips_collection = db["tips"]

except Exception as e:
    logger.error("MongoDB connection error: %s", str(e))
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
    """Detect food item from MongoDB"""
    foods = nutrition_collection.find()

    for food in foods:
        clean_name = food["name"].lower()

        if clean_name in message:
            return food

    return None


def detect_recipe(message):
    """Detect recipe using name or ingredient"""
    recipes = recipes_collection.find()

    for recipe in recipes:
        recipe_name = recipe["name"].lower()

        if recipe_name in message:
            return recipe

        for ing in recipe["ingredients"]:
            if ing.lower() in message:
                return recipe

    return None


def format_nutrition(food):

    return f"""
🥗 **{food['name'].title()} Nutrition Information**

Calories: {food['calories']} kcal  
Protein: {food['protein']} g  
Carbohydrates: {food['carbs']} g  
Fat: {food['fat']} g  
Serving Size: {food['serving']}
"""


def format_recipe(recipe):

    ingredients = "\n".join(
        [f"{i+1}. {ing.title()}" for i, ing in enumerate(recipe["ingredients"])]
    )

    steps = recipe["instructions"]

    instructions = "\n".join(
        [f"{i+1}. {step}" for i, step in enumerate(steps)]
    )

    nutrition = "\n".join(
        [f"• {n}" for n in recipe["nutrition"]]
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
    return {"message": "Dietary Assistant API is running with MongoDB"}


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
        if any(w in message for w in ["recipe", "cook", "make"]):

            recipe = detect_recipe(message)

            if recipe:
                return {"reply": format_recipe(recipe)}

            # Random recipe from MongoDB
            random_recipe = recipes_collection.aggregate([{"$sample": {"size": 1}}])
            recipe = list(random_recipe)[0]

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

            tip = tips_collection.aggregate([{"$sample": {"size": 1}}])
            tip_text = list(tip)[0]["text"]

            return {"reply": f"💡 Healthy Tip: {tip_text}"}

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