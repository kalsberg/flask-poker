function createPlayer(id) {
    let rowId = "playerRow_" + id;
    let playerRow = document.getElementById(rowId);
    
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
        })
    });

    const voteButtons = document.getElementById("vote").getElementsByTagName("button")
    for (let button of voteButtons) {
        button.onclick = click => {
            socket.emit('vote', {data: click.target.innerHTML});
            click.target
            for ( let button of voteButtons ) {
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
        var voteValues = document.querySelectorAll('.vote-value');
        var voteStatuses = document.querySelectorAll('.vote-status');
    
        // Calculate the total sum of vote values
        var totalSum = 0;
        voteValues.forEach(function(voteValue) {
            totalSum += parseInt(voteValue.textContent); // Assuming vote values are stored as text content
        });
    
        // Calculate the average
        var average = totalSum / voteValues.length;
    
        // Create a new row for displaying the average
        var averageRow = document.getElementById('averageVotesRow');
        averageRow.innerHTML = `
            <td class="whitespace-nowrap border-e border-neutral-200 bg-[#D8F0EF] px-6 py-4 font-medium text-[#00857A] dark:border-white/10" colspan="2">
                CONSENSUS: ${average.toFixed(2)}
            </td>
        `;
    
        // Hide the reveal button row
        var revealVotesRow = document.getElementById('revealVotesRow');
        revealVotesRow.style.display = 'none';
    
        // Hide individual vote values and show vote statuses
        voteValues.forEach(function(voteValue) {
            voteValue.style.display = 'none';
        });
    
        voteStatuses.forEach(function(voteStatus) {
            voteStatus.style.display = 'inline';
        });
    
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