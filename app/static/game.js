// Event listeners
document.addEventListener("DOMContentLoaded", function () {

    var copyInviteButton = document.getElementById("copyInvite")
    if (copyInviteButton) {
        copyInviteButton.addEventListener("click", function(event) {
            var pageUrl = window.location.href;
            navigator.clipboard.writeText(pageUrl)
                .then(function() {
                    copyInviteButton.innerText = 'COPIED!';
                
                setTimeout(function() {
                    copyInviteButton.innerText = 'Copy invite link';
                }, 2000);
            })
            .catch(function(error) {
                console.error("Failed to copy: ", error);
            });
        })
    }
})
    

window.onload = () => {
    const socket = io();
    socket.io.opts.transports = ["websocket"];

    // socket.on("vote", votes => {
    //     let totalVotes = 0;
    //     let voteCount = votes.length;
    
    //     votes.forEach(vote => {
    //         let row = createPlayer(vote['user']);
    //         row.getElementsByTagName("td")[0].innerText = vote['name'];
    //         row.getElementsByTagName("td")[1].innerText = vote['value'];
    
    //         totalVotes += parseFloat(vote['value']);
    //     });
    
    //     let averageVote = totalVotes / voteCount;
    //     let averageVoteText = `CONSENSUS: ${averageVote.toFixed(2)}`;
    
    //     document.getElementById("averageVoteCell").innerText = averageVoteText;
    // });
    
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
