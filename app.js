var app = {
    API_VERSION: '5.69',
    MAX_HOLD_DAYS: 10,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    HOUR_SEPARATOR: {
        EVERY_HOUR: 1,
        EVERY_30MIN: 2,
        EVERY_15MIN: 3
    },

    pages: {
        pickDatetime: document.getElementById('page-pick-datetime'),
        pickRoom: document.getElementById('page-pick-room')
    },
    elements: {
        dateSelector: document.getElementById('select-date'),
        timeSelector: document.getElementById('list-select-time')
    },

    show: function (page) {
        app.hideAll();
        page.classList.remove('hidden');

        switch (page) {
            case app.pages.pickDatetime:
                app.fillDateSelector(app.elements.dateSelector);
                app.elements.timeSelector.innerHTML = app.generateTimePickerList();
                break;

            case app.pages.pickRoom:
                var request = app.getXmlHTTP();
                request.open('GET', 'getRoomsList.php', true);
                request.onreadystatechange = function () {
                    if (request.readyState === 4 && request.status === 200) {
                        var response = JSON.parse(request.responseText);
                        app.pages.pickRoom.innerHTML = app.generateRoomsPickerList(response.data);
                    }
                };
                request.send();
                break;
        }
    },

    hideAll: function () {
        for (var page in app.pages) {
            app.pages[page].classList.add('hidden');
        }
    },

    generateRoomsPickerList: function (rooms) {
        var roomItemHtml = '';

        rooms.forEach(function (room) {
            // TODO: Get Room status
            roomItemHtml += '<div class="room-list-item" style="background-image: url(' + room.photoLink + ')">' +
                        '<div class="gradient"></div>' +
                        '<h2 class="room-name">' + room.name + '<small>' + room.location + '</small></h2>' +
                        '<span class="room-status attention">Сейчас занята. Освободится в 17:30</span>' +
                    '</div>'
        });
        return roomItemHtml;
    },

    fillDateSelector: function (selectElement) {
        selectElement.innerHTML = '';
        var currentDay = new Date().getDate();

        for (var i = 0; i < app.MAX_HOLD_DAYS; i++) {
            var nextDate = new Date(new Date().setDate(currentDay + i));
            selectElement.innerHTML += '<option>' + nextDate.toLocaleDateString() + '</option>';
        }
    },

    generateTimePickerList: function () {
        var tableHtml = '';

        for (var i = 0; i < app.HOURS_PER_DAY * app.MINUTES_PER_HOUR; i += app.MINUTES_PER_HOUR / app.HOUR_SEPARATOR.EVERY_30MIN) {
            var date = new Date(new Date(0).setHours(0));
            var time = new Date(date.setMinutes(i));
            var stringTime = time.toLocaleTimeString().split(/:00$/)[0];
            tableHtml +=
                '<li>' +
					'<input type="checkbox" id="time-' + stringTime + '">' +
					'<label for="time-' + stringTime + '">' +
						'<span>' + stringTime + '</span>' +
					'</label>' +
                '</li>';
        }
        return tableHtml;
    },

    getXmlHTTP: function () {
        var xmlHTTP;
        try {
            xmlHTTP = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (eventMsxml2Error) {
            try {
                xmlHTTP = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (eventMicrosoftError) {
                xmlHTTP = false;
            }
        }

        if (!xmlHTTP && typeof XMLHttpRequest!='undefined') {
            xmlHTTP = new XMLHttpRequest();
        }
        return xmlHTTP;
    },

    init: function () {
        app.show(app.pages.pickDatetime);
    }
};

window.addEventListener('load', function () {
    app.init();
});