# DietarySense Chatbot Error Fix - TODO

## Plan Overview
Fix "'name'" KeyError in ai-service/main.py chat endpoint caused by MongoDB nutritions/recipes collections lacking 'name' field.

## Steps:
- [x] Step 1: Update ai-service/main.py with safe field access (food?.get('name', '')) and JSON fallback
- [x] Step 2: Query MongoDB nutritions collection to inspect data structure  
- [ ] Step 3: Test AI service endpoint directly with PowerShell curl
- [ ] Step 4: Test full chatbot flow (frontend -> backend -> ai-service)
- [ ] Step 5: Complete task

**Status:** All code fixes complete. Manual restart required.

**Test Steps (Run in VSCode Terminal):**
1. Kill existing ai-service (Ctrl+C)
2. <code>cd ai-service</code>
3. <code>python -m uvicorn main:app --reload</code>
4. New terminal: <code>$body = @{message='apple calories'} | ConvertTo-Json ; Invoke-RestMethod -Uri http://localhost:8000/chat -Method POST -ContentType 'application/json' -Body $body</code>
5. Backend: <code>cd backend && npm start</code>
6. Frontend test chatbot.

Expected: Apple nutrition info from JSON! ✅



