// Variable to decide whether to include "@" when copying the channel handle.
const includeAtSymbol = false; // set to false if you don't want to include "@"

/**
 * Extracts the channel ID or handle from a YouTube video or channel page URL.
 *
 * Parameters:
 *    None. (It uses the current window's URL and accesses the DOM to extract the relevant data)
 *
 * Returns:
 *    string | null: The channel ID or handle if found, otherwise null.
 */
function extractChannelFromVideoPage() {
    // Get the current URL from the window object.
    const currentURL = window.location.href;

    // Check if the URL contains the pattern indicating a channel page using the 'channel' identifier.
    if (currentURL.includes('youtube.com/channel/')) {
        // Split the URL based on the pattern and return the channel ID.
        return currentURL.split('youtube.com/channel/')[1].split('/')[0];
    } 
    // Check if the URL contains the pattern indicating a channel page using the '@' handle.
    else if (currentURL.includes('youtube.com/@')) {
        const extracted = currentURL.split('youtube.com/@')[1];
        // Return the channel handle with or without '@' prefix based on `includeAtSymbol`.
        return includeAtSymbol ? "@" + extracted.split('/')[0] : extracted.split('/')[0];
    }

    // If not on a direct channel page, try to extract the channel from the standard YouTube video page structure.
    const channelLinkElement = document.querySelector('.yt-simple-endpoint.style-scope.ytd-video-owner-renderer');
    if (channelLinkElement) {
        const channelHref = channelLinkElement.getAttribute('href');
        if (channelHref.includes("/channel/")) {
            return channelHref.split("/channel/")[1];
        } else if (channelHref.includes("/@")) {
            const extractedHandle = channelHref.split("/@")[1];
            // Return the channel handle with or without '@' prefix based on `includeAtSymbol`.
            return includeAtSymbol ? "@" + extractedHandle : extractedHandle;
        }
    }

    // If the structure above is not found, then revert to another possible structure to get the channel ID or handle.
    const originalChannelLinkElement = document.querySelector('yt-formatted-string[id="text"] a');
    if (originalChannelLinkElement) {
        const channelHref = originalChannelLinkElement.getAttribute('href');
        if (channelHref.includes("/channel/")) {
            return channelHref.split("/channel/")[1];
        } else if (channelHref.includes("/@")) {
            const extractedHandle = channelHref.split("/@")[1];
            // Return the channel handle with or without '@' prefix based on `includeAtSymbol`.
            return includeAtSymbol ? "@" + extractedHandle : extractedHandle;
        }
    }

    // If no patterns match, return null to indicate that the channel ID or handle was not found.
    return null;
}


/**
 * Creates a button to copy the provided channel ID and inserts it next to the channel name element.
 *
 * Parameters:
 *     channelId (String): The ID of the channel to be copied when the button is clicked.
 *
 * Returns:
 *     None
 */
function createCopyButton(channelId) {
    // Create a new button element
    const button = document.createElement('button');
    
    // Set the inner text for the button
    button.innerText = 'Copy Channel ID';
    
    // Apply styles to the button for a better visual appearance
    button.style.marginLeft = '25px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#202020'; // Dark gray background color
    button.style.color = 'white'; // White text color
    button.style.border = '2px solid #FF0000'; // Red border
    button.style.borderRadius = '6px'; // Rounded corners
    button.style.cursor = 'pointer'; // Cursor changes to pointer on hover
    button.style.fontSize = '1.1rem'; // Font size
    button.style.fontWeight = 'bold'; // Bold font
    button.style.transition = 'background-color 0.3s ease, transform 0.3s ease, color 0.3s ease'; // Smooth transitions
    button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; // Shadow effect

    // Define the hover effect for the button
    button.onmouseover = () => {
        button.style.backgroundColor = '#FF0000'; // Red background on hover
        button.style.color = '#FFFFFF'; // White text on hover
        button.style.transform = 'scale(1.05)'; // Slightly enlarge the button
    };

    // Define the mouse out effect to reset the button's style
    button.onmouseout = () => {
        button.style.backgroundColor = '#202020'; // Reset to dark gray background
        button.style.color = 'white'; // Reset text color
        button.style.transform = 'scale(1)'; // Reset the button's size
    };

    // Attach a click event listener to the button
    button.addEventListener('click', () => {
        // Use the Clipboard API to copy the provided channelId to the clipboard
        navigator.clipboard.writeText(channelId)
            .then(() => {
                // Notify the user that the channel ID has been copied
                alert(`Channel ID "${channelId}" copied to clipboard!`);
            })
            .catch(err => {
                // Notify the user of any error that occurred while copying
                alert('Failed to copy channel ID:', err);
            });
    });

    // Locate the channel name element on the page
    const channelNameElement = document.querySelector('yt-formatted-string[id="text"]');
    if (channelNameElement) {
        // Insert the created button next to the located channel name element
        channelNameElement.parentNode.insertBefore(button, channelNameElement.nextSibling);
    } else {
        // Log an error message if the channel name element isn't found
        console.error("Couldn't find the Channel Name element on the page");
    }
}


/**
 * Sets up the MutationObserver to monitor and act upon specific DOM changes.
 * The observer looks for mutations in child elements of the body.
 * When it detects a change on an element with the `id` of "channel-name",
 * it extracts the channel ID, checks if a copy button already exists, and then
 * creates or updates the button accordingly.
 */

const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.target.id === "channel-name") {
            const channelId = extractChannelFromVideoPage();
            const existingButton = document.querySelector('yt-formatted-string[id="text"] + button');
            
            if (channelId && !existingButton) {
                createCopyButton(channelId);
            } else if (existingButton) {
                existingButton.remove();  // Remove old button
                createCopyButton(channelId);  // Add new button with updated channelId
            }
        }
    }
});

observer.observe(document.body, { attributes: false, childList: true, subtree: true });
