#!/bin/bash

# Configuration
API_URL="http://localhost:3000/api"
INFLUENCER_CODE="POSHPAL123"
NEW_USER_ID="test_user_$(date +%s)"

echo "--- Phase 6 Verification Script ---"

# 1. Initialize Influencer Stats
echo "1. Checking Influencer (default_user) initial stats..."
INITIAL_COUNT=$(team-db "SELECT referral_count FROM users WHERE referral_code = '$INFLUENCER_CODE'" | grep -o '[0-9]\+')
echo "Initial referral count: $INITIAL_COUNT"

# 2. Register New User
echo "2. Registering new user: $NEW_USER_ID..."
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$NEW_USER_ID\"}" > /dev/null

# 3. Redeem Influencer Code
echo "3. Redeeming influencer code: $INFLUENCER_CODE for user: $NEW_USER_ID..."
REDEEM_RESPONSE=$(curl -s -X POST "$API_URL/referrals/redeem" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: $NEW_USER_ID" \
  -d "{\"code\": \"$INFLUENCER_CODE\"}")

echo "Redeem Response: $REDEEM_RESPONSE"

# 4. Verify Influencer Count Increased
echo "4. Verifying influencer referral count increased..."
NEW_COUNT=$(team-db "SELECT referral_count FROM users WHERE referral_code = '$INFLUENCER_CODE'" | grep -o '[0-9]\+')
echo "New referral count: $NEW_COUNT"

if [ "$NEW_COUNT" -gt "$INITIAL_COUNT" ]; then
  echo "✅ SUCCESS: Referral count increased."
else
  echo "❌ FAILURE: Referral count did not increase."
fi

# 5. Verify New User Pro Status
echo "5. Verifying new user Pro status and expiry..."
USER_STATS=$(team-db "SELECT is_pro, pro_expires_at, user_type FROM users WHERE id = '$NEW_USER_ID'")
echo "User Stats: $USER_STATS"

IS_PRO=$(echo $USER_STATS | grep -o '"is_pro": 1')
if [ ! -z "$IS_PRO" ]; then
  echo "✅ SUCCESS: New user is PRO."
else
  echo "❌ FAILURE: New user is NOT PRO."
fi

# Check expiry (should be ~90 days)
EXPIRY=$(echo $USER_STATS | grep -o '"pro_expires_at": "[^"]*"' | cut -d'"' -f4)
echo "Pro expires at: $EXPIRY"

# Cleanup
# team-db "DELETE FROM users WHERE id = '$NEW_USER_ID'"
# team-db "DELETE FROM referral_history WHERE referred_user_id = '$NEW_USER_ID'"
# team-db "UPDATE users SET referral_count = $INITIAL_COUNT WHERE referral_code = '$INFLUENCER_CODE'"

echo "--- Verification Complete ---"
