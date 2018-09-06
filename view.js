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

    generateRoomsPickerList(roomsPicker, rooms, adminAccess) {
        let roomListItem = (room, holdedClassName) => {
            return `<div onclick="app.setPickDatetimePageContext(${room.id})" class="room-list-item" style="background-image: url(${room.photoLink})">` +
                        `<div class="gradient"></div>` +
                        `<h2 class="room-name">${room.name}<small>${room.location}</small></h2>` +
                        (adminAccess ? `<div class="icon_x"></div>` : ``) +
                        `<span class="room-status ${holdedClassName}">${room.statusText}</span>` +
                    `</div>`;
        }
        
        roomsPicker.innerHTML = ``;

        rooms.forEach(room => {
            let holdedClassName = +room.statusCode ? `attention` : ``;
            
            roomsPicker.innerHTML += roomListItem(room, holdedClassName);
        });
        
        if (adminAccess) {
            roomsPicker.innerHTML += `<div onclick="alert('change')" class="room-list-item" style="text-align:center; min-height:auto">` +
                                        `<h2 class="room-name" style="padding: 0"><div class="icon_plus"></div>Добавить комнату</h2>` +
                                    `</div>`;
        }
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
    
    disableElement(selector) {
        let DOMElement = document.getElementById(selector);
        DOMElement.disabled = true;
        return DOMElement;
    },

    disableElementByHolder(selector, holderName) {
        let DOMElement = view.disableElement(selector);
        DOMElement.parentElement.setAttribute('title', holderName);
        return DOMElement;
    },
    
    enableElementWithHolder(selector) {
        let oldDomElement = document.getElementById(selector).parentElement;
        let newDomElement = oldDomElement.cloneNode(true);
        newDomElement.removeAttribute('title');
        newDomElement.firstElementChild.disabled = false;
        oldDomElement.parentNode.replaceChild(newDomElement, oldDomElement);
    },

    show(element) {
        element.classList.remove(`hidden`);
    },

    hide(element) {
        element.classList.add(`hidden`);
    }
};