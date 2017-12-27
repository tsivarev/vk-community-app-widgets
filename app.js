let app = {
    API_VERSION: '5.69',
    MAX_HOLD_DAYS: 10,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    HOUR_SEPARATOR: {
        EVERY_HOUR: 1,
        EVERY_30MIN: 2,
        EVERY_15MIN: 3
    },
    URL: {
        GET_ROOMS_LIST: 'getRoomsList.php'
    },
    SERVER_ANSWERS: {
        OK: 200
    },

    pages: {
        pickDatetime: document.getElementById('page-pick-datetime'),
        pickRoom: document.getElementById('page-pick-room')
    },
    elements: {
        dateSelector: document.getElementById('select-date'),
        timeSelector: document.getElementById('list-select-time'),
        datetimePageHeader: document.querySelector('#page-pick-datetime .header'),
        datetimePageTitle: document.getElementById('text-title-header')
    },

    show: (page) => {
        app.hideAll();
        view.show(page);

        switch (page) {
            case app.pages.pickDatetime:
                let room = app.pages.pickRoom.rooms.filter(room => room.id == page.context)[0];

                view.setElementStyle(app.elements.datetimePageHeader, 'backgroundImage', 'url(' + room.photoLink + ')');
                view.setRoomTitle(app.elements.datetimePageTitle, room.name, room.location);
                view.generateDateSelector(app.elements.dateSelector, app.MAX_HOLD_DAYS);
                view.generateTimePickerList(app.elements.timeSelector, app.HOURS_PER_DAY, app.MINUTES_PER_HOUR, app.HOUR_SEPARATOR.EVERY_30MIN);
                break;

            case app.pages.pickRoom:
                app.fetchGetData(app.URL.GET_ROOMS_LIST).then((rooms) => {
                    app.pages.pickRoom.rooms = rooms;
                    view.generateRoomsPickerList(app.pages.pickRoom, rooms);
                });
                break;
        }
    },

    hideAll: () => {
        for (let page in app.pages) {
            view.hide(app.pages[page]);
        }
    },

    setPickDatetimePageContext: (context) => {
        app.pages.pickDatetime.context = context;
        app.show(app.pages.pickDatetime);
    },

    fetchGetData: (url) => {
        return fetch(url).then((response) => {
            if (response.status !== app.SERVER_ANSWERS.OK) {
                throw new Error(response.statusText);
            } else if (response.headers.get("Content-type") !== "application/json") {
                throw new TypeError();
            }

            return response.json();
        }).then((responseData) => {
            if (responseData.status === "error") {
                throw new Error(responseData.message);
            }

            return responseData.data;
        });
    },

    init: () => {
        app.show(app.pages.pickRoom);
        app.elements.datetimePageHeader.addEventListener('click', (event) => {
            app.show(app.pages.pickRoom);
        });
    }
};

window.addEventListener('load', () => {
    app.init();
});