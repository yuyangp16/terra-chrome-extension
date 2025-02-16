let currentAnalysisResponse = null;  // Used only for immediate UI update

// Utility function to create a leaf image element
function createLeafImage(src) {
    let img = document.createElement('img');
    img.src = chrome.runtime.getURL(src);
    img.alt = 'Leaf';
    return img;
}

document.getElementById('analyzeButton').addEventListener('click', function() {
    document.getElementById('result').innerText = 'Analyzing product...';
    chrome.runtime.sendMessage({ action: "analyze_product" }, function(response) {
        if (response && response.error) {
            document.getElementById('result').innerText = 'Error: ' + response.error;
            currentAnalysisResponse = null;
        } else if (response) {
            currentAnalysisResponse = response;
            
            // Update the sustainability highlights list
            let highlightsList = document.getElementById('sustainabilityHighlights');
            highlightsList.innerHTML = '';
            if (response.sustainability_highlights && response.sustainability_highlights.length > 0) {
                response.sustainability_highlights.forEach(item => {
                    let isPositive = false;
                    let text = item;
                    if(text.startsWith("True")) {
                        isPositive = true;
                        text = text.replace(/^True[:\s-]*/, '');
                    } else if(text.startsWith("False")) {
                        isPositive = false;
                        text = text.replace(/^False[:\s-]*/, '');
                    }
                    let li = document.createElement('li');
                    li.className = 'rating-item';
                    let span = document.createElement('span');
                    span.className = isPositive ? 'icon icon-check' : 'icon icon-x';
                    span.innerText = isPositive ? '\u2713' : '\u2715';
                    li.appendChild(span);
                    li.appendChild(document.createTextNode(text));
                    highlightsList.appendChild(li);
                });
            }
            
            // Append alternative green options if provided
            if (response.green_options && response.green_options.length > 0) {
                let header = document.createElement('h3');
                header.style.textAlign = 'center';
                header.style.margin = '12px 0';
                header.innerText = 'Alternative Green Options:';
                highlightsList.parentNode.insertBefore(header, highlightsList.nextSibling);
                
                let greenList = document.createElement('ul');
                greenList.className = 'rating-list';
                response.green_options.forEach(item => {
                    let li = document.createElement('li');
                    li.className = 'rating-item green-option';
                    // If item is an object with name and link, create a hyperlink
                    if (typeof item === 'object' && item.name && item.link) {
                        let a = document.createElement('a');
                        a.href = item.link;
                        a.target = "_blank";
                        a.innerText = item.name;
                        li.appendChild(a);
                    } else {
                        // Fallback if not in expected format
                        li.appendChild(document.createTextNode(item));
                    }
                    greenList.appendChild(li);
                });
                header.parentNode.insertBefore(greenList, header.nextSibling);
            }
            
            // Update the leaf container based on esg_score
            let leafContainer = document.getElementById('leafContainer');
            leafContainer.innerHTML = '';
            let esgScore = response.esg_score;
            if (typeof esgScore === 'number') {
                if (esgScore === 1) {
                    // 1 red leaf, 4 grey leaves
                    leafContainer.appendChild(createLeafImage("images/red_leaf.png"));
                    for (let i = 0; i < 4; i++) {
                        leafContainer.appendChild(createLeafImage("images/grey_leaf.png"));
                    }
                } else if (esgScore >= 2 && esgScore <= 4) {
                    for (let i = 0; i < esgScore; i++) {
                        leafContainer.appendChild(createLeafImage("images/yellow_leaf.png"));
                    }
                    for (let i = 0; i < 5 - esgScore; i++) {
                        leafContainer.appendChild(createLeafImage("images/grey_leaf.png"));
                    }
                } else if (esgScore === 5) {
                    for (let i = 0; i < 5; i++) {
                        leafContainer.appendChild(createLeafImage("images/green_leaf.png"));
                    }
                }
            }
            
            // Update rating message based on esg_score
            let ratingMessageEl = document.getElementById('ratingMessage');
            if (typeof esgScore === 'number') {
                let message = "";
                switch(esgScore) {
                    case 1:
                        message = "Unsustainable! Do better.";
                        break;
                    case 2:
                        message = "Leaf-ing me unimpressed...";
                        break;
                    case 3:
                        message = "Decent! But there's room to grow.";
                        break;
                    case 4:
                        message = "Eco-friendly! Almost tree-mendous, just a twig away!";
                        break;
                    case 5:
                        message = "Planet Protector! Green hero status.";
                        break;
                }
                ratingMessageEl.innerText = message;
            }
            
            // Hide the Analyze Product button and show the post-analysis actions
            document.getElementById('analyzeButton').style.display = 'none';
            document.getElementById('postAnalysisActions').style.display = 'block';
            
            document.getElementById('result').innerText = 'Analysis Complete';
        }
    });
});

// Event listener for Learn More button
document.getElementById('learnMoreButton').addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL("learn_more.html") });
});

// Event listener for Send Complaint Report button
document.getElementById('sendComplaintButton').addEventListener('click', function() {
    document.getElementById('result').innerText = 'Preparing complaint report...';
    chrome.runtime.sendMessage({ action: "prepare_complaint" }, function(response) {
        if (response && response.error) {
            document.getElementById('result').innerText = 'Error: ' + response.error;
        } else {
            document.getElementById('result').innerText = 'Complaint report prepared.';
            chrome.tabs.create({ url: chrome.runtime.getURL("complaint.html") });
        }
    });
});
