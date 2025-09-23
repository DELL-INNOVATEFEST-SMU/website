#!/bin/bash

# Deploy the guarded chat edge function
echo "🚀 Deploying space-chat-guarded edge function..."

# Navigate to the frontend directory
cd "$(dirname "$0")"

# Deploy the edge function
supabase functions deploy space-chat-guarded

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your GOOGLE_API_KEY is set in Supabase secrets"
echo "2. Test the function with: supabase functions serve space-chat-guarded"
echo "3. Monitor logs with: supabase functions logs space-chat-guarded"
echo ""
echo "🔧 To set secrets:"
echo "supabase secrets set GOOGLE_API_KEY=your_gemini_api_key"
