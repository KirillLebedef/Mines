// Инициализация Telegram WebApp
if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    // Расширяем приложение на полный экран
    Telegram.WebApp.expand();

    // (Опционально) Устанавливаем цвет фона приложения
    Telegram.WebApp.setBackgroundColor("#000428");
}

// Ваш существующий код
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("grid");
    const counter = document.getElementById("counter");
    const plusBtn = document.getElementById("plus");
    const minusBtn = document.getElementById("minus");
    const getSignalBtn = document.getElementById("getSignal");

    let count = 3;
    const cooldownTime = 5000; // Кулдаун в миллисекундах (5000 мс = 5 секунд)
    let isCooldown = false; // Флаг кулдауна


    // Функция для вибрации через Telegram
    function telegramVibrate(type, style) {
        if (Telegram.WebApp && Telegram.WebApp.HapticFeedback) {
            if (type === 'impact') {
                Telegram.WebApp.HapticFeedback.impactOccurred(style || 'light');
            } else if (type === 'notification') {
                Telegram.WebApp.HapticFeedback.notificationOccurred(style || 'success');
            } else if (type === 'selection') {
                Telegram.WebApp.HapticFeedback.selectionChanged();
            }
        } else {
            console.warn("Haptic feedback is not supported by Telegram WebApp.");
        }
    }

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
            telegramVibrate('impact', 'light'); // Вибрация при нажатии на плюс
        } else {
            telegramVibrate('notification', 'error'); // Вибрация при превышении лимита
        }
    });

    minusBtn.addEventListener("click", () => {
        if (count > 1) {
            count = count === 7 ? 5 : count === 5 ? 3 : 1;
            updateCounter();
            telegramVibrate('impact', 'light'); // Вибрация при нажатии на минус
        } else {
            telegramVibrate('notification', 'error'); // Вибрация при достижении минимума
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
            telegramVibrate('notification', 'warning'); // Вибрация при попытке нажать во время кулдауна
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

        // Вибрация при успешном нажатии кнопки
        telegramVibrate('impact', 'medium');

        // Устанавливаем режим кулдауна
        isCooldown = true;

        // Запускаем таймер кулдауна
        setTimeout(() => {
            isCooldown = false; // Сбрасываем кулдаун через 5 секунд
        }, cooldownTime);
    });

    // Инициализация Particles.js
    particlesJS("particles-js", {
        "particles": {
            "number": {
                "value": 300, // Количество частиц
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff" // Белый цвет частиц
            },
            "shape": {
                "type": "circle", // Форма частиц
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.7, // Прозрачность частиц
                "random": true,
                "anim": {
                    "enable": true, // Включение анимации прозрачности
                    "speed": 1,
                    "opacity_min": 0.3,
                    "sync": false
                }
            },
            "size": {
                "value": 3, // Размер частиц
                "random": true,
                "anim": {
                    "enable": true, // Включение анимации размера
                    "speed": 2,
                    "size_min": 1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": false, // Отключение линий между частицами
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 12, // Скорость движения частиц
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse" // Отталкивание частиц при наведении
                },
                "onclick": {
                    "enable": true,
                    "mode": "push" // Добавление новых частиц при клике
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
});


document.body.style.height = `${window.innerHeight}px`;
window.addEventListener('resize', () => {
    document.body.style.height = `${window.innerHeight}px`;
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);



