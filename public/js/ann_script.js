// Author- Aryan Shandilya
document.addEventListener("DOMContentLoaded", () => {
    const announcementsContainer = document.getElementById("announcements");
  
    // Fetch data from announcements.json
    fetch("json_folder/announcements.json")
      .then(response => response.json())
      .then(data => {
        data.forEach(announcement => {
          const card = document.createElement("div");
          card.classList.add("card");
  
          card.innerHTML = `
            <img src="${announcement.image}" alt="Announcement Image">
            <div class="card-content">
              <p>${announcement.description}</p>
              <a href="${announcement.link}" target="_blank">Know More</a>
            </div>
          `;
  
          announcementsContainer.appendChild(card);
        });
      })
      .catch(error => console.error("Error loading announcements:", error));
  });
  