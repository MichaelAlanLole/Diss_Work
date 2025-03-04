// IMPORTS
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createScene } from './sceneCreation';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';

// Import Scene Creation
const { scene, camera, renderer } = createScene();

camera.position.z = 10;
camera.position.y = 10;
camera.lookAt(0, 0, 0);

let shuffledQuestions, currentQuestionIndex;

const questionElement = document.getElementById("question");

const label_renderer = new CSS2DRenderer();
label_renderer.setSize(window.innerWidth, window.innerHeight);
label_renderer.domElement.style.position = "absolute";
label_renderer.domElement.style.top = "0px";
//label_renderer.domElement.style.pointerEvents = "none";
document.body.appendChild(label_renderer.domElement);

const startButton = document.createElement("button");
startButton.className = "strt-btn";
const startButtonContain = document.createElement("div");
startButtonContain.appendChild(startButton);
const startButton2D = new CSS2DObject(startButtonContain);
scene.add(startButton2D);

startButton.textContent = "Start";

const answerOne = document.createElement("button");
answerOne.className = "answr-btn hidden";
answerOne.classList.add("answr");
const answrContainer = document.createElement("div");
answrContainer.appendChild(answerOne);
const answerOne2D = new CSS2DObject(answrContainer);
scene.add(answerOne2D);

const answerTwo = document.createElement("button");
answerTwo.className = "answr-btn hidden";
answerTwo.classList.add("answr");
const answrTwoContainer = document.createElement("div");
answrTwoContainer.appendChild(answerTwo);
const answerTwo2D = new CSS2DObject(answrTwoContainer);
scene.add(answerTwo2D);

const answerThree = document.createElement("button");
answerThree.className = "answr-btn hidden";
answerThree.classList.add("answr");
const answrThreeContainer = document.createElement("div");
answrThreeContainer.appendChild(answerThree);
const answerThree2D = new CSS2DObject(answrThreeContainer);
scene.add(answerThree2D);

const answerFour = document.createElement("button");
answerFour.className = "answr-btn hidden";
answerFour.classList.add("answr");
const answrFourContainer = document.createElement("div");
answrFourContainer.appendChild(answerFour);
const answerFour2D = new CSS2DObject(answrFourContainer);
scene.add(answerFour2D);

const nextButtonEl = document.createElement('button');
nextButtonEl.classList.add('next', 'hidden');  // start hidden
nextButtonEl.textContent = 'Next';

const nextButtonContainer = document.createElement('div');
nextButtonContainer.appendChild(nextButtonEl);

const nextButton2D = new CSS2DObject(nextButtonContainer);
scene.add(nextButton2D);
nextButton2D.position.set(0, 3, 0);  // Adjust as desired


const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 10), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
scene.add(floor);

startButton2D.position.set(10, 0, -5);

answerOne2D.position.set(8, 0, 0);
answerTwo2D.position.set(-8, 0, -2);
answerThree2D.position.set(2, 0, 1);
answerFour2D.position.set(5, 0, 2);

startButton.addEventListener("click", startGame);

answerOne.addEventListener("click", selectAnswer);
answerTwo.addEventListener("click", selectAnswer);
answerThree.addEventListener("click", selectAnswer);
answerFour.addEventListener("click", selectAnswer);

nextButtonEl.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
  });

function startGame() {
    console.log("started");
    startButton.classList.add("hidden");
    answerOne.classList.remove("hidden");
    answerTwo.classList.remove("hidden");
    answerThree.classList.remove("hidden");
    answerFour.classList.remove("hidden");

    shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    setNextQuestion();
}

function setNextQuestion() {

    if (currentQuestionIndex >= shuffledQuestions.length) {
        console.log("Quiz finished!");
        questionElement.innerText = "All questions completed!";
        nextButtonEl.classList.add('hidden');
        // You could hide the answer buttons or show a “Restart” button here
        return;
    }

    showQuestion(shuffledQuestions[currentQuestionIndex])

    nextButtonEl.classList.add('hidden');
}

function showQuestion(question) {
    questionElement.innerText = question.question;

    const answerButtons = [answerOne, answerTwo, answerThree, answerFour];
    answerButtons.forEach((button, index) =>  {
        const answerOption = question.answers[index];

        button.classList.remove("correct", "wrong");

        if (answerOption) {
            button.textContent = answerOption.text;
            button.dataset.correct = answerOption.correct;
        }
    });
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";

    if (correct) {
        selectedButton.classList.add("correct");
        console.log("correct");
    } else {
        selectedButton.classList.add("wrong");
        console.log("wrong");
    }

    nextButtonEl.classList.remove('hidden');
}

const questions = [
    {
        question: 'How harmful is pollution?',
        answers: [
            { text: "really bad", correct: true },
            { text: "really good", correct: false },
            { text: "Super Good", correct: false },
            { text: "Super Bad", correct: false }
        ]
    },
    {
        question: 'How gay is liv',
        answers: [
            { text: "really bad", correct: true },
            { text: "really good", correct: false },
            { text: "Super Good", correct: false },
            { text: "Super Bad", correct: false }
        ]
    },
    {
        question: 'How stupid',
        answers: [
            { text: "really bad", correct: true },
            { text: "really good", correct: false },
            { text: "Super Good", correct: false },
            { text: "Super Bad", correct: false }
        ]
    }
]

function animate() {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);

    // Renders The Labels Each Frame
    label_renderer.render(scene, camera);

    floor.rotation.y += 0.2;
}

animate();