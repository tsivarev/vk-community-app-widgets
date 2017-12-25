var app = {
    API_VERSION: '5.69',
    API_SETTINGS_SCOPE_PHOTOS: 4,
    VIEWER_DEVICE_MOBILE: 'mobile',
    MAX_HOLD_DAYS: 10,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    HOUR_SEPARATOR: 2, // 1 - EVERY HOUR, 2 - EVERY 30 MIN, 4 - EVERY 15 MIN

    pages: {
        // install: document.getElementById('page-install'),
        pickDatetime: document.getElementById('page-pick-datetime'),
        pickRoom: document.getElementById('page-pick-room')
    },
    elements: {
        dateSelector: document.getElementById('select-date'),
        timeSelector: document.getElementById('list-select-time')
    },
    groupId: 0,
    appId: 0,

    show: function (page) {
        app.hideAll();
        page.classList.remove('hidden');

        switch (page) {
            case app.pages.pickDatetime:
                app.fillDateSelector(app.elements.dateSelector);
                app.elements.timeSelector.innerHTML = app.generateTimePickerList();
                break;
        }
    },

    hideAll: function () {
        for (var page in app.pages) {
            app.pages[page].classList.add('hidden');
        }
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

        for (var i = 0; i < app.HOURS_PER_DAY * app.MINUTES_PER_HOUR; i += app.MINUTES_PER_HOUR / app.HOUR_SEPARATOR) {
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

    init: function () {
        app.show(app.pages.pickDatetime);
    }
};

window.addEventListener('load', function () {
    app.init();
});