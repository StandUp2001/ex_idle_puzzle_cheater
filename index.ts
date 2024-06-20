// #region TYPES/CLASSES
class Buttons {
    position: Vector2;
    color: string;
    direction: Direction;

    constructor(color: string, indexes: [number, number], direction?: Direction) {
        this.position = new Vector2(indexes[0] + 0.5, indexes[1] + 0.5);
        this.color = color;
        this.direction = direction || Math.floor(Math.random() * 4) as Direction;
    }

    updateDirection() {
        switch (this.direction) {
            case Direction.UP:
                this.direction = Direction.RIGHT;
                break;
            case Direction.RIGHT:
                this.direction = Direction.DOWN;
                break;
            case Direction.DOWN:
                this.direction = Direction.LEFT;
                break;
            case Direction.LEFT:
                this.direction = Direction.UP;
                break;
        }
    }
}
class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    array(): [number, number] {
        return [this.x, this.y];
    }
}

enum Direction {
    UP,
    RIGHT,
    DOWN,
    LEFT,
}

enum Mode {
    SET,
    PLAY,
}
// #endregion

// #region UTILS_PROPS
const CUBE_SIZE = 3;
const GRID_ROWS = CUBE_SIZE;
const GRID_COLS = CUBE_SIZE;
const SPACE = 32;
const buttons: Buttons[] = [];
let mode = Mode.SET;
// #endregion


// #region MAIN
(() => {
    const game = document.getElementById("game") as HTMLCanvasElement | null;
    if (!game) throw new Error("Game not found");

    game.width = 800;
    game.height = 800;

    const ctx = game.getContext("2d");
    if (!ctx) throw new Error("Canvas not found");

    window.addEventListener("keypress", (event) => keyDownEvent(event, ctx));
    window.addEventListener("mousedown", (event) => mouseDownEvent(event, ctx));

    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.scale(ctx.canvas.width / GRID_COLS, ctx.canvas.height / GRID_ROWS);
    ctx.strokeStyle = "#303030";
    ctx.lineWidth = 0.05;
    for (let x = 0; x <= GRID_COLS; ++x) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GRID_ROWS);
        ctx.stroke();
    }
    for (let y = 0; y <= GRID_ROWS; ++y) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GRID_COLS, y);
        ctx.stroke();
    }
    for (let x = 0; x < GRID_COLS; ++x) {
        for (let y = 0; y < GRID_ROWS; ++y) {
            buttons.push(new Buttons("#202020", [x, y]));
        }
    }

    renderButtons(ctx);
})();
// #endregion



// #region EVENTS
function keyDownEvent(event: KeyboardEvent, ctx: CanvasRenderingContext2D) {
    switch (event.key.charCodeAt(0)) {
        case SPACE:
            const current = mode;
            mode = mode === Mode.SET ? Mode.PLAY : Mode.SET;
            console.log("Switched mode from", Mode[current], "to", Mode[mode]);
            break;
        default:
            console.log("Key pressed:", event.key);
    }
    switch (mode) {
        case Mode.PLAY:
            console.log("Play mode");
            gameLogic(ctx);
            break;
        default:
            break;
    }
}

function mouseDownEvent(event: MouseEvent, ctx: CanvasRenderingContext2D) {
    const x_index = Math.floor(event.offsetX / (ctx.canvas.width / GRID_COLS));
    const y_index = Math.floor(event.offsetY / (ctx.canvas.height / GRID_ROWS));
    const button = getButton(x_index, y_index);
    if (!button) {
        // Outside the grid
        return;
    }
    switch (mode) {
        case Mode.SET:
            button.updateDirection();
            break;
        case Mode.PLAY:
            updateButtons(x_index, y_index);

            break;
        default:
            break;
    }
    renderButtons(ctx);
}
// #endregion


// #region RENDER
function renderButtonText(ctx: CanvasRenderingContext2D, button: Buttons) {

    function renderArrowStrokes(ctx: CanvasRenderingContext2D, first: Vector2, middle: Vector2, last: Vector2) {
        ctx.moveTo(...first.array());
        ctx.lineTo(...middle.array());
        ctx.lineTo(...last.array());
    }

    const move_pixels = 0.20;
    const center = new Vector2(button.position.x, button.position.y);

    const top = new Vector2(center.x, center.y - move_pixels);
    const left = new Vector2(center.x - move_pixels, center.y);
    const right = new Vector2(center.x + move_pixels, center.y);
    const bottom = new Vector2(center.x, center.y + move_pixels);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 0.05;


    ctx.beginPath();
    switch (button.direction) {
        case Direction.UP:
            renderArrowStrokes(ctx, left, top, right);
            break;
        case Direction.RIGHT:
            renderArrowStrokes(ctx, top, right, bottom);
            break;
        case Direction.DOWN:
            renderArrowStrokes(ctx, right, bottom, left);
            break;
        case Direction.LEFT:
            renderArrowStrokes(ctx, bottom, left, top);
            break;
    }
    ctx.stroke();
}


function circle(ctx: CanvasRenderingContext2D, button: Buttons) {
    // Circle with the color
    ctx.fillStyle = button.color;
    ctx.beginPath();
    ctx.arc(...button.position.array(), 0.45, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "0.3px sans-serif";
    renderButtonText(ctx, button);
}

function renderButtons(ctx: CanvasRenderingContext2D) {
    buttons.forEach((button) => circle(ctx, button));
}

// #endregion


// #region GAME
function gameLogic(ctx: CanvasRenderingContext2D) {
    if (allOneDirection()) {
        console.log("All buttons are in the same direction");
    }
}
// #endregion

// #region UTILS
function getButton(x: number, y: number): Buttons | undefined {
    if (!inBounds(x, y)) {
        return undefined;
    }
    return buttons[y + x * GRID_COLS];
}

function inBounds(x: number, y: number): boolean {
    return x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS;
}

function allOneDirection(): boolean {
    return buttons.every((button) => button.direction === Direction.UP) ||
        buttons.every((button) => button.direction === Direction.RIGHT) ||
        buttons.every((button) => button.direction === Direction.DOWN) ||
        buttons.every((button) => button.direction === Direction.LEFT);
}

function updateButtons(x: number, y: number) {
    for (let i = -1; i <= 1; ++i) {
        for (let j = -1; j <= 1; ++j) {
            const next = getButton(x + j, y + i);
            if (!next) {
                // No button found
                continue;
            }
            next.updateDirection();
        }
    }
}
// #endregion