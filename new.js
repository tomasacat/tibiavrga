let currentGuildName = null;
let oldOnlineMembers = [];
const updateInterval = 60000;
let currentSort = {
    column: null,
    order: 'ascending' 
};

// get guild name, remove unwanted characters, check if !newGuildName truthy or falsy if NO guild in entered or is falsy return... 
// if newGuild is not equalto current guildname 
function guildToTrack() {
    const newGuildName = document.getElementById('guildName').value.trim();

    if (!newGuildName) {
        return; 
    }

    if (newGuildName !== currentGuildName) {
        currentGuildName = newGuildName;
        const tibiaApi = `https://api.tibiadata.com/v4/guild/${currentGuildName}`;
        guildInfo(tibiaApi);
    }
}

//  fetch api, if response not equal 200, return error. If response is equal 200, get only online guild members,
// map by name, vocation, level, group if less than or equal to 130, group is Maker, if less than or equal to 400, group is Bomb, else group is Main
// log current online members, old online members, call compare and log, if diff update old online ( which is actual list of online members)
// if diff update current online ( which is actual list of online members) the current online members will be added to old online
function guildInfo(tibiaApi) {
    fetch(tibiaApi)
        .then(response => {
            if (response.status !== 200) {
                throw new Error('Error in API, Try again later.');
            }
            return response.json();
        })
        .then(data => {
            if (data.guild) {
                const currentOnlineMembers = data.guild.members
                    .filter(member => member.status === 'online')
                    .map(member => ({
                        name: member.name,
                        vocation: member.vocation === 'Druid' ? 'Elder Druid' : member.vocation === 'Sorcerer' ? 'Master Sorcerer' : member.vocation === 'Knight' ? 'Elite Knight' : member.vocation === 'Paladin' ? 'Royal Paladin' : member.vocation,
                        level: member.level,
                        group: member.level <= 130 ? 'Maker' : member.level <= 400 ? 'Bomb' : 'Main'
                    }));

                console.log("Current online:", currentOnlineMembers);
                console.log("Old online:", oldOnlineMembers);

                compareAndLogChanges(currentOnlineMembers, oldOnlineMembers);
                
                oldOnlineMembers = [...currentOnlineMembers];

                    updateOnlineCountsTable();
                    sortMembers();
                    mainGuildTable();
                
            }
        })
        .catch(error => {
            console.error("Error fetching guild:", error);
            alert("Enter an existing guild.");
        });

}


//  log online sessions, compare members, if currentnames are not in oldonline, user has logged off...
//  if current online is not in old online, user has just logged in
// added to check if level has changed
function compareAndLogChanges(currentOnlineMembers, oldOnlineMembers) {
    const logContainer = document.getElementById("logContainer");
    let logMessages = logContainer.innerHTML;

    const currentNames = currentOnlineMembers.map(member => ({ name: member.name, level: member.level }));
    const oldNames = oldOnlineMembers.map(member => ({ name: member.name, level: member.level }));

    const loggedOffMembers = oldOnlineMembers.filter(member => !currentNames.includes(member.name));
    const loggedInMembers = currentOnlineMembers.filter(member => !oldNames.includes(member.name));

    oldOnlineMembers.forEach(oldMember => {
        const currentMember = currentOnlineMembers.find(member => member.name === oldMember.name);
    
        if (currentMember) {
            const levelDiff = currentMember.level - oldMember.level;
    
            if (levelDiff > 0) {
                const message = member.name + " has advanced level.";
                logMessages += message + "<br>"; 

            } else if (levelDiff < 0) {
                const message = member.name + " has recently died.";
                logMessages += message + "<br>"; 

            }
        }
    });
    
    loggedOffMembers.forEach(member => {
        const message = member.name + " has logged off.";
        console.log(message);
        logMessages += message + "<br>"; 
    });

    loggedInMembers.forEach(member => {
        const message = member.name + " has just logged in.";
        console.log(message);
        logMessages += message + "<br>";
    });

    logContainer.innerHTML = logMessages;
}


function mainGuildTable() {
    const guildMainTable = document.getElementById('guildMainTableBody');
    const guildBombTable = document.getElementById('guildBombTableBody');
    const guildMakerTable = document.getElementById('guildMakerTableBody');

    let mainMembers = oldOnlineMembers.filter(member => member.group === 'Main');
    let bombMembers = oldOnlineMembers.filter(member => member.group === 'Bomb');
    let makerMembers = oldOnlineMembers.filter(member => member.group === 'Maker');

    let mainTableRows = generateTableRows(mainMembers);
    let bombTableRows = generateTableRows(bombMembers);
    let makerTableRows = generateTableRows(makerMembers);

    guildMainTable.innerHTML = mainTableRows;
    guildBombTable.innerHTML = bombTableRows;
    guildMakerTable.innerHTML = makerTableRows;
}

function countMembersByGroup() {
    const mainCount = oldOnlineMembers.filter(member => member.group === 'Main').length;
    const bombCount = oldOnlineMembers.filter(member => member.group === 'Bomb').length;
    const makerCount = oldOnlineMembers.filter(member => member.group === 'Maker').length;
    const totalCount = oldOnlineMembers.length;

    return { mainCount, bombCount, makerCount, totalCount };
}

function updateOnlineCountsTable() {
    const counts = countMembersByGroup();
    const onlineCountsTable = document.getElementById('onlineCounts');

    onlineCountsTable.innerHTML = `
        <tr>
            <td>${counts.totalCount}</td>
            <td><img src="media/main.gif" style="width:10px; height:10px; vertical-align:middle;">${counts.mainCount}</td>
            <td><img src="media/bomb.gif" style="width:10px; height:10px; vertical-align:middle;">${counts.bombCount}</td>
            <td><img src="media/maker.gif" style="width:10px; height:10px; vertical-align:middle;">${counts.makerCount}</td>
        </tr>`;
}

// check if sorting is needed
function sortMembers() {
    if (currentSort.column === null || currentSort.column === undefined) {
        return;
    }
// if the column is level, if a - b = positive, ascending, other wise descending, if not level then analyze as string
// in which case ascii for b > a  == ascending, otherwise descending, otherwise not change its value. 
    oldOnlineMembers.sort(function(a, b) {
        if (currentSort.column === 'level') {
            if (currentSort.order === 'ascending') {
                return a.level - b.level;
            } else {
                return b.level - a.level;
            }
        } else {
            if (a[currentSort.column] < b[currentSort.column]) {
                if (currentSort.order === 'ascending') {
                    return -1;
                } else {
                    return 1;
                }
            } else if (a[currentSort.column] > b[currentSort.column]) {
                if (currentSort.order === 'ascending') {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                return 0;
            }
        }
    });
}

function sortTable(column) {
    if (currentSort.column === column) {
        if (currentSort.order === 'ascending') {
            currentSort.order = 'descending';
        } else {
            currentSort.order = 'ascending';
        }
    } else {
        currentSort.column = column;
        currentSort.order = 'ascending';
    }

    sortMembers();
    mainGuildTable();
}

// generate table rows for online members

function generateTableRows(members) {
    return members.map(member => {
        const setVocation = member.vocation.toLowerCase().replace(/ /g, '');
        const setGroup = member.group.toLowerCase();
        const vocationImage = `media/${setVocation}.gif`;
        const groupImage = `media/${setGroup}.gif`;

        return `<tr onclick="copyToClipboard('${member.name}')">
            <td>${member.name}</td>
            <td><img src="${vocationImage}" style="width:10px; height:10px; vertical-align:middle;"> ${member.vocation}</td>
            <td>${member.level}</td>
            <td><img src="${groupImage}" style="width:10px; height:10px; vertical-align:middle;">${member.group}</td>
        </tr>`;
    }).join('');
}

// when click on a member, copy name to clipboard
function copyToClipboard(name) {
    const textToCopy = `exiva "${name}"`;
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert(`Copied to clipboard: ${textToCopy}`);
        })
        .catch(err => {
            alert('Error copying to clipboard', err);
        });
}


setInterval(guildInfo, updateInterval);
