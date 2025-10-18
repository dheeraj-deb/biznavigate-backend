// Complete API Test with Real Data
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1/leads';
const BUSINESS_ID = '33333333-3333-3333-3333-333333333333';
const AGENT_ID = '55555555-5555-5555-5555-555555555555';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer test-token'
};

let createdLeadIds = [];

async function runTests() {
  console.log('==========================================');
  console.log('🧪 BizNavigate Lead API - Real Data Tests');
  console.log('==========================================\n');

  try {
    // Test 1: Create Lead from WhatsApp
    console.log('1️⃣  Creating Lead from WhatsApp...');
    const lead1 = await axios.post(BASE_URL, {
      source: 'whatsapp',
      business_id: BUSINESS_ID,
      first_name: 'Rahul',
      last_name: 'Sharma',
      phone: '9876543210',
      email: 'rahul.sharma@example.com',
      city: 'Mumbai',
      state: 'Maharashtra',
      intent_type: 'product_inquiry',
      lead_quality: 'hot',
      interested_products: ['Laptop', 'Mouse', 'Keyboard'],
      sentiment_score: 0.85,
      utm_source: 'whatsapp_campaign'
    }, { headers });

    createdLeadIds.push(lead1.data.data.lead_id);
    console.log('   ✅ Created:', lead1.data.data.first_name, lead1.data.data.last_name);
    console.log('   Lead ID:', lead1.data.data.lead_id);
    console.log('   Status:', lead1.data.data.status);
    console.log('   Score:', lead1.data.data.lead_score);
    console.log('');

    // Test 2: Create Lead from Instagram
    console.log('2️⃣  Creating Lead from Instagram DM...');
    const lead2 = await axios.post(BASE_URL, {
      source: 'instagram_dm',
      business_id: BUSINESS_ID,
      platform_user_id: 'ig_user_12345',
      first_name: 'Priya',
      last_name: 'Patel',
      phone: '9988776655',
      email: 'priya.patel@example.com',
      city: 'Bangalore',
      state: 'Karnataka',
      intent_type: 'course_inquiry',
      lead_quality: 'warm',
      interested_courses: ['Digital Marketing', 'SEO']
    }, { headers });

    createdLeadIds.push(lead2.data.data.lead_id);
    console.log('   ✅ Created:', lead2.data.data.first_name, lead2.data.data.last_name);
    console.log('   Lead ID:', lead2.data.data.lead_id);
    console.log('   Status:', lead2.data.data.status);
    console.log('');

    // Test 3: Create Lead from Website
    console.log('3️⃣  Creating Lead from Website Form...');
    const lead3 = await axios.post(BASE_URL, {
      source: 'website_form',
      business_id: BUSINESS_ID,
      first_name: 'Amit',
      last_name: 'Kumar',
      phone: '8877665544',
      email: 'amit.kumar@example.com',
      city: 'Delhi',
      state: 'Delhi',
      lead_quality: 'cold',
      custom_fields: {
        budget: '50000',
        timeline: '1 month',
        company: 'Tech Startup'
      }
    }, { headers });

    createdLeadIds.push(lead3.data.data.lead_id);
    console.log('   ✅ Created:', lead3.data.data.first_name, lead3.data.data.last_name);
    console.log('   Lead ID:', lead3.data.data.lead_id);
    console.log('');

    // Test 4: Get All Leads
    console.log('4️⃣  Getting All Leads with Pagination...');
    const allLeads = await axios.get(`${BASE_URL}?page=1&limit=10`, { headers });
    console.log('   ✅ Found', allLeads.data.data.length, 'leads');
    console.log('   Pagination:', JSON.stringify(allLeads.data.meta.pagination, null, 2));
    console.log('');

    // Test 5: Get Lead by ID
    const leadId = createdLeadIds[0];
    console.log('5️⃣  Getting Lead by ID:', leadId);
    const singleLead = await axios.get(`${BASE_URL}/${leadId}`, { headers });
    console.log('   ✅ Retrieved:', singleLead.data.data.first_name, singleLead.data.data.last_name);
    console.log('   Recent Activities:', singleLead.data.data.lead_activities.length);
    console.log('');

    // Test 6: Update Lead
    console.log('6️⃣  Updating Lead...');
    const updated = await axios.patch(`${BASE_URL}/${leadId}`, {
      lead_quality: 'hot',
      custom_fields: {
        updated: true,
        notes: 'Very interested in premium products'
      }
    }, { headers });
    console.log('   ✅ Updated quality to:', updated.data.data.lead_quality);
    console.log('');

    // Test 7: Assign Lead to Agent
    console.log('7️⃣  Assigning Lead to Agent...');
    const assigned = await axios.post(`${BASE_URL}/${leadId}/assign`, {
      agent_id: AGENT_ID,
      reason: 'Best fit based on expertise'
    }, { headers });
    console.log('   ✅ Assigned to:', assigned.data.data.assigned_agent?.name || 'Agent');
    console.log('   Assigned at:', new Date(assigned.data.data.assigned_at).toLocaleString());
    console.log('');

    // Test 8: Update Status
    console.log('8️⃣  Updating Lead Status...');
    const statusUpdated = await axios.patch(`${BASE_URL}/${leadId}/status`, {
      status: 'contacted',
      reason: 'Called customer and discussed requirements in detail'
    }, { headers });
    console.log('   ✅ Status updated to:', statusUpdated.data.data.status);
    console.log('');

    // Test 9: Get Timeline
    console.log('9️⃣  Getting Lead Timeline...');
    const timeline = await axios.get(`${BASE_URL}/${leadId}/timeline`, { headers });
    console.log('   ✅ Timeline has', timeline.data.data.length, 'activities');
    console.log('   Recent activities:');
    timeline.data.data.slice(0, 3).forEach((activity, idx) => {
      console.log(`     ${idx + 1}. ${activity.activity_type} - ${activity.description}`);
    });
    console.log('');

    // Test 10: Convert Lead
    const convertLeadId = createdLeadIds[1];
    console.log('🔟 Converting Lead...');
    const converted = await axios.post(`${BASE_URL}/${convertLeadId}/convert`, {
      conversion_value: 45000,
      conversion_notes: 'Customer purchased Digital Marketing course - Annual subscription'
    }, { headers });
    console.log('   ✅ Lead converted!');
    console.log('   Conversion value: ₹', converted.data.data.conversion_value);
    console.log('   Converted at:', new Date(converted.data.data.converted_at).toLocaleString());
    console.log('');

    // Test 11: Get Statistics
    console.log('1️⃣1️⃣  Getting Lead Statistics...');
    const stats = await axios.get(`${BASE_URL}/stats/overview`, { headers });
    console.log('   ✅ Statistics:');
    console.log('      Total Leads:', stats.data.data.total_leads);
    console.log('      Converted:', stats.data.data.converted_leads);
    console.log('      Conversion Rate:', stats.data.data.conversion_rate + '%');
    console.log('      Avg Score:', stats.data.data.avg_lead_score);
    console.log('      By Status:', JSON.stringify(stats.data.data.by_status, null, 8));
    console.log('      By Source:', JSON.stringify(stats.data.data.by_source, null, 8));
    console.log('');

    // Test 12: Filtering
    console.log('1️⃣2️⃣  Testing Filters...');
    const filtered = await axios.get(`${BASE_URL}?status=contacted&lead_quality=hot&page=1&limit=5`, { headers });
    console.log('   ✅ Filtered leads (status=contacted, quality=hot):', filtered.data.data.length);
    console.log('');

    // Test 13: Search
    console.log('1️⃣3️⃣  Testing Search...');
    const searched = await axios.get(`${BASE_URL}?search=Rahul`, { headers });
    console.log('   ✅ Search results for "Rahul":', searched.data.data.length);
    if (searched.data.data.length > 0) {
      console.log('   Found:', searched.data.data[0].first_name, searched.data.data[0].last_name);
    }
    console.log('');

    console.log('==========================================');
    console.log('✅ ALL TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('==========================================');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - Created 3 leads');
    console.log('   - Updated 1 lead');
    console.log('   - Assigned 1 lead to agent');
    console.log('   - Changed 1 lead status');
    console.log('   - Converted 1 lead');
    console.log('   - Tested filtering and search');
    console.log('   - Verified statistics');
    console.log('');
    console.log('💾 Database now contains real data!');
    console.log('   View at: http://localhost:8000/api/docs');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

runTests();
