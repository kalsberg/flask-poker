function createPlayer(id) {
    let playerRow = document.getElementById(id);
    
    // Check if player already exists
    if (playerRow) {
        return playerRow;
    }

    playerRow = document.createElement("tr");
    playerRow.id = id
    let nameData = document.createElement("td")
    let voteData = document.createElement("td")
    playerRow.appendChild(nameData);
    playerRow.appendChild(voteData);
    document.getElementsByTagName("tbody")[0].appendChild(playerRow);
    return playerRow;
}

window.onload = () => {
    const socket = io();
    socket.io.opts.transports = ["websocket"];

    socket.on("vote", votes => {
        votes.forEach(vote => {
            let row = createPlayer(vote['user']);
            console.log(row.getElementsByTagName("td"))
            // row.getElementsByTagName("td")[1].innerText = vote['value']
        })
        console.log(votes)
    });

    const voteButtons = document.getElementById("vote").getElementsByTagName("button")
    for (let button of voteButtons) {
        button.onclick = click => {
            socket.emit('vote', {data: click.target.innerHTML});
            console.log(click.target.innerHTML)
            click.target
            for ( let button of voteButtons ) {
                button.classList.remove("me");
                click.target.classList.add("me");
            }
        }
    }

    document.getElementById("showVote").onclick = () => {
        socket.emit('show', {});
    }
}