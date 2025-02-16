let currentAnalysisResponse = null;  // Used only for immediate UI update

document.getElementById('analyzeButton').addEventListener('click', function() {
    document.getElementById('result').innerText = 'Analyzing product...';
    chrome.runtime.sendMessage({ action: "analyze_product" }, function(response) {
        if (response && response.error) {
            document.getElementById('result').innerText = 'Error: ' + response.error;
            currentAnalysisResponse = null;
        } else if (response) {
            currentAnalysisResponse = response;
            
            // Update the ESG rating list with leaf icons
            let ratingList = document.getElementById('esgRating');
            ratingList.innerHTML = '';
            response.leaves.forEach(leaf => {
                let li = document.createElement('li');
                li.className = 'rating-item';
                let iconSpan = document.createElement('span');
                iconSpan.className = 'icon';
                iconSpan.innerText = leaf.icon;
                li.appendChild(iconSpan);
                li.appendChild(document.createTextNode(leaf.label));
                ratingList.appendChild(li);
            });
            
            // Update sustainability highlights and green options
            let highlightsDiv = document.getElementById('sustainabilityHighlights');
            highlightsDiv.innerHTML = '';
            if (response.sustainability_highlights && response.sustainability_highlights.length > 0) {
                let h3 = document.createElement('h3');
                h3.innerText = 'Sustainability Highlights:';
                highlightsDiv.appendChild(h3);
                let ul = document.createElement('ul');
                response.sustainability_highlights.forEach(item => {
                    let li = document.createElement('li');
                    li.innerText = item;
                    ul.appendChild(li);
                });
                highlightsDiv.appendChild(ul);
            }
            if (response.green_options && response.green_options.length > 0) {
                let h3 = document.createElement('h3');
                h3.innerText = 'Alternative Green Options:';
                highlightsDiv.appendChild(h3);
                let ul = document.createElement('ul');
                response.green_options.forEach(item => {
                    let li = document.createElement('li');
                    li.innerText = item;
                    ul.appendChild(li);
                });
                highlightsDiv.appendChild(ul);
            }
            
            document.getElementById('result').innerText = 'Analysis Complete';
        }
    });
});

document.getElementById('learnMore').addEventListener('click', function() {
    // Open a new tab for learn_more.html
    chrome.tabs.create({ url: chrome.runtime.getURL("learn_more.html") });
});

document.getElementById('sendComplaint').addEventListener('click', function() {
    document.getElementById('result').innerText = 'Preparing complaint report...';
    chrome.runtime.sendMessage({ action: "prepare_complaint" }, function(response) {
        if (response && response.error) {
            document.getElementById('result').innerText = 'Error: ' + response.error;
        } else {
            document.getElementById('result').innerText = 'Complaint report prepared.';
            // Open complaint.html directly from the popup (tied to the user click)
            chrome.tabs.create({ url: chrome.runtime.getURL("complaint.html") });
        }
    });
});

