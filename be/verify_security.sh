#!/bin/bash

BASE_URL="http://localhost:8081/api"
NGINX_URL="http://localhost" # Nginx is on port 80

echo "============================================="
echo "Security Verification Script"
echo "============================================="

# 1. Register User A (Victim)
echo -e "\n1. Registering Victim..."
TS=$(date +%s)
VICTIM="victim_$TS"
ATTACKER="attacker_$TS"

curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$VICTIM"'",
    "password": "password123",
    "email": "'"$VICTIM"'@example.com",
    "phone": "081234567890",
    "address": "Jl. Victim No. 1",
    "role": "tenant"
  }' > response_victim.json

sleep 2

# 2. Login Victim
echo -e "\n2. Logging in Victim..."
curl -s -c cookies_victim.txt -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$VICTIM"'",
    "password": "password123"
  }' > login_victim.json
  
sleep 2

# 3. Register User B (Attacker)
echo -e "\n3. Registering Attacker..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$ATTACKER"'",
    "password": "password123",
    "email": "'"$ATTACKER"'@example.com",
    "phone": "081234567891",
    "address": "Jl. Attacker No. 1",
    "role": "tenant"
  }' > response_attacker.json
 
sleep 2

# 4. Login Attacker
echo -e "\n4. Logging in Attacker..."
curl -s -c cookies_attacker.txt -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$ATTACKER"'",
    "password": "password123"
  }' > login_attacker.json

sleep 2

# 5. Create Booking as Victim (Assuming Kamar ID 1 exists)
echo -e "\n5. Getting Rooms..."
curl -s "$BASE_URL/kamar" > rooms.json
KAMAR_ID=$(grep -o '"id":[0-9]*' rooms.json | head -1 | cut -d: -f2)

if [ -z "$KAMAR_ID" ]; then
    echo "No rooms found. Cannot proceed with booking creation."
    KAMAR_ID=1 # Fallback
fi

echo -e "\n6. Creating Booking as Victim for Room $KAMAR_ID..."
curl -s -b cookies_victim.txt -X POST "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "kamar_id": '"$KAMAR_ID"',
    "tanggal_mulai": "2026-03-01",
    "durasi_sewa": 1
  }' > booking_victim.json

BOOKING_ID=$(grep -o '"id":[0-9]*' booking_victim.json | head -1 | cut -d: -f2)
echo "Created Booking ID: $BOOKING_ID"

if [ -z "$BOOKING_ID" ]; then
    echo "Failed to create booking. Response:"
    cat booking_victim.json
    # Don't exit, try rate limit test anyway
fi

# 6. IDOR Check: Attacker tries to cancel Victim's booking
if [ -n "$BOOKING_ID" ]; then
    echo -e "\n7. [IDOR TEST] Attacker tries to cancel Booking $BOOKING_ID..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -b cookies_attacker.txt -X POST "$BASE_URL/bookings/$BOOKING_ID/cancel")

    if [ "$HTTP_CODE" == "403" ] || [ "$HTTP_CODE" == "401" ]; then
        echo "✅ PASSED: Attacker cannot cancel victim's booking (HTTP $HTTP_CODE)"
    else
        echo "❌ FAILED: Attacker request returned HTTP $HTTP_CODE"
    fi
    
    # 7. Victim cancels their own booking
    echo -e "\n8. [NORMAL FLOW] Victim cancels their own booking..."
    HTTP_CODE_VICTIM=$(curl -s -o /dev/null -w "%{http_code}" -b cookies_victim.txt -X POST "$BASE_URL/bookings/$BOOKING_ID/cancel")

    if [ "$HTTP_CODE_VICTIM" == "200" ]; then
        echo "✅ PASSED: Victim can cancel their own booking (HTTP 200)"
    else
        echo "❌ FAILED: Victim request returned HTTP $HTTP_CODE_VICTIM"
    fi
fi

# 8. Rate Limiting Test (Nginx)
echo -e "\n9. [RATE LIMIT TEST] Sending burst requests to Nginx..."
# Hit Nginx port (80)
# Since we configured rate limit 10r/s burst=20, sending 30 requests very fast should trigger some blocks.
# Using 'seq' is better than {1..30} in some shells.

blocked=0
total=30

for i in $(seq 1 $total); do
  # Use curl in parallel effectively? No, strictly sequential loop is safer for simple test.
  # But loop might be slow. Backgrounding might be better.
  # Let's try sequential fast.
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$NGINX_URL/api/kamar")
  if [ "$HTTP_CODE" == "503" ]; then
    blocked=$((blocked+1))
    echo -n "x"
  else
    echo -n "."
  fi
done

echo ""
echo "Blocked requests: $blocked out of $total"

if [ $blocked -gt 0 ]; then
    echo "✅ PASSED: Rate limiting is working (Nginx blocked requests)"
else
    echo "⚠️ WARNING: Rate limiting might not be active or threshold not reached (0/$total blocked)."
    echo "   Ensure you are testing against Nginx port ($NGINX_URL) and Nginx service is running."
fi

# Clean up
rm -f *.json *.txt
