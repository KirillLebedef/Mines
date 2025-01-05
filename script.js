// JS
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("grid");
    const counter = document.getElementById("counter");
    const plusBtn = document.getElementById("plus");
    const minusBtn = document.getElementById("minus");
    const getSignalBtn = document.getElementById("getSignal");

    let count = 3;
    const cooldownTime = 5000; // Кулдаун в миллисекундах (5000 мс = 5 секунд)
    let isCooldown = false; // Флаг кулдауна

    // Создаем сетку 5x5
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        grid.appendChild(cell);
    }

    function updateCounter() {
        counter.textContent = count;
    }

    plusBtn.addEventListener("click", () => {
        if (count < 7) {
            count = count === 1 ? 3 : count === 3 ? 5 : 7;
            updateCounter();
        }
    });

    minusBtn.addEventListener("click", () => {
        if (count > 1) {
            count = count === 7 ? 5 : count === 5 ? 3 : 1;
            updateCounter();
        }
    });

    /**
     * Функция «рассыпания» клетки на кусочки.
     * @param {HTMLElement} cell - Ячейка, которую "разбиваем".
     */
    function breakIntoPieces(cell) {
        cell.style.backgroundImage = "";
        cell.style.position = "relative";
        cell.style.backgroundColor = "transparent";
        cell.style.border = "none";
        cell.innerHTML = "";

        // Количество кусочков
        const numberOfPieces = 12;

        for (let i = 0; i < numberOfPieces; i++) {
            const piece = document.createElement("div");
            piece.classList.add("piece");

            // Случайный размер кусочка (4–10 px)
            const randSize = Math.floor(Math.random() * 7) + 4;
            piece.style.width = randSize + "px";
            piece.style.height = randSize + "px";

            // Случайное смещение (-50…50)
            const randX = (Math.random() - 0.5) * 100;
            const randY = (Math.random() - 0.5) * 100;

            // Случайный угол поворота (-180…180)
            const randRot = (Math.random() - 0.5) * 360;

            // Ставим значения в CSS-переменные
            piece.style.setProperty("--randX", randX.toFixed(1));
            piece.style.setProperty("--randY", randY.toFixed(1));
            piece.style.setProperty("--randRot", randRot.toFixed(1));

            // Ставим кусочек в центр ячейки
            piece.style.left = `calc(50% - ${randSize / 2}px)`;
            piece.style.top  = `calc(50% - ${randSize / 2}px)`;

            // Для разнообразия — случайная продолжительность (0.5–0.8с)
            const randomDuration = (0.5 + Math.random() * 0.3).toFixed(2);
            piece.style.animationDuration = `${randomDuration}s`;

            cell.appendChild(piece);
        }

        // По окончании анимации убираем кусочки
        setTimeout(() => {
            cell.innerHTML = "";
            cell.style.position = "";
        }, 800);
        // 800 мс — чуть больше, чем макс. длительность анимации (0.8s),
        // чтобы гарантированно убрать всё после завершения.
    }

    /**
     * Функция для отображения временного сообщения
     * @param {string} message - Текст сообщения
     */
    function showMessage(message) {
        // Проверяем, есть ли уже отображающееся сообщение
        if (document.querySelector('.popup-message')) {
            return; // Если есть, не создаем новое
        }

        // Создаем контейнер для сообщения
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("popup-message");
        messageDiv.textContent = message;

        // Добавляем сообщение в конец body
        document.body.appendChild(messageDiv);

        // Запустить анимацию показа
        setTimeout(() => {
            messageDiv.classList.add("show");
        }, 10);

        // Удаляем сообщение через 2 секунды
        setTimeout(() => {
            messageDiv.classList.remove("show");
            messageDiv.classList.add("hide");
            // Удаляем элемент после завершения анимации
            setTimeout(() => {
                messageDiv.remove();
            }, 500); // Время должно совпадать с временем анимации hide
        }, 2000);
    }

    // Генерация сигнала
    getSignalBtn.addEventListener("click", () => {
        if (isCooldown) {
            // Если в режиме кулдауна, показываем сообщение
            showMessage("Wait 5 seconds");
            return;
        }

        // Выполняем основную логику генерации сигнала
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.style.backgroundImage = "";
            cell.style.backgroundColor = "#5489c2";
            cell.innerHTML = "";
            cell.style.position = "";
            cell.style.border = "";
        });

        let numberOfStars = 0;
        switch (count) {
            case 1:
                numberOfStars = 10;
                break;
            case 3:
                numberOfStars = 5;
                break;
            case 5:
                numberOfStars = 4;
                break;
            case 7:
                numberOfStars = 3;
                break;
            default:
                numberOfStars = 5;
        }

        const selectedCells = [];
        let delay = 0;

        while (selectedCells.length < numberOfStars) {
            const index = Math.floor(Math.random() * 25);
            if (!selectedCells.includes(index)) {
                selectedCells.push(index);
                const selectedCell = cells[index];

                setTimeout(() => {
                    breakIntoPieces(selectedCell);

                    // Появление звезды чуть позже
                    setTimeout(() => {
                        selectedCell.style.backgroundImage = "url('star.png')";
                        selectedCell.style.backgroundSize = "cover";
                        selectedCell.style.backgroundPosition = "center";
                    }, 0);

                }, delay);

                delay += 600;
            }
        }

        // Устанавливаем режим кулдауна
        isCooldown = true;

        // Запускаем таймер кулдауна
        setTimeout(() => {
            isCooldown = false;
        }, cooldownTime);
    });
});
