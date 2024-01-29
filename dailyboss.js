
function fetchBoostedCreature() {
    fetch("https://api.tibiadata.com/v4/creatures")
    .then(response => response.json())
    .then(data => {
        if (data.creatures && data.creatures.boosted.featured) {
            boostedCreatureData = {
                name: data.creatures.boosted.name,
                image: data.creatures.boosted.image_url,
            };
        }
    })
    .catch(error => console.error("Error fetching boosted creatures:", error));
}

function fetchBoostedBoss() {
    fetch("https://api.tibiadata.com/v4/boostablebosses")
    .then(response => response.json())
    .then(data => {
        if (data.boostable_bosses && data.boostable_bosses.boosted.featured) {
            boostedBossData = {
                name: data.boostable_bosses.boosted.name,
                image: data.boostable_bosses.boosted.image_url,
            };
        }
    })
    .catch(error => console.error("Error fetching boosted bosses:", error));
}

fetchBoostedCreature();
fetchBoostedBoss();


document.getElementById("showBoostedCheckbox").addEventListener("change", function() {
    const boostedCreatureDisplay = document.getElementById("boostedCreatureDisplay");
    const boostedBossDisplay = document.getElementById("boostedBossDisplay");
    const rashidDisplay = document.getElementById("rashidDisplay");

    if (!this.checked) {
        boostedCreatureDisplay.innerHTML = "";
        boostedBossDisplay.innerHTML = "";
        rashidDisplay.innerHTML = "";
    } else {
        
        if (boostedCreatureData) {
            boostedCreatureDisplay.innerHTML = `<img src="${boostedCreatureData.image}"> ${boostedCreatureData.name}`;
        }
        if (boostedBossData) {
            boostedBossDisplay.innerHTML = `<img src="${boostedBossData.image}"> ${boostedBossData.name}`;
        }
        if (rashidToday) {
            rashidDisplay.innerHTML = `<img src="media/rashid.gif"> Rashid is located in ${rashidToday()}.`;
        }
    }
});

// Rashid spawns on a different city every day.
function rashidToday() {
    let date = new Date();
    date.setUTCHours(date.getUTCHours() - 9);
    let day = date.getUTCDay();
    const rashidSpawn = ["Carlin", "Svargrond", "Liberty Bay", "Port Hope", "Ankrahmun", "Darashia", "Edron"];

    return rashidSpawn[day];
}