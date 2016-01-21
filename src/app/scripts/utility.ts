﻿export class Utility {
    constructor() {
    }

    route(path, router, e) {
        e.preventDefault();
        router.parent.navigateByUrl(path);
    }

    boldText(strtext: string): string {
        /* Get the text of the element I'm after */
        let boldText = strtext.trim(),
            openSpan = '<b>', closeSpan = '</b>';

        /* Make the paragraph into an array */
        boldText = boldText.split(' ');

        /* Add b tag to the beginning of the array */
        boldText.unshift(openSpan);

        /* Add  as the 4th value in the array */
        boldText.splice(6, 0, closeSpan);

        /* Turn it back into a string */
        boldText = boldText.join(' ');

        /* Append the new HTML to the paragraph */
        return boldText;
    }

    generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };


}