// Replace with your actual OpenAI API key
const OPENAI_API_KEY = '<your API key>';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "analyze_product") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "get_product_specs" }, function(productSpecs) {
          if (chrome.runtime.lastError || !productSpecs || productSpecs.error) {
            sendResponse({ error: productSpecs?.error || "Failed to retrieve product specs." });
            return;
          }
          
          const prompt = `
You are an AI assistant. Given the following product name:
"${productSpecs.productName}"

1. Search the manufacturer of the product.
2. Rate the product on a scale of 1 to 5 leaves based on its sustainability. Search relevant information online to support your rating.
Key Aspects to Consider:
Carbon Footprint and Climate Impact
Does the company measure and report its greenhouse gas (GHG) emissions?
Are there targets and timelines for reducing emissions?
Does the company invest in carbon offsetting or renewable energy?
Resource Management and Waste Reduction
How does the company manage its material inputs and waste outputs?
Does it use circular economy practices (e.g., recycling, reuse, or composting)?
Does it have clear initiatives to reduce packaging and single-use materials?
Energy and Water Usage
Percentage of energy from renewable sources vs. non-renewable sources.
Water conservation strategies: does the company disclose water usage and work to reduce it?
Supply Chain Practices
Are suppliers held to environmental standards (e.g., code of conduct, audits)?
Does the company vet suppliers for sustainability or require certifications?
Product Lifecycle and Innovation
Are products designed to be more eco-friendly (e.g., biodegradable materials, longer lifespan)?
Do they invest in R&D for sustainable product or process innovation?
Transparency and Reporting
Does the company openly share progress, setbacks, and initiatives?
Is the data consistent and verified by third parties?
Social Impact (Optional but Relevant)
Consider whether the company’s sustainability efforts also include fair labor practices and community engagement, as social and environmental considerations often go hand in hand.

Scoring and Reasoning:
Assign a score between 1 and 5:
1: Severe underperformance. Little to no transparency, significant negative environmental impact, possible infractions of regulations.
2-3: Moderate performance. Shows some efforts but lacks consistency or transparent reporting.
4: Good performance. Demonstrates clear environmental strategies, targets, and ongoing improvements.
5: Exemplary performance. Strong leadership in sustainability, transparent reporting, and consistent third-party validation.

3. Search online (using at most 3 reputable websites) and provide fewer than five sustainability highlights/problems (less than 5 words each), focusing on aspects like recycled materials, plastic packaging, lawsuits, and chemicals. Before each bullet point, add a string False if it is a negative point and a string True if it is a positive point.
4. If the ESG Environmental Score is below 3, search and find at most three alternative green options. Each alternative should be an object with keys "name" (the product's name) and "website link" (the URL to the google search result of the product), so that they can be displayed as clickable hyperlinks.
5. Provide three separate paragraphs (each one approximately 200–250 words) that explain:
   a. **Materials:** The sustainable sourcing and recycled content of the product's materials.
   b. **Carbon Footprint:** The product’s carbon emissions from manufacturing and shipping.
   c. **Brand Accountability:** The brand’s transparency, environmental record, and any controversies.
6. Also provide up to 3 relevant websites you used, along with a short paragraph (under 75 words) for each.
Return your final response in valid JSON format with the following keys:
   - "esg_score" (number, 1-5),
   - "sustainability_highlights" (array of strings),
   - "green_options" (array of objects, each with "name" and "link"),
   - "materials" (string, paragraph on Materials),
   - "carbon_footprint" (string, paragraph on Carbon Footprint),
   - "brand_accountability" (string, paragraph on Brand Accountability),
   - "sources" (array of objects, each with "website" (a URL) and "description")
          `;
          
          fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + OPENAI_API_KEY
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 800,
              temperature: 0.5
            })
          })
          .then(response => response.json())
          .then(data => {
            console.log("OpenAI API Response:", data); // Debugging log

            if (data.error || !data.choices || !data.choices[0]?.message?.content) {
              sendResponse({ error: data.error?.message || "Unexpected API response format." });
              return;
            }

            const aiResponse = data.choices[0].message.content.trim();
            console.log("Raw AI Response:", aiResponse);

            // Extract JSON inside ```json ... ```
            const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/);
            if (!jsonMatch) {
              sendResponse({ error: "Response does not contain valid JSON." });
              return;
            }

            try {
              const result = JSON.parse(jsonMatch[1].trim());
              const esgScore = result.esg_score;
              
              chrome.storage.local.set({ analysisData: {
                productName: productSpecs.productName,
                esg_score: esgScore,
                sustainability_highlights: result.sustainability_highlights || [],
                green_options: result.green_options || [],
                sources: result.sources || [],
                materials: result.materials || "",
                carbon_footprint: result.carbon_footprint || "",
                brand_accountability: result.brand_accountability || ""
              }});

              sendResponse({
                esg_score: esgScore,
                sustainability_highlights: result.sustainability_highlights || [],
                green_options: result.green_options || [],
                sources: result.sources || [],
                materials: result.materials || "",
                carbon_footprint: result.carbon_footprint || "",
                brand_accountability: result.brand_accountability || ""
              });
            } catch (e) {
              sendResponse({ error: "Failed to parse AI response." });
            }
          })
          .catch(err => {
            sendResponse({ error: "Error calling OpenAI API: " + err.message });
          });

        });
      } else {
        sendResponse({ error: "No active tab found." });
      }
    });
    return true;
  }

  else if (request.action === "prepare_complaint") {
    // (Complaint code remains unchanged)
    chrome.storage.local.get("analysisData", function(data) {
      if (!data.analysisData || !data.analysisData.productName) {
        sendResponse({ error: "No product analysis data available. Please run analysis first." });
        return;
      }
      
      const productName = data.analysisData.productName;
      
      const complaintPrompt = `
 You are an AI assistant. Given the product name:
    "${productName}"
    
    Please search online to find product's brand and the brand's email address (if available) and draft a complaint report email in the following format:
    
    Dear [brand] Team,

    I hope this message finds you well. As a long-time customer, I am writing to express my concern about your sustainability practices, particularly with the "${productName}". I recently switched to a more eco-friendly alternative, prompted by the Terra extension.
    
    Moreover, [brand] has faced several ESG controversies, including: 
    [include relevant sustainability or safety concerns here in bullet point form]
    [Additional details can be included.]

    I urge [brand] to prioritize and implement more sustainable practices across your product lines. Consumers are increasingly making purchasing decisions based on environmental impact, and [brand] can retain and attract customers by committing to sustainability.

    Thank you for considering my feedback. I look forward to seeing [brand] take significant steps towards more sustainable business practices. 
    
    Return your final response in valid JSON format with keys:
       - "brand_email" (string, the email address found, or "Not found" if unavailable),
       - "complaint_email" (string, the full drafted email text).
          `;
      
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: complaintPrompt }],
          max_tokens: 500,
          temperature: 0.7
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          sendResponse({ error: data.error.message });
        } else {
          try {
            const aiResponse = data.choices[0].message.content;
            const complaintResult = JSON.parse(aiResponse);
            
            chrome.storage.local.set({ complaintData: {
              brand_email: complaintResult.brand_email || "Not found",
              complaint_email: complaintResult.complaint_email || ""
            }}, function() {
              sendResponse({ success: true });
            });
          } catch (e) {
            sendResponse({ error: "Failed to parse AI response for complaint." });
          }
        }
      })
      .catch(err => {
        sendResponse({ error: "Error calling OpenAI API for complaint: " + err.message });
      });
    });
    return true;
  }
});
