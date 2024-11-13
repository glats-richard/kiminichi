const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const feedBtn = document.getElementById("feedBtn");
const playBtn = document.getElementById("playBtn");
const gameOverText = document.getElementById("gameOver");

// グローバル変数
let health = 100; // 体力（0～100）
let happiness = 100; // 満足度（0～100）
let feedCount = 0; // 餌を与えた回数
let evolutionLevel = 0; // 進化段階（0: 初期, 1: 最初の進化, 2: ドラゴン形態）
let isEvolving = false; // 進化中かどうか
let evolutionFrame = 0; // 進化アニメーションの現在のフレーム

// ハートアイコン設定
const heartImage = new Image();
heartImage.src = "images/heart.webp"; // ハート画像の正しいパスを指定

// キャラクター画像の読み込み
const normalImage = new Image();
normalImage.src = "images/character.png"; // 初期状態の画像
const evolvedImage1 = new Image();
evolvedImage1.src = "images/character2.png"; // 最初の進化画像
const evolvedImage2 = new Image();
evolvedImage2.src = "images/character3.png"; // ドラゴン形態の進化画像

let currentCharacterImage = normalImage; // 現在のキャラクター画像

// 餌の設定
let food = null;

// 餌を生成する関数
function spawnFood() {
    food = {
        x: Math.random() * (canvas.width - 50) + 25, // ランダムな位置
        y: 0,
        radius: 20,
        color: "green",
        speed: 3,
    };
}

// キャラクターオブジェクトの定義
const character = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    width: 80,
    height: 80,
    normalSpeed: 2,
    maxSpeed: 6, // 最大速度
    currentSpeed: 2, // 現在の速度
    direction: 1, // 1: 右, -1: 左
    isMovingToFood: false,
    showHeart: false,
    heartTimer: 0,
    showAlert: false,
};

// キャラクターの移動処理
function moveCharacter() {
    if (character.isMovingToFood && food) {
        const distance = Math.abs(character.x - food.x);
        character.currentSpeed = Math.min(character.maxSpeed, Math.max(character.normalSpeed, distance / 50));

        // 餌に向かって移動
        if (character.x < food.x) {
            character.x += character.currentSpeed;
            character.direction = 1; // 右向き
        } else if (character.x > food.x) {
            character.x -= character.currentSpeed;
            character.direction = -1; // 左向き
        }

        // 到着判定
        if (distance <= character.currentSpeed) {
            character.x = food.x; // 餌の位置に到着
        }
    } else {
        character.x += character.normalSpeed * character.direction;

        // 壁に当たったら方向を反転
        if (character.x - character.width / 2 <= 0 || character.x + character.width / 2 >= canvas.width) {
            character.direction *= -1;
        }
    }
}

// キャラクター画像を描画するヘルパー関数
function drawCharacterImage(image, x, y, width, height) {
    ctx.save();
    if (character.direction === -1) {
        ctx.scale(-1, 1); // 水平方向に反転
        ctx.drawImage(
            image,
            -x - width / 2,
            y - height / 2,
            width,
            height
        );
    } else {
        ctx.drawImage(
            image,
            x - width / 2,
            y - height / 2,
            width,
            height
        );
    }
    ctx.restore();
}

// ハートを描画する関数
function drawHearts(x, y, count) {
    const heartSize = 30; // ハートのサイズ
    const spacing = 5; // ハートの間隔
    for (let i = 0; i < count; i++) {
        ctx.drawImage(heartImage, x + i * (heartSize + spacing), y, heartSize, heartSize);
    }
}

// キャラクターを描画する関数
function drawCharacter() {
    drawCharacterImage(currentCharacterImage, character.x, character.y, character.width, character.height);
}

// ステータスハートの描画
function drawStatus() {
    const maxHearts = 10; // 最大10個のハートを表示
    const healthHearts = Math.ceil((health / 100) * maxHearts); // 体力をハートに変換
    const happinessHearts = Math.ceil((happiness / 100) * maxHearts); // 満足度をハートに変換

    // 体力のハート
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("体力:", 10, 30);
    drawHearts(60, 10, healthHearts);

    // 満足度のハート
    ctx.fillText("満足度:", 10, 70);
    drawHearts(60, 50, happinessHearts);
}

// キャラクターの移動処理
function moveCharacter() {
    if (character.isMovingToFood && food) {
        const distance = Math.abs(character.x - food.x);
        character.currentSpeed = Math.min(character.maxSpeed, Math.max(character.normalSpeed, distance / 50));

        // 餌に向かって移動
        if (character.x < food.x) {
            character.x += character.currentSpeed;
            character.direction = 1; // 右向き
        } else if (character.x > food.x) {
            character.x -= character.currentSpeed;
            character.direction = -1; // 左向き
        }

        // 到着判定
        if (distance <= character.currentSpeed) {
            character.x = food.x; // 餌の位置に到着
        }
    } else {
        character.x += character.normalSpeed * character.direction;

        // 壁に当たったら方向を反転
        if (character.x - character.width / 2 <= 0 || character.x + character.width / 2 >= canvas.width) {
            character.direction *= -1;
        }
    }
}

// ゲームの更新処理
function updateGame() {
    if (health > 0 && happiness > 0) {
        health -= 0.05;
        happiness -= 0.05;
    }

    // 餌の移動とキャッチ判定
    if (food) {
        food.y += food.speed;

        // キャッチ判定
        const dist = Math.hypot(character.x - food.x, character.y - food.y);
        if (dist < character.width / 2 + food.radius) {
            health = Math.min(100, health + 20);
            happiness = Math.min(100, happiness + 10);
            food = null; // 餌を消去
            character.isMovingToFood = false;
            feedCount++;

            // 進化条件の確認
            if (feedCount === 4 && evolutionLevel === 0) {
                evolveCharacter(1); // 最初の進化
            } else if (feedCount === 8 && evolutionLevel === 1) {
                evolveCharacter(2); // ドラゴン形態
            }
        }

        // 餌が画面外に出たら消去
        if (food && food.y > canvas.height) {
            food = null;
            character.isMovingToFood = false;
        }
    }

    moveCharacter();
    draw();
}

// 進化処理
function evolveCharacter(level) {
    evolutionLevel = level; // 進化段階を更新
    if (level === 1) {
        currentCharacterImage = evolvedImage1; // 最初の進化
    } else if (level === 2) {
        currentCharacterImage = evolvedImage2; // ドラゴン形態
    }
    console.log(`進化しました！進化段階: ${level}`);
}

// ゲーム描画
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStatus(); // ステータスハートを描画
    drawCharacter();
    drawFood();
}

// 餌を描画する関数
function drawFood() {
    if (food) {
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
        ctx.fillStyle = food.color;
        ctx.fill();
        ctx.closePath();
    }
}

// 餌を与えるボタンの処理
feedBtn.addEventListener("click", () => {
    if (!food) {
        spawnFood();
        character.isMovingToFood = true;
    }
});

// 遊ぶボタンの処理
playBtn.addEventListener("click", () => {
    if (happiness < 100) happiness = Math.min(100, happiness + 20);
    if (health > 0) health = Math.max(0, health - 10);
});

// ゲームループ
function gameLoop() {
    updateGame();
    if (health > 0 || happiness > 0) {
        requestAnimationFrame(gameLoop);
    }
}

// ゲーム開始
gameLoop();