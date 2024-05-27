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
