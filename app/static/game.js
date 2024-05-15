function createPlayer(id) {
    let rowId = "playerRow_" + id;
    let playerRow = document.getElementById(rowId);
    
    // Check if player already exists
    if (playerRow) {
        return playerRow;
    }

    playerRow = document.createElement("tr");
    playerRow.id = rowId
    let nameData = document.createElement("td")
    let voteData = document.createElement("td")
    playerRow.appendChild(nameData);
    playerRow.appendChild(voteData);
    document.getElementsByTagName("tbody")[0].appendChild(playerRow);
    return playerRow;
}

function copyToClipboard() {
    var pageUrl = window.location.href;

    navigator.clipboard.writeText(pageUrl)
        .then(function() {
        document.getElementById('copy-invite').innerText = 'COPIED!';
        
        setTimeout(function() {
            document.getElementById('copy-invite').innerText = 'Copy invite link';
        }, 2000);
    })
    .catch(function(error) {
        console.error("Failed to copy: ", error);
    });
}

window.onload = () => {
    const socket = io();
    socket.io.opts.transports = ["websocket"];

    socket.on("vote", votes => {
        votes.forEach(vote => {
            let row = createPlayer(vote['user']);
            row.getElementsByTagName("td")[0].innerText = vote['name'];
            row.getElementsByTagName("td")[1].innerText = vote['value'];
            console.log(row)
        })
    });

    const voteButtons = document.getElementById("vote").getElementsByTagName("button")
    for (let button of voteButtons) {
        button.onclick = click => {
            socket.emit('vote', {data: click.target.innerHTML});
            click.target
            for ( let button of voteButtons ) {
                button.classList.remove("me");
                click.target.classList.add("me");
            }
        }
    }

    document.getElementById("showVote").onclick = () => {
        socket.emit('show');
        var voteValues = document.querySelectorAll('.vote-value');
        var voteStatuses = document.querySelectorAll('.vote-status');

        voteValues.forEach(function(voteValue) {
            voteValue.style.display = 'inline'; // Display vote value
        });

        voteStatuses.forEach(function(voteStatus) {
            voteStatus.style.display = 'none'; // Hide vote status
        });
    }
}