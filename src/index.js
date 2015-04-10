(function() {  // IIFE

"use strict";
var _ = require("lodash");
var sortedObject = require("sorted-object");
var url = require("url");
var streamFrame;

var baseUrl = url.parse("https://www.streamtext.net/player", true);
// Because https://us.ycon.org does not set CORS headers, we have our own copy
// of the conference data.
var conferenceJsonUrl = "static/conference.json";  // eslint-disable-line no-unused-vars

// For a list of available query parameters, see
//   https://streamtext.zendesk.com/entries/21721966-controlling-the-streaming-text-page-display
var queryParams = {
    chat: "off",
    header: "off",
    title: "off",
    footer: "off",
    scroll: "off",
    fgc: "fff",
    bgc: "transparent",
    ff: "helvetica,arial,sans-serif",
    fs: "42",
    spacing: "1.8",
    "content-style": "overflow:hidden; text-transform: uppercase"
};

function createStreamTextUrl(eventId) {
    var urlObj = _.clone(baseUrl);
    urlObj.query = sortedObject(_.extend(_.clone(queryParams), { event: eventId }));
    return url.format(urlObj);
}

function extractEventId(streamTextUrl) {
    var urlObj = url.parse(streamTextUrl, true);
    return urlObj.query.event;
}

function createIframe(streamTextUrl) {
    var iframe = document.createElement("iframe");
    iframe.src = streamTextUrl;
    iframe.className = "content";
    iframe.id = "stream-text-embed";
    return iframe;
}

function getStreamTextUrl() {
    var inputUrl = localStorage.getItem('reloadingTarget') || window.prompt("Enter URL") || 'http://www.streamtext.net/player?event=IHaveADream&chat=false',
        eventId;  // eslint-disable-line no-alert

    if (!inputUrl) {
        localStorage.removeItem('reloadingTarget');

        console.error('No URL is given.');

        return;
    }

    localStorage.setItem('reloadingTarget', inputUrl);

    eventId = extractEventId(inputUrl, true);

    checkForActiveEvent(eventId);

    return createStreamTextUrl();
}

function checkForActiveEvent(eventId) {
    //http://www.streamtext.net/text-data.ashx?event=
    var apiUrl = 'http://www.streamtext.net/text-data.ashx';

    $.ajax(apiUrl, {
        data: {
            event: eventId,
            last:  0
        },
        success: function (response) {
            localStorage.removeItem('reloadingTarget');
        },
        statusCode: {
            404: function() {
                setTimeout(function() { history.go(); }, 2000);
            }
        }
    });
}

streamFrame = createIframe(getStreamTextUrl());

document.getElementById("stream-text-container").appendChild(streamFrame);

})();  // IIFE
