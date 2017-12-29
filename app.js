let app = {
    API_VERSION: `5.69`,
    MAX_HOLD_DAYS: 10,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    HOUR_SEPARATOR: {
        EVERY_HOUR: 1,
        EVERY_30MIN: 2,
        EVERY_15MIN: 3
    },
    URL: {
        GET_ROOMS_LIST: `getRoomsList.php`,
        GET_ROOMS_HOLD_PERIOD: `getRoomsHoldPeriod.php`
    },
    SERVER_ANSWERS: {
        OK: 200,
        CONTENT_ERROR: `error`
    },
    CONTENT_TYPES: {
        APPLICATION_JSON: `application/json`
    },

    pages: {
        pickDatetime: document.getElementById(`page-pick-datetime`),
        pickRoom: document.getElementById(`page-pick-room`)
    },
    elements: {
        dateSelector: document.getElementById(`select-date`),
        timeSelector: document.getElementById(`list-select-time`),
        datetimePageHeader: document.querySelector(`#page-pick-datetime .header`),
        datetimePageTitle: document.getElementById(`text-title-header`)
    },

    show(page) {
        app.hideAll();
        view.show(page);

        switch (page) {
            case app.pages.pickDatetime:
                let room = app.pages.pickRoom.rooms.filter(room => room.id == page.context)[0];

                view.setElementStyle(app.elements.datetimePageHeader, `backgroundImage`, `url(${room.photoLink})`);
                view.setRoomTitle(app.elements.datetimePageTitle, room.name, room.location);
                view.generateDateSelector(app.elements.dateSelector, app.MAX_HOLD_DAYS);

                let requestGetRoomsHoldStatusData = {
                    roomId: room.id,
                    date: app.elements.dateSelector.value
                };
                app.fetchGetData(app.URL.GET_ROOMS_HOLD_PERIOD, requestGetRoomsHoldStatusData).then(holdPeriods => {
                    view.generateTimePickerList(app.elements.timeSelector, app.HOURS_PER_DAY, app.MINUTES_PER_HOUR, app.HOUR_SEPARATOR.EVERY_30MIN);
                    if (holdPeriods) {
                        app.disableHoldedTimeSelectors(holdPeriods, app.HOUR_SEPARATOR.EVERY_30MIN);
                    }
                });
                break;

            case app.pages.pickRoom:
                app.fetchGetData(app.URL.GET_ROOMS_LIST).then(rooms => {
                    app.pages.pickRoom.rooms = rooms;
                    view.generateRoomsPickerList(app.pages.pickRoom, rooms);
                });
                break;
        }
    },

    hideAll() {
        for (let page in app.pages) {
            view.hide(app.pages[page]);
        }
    },

    disableHoldedTimeSelectors(timePeriods, HOUR_SEPARATOR) {
        timePeriods.forEach(period => {
            const EMPTY_DATE = () => {
                return new Date(new Date(0).setHours(0));
            };

            period.startTime = period.startTime.split(` `)[1];
            period.finishTime = period.finishTime.split(` `)[1];

            let startTimeInMinutes = period.startTime.split(`:`);
            startTimeInMinutes = +startTimeInMinutes[0] * app.MINUTES_PER_HOUR + +startTimeInMinutes[1];
            let finishTimeInMinutes = period.finishTime.split(`:`);
            finishTimeInMinutes = +finishTimeInMinutes[0] * app.MINUTES_PER_HOUR + +finishTimeInMinutes[1];

            let startTime = new Date(EMPTY_DATE().setMinutes(startTimeInMinutes));
            let finishTime = new Date(EMPTY_DATE().setMinutes(finishTimeInMinutes));

            for (let i = startTime; i < finishTime; i.setMinutes(i.getMinutes() + app.MINUTES_PER_HOUR / HOUR_SEPARATOR)) {
                let timeSelectorId = `time-${i.toLocaleTimeString().split(/:00$/)[0]}`;
                view.disableElement(timeSelectorId);
            }
        });
    },

    setPickDatetimePageContext(context) {
        app.pages.pickDatetime.context = context;
        app.show(app.pages.pickDatetime);
    },

    fetchGetData(url, data) {
        return fetch(url + (data ? `?data=${encodeURIComponent(JSON.stringify(data))}` : ``))
            .then(response => {
                if (response.status !== app.SERVER_ANSWERS.OK) {
                    throw new Error(response.statusText);
                } else if (response.headers.get(`Content-type`) !== app.CONTENT_TYPES.APPLICATION_JSON) {
                    throw new TypeError();
                }
                return response.json();
            }).then(responseData => {
                if (responseData.status === app.SERVER_ANSWERS.CONTENT_ERROR) {
                    throw new Error(responseData.message);
                }

                return responseData.data;
            });
    },

    init() {
        app.show(app.pages.pickRoom);
        app.elements.datetimePageHeader.addEventListener(`click`, event => {
            event.preventDefault();
            app.show(app.pages.pickRoom);
        });
    }
};

window.addEventListener(`load`, () => {
    app.init();
});