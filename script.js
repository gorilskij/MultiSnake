$killOnBite = false;
$follow = false;
$canvases = [4, 3];

k = ['a', ',', 'e', 'o', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
mm = [[-1, 0], [0, -1], [1, 0], [0, 1]];
snake = [[30, 30], [31, 30], [32, 30]];
sk = snake.map(i => i[0]*60 + i[1]);
m = [-1, 0];
eaten = true;
kq = [];
a = randCoord(60, 60, snake);
av = 5;
maxl = snake.length;
frame = 0;

function randCoord(rangex, rangey, exceptions) {
    let p = [];
    for (let i = 0; i < rangex; i++) {
        for (let j = 0; j < rangey; j++) {
            let good = true;
            for (let k of exceptions) {
                if (i === k[0] && j === k[1]) {
                    good = false;
                    break;
                }
            }
            if (good) p.push([i, j]);
        }
    }
    return p[Math.floor(Math.random() * p.length)];
}

function reCanvas(canx, cany) {
    $canvases = [
        canx || Math.abs(parseInt(prompt('Nº of canvases horizontally', '4'))) || 4,
        cany || Math.abs(parseInt(prompt('Nº of canvases vertically', '3'))) || 3
    ];
    let rem = [];
    for (let i of canvasTable.children) {
        rem.push(i);
    }
    rem.forEach(i => {canvasTable.removeChild(i);});

    for (let i = 0; i < $canvases[1]; i++) {
        let nr = document.createElement('tr');
        for (let j = 0; j < $canvases[0]; j++) {
            let nd = document.createElement('td'),
                nc = document.createElement('canvas');
            nc.height = 600;
            nc.width = 600;
            nc.className = 'rep';
            nd.appendChild(nc);
            nr.appendChild(nd);
        }
        canvasTable.appendChild(nr);
    }

    let repc = document.getElementsByClassName('rep');
    rep = [];
    for (let i of repc) {
        rep.push(i.getContext('2d'));
    }
    redrawSnake();
}

window.onload = function () {
    canvasTable = document.getElementById("canvasTable");
    window.onresize();
    game = setInterval(draw, 80);
    g = true;
};

function start_stop() {
    if (g) stop(); else start();
}

function start() {
    game = setInterval(draw, 80);
    g = true;
}

function stop() {
    clearInterval(game);
    g = false;
}

function correct(n, i) {
    return $follow ? mod(n - snake[0][i] + 30, 60) : n;
}

function eachRep(fun) {
    fun(rep[0]);
    for (let i = 1; i < rep.length; i++) {
        rep[i].clearRect(0,0, 600, 600);
        rep[i].drawImage(rep[0].canvas, 0, 0);
    }
}

function draw() {
    if (kq.length) m = mm[kq.shift()];
    snake.unshift([
        mod(snake[0][0] + m[0], 60),
        mod(snake[0][1] + m[1], 60)
    ]);
    sk.unshift(snake[0][0]*60 + snake[0][1]);
    if (sk.indexOf(sk[0], sk.indexOf(sk[0]) + 1) > -1) {
        if ($killOnBite) {
//      LOSE ON TAIL BITE
            stop();
            alert('you lost');
        } else {
//      SNIP TAIL
            snake = snake.slice(0, sk.indexOf(sk[0], sk.indexOf(sk[0]) + 1) + 1);
            sk = snake.map(i => i[0]*60 + i[1]); // ?
            redrawSnake();
        }
        document.title = `${snake.length} (max: ${maxl})`;
    } else if (sk[0] === a[0]*60 + a[1]) {
        eaten += av;
        a = randCoord(60, 60, snake);
        if (Math.random() > 0.9)
            av = 15;
        else
            av = 5;
    } else if (a[0] === undefined || a[1] === undefined)
        a = randCoord(60, 60, snake);

    if (eaten) {
        eaten--;
        if (snake.length > maxl) maxl = snake.length;
        document.title = `${snake.length} (max: ${maxl})`;
    } else {
        eachRep(r => {
            r.fillStyle = 'black';
            r.fillRect(correct(snake[snake.length - 1][0], snake.length - 1)*10, correct(snake[snake.length - 1][1], snake.length - 1)*10, 10, 10);
        });
        snake.pop();
        sk.pop();
    }

    if (frame % 100 === 0 || $follow)
        redrawSnake();
    else
        eachRep(r => {
            r.fillStyle = 'white';
            r.fillRect(correct(snake[0][0], 0)*10, correct(snake[0][1], 1)*10, 10, 10);
        });

    eachRep(r => {
        r.fillStyle = av === 15 ? 'cyan' : 'red';
        r.fillRect(correct(a[0], 0)*10, correct(a[1], 1)*10, 10, 10);
    });
    frame++;
}

function redrawSnake() {
    eachRep(r => {
        r.clearRect(0, 0, 600, 600);
        r.fillStyle = 'white';
        snake.forEach(i => {
            r.fillRect(correct(i[0], 0)*10, correct(i[1], 1)*10, 10, 10);
        });
        r.fillStyle = av === 15 ? 'cyan' : 'red';
        r.fillRect(correct(a[0], 0)*10, correct(a[1], 1)*10, 10, 10);
    });
}

function mod(a, b) {
    return ((a % b) + b) % b;
}

window.onkeydown = function (e) {
    if (e.key === ' ') {
        start_stop();
        return;
    }

    if (e.key === 'f') {
        $follow = !$follow;
        redrawSnake();
        return;
    }

    let key = k.indexOf(key.key) % 4;
    if (key === -1) return;
    if (kq.indexOf(key) === -1 && !(kq.length === 0 && mm[(key + 2) % 4] === m))
        if (kq.length < 2)
            if (kq[0] === (key + 2) % 4)
                kq[0] = key;
            else
                kq.push(key);
        else
        if (kq[1] === (key + 2) % 4)
            kq[1] = key;
};

window.onresize = function () {
    let oc = $canvases;
    $canvases = [
        Math.ceil(window.innerWidth / 300),
        Math.ceil(window.innerHeight / 300)
    ];
    if (oc[0] !== $canvases || oc[1] !== $canvases[1])
        reCanvas(...$canvases);
};