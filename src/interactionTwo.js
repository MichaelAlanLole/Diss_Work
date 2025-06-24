// IMPORTS
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createScene } from './sceneCreation';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { contain } from 'three/src/extras/TextureUtils.js';

// Import Scene Creation
const { scene, camera, renderer } = createScene();

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

camera.position.set(2.5, 3.5, -1.3);
camera.lookAt(-2, 0, -1.3);

const listener = new THREE.AudioListener();
camera.add(listener);
const backgroundMusic = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load(
    'Assets/Sounds/CarNoises.mp3',     // path to file
    buffer => {
        backgroundMusic.setBuffer(buffer);
        backgroundMusic.setLoop(true);      //  make it loop
        backgroundMusic.setVolume(0.6);    // tweak volume 0.0–1.0
    }
);

let correctBuffer = null;

// load once at startup
audioLoader.load(
    'Assets/Sounds/CarDriving.mp3',
    buffer => {
        correctBuffer = buffer;
    }
);

function playCorrectSound() {
    if (!correctBuffer) return;               // not loaded yet
    const oneShot = new THREE.Audio(listener);
    oneShot.setBuffer(correctBuffer);
    oneShot.setLoop(false);
    oneShot.setVolume(3);
    oneShot.play();
}

const dir_light = new THREE.DirectionalLight(0xFFFFFF, 1);
dir_light.target.position.set(0, 0, 0);
dir_light.position.set(-4, 15, -10);
dir_light.castShadow = true;
dir_light.shadow.mapSize.set(4096, 4096);                //  crispness
dir_light.shadow.radius = 4;                        // PCFSoft blur radius
dir_light.shadow.bias = -0.0005;
// adjust the orthographic camera frustum for the shadow
const d = 8;
dir_light.shadow.camera.left = -d;
dir_light.shadow.camera.right = d;
dir_light.shadow.camera.top = d;
dir_light.shadow.camera.bottom = -d;
dir_light.shadow.camera.near = 1;
dir_light.shadow.camera.far = 30;
scene.add(dir_light);
scene.add(dir_light.target);

const loader = new GLTFLoader()

const clock = new THREE.Clock();
const mixers = [];    // THREE.AnimationMixer[]
const carModels = [];   // THREE.Group  – index = answer button 0‑3
const carActions = [];

loader.load(
    'Assets/models/city.glb', // Path to the .gltf file
    (gltf) => {
        const cityModel = gltf.scene;
        cityModel.traverse(child => {
            if (child.isMesh) {
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        scene.add(cityModel);
    },
    (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

const carPositions = [           // match your layout / answer order
    new THREE.Vector3(-1.6, -0.13, -3),  // answerOne
    new THREE.Vector3(-0.5, -0.13, 0.4),  // answerTwo
    new THREE.Vector3(0.6, -0.13, -1.8),  // answerThree
    new THREE.Vector3(-2.8, -0.13, -0.7)   // answerFour
];

const carFiles = [
    'Assets/models/Cars/car.glb',   // answerOne
    'Assets/models/Cars/car2.glb',   // answerTwo
    'Assets/models/Cars/car3.glb',   // answerThree
    'Assets/models/Cars/car4.glb'    // answerFour
];

const carRotations = [              // Euler angles in radians
    new THREE.Euler(0, 0, 0),   
    new THREE.Euler(0, Math.PI, 0),   
    new THREE.Euler(0, -Math.PI / 2, 0),   
    new THREE.Euler(0, Math.PI / 2, 0)    
];

carFiles.forEach((file, idx) => {
    loader.load(
        file,
        gltf => {
            const car = gltf.scene;
            car.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;    // this mesh casts shadows
                    child.receiveShadow = true; // this mesh also shows shadows from others
                }
            });
            car.position.copy(carPositions[idx]);
            car.rotation.copy(carRotations[idx]);
            scene.add(car);
            carModels[idx] = car;

            // Mixer + *all* clips for this model
            const mixer = new THREE.AnimationMixer(car);
            mixers[idx] = mixer;

            const seq = [];
            gltf.animations.forEach(clip => {
                const a = mixer.clipAction(clip);
                a.setLoop(THREE.LoopOnce, 0);
                a.clampWhenFinished = true;
                seq.push(a);
            });
            carActions[idx] = seq;
        },
        xhr => console.log(`${Math.round((xhr.loaded / xhr.total) * 100)} % ${file}`),
        err => console.error(`Error loading ${file}:, err`)
    );
});

let shuffledQuestions, currentQuestionIndex;

const questionElement = document.getElementById("question");

const label_renderer = new CSS2DRenderer();
label_renderer.setSize(window.innerWidth, window.innerHeight);
label_renderer.domElement.style.position = "absolute";
label_renderer.domElement.style.top = "0px";
label_renderer.domElement.style.pointerEvents = "none";
document.body.appendChild(label_renderer.domElement);

const startButton = document.createElement("button");
startButton.id = "start-button";     
startButton.className = "strt-btn";
startButton.textContent = "Start";

questionElement.appendChild(startButton);   // ← INSIDE the container

const answerOne = document.createElement("button");
answerOne.className = "answr-btn hidden";
answerOne.classList.add("answr");
const answrContainer = document.createElement("div");
answrContainer.style.pointerEvents = "auto";
answrContainer.appendChild(answerOne);
const answerOne2D = new CSS2DObject(answrContainer);
scene.add(answerOne2D);

const answerTwo = document.createElement("button");
answerTwo.className = "answr-btn hidden";
answerTwo.classList.add("answr");
const answrTwoContainer = document.createElement("div");
answrTwoContainer.style.pointerEvents = "auto";
answrTwoContainer.appendChild(answerTwo);
const answerTwo2D = new CSS2DObject(answrTwoContainer);
scene.add(answerTwo2D);

const answerThree = document.createElement("button");
answerThree.className = "answr-btn hidden";
answerThree.classList.add("answr");
const answrThreeContainer = document.createElement("div");
answrThreeContainer.style.pointerEvents = "auto";
answrThreeContainer.appendChild(answerThree);
const answerThree2D = new CSS2DObject(answrThreeContainer);
scene.add(answerThree2D);

const answerFour = document.createElement("button");
answerFour.className = "answr-btn hidden";
answerFour.classList.add("answr");
const answrFourContainer = document.createElement("div");
answrFourContainer.style.pointerEvents = "auto";
answrFourContainer.appendChild(answerFour);
const answerFour2D = new CSS2DObject(answrFourContainer);
scene.add(answerFour2D);

const explanationBox = document.createElement('div');
explanationBox.id = 'explanation-box';
explanationBox.classList.add('hidden');
questionElement.parentElement.appendChild(explanationBox);

const nextButtonEl = document.createElement('button');
const nextContainer = document.createElement('div');
nextContainer.appendChild(nextButtonEl);
nextContainer.classList.add('next-container');
nextButtonEl.classList.add('next');  // start hidden
nextButtonEl.textContent = 'Next';
questionElement.parentElement.appendChild(nextContainer);

const restartButton = document.createElement('button');
restartButton.id = 'restart-button';
restartButton.classList.add('next', 'hidden');  // reuse .next styling
restartButton.textContent = 'Restart';

// append it in the same wrapper as Next
nextContainer.appendChild(restartButton);

// wire up its click to restart the quiz
restartButton.addEventListener('click', () => {
    restartQuiz();
});

answerOne2D.position.set(-1.6, 1, -3);
answerTwo2D.position.set(-0.5, 1, 0.4);
answerThree2D.position.set(0.6, 1, -1.8);
answerFour2D.position.set(-2.8, 1, -0.7);

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
    listener.context.resume().then(() => {
        if (!backgroundMusic.isPlaying) {
            backgroundMusic.play();
        }
    });

    startButton.classList.add("hidden");
    answerOne.classList.remove("hidden");
    answerTwo.classList.remove("hidden");
    answerThree.classList.remove("hidden");
    answerFour.classList.remove("hidden");

    shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    setNextQuestion();
}

function playAllClips(index) {
    const seq = carActions[index];
    const mixer = mixers[index];
    if (!seq || !mixer) return;

    // Stop any previous listeners to avoid duplicates
    mixer.removeEventListener('finished', mixer._allDoneListener ?? (() => { }));

    let finishedCount = 0;
    const total = seq.length;

    const onFinished = (e) => {
        if (!seq.includes(e.action)) return;   // ignore clips from other cars
        finishedCount++;
        if (finishedCount === total) {
            mixer.removeEventListener('finished', onFinished);
            seq.forEach(a => a.stop());        // freeze
            mixer.setTime(0);                  // first frame / rest pose
        }
    };
    mixer.addEventListener('finished', onFinished);
    mixer._allDoneListener = onFinished;

    // Fire **all** clips right now
    seq.forEach(a => a.reset().play());
}

function playCar(index) {

    playAllClips(index);            // play all its clips

}

function setNextQuestion() {

    explanationBox.classList.add('hidden');
    explanationBox.textContent = '';

    [answerOne, answerTwo, answerThree, answerFour].forEach(btn => {
        btn.disabled = false;                  // re‑enable click
        btn.classList.remove('correct', 'wrong'); // clear any coloring
    });

    if (currentQuestionIndex >= shuffledQuestions.length) {
        console.log("Quiz finished!");
        questionElement.innerText = "All questions completed!";
        nextContainer.classList.remove('show')
        nextButtonEl.classList.add('hidden');
        restartButton.classList.remove('hidden');
        nextContainer.classList.add('show');
        return;
    }

    showQuestion(shuffledQuestions[currentQuestionIndex])

    nextContainer.classList.remove('show');
}

function restartQuiz() {
    // 1) Hide explanation
    explanationBox.classList.add('hidden');
    explanationBox.textContent = '';

    // 2) Hide the next/restart container
    nextContainer.classList.remove('show');
    restartButton.classList.add('hidden');
    nextButtonEl.classList.add('hidden');

    // 3) Shuffle & reset index
    shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;

    // 4) Reset pointer-events on the CSS2DRenderer so clicks hit your buttons
    label_renderer.domElement.style.pointerEvents = 'none';

    // 5) Reset all answer buttons
    const answerButtons = [answerOne, answerTwo, answerThree, answerFour];
    answerButtons.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
        btn.classList.remove('hidden');
    });

    // 6) Render the first question
    showQuestion(shuffledQuestions[0]);
}

function showQuestion(question) {
    const n = currentQuestionIndex + 1;        // 1‑based
    const max = shuffledQuestions.length;        // after shuffle
    questionElement.innerText = `Question ${n}: ${question.question}`;


    const answerButtons = [answerOne, answerTwo, answerThree, answerFour];
    answerButtons.forEach((button, index) => {
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
    const idx = [answerOne, answerTwo, answerThree, answerFour]
        .indexOf(selectedButton);
    const correct = selectedButton.dataset.correct === "true";



    if (correct) {
        playCar(idx);
        selectedButton.classList.add("correct");
        const q = shuffledQuestions[currentQuestionIndex];

        playCorrectSound();

        explanationBox.innerHTML = `
      <strong>Answer:</strong>
      ${q.answers.find(a => a.correct).text}<br>
      ${q.explanation}
    `;
        explanationBox.classList.remove('hidden');

        nextContainer.classList.add('show');

        [answerOne, answerTwo, answerThree, answerFour].forEach(btn => btn.disabled = true);

    } else {
        selectedButton.classList.add("wrong");
        selectedButton.disabled = true;
    }
}

const questions = [
    {
        question: 'What percentage of the UK\'s total nitrogen oxide (NOx) emissions in 2022 was attributed to the transport sector?',
        answers: [
            { text: "22%", correct: false },
            { text: "36%", correct: false },
            { text: "71%", correct: false },
            { text: "49%", correct: true }
        ],
        explanation: 'Absolutely right! That number is surprisingly high, but would you believe it has actually dropped by 78% since 1990? This impressive decline is thanks to significant advancements in motor vehicle development.'
    },
    {
        question: 'In 2022, what percentage of the UK\'s total PM2.5 (particulate matter) pollution was attributed to the transport sector?',
        answers: [
            { text: "12%", correct: false },
            { text: "19%", correct: false },
            { text: "22%", correct: true },
            { text: "31%", correct: false }
        ],
        explanation: 'Exactly! It’s incredible, despite how harmful Particulate Matter is to breathe in, its levels have dropped by 72% since 1990. Thank goodness for that progress!'
    },
    {
        question: 'Which transport-related pollutant poses the greatest risk to human health?',
        answers: [
            { text: "PM2.5", correct: true },
            { text: "PM10", correct: false },
            { text: "Nitrogen Oxides", correct: false },
            { text: "Carbon Dioxide", correct: false }
        ],
        explanation: 'Correct! PM2.5 is considered the most hazardous because of the variety of harmful chemicals it can carry and its incredibly small size, which allows it to penetrate deep into the tiny crevices of our lungs.'
    },
    {
        question: 'Which country has the highest number of vehicles per person, with 1,606 vehicles per 1,000 people?',
        answers: [
            { text: "China", correct: false },
            { text: "United States", correct: false },
            { text: "New Zealand", correct: false },
            { text: "San Marino", correct: true }
        ],
        explanation: 'Spot on! Because of San Marino’s small size, it actually has more cars than people! Interestingly, New Zealand ranks 9th and the United States comes in at 11th.'
    },
    {
        question: 'Which of the following are symptoms or health effects caused by nitrogen oxide (NOx) pollution?',
        answers: [
            { text: "Lung Disease", correct: true },
            { text: "Damage Crops", correct: true },
            { text: "Smog", correct: true },
            { text: "Change Soil Chemistry", correct: true }
        ],
        explanation: 'Correct! Actually all of these are symptoms of Nitrogen Oxide (NOx).'
    },
    {
        question: 'Which of the following are symptoms or health effects associated with PM2.5 and PM10 (particulate matter) pollution?',
        answers: [
            { text: "Worsening Medical Conditions", correct: true },
            { text: "Lung Cancer", correct: true },
            { text: "Chronic Bronchitis", correct: true },
            { text: "Reduced Lung Function", correct: true }
        ],
        explanation: 'Absolutely right! In fact, all of these are symptoms associated with exposure to both PM2.5 and PM10!'
    },
    {
        question: 'What is the difference between PM2.5 and PM10 (Particulate Matter)?',
        answers: [
            { text: "Size", correct: true },
            { text: "Health Effects", correct: false },
            { text: "How they are Produced", correct: false },
            { text: "Colour", correct: false }
        ],
        explanation: 'Well done! Interestingly, even though they contain the same chemicals. The size difference between the two makes PM2.5 much more deadly!'
    },
    {
        question: 'What was the largest contributor to greenhouse gas emissions in the UK in 2021?',
        answers: [
            { text: "Factories", correct: false },
            { text: "Transport", correct: true },
            { text: "Fossil Fuel Power Plants", correct: false },
            { text: "Agriculture", correct: false }
        ],
        explanation: 'Great job! While this isn’t a historic high, it was still 10% higher than the previous year, 2020.'
    },
    {
        question: 'What percentage of the UK’s total greenhouse gas emissions in 2021 came from the transport sector?',
        answers: [
            { text: "31%", correct: false },
            { text: "17%", correct: false },
            { text: "5%", correct: false },
            { text: "26%", correct: true }
        ],
        explanation: 'Correct! A quarter of our greenhouse gas emissions each year come from transportation alone!'
    },
    {
        question: 'Which country had the worst air quality in the world according to the 2023 World Air Quality Report?',
        answers: [
            { text: "China", correct: false },
            { text: "Bangladesh", correct: true },
            { text: "France", correct: false },
            { text: "Indonesia", correct: false }
        ],
        explanation: 'Spot on! Areas that are poorer and more densely populated often experience significantly worse air quality.'
    },
    {
        question: 'Which country has released the most greenhouse gases into the atmosphere to date?',
        answers: [
            { text: "India", correct: false },
            { text: "UK", correct: false },
            { text: "Russia", correct: false },
            { text: "United States", correct: true }
        ],
        explanation: 'Great job! Surprisingly, the United States is responsible for the highest emissions, followed by China in second place and Russia in third.'
    }
]

function animate() {

    requestAnimationFrame(animate);

    // advance all mixers
    const delta = clock.getDelta();
    mixers.forEach(mixer => mixer.update(delta));

    renderer.render(scene, camera);

    // Renders The Labels Each Frame
    label_renderer.render(scene, camera);
}

animate();