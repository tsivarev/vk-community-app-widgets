let app = {
    VK_API_VERSION: `5.69`,
    MAX_HOLD_DAYS: 10,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    VK_VIEWER_TYPE: {
        ADMIN: 4,
        EDITOR: 3,
        MODERATOR: 2,
        PARTICIPANT: 1,
        NOT_IN_COMMUNITY: 0
    },
    VK_API_SETTINGS_SCOPE: {
        APP_WIDGET: 64,
    },
    HOUR_SEPARATOR: {
        EVERY_HOUR: 1,
        EVERY_30MIN: 2,
        EVERY_15MIN: 3
    },
    API_METHODS: {
        GET_ROOMS_LIST: `rooms_get_all`,
        GET_ROOMS_LIST_BY_HOLD_TIME: `rooms_get_all_by_hold`,
        GET_ROOMS_HOLD_PERIOD: `rooms_get_hold_period`,
        DISCARD_HOLD: `rooms_discard_hold`,
        POST_HOLD_PERIODS: `rooms_hold_periods`,
        WIDGET_UPDATE: `widget_update`
    },
    SERVER_ANSWERS: {
        OK: 200,
        CONTENT_ERROR: `error`
    },
    CONTENT_TYPES: {
        APPLICATION_JSON: `application/json`
    },
    APP_NAME: `Тайная комната`,
    WIDGET_TYPE: `cover_list`,
    WIDGET_BUTTON_TEXT: `Забронировать`,
    WIDGET_COVER_LIST_ITEMS: 3,

    appId: 0,
    groupId: 0,
    viewerType: null,
    currentHourSeparator: null,
    pages: {
        pickDatetime: document.getElementById(`page-pick-datetime`),
        pickRoom: document.getElementById(`page-pick-room`)
    },
    elements: {
        dateSelector: document.getElementById(`select-date`),
        timeSelector: document.getElementById(`list-select-time`),
        datetimePageHeader: document.querySelector(`#page-pick-datetime .header`),
        datetimePageTitle: document.getElementById(`text-title-header`),
        holdButton: document.getElementById(`btn-hold`)
    },

    EMPTY_DATE() {
        return new Date(new Date(0).setHours(0));
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
                app.generateTimePickerSelector();
                break;

            case app.pages.pickRoom:
                view.generateRoomsPickerList(page, page.rooms, app.viewerType == app.VK_VIEWER_TYPE.ADMIN);
                break;
        }
    },

    hideAll() {
        for (let page in app.pages) {
            view.hide(app.pages[page]);
        }
    },

    generateTimePickerSelector() {
        let requestDataGetRoomHoldStatus = {
            roomId: app.pages.pickDatetime.context,
            date: app.elements.dateSelector.value
        };
        app.callApiMethod(app.API_METHODS.GET_ROOMS_HOLD_PERIOD, requestDataGetRoomHoldStatus).then(holdPeriods => {
            view.generateTimePickerList(app.elements.timeSelector, app.HOURS_PER_DAY, app.MINUTES_PER_HOUR, app.HOUR_SEPARATOR.EVERY_30MIN);
            if (holdPeriods && holdPeriods.length) {
                app.disableTimeSelectorHoldedItems(holdPeriods, app.currentHourSeparator);
            }
        });
    },
    
    stringTimeToMinutes(timeString) { // hh:mm
        splittedTime = timeString.split(':');
        return +splittedTime[0] * app.MINUTES_PER_HOUR + +splittedTime[1];
    },

    disableTimeSelectorHoldedItems(timePeriods, HOUR_SEPARATOR) {
        timePeriods.forEach(period => {
            const getTooltipInfo = new Promise((resolve, reject) => {
                period.startTime = period.startTime.split(` `)[1];
                period.finishTime = period.finishTime.split(` `)[1];

                let startTimeInMinutes = app.stringTimeToMinutes(period.startTime);
                let finishTimeInMinutes = app.stringTimeToMinutes(period.finishTime);

                let startTime = new Date(app.EMPTY_DATE().setMinutes(startTimeInMinutes));
                let finishTime = new Date(app.EMPTY_DATE().setMinutes(finishTimeInMinutes));
                
                VK.api(`users.get`, { user_ids: period.userVkId}, function (data) {
                    resolve({
                        userName: data.response[0].first_name + ' ' + data.response[0].last_name,
                        userVkId: period.holder,
                        startTime,
                        finishTime,
                        periodStartTime: period.startTime,
                        periodFinishTime: period.finishTime,
                        holdId: period.holdId
                    });
                });
            });

            getTooltipInfo.then((toolTipData) => {
                for (let i = toolTipData.startTime; i < toolTipData.finishTime; i.setMinutes(i.getMinutes() + app.MINUTES_PER_HOUR / HOUR_SEPARATOR)) {
                    let timeSelectorId = `time-${i.toLocaleTimeString().split(/:00$/)[0]}`;
                    let timeItemElement = view.disableElementByHolder(timeSelectorId, toolTipData.userName);
                    
                    if (app.getUrlParameter(`viewer_id`) == toolTipData.userVkId || app.viewerType == app.VK_VIEWER_TYPE.ADMIN) {
                        timeItemElement.parentElement.addEventListener('click', app.discardHoldedPeriodEvent.bind(toolTipData));
                    }
                }
            });
        });
    },
    
    discardHoldedPeriodEvent(event) {
        if (!this.holdId) {
            throw Error('Undefined hold');
        }
        
        swal({
            title: `Вы уверены?`,
            text: `Вы собираетесь отменить бронирование в период с ${this.periodStartTime} по ${this.periodFinishTime} на имя ${this.userName}.`,
            icon: `warning`,
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                app.callApiMethod(app.API_METHODS.DISCARD_HOLD, { holdId: this.holdId })
                    .then(async (data) => {
                        swal(`Вы отменили бронирование!`, {
                            icon: "success",
                        });

                        let requestData = {
                            code: `return ` + await app.generateWidget() + `;`,
                            type: app.WIDGET_TYPE
                        };
                        return app.callApiMethod(app.API_METHODS.WIDGET_UPDATE, requestData);
                    }).then(() => {
                        let startTime = new Date(app.EMPTY_DATE().setMinutes(app.stringTimeToMinutes(this.periodStartTime)));
                        let finishTime = new Date(app.EMPTY_DATE().setMinutes(app.stringTimeToMinutes(this.periodFinishTime)));
                    
                        for (let i = startTime; i < finishTime; i.setMinutes(i.getMinutes() + app.MINUTES_PER_HOUR / app.currentHourSeparator)) {
                            let timeSelectorId = `time-${i.toLocaleTimeString().split(/:00$/)[0]}`;
                            let timeItemElement = view.enableElementWithHolder(timeSelectorId);
                        }
                    });
            }
        });
    },

    async holdRoomEvent(event) {
        event.preventDefault();
        
        if (!app.pages.pickDatetime.context) {
            console.log(`Не определена комната`);
            return false;
        }
        let timeItems = document.querySelectorAll(`.time-item:checked`);

        if (timeItems.length === 0) {
            console.log(`Не выбрано время`);
            return false;
        }

        let data = new FormData();
        let requestDataHoldPeriods = {
            roomId: app.pages.pickDatetime.context,
            userVkId: app.getUrlParameter(`viewer_id`),
            date: app.elements.dateSelector.value,
            periods: [],
        };
        let requestParams = {
            method: `post`,
            body: data
        };

        timeItems.forEach(timeItem => {
            let time = timeItem.id.split(`-`)[1];
            let startTimeInMinutes = time.split(`:`);
            startTimeInMinutes = +startTimeInMinutes[0] * app.MINUTES_PER_HOUR + +startTimeInMinutes[1];

            let startTimeObject = new Date(app.EMPTY_DATE().setMinutes(startTimeInMinutes));
            let finishTimeObject = new Date(app.EMPTY_DATE().setMinutes(startTimeInMinutes + app.MINUTES_PER_HOUR / app.HOUR_SEPARATOR.EVERY_30MIN - 1));
            let periodObject = {
                startTime: startTimeObject.toLocaleTimeString().split(/:00$/)[0],
                finishTime: finishTimeObject.toLocaleTimeString().split(/:00$/)[0]
            };
            requestDataHoldPeriods.periods.push(periodObject);
            timeItem.checked = false;
        });

        requestDataHoldPeriods.periods = app.concatTimePeriods(requestDataHoldPeriods.periods);
        data.append(`json`, JSON.stringify(requestDataHoldPeriods));

        fetch(`api.php?method=${app.API_METHODS.POST_HOLD_PERIODS}`, requestParams)
            .then(response => {
                return response.json();
            })
            .then(async (data) => {
                if (!data.response || !data.response.length) {
                    throw new Error();
                }
                app.disableTimeSelectorHoldedItems(data.response, app.currentHourSeparator);
                
                swal(`Комната забронирована`, {
                    icon: "success",
                });
            
                let requestData = {
                    code: `return ` + await app.generateWidget() + `;`,
                    type: app.WIDGET_TYPE
                };
                return app.callApiMethod(app.API_METHODS.WIDGET_UPDATE, requestData);
            });
    },

    stringTimeToMinutes(time) {
        let timeInMinutes = time.split(`:`);
        return +timeInMinutes[0] * app.MINUTES_PER_HOUR + +timeInMinutes[1];
    },

    concatTimePeriods(periods) {
        return periods.filter((period, index, periods) => {
            if (index === periods.length - 1) {
                return true;
            }
            let currentFinishTime = app.stringTimeToMinutes(period.finishTime);
            let nextStartTime = app.stringTimeToMinutes(periods[index + 1].startTime);

            if (currentFinishTime + 1 !== nextStartTime) {
                return true;
            }
            periods[index + 1].startTime = period.startTime;
        });
    },

    setPickDatetimePageContext(context) {
        app.pages.pickDatetime.context = context;
        app.show(app.pages.pickDatetime);
    },

    callApiMethod(method, data) {
        return fetch(`api.php?method=${method}` + (data ? `&data=${encodeURIComponent(JSON.stringify(data))}` : ``))
            .then(response => {
                if (response.status !== app.SERVER_ANSWERS.OK) {
                    throw new Error(response.statusText);
                } else if (response.headers.get(`Content-Type`) !== app.CONTENT_TYPES.APPLICATION_JSON) {
                    throw new TypeError();
                }
                return response.json();
            }).then(responseData => {
                if (!responseData.response || responseData.response.error) {
                    throw new Error();
                }
                return responseData.response;
            });
    },

    getUrlParameter: function (name) {
        name = name.replace(/[\[]/, `\\[`).replace(/[\]]/, `\\]`);

        let regex = new RegExp(`[\\?&]` + name + `=([^&#]*)`);
        let results = regex.exec(location.search);

        return results === null ? `` : decodeURIComponent(results[1].replace(/\+/g, ` `));
    },

    generateWidget() {
        return app.callApiMethod(app.API_METHODS.GET_ROOMS_LIST_BY_HOLD_TIME).then(rooms => {
            let widgetObject = {
                title: app.APP_NAME,
                rows: []
            };
            for (let i = 0; i < app.WIDGET_COVER_LIST_ITEMS; i++) {
                let appUrl = `https://vk.com/app${app.appId}_-${app.groupId}#${rooms[i].id}`;
                let widgetObjectRow = {
                    title: rooms[i].name + ` ` + rooms[i].location,
                    button: app.WIDGET_BUTTON_TEXT,
                    descr: rooms[i].statusText,
                    cover_id: rooms[i].coverId,
                    url: appUrl,
                    button_url: appUrl
                };
                widgetObject.rows.push(widgetObjectRow);
            }
            return JSON.stringify(widgetObject);
        });
    },

    createWidget() {
        VK.callMethod('showAppWidgetPreviewBox', 'cover_list', 'return { "title": "Тайная комната", "rows": [] };');
        VK.addCallback('onAppWidgetPreviewFail', (data) => {
            console.log('fail',data);
        });
        VK.addCallback('onAppWidgetPreviewCancel', (data) => {
            console.log('cancel',data);
        });
        VK.addCallback('onAppWidgetPreviewSuccess', (data) => {
            console.log('success',data);
        });
    },

    init() {
        VK.init(null, null, app.VK_API_VERSION);
        app.viewerType = app.getUrlParameter('viewer_type');
        app.appId = app.getUrlParameter('api_id');
        app.groupId = app.getUrlParameter('group_id');
        app.currentHourSeparator = app.HOUR_SEPARATOR.EVERY_30MIN;
        let requestedRoomId = +app.getUrlParameter('hash');

        app.callApiMethod(app.API_METHODS.GET_ROOMS_LIST).then(rooms => {
            app.pages.pickRoom.rooms = rooms;

            if (requestedRoomId && (requestedRoomId > 0 && requestedRoomId < rooms.length)) {
                app.setPickDatetimePageContext(requestedRoomId);
            } else {
                app.show(app.pages.pickRoom);
            }
        });

        app.elements.datetimePageHeader.addEventListener(`click`, event => {
            event.preventDefault();
            app.show(app.pages.pickRoom);
        });

        app.elements.dateSelector.addEventListener(`change`, event => {
            event.preventDefault();
            app.generateTimePickerSelector();
        });

        app.elements.holdButton.addEventListener(`click`, app.holdRoomEvent);
        console.log(app.currentHourSeparator);
    }
};

window.addEventListener(`load`, () => {
    app.init();
});