document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get("analysisData", function(data) {
      if (!data.analysisData) {
        document.getElementById("headerTitle").innerText = "No analysis data available. Please run analysis first.";
        return;
      }
      const analysis = data.analysisData;
      
      // Update header with product name if available
      if (analysis.productName) {
        document.getElementById("headerTitle").innerText = "More Information for " + analysis.productName;
      }
      
      // Build three sections for Materials, Carbon Footprint, and Brand Accountability using the paragraphs from AI
      const sectionsDiv = document.getElementById("sectionsContainer");
      let html = "";
      html += `<div class="section">
        <h2>Materials</h2>
        <p>${analysis.materials || "No information available."}</p>
      </div>`;
      html += `<div class="section">
        <h2>Carbon Footprint</h2>
        <p>${analysis.carbon_footprint || "No information available."}</p>
      </div>`;
      html += `<div class="section">
        <h2>Brand Accountability</h2>
        <p>${analysis.brand_accountability || "No information available."}</p>
      </div>`;
      sectionsDiv.innerHTML = html;
      
      // Populate sources list
      const sourcesList = document.getElementById("sourcesList");
      sourcesList.innerHTML = "";
      if (analysis.sources && analysis.sources.length > 0) {
        analysis.sources.forEach(src => {
          const li = document.createElement("li");
          li.innerHTML = `${src.description} Retrieved from <a href="${src.website}" target="_blank">${src.website}</a>`;
          sourcesList.appendChild(li);
        });
      } else {
        sourcesList.innerHTML = "<li>No sources available.</li>";
      }
      
    });
  });
  