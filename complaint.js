document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get("complaintData", function(data) {
        console.log("Retrieved complaintData:", data);
        if (data.complaintData) {
            document.getElementById("brandEmail").innerText = data.complaintData.brand_email;
            document.getElementById("complaintEmail").innerText = data.complaintData.complaint_email;
        } else {
            document.getElementById("brandEmail").innerText = "No data available. Please prepare the complaint report.";
            document.getElementById("complaintEmail").innerText = "No data available.";
        }
    });
});

// document.getElementById("sendBtn").addEventListener("click", function() {
//     alert("Complaint email sent!");
//     window.close();
// });

// document.getElementById("deleteBtn").addEventListener("click", function() {
//     alert("Complaint email deleted.");
//     window.close();
// });
