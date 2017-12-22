var app = {
    API_VERSION: '5.69',
    API_SETTINGS_SCOPE_PHOTOS: 4,
    VIEWER_DEVICE_MOBILE: 'mobile',
    MAX_HOLD_DAYS: 10,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    HOUR_SEPARATOR: 2, // 1 - EVERY HOUR, 2 - EVERY 30 MIN, 4 - EVERY 15 MIN

    pages: {
        install: document.getElementById('page-install'),
        pickDatetime: document.getElementById('page-pick-datetime')
    },
    elements: {
        dateSelector: document.getElementById('select-date'),
        timeSelector: document.getElementById('select-time')
    },
    groupId: 0,
    appId: 0,

    fillDateSelector: function (selectElement) {
        selectElement.innerHTML = '';
        var currentDay = new Date().getDate();

        for (var i = 0; i < app.MAX_HOLD_DAYS; i++) {
            var nextDate = new Date(new Date().setDate( currentDay + i ));
            selectElement.innerHTML += '<option>' + nextDate.toLocaleDateString() + '</option>';
        }
    },

    generateTimePickerList: function () {
        var tableHtml = '';

        for (var i = 0; i < app.HOURS_PER_DAY * app.MINUTES_PER_HOUR; i += app.MINUTES_PER_HOUR / app.HOUR_SEPARATOR) {
            var date = new Date(new Date(0).setHours(0));
            var time = new Date(date.setMinutes(i));

            tableHtml += '<li>' + time.toLocaleTimeString().split(/:00$/)[0] + '</li>';
        }
        return tableHtml;
    },

    init: function () {
        app.fillDateSelector(app.elements.dateSelector);
        app.elements.timeSelector.innerHTML = app.generateTimePickerList();
    }
};

window.addEventListener('load', function () {
    app.init();
});