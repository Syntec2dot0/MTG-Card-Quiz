/* Select all elements */
const start = document.getElementById("start");
const quiz = document.getElementById("quiz");
const qImg = document.getElementById("qImage");
const question = document.getElementById("question");
const counter = document.getElementById("counter");
const timeGauge = document.getElementById("timeGauge");
const choiceA = document.getElementById("A");
const choiceB = document.getElementById("B");
const choiceC = document.getElementById("C");
const progress = document.getElementById("progress");
const scoreContainer = document.getElementById("scoreContainer");
const loading = document.getElementById("loading");
/* Time to answer the question, the max Width of the countdown gauge and how many questions you want to ask */
const questionTime = 10;
const gaugeWidth = 150;
const questionNumber = 5;
/*  current time left*/
let count = 0;
/* The number of pixels that get filled by the second */
const gaugeProgressUnit = gaugeWidth / questionTime;
let TIMER;
let score = 0;
/* The question image answer array */
let questions = [];
/* Variable for the length of the quiz and the current question index */
let lastQuestionIndex = questionNumber - 1;
let runningQuestionIndex = 0;
/* The Scryfall API URL 
Searches for non-split Standard legal cards.*/
const fetchUrl = "https://api.scryfall.com/cards/random?q=legal:standard&&-is:split";
/* renders the Question by changing the Inner html of the Image Question, and Choices Containers */
function questionRender() {
    let q = questions[runningQuestionIndex];
    qImg.innerHTML = "<img src=" + q.imgSrc + ">";
    question.innerHTML = "<p>" + q.question + "</p>";
    choiceA.innerHTML = q.choiceA;
    choiceB.innerHTML = q.choiceB;
    choiceC.innerHTML = q.choiceC;
};

/* renders the progress bar */
function progressRender() {
    /* one Iteration for each Question */
    for (let qIndex = 0; qIndex <= lastQuestionIndex; qIndex++) {
        /* Creates an object in the Progress container which the prog Class and the id of the Question Index */
        progress.innerHTML += "<div class='prog' id=" + qIndex + "></div>";
    }

};
/* Function that gets called when the answer is correct to turn the Progress circle green */
function updateProgress(isCorrect) {
    /* gets the Progress object corresponding to the current question and changes its color*/
    if (isCorrect) {
        document.getElementById(runningQuestionIndex).style.backgroundColor = "green"
    } else {
        document.getElementById(runningQuestionIndex).style.backgroundColor = "red"
    }
};

/* Renders the time gauge and the counter */
function counterRender() {
    /* if time is left update the Counter object and update the timeGauge CSS with the new width */
    if (count <= questionTime) {
        counter.innerHTML = count;
        timeGauge.style.width = gaugeProgressUnit * count + "px";
        count++;
    } else {
        /* If the time runs out the answer counts as wrong  */
        count = 0;
        updateProgress(false);
        /* Is there still a question left? if yes render the new question. If not stop the Interval function and render the final score*/
        if (runningQuestionIndex < lastQuestionIndex) {
            runningQuestionIndex++;
            questionRender();
        } else {
            clearInterval(TIMER);
            scoreRender();
        }
    }
}
/* Function that checks the specified answer and is alled by the onClick event of the answer Buttons */
function checkAnswer(answer) {
    /* Compares the answer var to the specified entry in the question array */
    if (questions[runningQuestionIndex].correct == answer) {
        score++;
        updateProgress(true)
    } else {
        updateProgress(false);
    }
    /* Checks if there are any questions left. If yes resets the timer and renders the next Question if not stops the Intervall func and shows the score*/
    if (runningQuestionIndex < lastQuestionIndex) {
        count = 0;
        runningQuestionIndex++;
        questionRender();
    } else {
        clearInterval(TIMER);
        scoreRender();
    }
};
/* adds a listener that checks if start quiz has been clicked */
start.addEventListener("click", startQuiz);


/* Starts the Quiz */
function startQuiz() {
    start.style.display = "none";
    loading.style.display = "block";
    getQuestions().then(function () {
        loading.style.display = "none";
        questionRender();
        quiz.style.display = "block";
        /* renders the progress and the question for the first time */
        progressRender();
        /* renders the counter for the first time */
        counterRender();
        /* sets the iteration function */
        TIMER = setInterval(counterRender, 1000);
    }).catch(function (error) {
        console.log("Error: " + error);
    });
};

function scoreRender() {
    scoreContainer.style.display = "block";
    const scorePerCent = Math.round(100 * score / questions.length);
    let img = (scorePerCent >= 80) ? "img/5.png" :
        (scorePerCent >= 60) ? "img/4.png" :
            (scorePerCent >= 40) ? "img/3.png" :
                (scorePerCent >= 20) ? "img/2.png" :
                    "img/1.png";

    scoreContainer.innerHTML = "<img src=" + img + ">"
    scoreContainer.innerHTML += "<p>" + scorePerCent + "%</p>";
};

async function getQuestions() {
    let img;
    let correct;
    let artist;
    let incorrectNameOne;
    let incorrectNameTwo;
    let correctName;
    let wrongChoices;
    let correctChoice;
    /* fills the question array with 10 (questionNumber) questions */
    for (let i = 0; i < questionNumber; i++) {
        /* fetches the correct card. Saves art_cropt, artist, correct answer and  */
        const response = await fetch(fetchUrl);
        const data = await response.json();
        await sleeper(50);

        /* fetches the first incorrect card and saves the name */
        const response2 = await fetch(fetchUrl);
        const data2 = await response2.json();
        incorrectNameOne = data2.name;
        await sleeper(50);

        /* fetches the second incorrect card and saves the name */
        const response3 = await fetch(fetchUrl);
        const data3 = await response3.json();
        incorrectNameTwo = data3.name;
        await sleeper(50);

        /* creates a random number for the correct answer  and saves the art_crop artist name and the correct name of the card
        if (data.image_uris.art_crop == "undefined" || data.artist == "undefined") {
            i--;
            console.log("Some property of the card" + data.name + "was undefined. Trying different cards.");
            continue;
        } */
        correct = Math.floor(Math.random() * 3 + 1);
        correctName = data.name;
        console.log(correctName);
        console.log(data);
        if (data.layout == "transform") {
            img = data.card_faces[0].image_uris.art_crop;
            artist = data.card_faces[0].artist;
        } else {
            img = data.image_uris.art_crop;
            artist = data.artist;
        }


        /* Builds the current question with the question, the img and the artist*/
        let questionToAppend = {
            question: "What's this card?",
            imgSrc: img,
            artist: artist,
        };
        /* uses the correct variable to assign the correct answer (1=A 2=B 3=C) with one if and an elseif statement
        then generates another number from 1 to 2 to mix up the wrong answers */
        if (correct == 1) {
            correctChoice = {
                choiceA: correctName,
                correct: "A"
            };
            //questionToAppend = Object.assign(correctChoice);
            if (Math.floor(Math.random() * 2 + 1) == 2) {
                wrongChoices = {
                    choiceB: incorrectNameOne,
                    choiceC: incorrectNameTwo
                };
            } else {
                wrongChoices = {
                    choiceB: incorrectNameTwo,
                    choiceC: incorrectNameOne
                };
            }
            //questionToAppend = Object.assign(wrongChoices);
        } else if (correct == 2) {
            correctChoice = {
                choiceB: correctName,
                correct: "B"
            };
            //questionToAppend = Object.assign(correctChoice);
            if (Math.floor(Math.random() * 2 + 1) == 2) {
                wrongChoices = {
                    choiceA: incorrectNameOne,
                    choiceC: incorrectNameTwo
                };
            } else {
                wrongChoices = {
                    choiceC: incorrectNameTwo,
                    choiceA: incorrectNameOne
                };
            }
            //questionToAppend = Object.assign(wrongChoices);
        } else {
            correctChoice = {
                choiceC: correctName,
                correct: "C"
            };
            //questionToAppend += Object.assign(correctChoice);
            if (Math.floor(Math.random() * 2 + 1) == 2) {
                wrongChoices = {
                    choiceA: incorrectNameOne,
                    choiceB: incorrectNameTwo
                };
            } else {
                wrongChoices = {
                    choiceB: incorrectNameTwo,
                    choiceA: incorrectNameOne
                };
            }
        }
        /* Object.assign() assigns the combination of the specified lists at the specified index of the question container */
        questions[i] = Object.assign(questionToAppend, correctChoice, wrongChoices);
    }
};
/* sleeper function that delays fetch requests. .then(sleeper(x)) or await sleeper(ms)
its promise based so the code will stop until the promise is resolved*/
async function sleeper(ms) {
    return function (x) {
        return new Promise(resolve => setTimeout(() => resolve(x), ms));
    };
};