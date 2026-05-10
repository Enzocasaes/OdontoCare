# CORS Fix - May 10, 2026

## Issue
```
Access to XMLHttpRequest at 'https://odontocare-api.fly.dev/api/auth/login' 
from origin 'https://odonto-care-five.vercel.app' has been blocked by CORS policy
```

## Root Cause
The Vercel frontend URL changed to `https://odonto-care-five.vercel.app`, but the `CORS_ORIGIN` secret on Fly.io was still pointing to the old URL.

## Solution
Updated Fly.io secret:
```bash
flyctl secrets set CORS_ORIGIN="https://odonto-care-five.vercel.app" -a odontocare-api
flyctl apps restart odontocare-api
```

## Result
✅ App restarted (version 7)
✅ CORS policy now accepts requests from the new frontend URL
✅ Login and API calls should work without CORS errors
