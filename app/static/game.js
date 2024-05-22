function createPlayer(id, name, vote) {
    let rowId = "playerRow_" + id;
    let playerRow = document.getElementById(rowId);
    
    if (playerRow) {
        return playerRow;
    }

    playerRow = document.createElement("tr");
    playerRow.id = rowId;
    playerRow.className = "border-b border-neutral-200 dark:border-white/10";

    let nameData = document.createElement("td");
    nameData.className = "whitespace-nowrap border-e border-neutral-200 px-6 py-4 font-medium dark:border-white/10";
    nameData.textContent = name;
    
    let voteData = document.createElement("td");
    voteData.className = "whitespace-nowrap border-e border-neutral-200 px-6 py-4 dark:border-white/10";
    
    if (vote) {
        let voteValue = document.createElement("span");
        voteValue.className = "vote-value";
        voteValue.style.display = "none";
        voteValue.textContent = vote;

        let voteStatus = document.createElement("span");
        voteStatus.className = "vote-status";
        voteStatus.textContent = "Voted";

        voteData.appendChild(voteValue);
        voteData.appendChild(voteStatus);
    } else {
        voteData.textContent = "Yet to vote";
    }

    playerRow.appendChild(nameData);
    playerRow.appendChild(voteData);
    
    let tbody = document.querySelector("tbody");
    let revealVotesRow = document.getElementById("revealVotesRow");
    tbody.insertBefore(playerRow, revealVotesRow);
    
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
    let averageVote = 0;

    socket.on("vote", votes => {
        let totalVotes = 0;
        let voteCount = votes.length;
    
        votes.forEach(vote => {
            let row = createPlayer(vote['user']);
            row.getElementsByTagName("td")[0].innerText = vote['name'];
            row.getElementsByTagName("td")[1].innerText = vote['value'];
    
            totalVotes += parseFloat(vote['value']);
        });
    
        let averageVote = totalVotes / voteCount;
        let averageVoteText = `CONSENSUS: ${averageVote.toFixed(2)}`;
        console.log(averageVoteText);
    
        // Update the average vote in the HTML
        document.getElementById("averageVoteCell").innerText = averageVoteText;
    });
    
    const voteButtons = document.getElementById("vote").getElementsByTagName("button");
    for (let button of voteButtons) {
        button.onclick = click => {
            socket.emit('vote', {data: click.target.innerHTML});
            click.target;
            for (let button of voteButtons) {
                button.classList.remove("bg-[#00857A]");
                button.classList.add("bg-[#D8F0EF]");
                button.classList.remove("text-[#D8F0EF]");
                button.classList.add("text-[#00857A]");
    
                click.target.classList.remove("bg-[#D8F0EF]");
                click.target.classList.add("bg-[#00857A]");
                click.target.classList.remove("text-[#00857A]");
                click.target.classList.add("text-[#D8F0EF]");
            }
        }
    }    

    document.getElementById("showVote").onclick = () => {
        socket.emit('show');
    
        // Create a new row for displaying the average
        var averageRow = document.getElementById('averageVotesRow');
        averageRow.style.display = 'table-row';
    
        // Hide the reveal button row
        var revealVotesRow = document.getElementById('revealVotesRow');
        revealVotesRow.style.display = 'none';
    
        // Display the row containing the "Create new session" button
        var newSessionRow = document.getElementById('newSession');
        newSessionRow.style.display = 'inline';
    
        document.getElementById("newSession").onclick = () => {
            var currentURL = window.location.href;
            var updatedURL = currentURL.split('/')[0] + '//' + currentURL.split('/')[2];
            window.location.href = updatedURL;
        }
    }
}