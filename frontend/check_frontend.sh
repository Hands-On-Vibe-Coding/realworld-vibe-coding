#!/bin/bash

echo "🔍 Frontend Health Check Report"
echo "=" | tr '=' '=' | head -c 50; echo

BASE_URL="http://localhost:5175"
API_URL="http://localhost:8080"

echo
echo "1. 📄 Main Page Check:"

# Check main page
MAIN_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL")
HTTP_STATUS=$(echo "$MAIN_RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
MAIN_CONTENT=$(echo "$MAIN_RESPONSE" | sed 's/HTTPSTATUS:[0-9]*$//')

echo "   Status Code: $HTTP_STATUS"
echo "   Content Length: ${#MAIN_CONTENT} characters"

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "   ✅ Main page loads successfully"
    
    echo
    echo "   HTML Structure Analysis:"
    
    # Check for key elements
    if echo "$MAIN_CONTENT" | grep -qi "<!doctype html>"; then
        echo "     ✅ Has DOCTYPE"
    else
        echo "     ❌ Missing DOCTYPE"
    fi
    
    if echo "$MAIN_CONTENT" | grep -q 'id="root"'; then
        echo "     ✅ Has root div"
    else
        echo "     ❌ Missing root div"
    fi
    
    if echo "$MAIN_CONTENT" | grep -q 'src="/src/main.tsx"'; then
        echo "     ✅ Has main.tsx script"
    else
        echo "     ❌ Missing main.tsx script"
    fi
    
    if echo "$MAIN_CONTENT" | grep -q '/@vite/client'; then
        echo "     ✅ Has Vite client"
    else
        echo "     ❌ Missing Vite client"
    fi
    
    if echo "$MAIN_CONTENT" | grep -q 'react-refresh'; then
        echo "     ✅ Has React Refresh"
    else
        echo "     ❌ Missing React Refresh"
    fi
    
    # Extract title
    TITLE=$(echo "$MAIN_CONTENT" | sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p')
    echo "   Title: '$TITLE'"
    
else
    echo "   ❌ Main page failed to load: $HTTP_STATUS"
    exit 1
fi

echo
echo "2. 🎨 Asset Check:"

# Check key assets
ASSETS=("/src/main.tsx" "/src/App.tsx" "/src/index.css" "/@vite/client")

for asset in "${ASSETS[@]}"; do
    ASSET_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL$asset")
    if [ "$ASSET_STATUS" -eq 200 ]; then
        ASSET_SIZE=$(curl -s "$BASE_URL$asset" | wc -c | tr -d ' ')
        echo "   ✅ $asset ($ASSET_STATUS) - $ASSET_SIZE chars"
    else
        echo "   ❌ $asset ($ASSET_STATUS)"
    fi
done

echo
echo "3. 🔄 Development Server Info:"

VITE_CLIENT_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/@vite/client")
if [ "$VITE_CLIENT_STATUS" -eq 200 ]; then
    echo "   ✅ Vite development server is active"
    echo "   ✅ Hot Module Replacement (HMR) is available"
else
    echo "   ⚠️  Vite client not accessible ($VITE_CLIENT_STATUS)"
fi

echo
echo "4. 🌐 API Backend Check:"

API_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$API_URL/api/tags" 2>/dev/null)
if [ "$API_STATUS" -eq 200 ]; then
    echo "   ✅ Backend API is accessible ($API_STATUS)"
elif [ "$API_STATUS" -eq 000 ] || [ -z "$API_STATUS" ]; then
    echo "   ❌ Backend API not accessible (connection refused)"
    echo "   💡 Make sure the backend server is running on port 8080"
else
    echo "   ⚠️  Backend API returned status: $API_STATUS"
fi

echo
echo "5. 📊 Summary:"

if [ "$HTTP_STATUS" -eq 200 ] && [ "$ASSET_STATUS" -eq 200 ]; then
    echo "   ✅ Frontend appears to be working correctly"
    echo "   ✅ Key assets are loading"
    echo "   ✅ Development server is active"
    
    echo
    echo "6. 🎯 Next Steps:"
    echo "   • Open http://localhost:5175 in your browser"
    echo "   • Check browser console for any JavaScript errors"
    echo "   • Verify React app is rendering correctly"
    echo "   • Test navigation between different routes"
    
    echo
    echo "7. 🔧 Debugging Info:"
    echo "   • Frontend Dev Server: http://localhost:5175"
    echo "   • Backend API Server: http://localhost:8080"
    echo "   • Vite HMR: Active"
    echo "   • Title: $TITLE"
    
    exit 0
else
    echo "   ❌ Some issues detected with frontend setup"
    exit 1
fi