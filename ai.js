// routes/ai.js
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const db = require('./db');
const { authMiddleware } = require('./auth');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// POST /api/ai/chat
router.post('/chat', authMiddleware, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  // Save to DB
  db.prepare('INSERT INTO chat_history (user_id,role,message) VALUES (?,?,?)').run(req.user.id, 'user', message);

  const messages = [
    {
      role: 'system',
      content: `You are an expert Telangana Tourism Assistant. You know all 33 districts of Telangana, their tourist places, local cuisine, culture, festivals (Bathukamma, Bonalu, Medaram Jatara), heritage sites, transport options, best seasons, and travel tips. 
      Key facts:
      - Telangana has 33 districts, capital is Hyderabad
      - Famous sites: Charminar, Golconda Fort, Ramappa Temple (UNESCO World Heritage), Thousand Pillar Temple, Bhadrachalam Temple
      - Famous food: Hyderabadi Biryani, Haleem, Mirchi Bajji, Gongura dishes, Pesarattu
      - Best travel season: October to March
      - Famous handicrafts: Pochampally ikat, Nirmal paintings, Karimnagar silver filigree, Narayanpet sarees
      Be concise, friendly, helpful, and use relevant emojis. Always give specific, accurate information about Telangana.`
    },
    ...history.slice(-10),
    { role: 'user', content: message }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 600,
      temperature: 0.7
    });
    const reply = completion.choices[0].message.content;
    db.prepare('INSERT INTO chat_history (user_id,role,message) VALUES (?,?,?)').run(req.user.id, 'assistant', reply);
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI Error:', err.message);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

// POST /api/ai/itinerary
router.post('/itinerary', authMiddleware, async (req, res) => {
  const {
  from,
  to,
  days,
  style,
  budget,
  food,
  stay,
  travel
} = req.body;
  if (!from || !to) return res.status(400).json({ error: 'From and To required' });

  const prompt = `Create a detailed ${days || 3}-day Telangana tourism itinerary.
From: ${from}
To: ${to}
Days: ${days || 3}

Budget: ₹${budget || 3000}

Food Preference: ${food || 'Both'}
Stay Preference: ${stay || 'Haritha'}
Travel Preference: ${travel || 'Bus'}
Return ONLY a valid JSON object in this exact format:
{
  "title": "Trip title",
  "summary": "Brief summary",
  "totalCost": "₹7000",

  "days": [
    {
      "day": 1,
      "title": "Day 1",

      "travel": {
        "time": "08:00 AM",
        "mode": "Bus",
        "from": "Hyderabad",
        "to": "Warangal",
        "cost": "₹400"
      },

      "breakfast": {
        "time": "07:00 AM",
        "food": "Pesarattu",
        "cost": "₹100"
      },

      "lunch": {
        "time": "01:00 PM",
        "food": "Veg Meals",
        "cost": "₹200"
      },

      "dinner": {
        "time": "08:00 PM",
        "food": "Special Telangana Dinner",
        "cost": "₹300"
      },

      "hotel": {
        "time": "09:30 PM",
        "name": "Haritha Hotel",
        "type": "Haritha",
        "price": "₹2500"
      },

      "places": [
        {
          "time": "10:00 AM",
          "place": "Ramappa Temple",
          "activity": "Sightseeing"
        },
        {
          "time": "03:00 PM",
          "place": "Warangal Fort",
          "activity": "Explore Fort"
        }
      ],

      "dayCost": "₹3500"
    }
  ]
}
Include real places, accurate timings, local food recommendations at meals, and practical tips.

For every day include:

- Breakfast
- Lunch
- Dinner
- Travel mode
- Travel cost
- Hotel stay
- Hotel cost

Stay Rules:
- Prefer Haritha Hotels first
- Then Budget Hotels
- Then 3 Star Hotels
- Then 5 Star Hotels

Food Rules:
- Respect user's food preference (Veg / Non-Veg / Both)

Travel Rules:
- Respect user's travel preference (Bus / Car / Cab / Bike)

At the end include:

- Travel Cost
- Hotel Cost
- Food Cost
- Entry Ticket Cost
- Total Trip Cost

No extra text outside the JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const itinerary = JSON.parse(completion.choices[0].message.content);

console.log("AI ITINERARY:");
console.log(JSON.stringify(itinerary, null, 2));

    // Save to DB
    db.prepare('INSERT INTO trip_plans (user_id,from_district,to_district,days,style,budget,itinerary) VALUES (?,?,?,?,?,?,?)')
      .run(req.user.id, from, to, days || 3, style || 'cultural', budget || '3000', JSON.stringify(itinerary));

    res.json(itinerary);
  } catch (err) {
    console.error('Itinerary Error:', err.message);
    res.status(500).json({ error: 'Could not generate itinerary: ' + err.message });
  }
});

// GET /api/ai/history — user chat history
router.get('/history', authMiddleware, (req, res) => {
  const history = db.prepare('SELECT role,message,created_at FROM chat_history WHERE user_id=? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(history.reverse());
});

// GET /api/ai/plans — user saved plans
router.get('/plans', authMiddleware, (req, res) => {
  const plans = db.prepare('SELECT * FROM trip_plans WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json(plans.map(p => ({ ...p, itinerary: JSON.parse(p.itinerary) })));
});

module.exports = router;
