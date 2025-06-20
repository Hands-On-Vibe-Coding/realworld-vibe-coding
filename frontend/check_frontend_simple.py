#!/usr/bin/env python3
import requests
import json
import sys
from urllib.parse import urljoin

def check_frontend_health():
    base_url = "http://localhost:5175"
    
    print("🔍 Frontend Health Check Report")
    print("=" * 50)
    
    try:
        # Check main page
        print("\n1. 📄 Main Page Check:")
        response = requests.get(base_url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"   Content Length: {len(response.text)} characters")
        
        if response.status_code == 200:
            html_content = response.text
            print("   ✅ Main page loads successfully")
            
            # Check for key elements
            checks = {
                'Has DOCTYPE': '<!doctype html>' in html_content.lower() or '<!DOCTYPE html>' in html_content.lower(),
                'Has root div': 'id="root"' in html_content,
                'Has main.tsx script': 'src="/src/main.tsx"' in html_content,
                'Has Vite client': '/@vite/client' in html_content,
                'Has React Refresh': 'react-refresh' in html_content,
                'Has title': '<title>' in html_content,
            }
            
            print("\n   HTML Structure Analysis:")
            for check, passed in checks.items():
                status = "✅" if passed else "❌"
                print(f"     {status} {check}")
                
            # Extract title
            if '<title>' in html_content:
                title_start = html_content.find('<title>') + 7
                title_end = html_content.find('</title>', title_start)
                title = html_content[title_start:title_end]
                print(f"   Title: '{title}'")
        else:
            print(f"   ❌ Main page failed to load: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to frontend server")
        print("   💡 Make sure the development server is running on port 5175")
        return False
    except Exception as e:
        print(f"   ❌ Error checking main page: {e}")
        return False
    
    # Check key assets
    print("\n2. 🎨 Asset Check:")
    assets_to_check = [
        '/src/main.tsx',
        '/src/App.tsx',
        '/src/index.css',
        '/@vite/client'
    ]
    
    asset_results = {}
    for asset in assets_to_check:
        try:
            asset_url = urljoin(base_url, asset)
            asset_response = requests.get(asset_url, timeout=5)
            asset_results[asset] = {
                'status': asset_response.status_code,
                'content_type': asset_response.headers.get('content-type', 'N/A'),
                'size': len(asset_response.text)
            }
            
            status = "✅" if asset_response.status_code == 200 else "❌"
            print(f"   {status} {asset} ({asset_response.status_code}) - {asset_results[asset]['size']} chars")
            
        except Exception as e:
            asset_results[asset] = {'error': str(e)}
            print(f"   ❌ {asset} - Error: {e}")
    
    print("\n3. 🔄 Development Server Info:")
    try:
        vite_client_response = requests.get(f"{base_url}/@vite/client", timeout=5)
        if vite_client_response.status_code == 200:
            print("   ✅ Vite development server is active")
            print("   ✅ Hot Module Replacement (HMR) is available")
        else:
            print("   ⚠️  Vite client not accessible")
    except:
        print("   ❌ Cannot access Vite development features")
    
    # Check for API connectivity
    print("\n4. 🌐 API Backend Check:")
    api_base = "http://localhost:8080"
    try:
        api_response = requests.get(f"{api_base}/api/tags", timeout=5)
        print(f"   Status: {api_response.status_code}")
        if api_response.status_code == 200:
            print("   ✅ Backend API is accessible")
        else:
            print("   ⚠️  Backend API returned non-200 status")
    except requests.exceptions.ConnectionError:
        print("   ❌ Backend API not accessible (connection refused)")
        print("   💡 Make sure the backend server is running on port 8080")
    except Exception as e:
        print(f"   ❌ Error checking backend: {e}")
    
    print("\n5. 📊 Summary:")
    if response.status_code == 200 and all(asset_results.get(asset, {}).get('status') == 200 for asset in ['/src/main.tsx', '/src/App.tsx']):
        print("   ✅ Frontend appears to be working correctly")
        print("   ✅ Key assets are loading")
        print("   ✅ Development server is active")
        
        print("\n6. 🎯 Next Steps:")
        print("   • Open http://localhost:5175 in your browser")
        print("   • Check browser console for any JavaScript errors")
        print("   • Verify React app is rendering correctly")
        print("   • Test navigation between different routes")
        
        return True
    else:
        print("   ❌ Some issues detected with frontend setup")
        return False

if __name__ == "__main__":
    success = check_frontend_health()
    sys.exit(0 if success else 1)