/**
 * Scripts for the Deck of Cards API access
 * @author Ben Fuqua
 * @version 1.0
 *
 */

let deckID = null;
let playArea = document.getElementById("play-area");
let score = 0;
let startButton = document.getElementById("Start");
let drawACard = document.getElementById("Hit");
let reset = document.getElementById("Reset");

/**
 * At the loading of the page a fetch request pulls a new deck from the API
 */
//At the start of the page
window.onload = function() {
    //Get a deck from the API
    getDeck();
}

startButton.onclick = gameStart;
drawACard.onclick = drawCard;
reset.onclick = endGame;

/**
 * Gets a new deck from the API
 */
function getDeck()
{
    let url = "https://deckofcardsapi.com/api/deck/new/shuffle";
    let params = {
        method: "post",
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    fetch(url, params)
        .then(response => response.json())
        .then(data => {
            deckID = data.deck_id;
        });
}

/**
 * Starts the game by drawing two cards, hiding the start button, and showing the draw button
 * @returns {Promise<void>}
 */
async function gameStart() {
    for (let i = 0; i < 2; i++) {
        await drawCard();
    }
    startButton.style.display = "none";
    drawACard.style.display = "block";
}

/**
 * Draws a single card and adds it to the players hand.
 * Then refreshes the display of cards, and checks the score
 * @returns {Promise<void>}
 */
async function drawCard() {
    let url = "https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1";
    let url2 = "https://deckofcardsapi.com/api/deck/" + deckID + "/pile/hand/add/";
    let card = null;
    let params = {
        method: "post",
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"}
    };

    await fetch(url, params)
        .then(response => response.json())
        .then(data => {
            card = data.cards[0].code;
            score = score + cardValue(data.cards[0].value);
        });

    let data = new URLSearchParams();
    data.append("cards", card);
    params.body = data;
    console.log(params);

    await fetch (url2, params)
        .then(response => response.json())
        .then(data => console.log(data));

    displayHand();
    checkScore();
}

/**
 * Displays the cards currently in the player's hand
 */
function displayHand()
{
    clear(playArea);
    let url = "https://deckofcardsapi.com/api/deck/" + deckID + "/pile/hand/list/";
    let params = {
        method: "get",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"}
    };

    fetch (url, params)
        .then(response => response.json())
        .then(data => {
            let cardArray = data.piles.hand.cards;
            for (let i = 0; i < cardArray.length; i++) {
                let card = document.createElement("img");
                card.setAttribute("src", cardArray[i].image);
                playArea.appendChild(card);
            }
        })
}

/**
 * Returns all cards to the deck and shuffles
 * Then resets the score to zero, hides the reset button and game over text, and redisplays the start button
 * @returns {Promise<void>}
 */
async function endGame()
{
    let url = "https://deckofcardsapi.com/api/deck/" + deckID + "/return/";
    let url2 = "https://deckofcardsapi.com/api/deck/" + deckID + "/shuffle/";
    let params = {
        method: "get",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"}
    };

    await fetch (url, params)
        .then(response => response.json())
        .then(data => console.log(data));

    await fetch (url2, params)
        .then(response => response.json())
        .then(data => console.log(data));

    displayHand();
    score = 0;
    reset.style.display = "none";
    startButton.style.display = "block";
    document.getElementById("GameOver").innerText = "";

}

/**
 * Checks the card for its value in the game of blackjack
 * @param value The value given by the API (A number, or a face)
 * @returns {null|number} The number value of any given card
 */
function cardValue(value)
{
    if (!isNaN(parseInt(value)))
    {
        return parseInt(value);
    }
    else if (value === "JACK" || value === "QUEEN" || value === "KING")
    {
        return 10;
    }
    else if (value === "ACE")
    {
        if (score + 11 > 21)
        {
            return 1;
        }
        else
        {
            return 11;
        }
    }
    return null;
}

/**
 * Checks the score against the winning score of 21 in blackjack
 */
function checkScore()
{
    if (score > 21)
    {
        document.getElementById("GameOver").innerText = "Game Over!";
        drawACard.style.display = "none";
        reset.style.display = "block";
    }
    console.log(score);
}

/**
 * Removes all cards displayed in the player's hand
 * @param container
 */
function clear(container)
{
    while(container.firstChild)
    {
        container.removeChild(container.firstChild);
    }
}