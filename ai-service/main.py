from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import json
import random
import logging
import re
import os
from typing import Optional, Dict, Any

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
# Load Local JSON Data as Fallback
# ---------------------------------------
def load_local_data():
    """Load local JSON data as fallback"""
    try:
        local_data = {}
        
        # Nutrition facts
        nutrition_path = "data/nutrition_facts.json"
        if os.path.exists(nutrition_path):
            with open(nutrition_path, 'r') as f:
                nutrition_data = json.load(f)
                local_data['nutrition'] = nutrition_data
        
        # Sample recipes - direct list, not nested
        recipes_path = "data/sample_recipes.json"
        if os.path.exists(recipes_path):
            with open(recipes_path, 'r') as f:
                recipes_list = json.load(f)
                local_data['recipes'] = recipes_list  # Direct list
        
        # Tips - direct list
        tips_path = "data/tips.json"
        if os.path.exists(tips_path):
            with open(tips_path, 'r') as f:
                tips_list = json.load(f)
                local_data['tips'] = tips_list
        
        logger.info(f"Local data loaded: nutrition={len(local_data.get('nutrition', {}))}, recipes={len(local_data.get('recipes', []))}, tips={len(local_data.get('tips', []))}")
        return local_data
    except Exception as e:
        logger.warning(f"Failed to load local JSON: {e}")
        return {}

LOCAL_DATA = load_local_data()

# ---------------------------------------
# Request Model
# ---------------------------------------
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

# ---------------------------------------
# Helper Functions (unchanged except recipes access)
# ---------------------------------------
# ... [all previous helper functions remain the same]

def detect_recipe_local(message: str) -> Optional[Dict[str, Any]]:
    """Fallback recipe from local data - direct list access"""
    recipes = LOCAL_DATA.get('recipes', [])
    message_lower = message.lower()
    for recipe in recipes:
        name = recipe.get('name', '').lower()
        if name in message_lower:
            return recipe
    return None

# [All other functions unchanged - safe get(), format_nutrition, format_recipe etc.]

# Rest of endpoints unchanged...

# [Chat endpoint unchanged, now with correct LOCAL_DATA['recipes'] list]

