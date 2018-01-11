let view = {
    generateDateSelector(selectElement, MAX_HOLD_DAYS) {
        let currentDay = new Date().getDate();
        let optionsHtml = ``;

        for (let i = 0; i < MAX_HOLD_DAYS; i++) {
            let nextDate = new Date(new Date().setDate(currentDay + i));
            optionsHtml += `<option>${nextDate.toLocaleDateString()}</option>`;
        }
        selectElement.innerHTML = optionsHtml;
    },

    generateRoomsPickerList(roomsPicker, rooms) {
        roomsPicker.innerHTML = ``;

        rooms.forEach(room => {
            let holdedClassName = +room.statusCode ? `attention` : ``;
            roomsPicker.innerHTML +=
                `<div onclick="app.setPickDatetimePageContext(${room.id})" class="room-list-item" style="background-image: url(${room.photoLink})">` +
                    `<div class="gradient"></div>` +
                    `<h2 class="room-name">${room.name}<small>${room.location}</small></h2>` +
                    `<span class="room-status ${holdedClassName}">${room.statusText}</span>` +
                `</div>`;
        });
    },

    generateTimePickerList(timePicker, HOURS_PER_DAY, MINUTES_PER_HOUR, HOUR_SEPARATOR) {
        let listHtml = ``;

        for (let i = 0; i < HOURS_PER_DAY * MINUTES_PER_HOUR; i += MINUTES_PER_HOUR / HOUR_SEPARATOR) {
            let emptyDate = new Date(new Date(0).setHours(0));
            let time = new Date(emptyDate.setMinutes(i));
            let stringTime = time.toLocaleTimeString().split(/:00$/)[0];
            listHtml +=
                `<li>` +
                    `<input type="checkbox" class="time-item" id="time-${stringTime}">` +
                    `<label for="time-${stringTime}">` +
                        `<span>${stringTime}</span>` +
                    `</label>` +
                `</li>`;
        }
        timePicker.innerHTML = listHtml;
    },

    setElementStyle(element, styleAttr, value) {
        element.style[styleAttr] = value;
    },

    setRoomTitle(container, name, location) {
        container.innerHTML = name + `<small>${location}</small>`;
    },

    disableElement(element) {
        let DOMElement = document.getElementById(element);
        DOMElement.disabled = true;
    },

    show(element) {
        element.classList.remove(`hidden`);
    },

    hide(element) {
        element.classList.add(`hidden`);
    }
};