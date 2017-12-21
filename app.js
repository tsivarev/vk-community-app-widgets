var app = {
    API_VERSION: '5.69',
    API_SETTINGS_SCOPE_PHOTOS: 4,
    VIEWER_DEVICE_MOBILE: 'mobile',
    MAX_HOLD_DAYS: 48,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    HOUR_SEPARATOR: 0.01, // 1 - EVERY HOUR, 2 - EVERY 30 MIN, 4 - EVERY 15 MIN

    pages: {
        install: document.getElementById('page-install'),
        pickDatetime: document.getElementById('page-pick-datetime')
    },
    elements: {
        timeTable: document.getElementById('table-datetime-picker')
    },
    groupId: 0,
    appId: 0,

    fillPickerTable: function (table) {
        table.innerHTML = /*app.generatePickerTableHead() +*/ app.generatePickerTableBody();
    },

    generatePickerTableHead: function () {
        var currentDay = new Date().getDate();
        var tableHtml = '<thead><tr>';

        for (var i = 0; i < app.MAX_HOLD_DAYS; i++) {
            var nextDate = new Date(new Date().setDate( currentDay + i ));
            tableHtml += '<th>' + nextDate.toLocaleDateString() + '</th>';
        }
        tableHtml += '</tr></thead>';
        return tableHtml;
    },

    generatePickerTableBody: function () {
        var tableHtml = '<tbody>';

        for (var i = 0; i < app.HOURS_PER_DAY * app.MINUTES_PER_HOUR; i += app.MINUTES_PER_HOUR / app.HOUR_SEPARATOR) {
            var rowHtml = '<tr>';
            var columnsHtml = '';

            var date = new Date(new Date(0).setHours(0));
            var time = new Date(date.setMinutes(i));

            for (var j = 0; j < app.MAX_HOLD_DAYS;  j++) {
                columnsHtml += '<td>' + time.toLocaleTimeString().split(/:00$/)[0] + '</td>';
            }
            rowHtml += columnsHtml + '</tr>';
            tableHtml += rowHtml;
        }
        tableHtml += '</tbody>';
        return tableHtml;
    },

    init: function () {
        app.fillPickerTable(app.elements.timeTable);
        // document.getElementsByClassName('responsive')[0].addEventListener('scroll', function (event) {
        //     document.querySelector('#table-datetime-picker thead').style.top = event.target.scrollTop + 'px'; //Это временно
        // });
    }
};

window.addEventListener('load', function () {
    app.init();
});